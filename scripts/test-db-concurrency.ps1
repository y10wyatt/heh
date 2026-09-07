$ErrorActionPreference = "Stop"

$container = docker ps --filter "label=com.supabase.cli.project=Life_Dashboard_-_Capture_Rivalry" --format "{{.Names}}" |
  Where-Object { $_ -like "supabase_db_*" } |
  Select-Object -First 1

if (-not $container) {
  throw "Local Supabase database is not running. Run: npx supabase start"
}

$fixture = Get-Content -Raw "$PSScriptRoot\..\supabase\tests\concurrency_fixture.sql"
$cleanup = Get-Content -Raw "$PSScriptRoot\..\supabase\tests\concurrency_cleanup.sql"
$actor = "20000000-0000-4000-8000-000000000001"
$group = "20000000-0000-4000-8000-000000000010"
$entitlement = "20000000-0000-4000-8000-000000000050"
$room = "20000000-0000-4000-8000-000000000020"
$slot = "20000000-0000-4000-8000-000000000040"
$item = "20000000-0000-4000-8000-000000000030"

function Invoke-ParallelSql([string]$Sql) {
  $jobs = 1..2 | ForEach-Object {
    Start-Job -ScriptBlock {
      param($ContainerName, $Query)
      $output = & docker exec $ContainerName psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c $Query 2>&1
      [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = ($output -join "`n") }
    } -ArgumentList $container, $Sql
  }
  try {
    return $jobs | Wait-Job | Receive-Job
  }
  finally {
    $jobs | Remove-Job -Force
  }
}

function Invoke-Scalar([string]$Sql) {
  $value = & docker exec $container psql -U postgres -d postgres -t -A -v ON_ERROR_STOP=1 -c $Sql
  if ($LASTEXITCODE -ne 0) { throw "Verification query failed: $Sql" }
  return ($value | Select-Object -Last 1).Trim()
}

try {
  & docker exec $container psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c $fixture | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not create concurrency fixture" }

  $finalizeSql = "begin; set local role authenticated; select set_config('request.jwt.claim.sub','$actor',true); select (public.finalize_day('$group','2026-07-01 20:00:00+00')).id; commit;"
  $finalizeResults = Invoke-ParallelSql $finalizeSql
  if (@($finalizeResults | Where-Object ExitCode -ne 0).Count -ne 0) {
    throw "Both finalize_day calls should succeed safely.`n$($finalizeResults.Output -join "`n")"
  }
  if ((Invoke-Scalar "select count(*) from public.daily_results where challenge_group_id='$group' and local_date='2026-07-01';") -ne "1") {
    throw "Concurrent finalize_day created duplicate daily results"
  }
  if ((Invoke-Scalar "select count(*) from public.room_action_entitlements where challenge_group_id='$group' and source_date='2026-07-01';") -ne "2") {
    throw "Concurrent finalize_day created an incorrect reward set"
  }

  $actionSql = "begin; set local role authenticated; select set_config('request.jwt.claim.sub','$actor',true); select (public.apply_room_action('$entitlement','$room','$slot','$item','prank')).id; commit;"
  $actionResults = Invoke-ParallelSql $actionSql
  if (@($actionResults | Where-Object ExitCode -eq 0).Count -ne 1 -or @($actionResults | Where-Object ExitCode -ne 0).Count -ne 1) {
    throw "Exactly one concurrent apply_room_action call should consume the entitlement.`n$($actionResults.Output -join "`n")"
  }
  if ((Invoke-Scalar "select count(*) from public.room_actions where entitlement_id='$entitlement';") -ne "1") {
    throw "Concurrent apply_room_action created duplicate room actions"
  }

  Write-Output "PASS: concurrent finalize_day returned one result/reward set"
  Write-Output "PASS: concurrent apply_room_action consumed one entitlement once"
}
finally {
  & docker exec $container psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c $cleanup | Out-Null
}
