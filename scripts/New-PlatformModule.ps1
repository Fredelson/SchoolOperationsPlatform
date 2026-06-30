# ============================================
# ARAB UNITY SCHOOL
# Operations Platform
# New Platform Module Scaffolder
# ============================================

param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [string]$FrontendArea = "super-admin"
)

$kebabName = ($Name -replace '([a-z])([A-Z])', '$1-$2').ToLower()
$camelName = $Name.Substring(0,1).ToLower() + $Name.Substring(1)
$pascalName = $Name.Substring(0,1).ToUpper() + $Name.Substring(1)

$backendRoot = ".\backend\modules\$kebabName"
$frontendRoot = ".\frontend\src\modules\$FrontendArea\$kebabName"

# Backend folders
$backendFolders = @(
    "constants",
    "controllers",
    "helpers",
    "repositories",
    "routes",
    "services",
    "validators"
)

foreach ($folder in $backendFolders) {
    New-Item -ItemType Directory -Force "$backendRoot\$folder" | Out-Null
}

# Frontend folders
$frontendFolders = @(
    "api",
    "cards",
    "columns",
    "dialogs",
    "hooks",
    "pages"
)

foreach ($folder in $frontendFolders) {
    New-Item -ItemType Directory -Force "$frontendRoot\$folder" | Out-Null
}

# Backend files
New-Item -ItemType File -Force "$backendRoot\constants\$camelName`Defaults.js" | Out-Null
New-Item -ItemType File -Force "$backendRoot\controllers\$camelName`Controller.js" | Out-Null
New-Item -ItemType File -Force "$backendRoot\helpers\$camelName`Mapper.js" | Out-Null
New-Item -ItemType File -Force "$backendRoot\repositories\$camelName`Repository.js" | Out-Null
New-Item -ItemType File -Force "$backendRoot\routes\$camelName`Routes.js" | Out-Null
New-Item -ItemType File -Force "$backendRoot\services\$camelName`Service.js" | Out-Null
New-Item -ItemType File -Force "$backendRoot\validators\$camelName`Validator.js" | Out-Null
New-Item -ItemType File -Force "$backendRoot\index.js" | Out-Null

# Frontend files
New-Item -ItemType File -Force "$frontendRoot\api\$camelName`Api.js" | Out-Null
New-Item -ItemType File -Force "$frontendRoot\cards\$pascalName`KpiCards.jsx" | Out-Null
New-Item -ItemType File -Force "$frontendRoot\columns\$camelName`Columns.jsx" | Out-Null
New-Item -ItemType File -Force "$frontendRoot\dialogs\$pascalName`FormDialog.jsx" | Out-Null
New-Item -ItemType File -Force "$frontendRoot\hooks\use$pascalName`Manager.js" | Out-Null
New-Item -ItemType File -Force "$frontendRoot\pages\$pascalName`Manager.jsx" | Out-Null
New-Item -ItemType File -Force "$frontendRoot\index.js" | Out-Null

Write-Host ""
Write-Host "========================================="
Write-Host " Platform module scaffold created"
Write-Host " Module: $pascalName"
Write-Host " Backend: $backendRoot"
Write-Host " Frontend: $frontendRoot"
Write-Host "========================================="