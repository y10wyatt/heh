$ErrorActionPreference = "Stop"

$container = "supabase_db_Life_Dashboard_-_Capture_Rivalry"
$files = @(
  "supabase/proposals/legacy_household_fixture.sql",
  "supabase/proposals/20260909_household_onboarding.sql",
  "supabase/proposals/household_onboarding.test.sql"
)

foreach ($file in $files) {
  $name = Split-Path -Leaf $file
  docker cp $file "${container}:/tmp/$name" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not copy $file into the local database container." }
  $previousErrorPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $output = docker exec $container psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f "/tmp/$name" 2>&1
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorPreference
  $output | ForEach-Object { Write-Host $_ }

  if ($exitCode -ne 0) { throw "Postgres rejected $file." }

  if ($name -eq "household_onboarding.test.sql") {
    $testOutput = $output -join "`n"
    if ($testOutput -match "(?m)^\s*not ok" -or $testOutput -match "Looks like you planned") {
      throw "The household onboarding behavior tests reported a failure."
    }
  }
}

& "$PSScriptRoot/test-invite-race.ps1" -Container $container
