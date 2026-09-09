param(
  [Parameter(Mandatory = $true)]
  [string]$Container
)

$ErrorActionPreference = "Stop"
$ownerId = [guid]::NewGuid().ToString()
$joinerAId = [guid]::NewGuid().ToString()
$joinerBId = [guid]::NewGuid().ToString()
$runId = [guid]::NewGuid().ToString("N")
$setupPath = Join-Path $env:TEMP "our-place-race-setup-$runId.sql"
$joinAPath = Join-Path $env:TEMP "our-place-race-a-$runId.sql"
$joinBPath = Join-Path $env:TEMP "our-place-race-b-$runId.sql"
$containerSetupPath = "/tmp/our-place-race-setup-$runId.sql"
$containerJoinAPath = "/tmp/our-place-race-a-$runId.sql"
$containerJoinBPath = "/tmp/our-place-race-b-$runId.sql"
$groupId = $null
$failure = $null

function Invoke-Psql {
  param([string[]]$Arguments)

  $previousErrorPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $output = docker @Arguments 2>&1
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorPreference

  return [pscustomobject]@{
    ExitCode = $exitCode
    Output = ($output -join "`n")
  }
}

try {
  @"
insert into auth.users(id, email) values
  ('$ownerId', 'race-owner-$runId@example.test'),
  ('$joinerAId', 'race-a-$runId@example.test'),
  ('$joinerBId', 'race-b-$runId@example.test');
set role authenticated;
select set_config('request.jwt.claim.sub', '$ownerId', false);
select public.our_place_create_household('Race home', 'Race owner');
"@ | Set-Content -LiteralPath $setupPath -Encoding UTF8

  docker cp $setupPath "${Container}:$containerSetupPath" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not copy the invite-race setup." }
  $setup = Invoke-Psql @("exec", $Container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-f", $containerSetupPath)
  if ($setup.ExitCode -ne 0) { throw "Invite-race setup failed: $($setup.Output)" }

  $groupQuery = "select group_id from public.group_members where user_id = '$ownerId';"
  $groupResult = Invoke-Psql @("exec", $Container, "psql", "-At", "-U", "postgres", "-d", "postgres", "-c", $groupQuery)
  if ($groupResult.ExitCode -ne 0) { throw "Could not read the race household." }
  $groupId = $groupResult.Output.Trim()

  $inviteQuery = "set role authenticated; select set_config('request.jwt.claim.sub', '$ownerId', false); select code from public.our_place_create_invite('$groupId');"
  $inviteResult = Invoke-Psql @("exec", $Container, "psql", "-At", "-U", "postgres", "-d", "postgres", "-c", $inviteQuery)
  if ($inviteResult.ExitCode -ne 0) { throw "Could not create the race invite." }
  $inviteCode = ($inviteResult.Output -split "`n" | Where-Object { $_ -match '^[A-F0-9]{8}$' } | Select-Object -Last 1)
  if (-not $inviteCode) { throw "Could not identify the race invite code." }

  @"
set role authenticated;
select set_config('request.jwt.claim.sub', '$joinerAId', false);
select public.our_place_join_household('$inviteCode', 'Race joiner A');
"@ | Set-Content -LiteralPath $joinAPath -Encoding UTF8
  @"
set role authenticated;
select set_config('request.jwt.claim.sub', '$joinerBId', false);
select public.our_place_join_household('$inviteCode', 'Race joiner B');
"@ | Set-Content -LiteralPath $joinBPath -Encoding UTF8

  docker cp $joinAPath "${Container}:$containerJoinAPath" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not copy race join A." }
  docker cp $joinBPath "${Container}:$containerJoinBPath" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not copy race join B." }

  $jobs = @(
    Start-Job -ScriptBlock {
      param($containerName, $sqlPath)
      $result = docker exec $containerName psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f $sqlPath 2>&1
      [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = ($result -join "`n") }
    } -ArgumentList $Container, $containerJoinAPath
    Start-Job -ScriptBlock {
      param($containerName, $sqlPath)
      $result = docker exec $containerName psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f $sqlPath 2>&1
      [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = ($result -join "`n") }
    } -ArgumentList $Container, $containerJoinBPath
  )
  $raceResults = @($jobs | Wait-Job | Receive-Job)
  $jobs | Remove-Job -Force

  $successCount = @($raceResults | Where-Object { $_.ExitCode -eq 0 }).Count
  $stateQuery = "select (select count(*) from public.group_members where group_id = '$groupId' and user_id in ('$joinerAId', '$joinerBId')) || ':' || (select count(*) from public.group_invites where group_id = '$groupId' and used_by in ('$joinerAId', '$joinerBId'));"
  $stateResult = Invoke-Psql @("exec", $Container, "psql", "-At", "-U", "postgres", "-d", "postgres", "-c", $stateQuery)

  if ($successCount -ne 1 -or $stateResult.ExitCode -ne 0 -or $stateResult.Output.Trim() -ne "1:1") {
    $failure = "Invite race failed: expected one successful claimant and one consumed membership, got successes=$successCount state=$($stateResult.Output.Trim())."
  } else {
    Write-Host "ok - simultaneous invite claims create exactly one member"
  }
}
finally {
  if ($groupId) {
    $cleanupQuery = "delete from public.household_actions where group_id = '$groupId'; delete from public.household_member_settings where group_id = '$groupId'; delete from public.household_rooms where group_id = '$groupId'; delete from public.group_invites where group_id = '$groupId'; delete from public.group_members where group_id = '$groupId'; delete from public.groups where id = '$groupId'; delete from public.profiles where id in ('$ownerId', '$joinerAId', '$joinerBId'); delete from auth.users where id in ('$ownerId', '$joinerAId', '$joinerBId');"
    Invoke-Psql @("exec", $Container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-c", $cleanupQuery) | Out-Null
  }
  Remove-Item -LiteralPath $setupPath, $joinAPath, $joinBPath -Force -ErrorAction SilentlyContinue
}

if ($failure) { throw $failure }
