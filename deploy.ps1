# PowerShell script to deploy migo-test-suite to Android device
# Target: /data/data/com.minigame.androiddemo/files/migo/games/migo-test-suit/code

$PackageName = "com.minigame.androiddemo"
$GameId = "migo-test-suit"
$TargetBaseDir = "/data/data/$PackageName/files/migo/games/$GameId/code"
$TempDir = "/data/local/tmp/migo-deploy"

# Check for adb
if (!(Get-Command adb -ErrorAction SilentlyContinue)) {
    Write-Error "adb command not found. Please ensure Android SDK Platform-Tools is in your PATH."
    exit 1
}

# Check device connection
$devices = adb devices | Select-String -Pattern "\tdevice$"
if ($devices.Count -eq 0) {
    Write-Error "No Android device connected via adb."
    exit 1
}

Write-Host "Deploying to $PackageName..." -ForegroundColor Cyan

# 1. Create target directory structure on device
Write-Host "Creating target directories..."
adb shell "run-as $PackageName mkdir -p files/migo/games/$GameId/code"

# 2. Push files to a temporary location first (adb push can't directly write to /data/data without root)
Write-Host "Pushing files to temporary directory..."
adb shell "mkdir -p $TempDir && chmod 777 $TempDir"
adb push game.js "$TempDir/game.js"
adb push tests "$TempDir/"
adb push workers "$TempDir/"
adb shell "chmod -R 777 $TempDir"

# 3. Move files to the app's internal storage using run-as
Write-Host "Moving files to internal storage..."
adb shell "run-as $PackageName cp -r $TempDir/* files/migo/games/$GameId/code/"

# 4. Clean up temporary directory
Write-Host "Cleaning up..."
adb shell "rm -rf $TempDir"

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Files deployed to: $TargetBaseDir"
