# One-click deploy of this folder to GitHub Pages.
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 -Token "ghp_xxx"
#
# The token needs `repo` scope (classic PAT) to push code and enable Pages.

param(
  [Parameter(Mandatory = $true)][string]$Token,
  [string]$Owner = 'turkey-trip',
  [string]$RepoName = 'turkey-trip',
  [string]$Branch = 'master'
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$env:GIT_TERMINAL_PROMPT = '0'
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

$api = 'https://api.github.com'
$headers = @{
  Authorization          = "Bearer $Token"
  Accept                 = 'application/vnd.github+json'
  'User-Agent'           = 'trip-deploy'
}

Write-Host '[1/3] Checking token...' -ForegroundColor Cyan
$user = Invoke-RestMethod -Uri "$api/user" -Headers $headers -TimeoutSec 20
if (-not $Owner -or $Owner -eq 'turkey-trip') { $Owner = $user.login }
Write-Host "Account: $Owner"

Write-Host '[2/3] Creating repo if missing...' -ForegroundColor Cyan
$repoPath = "$api/repos/$Owner/$RepoName"
$repoExists = $true
try {
  Invoke-RestMethod -Uri $repoPath -Headers $headers -TimeoutSec 20 | Out-Null
  Write-Host 'Repo already exists.'
} catch {
  $repoExists = $false
}
if (-not $repoExists) {
  $body = @{ name = $RepoName; private = $false; description = 'editable shareable trip page' } | ConvertTo-Json
  Invoke-RestMethod -Uri "$api/user/repos" -Method Post -Headers $headers -Body $body -ContentType 'application/json' -TimeoutSec 25 | Out-Null
  Write-Host "Repo created: https://github.com/$Owner/$RepoName" -ForegroundColor Green
}

Write-Host '[3/3] Pushing code...' -ForegroundColor Cyan
$remote = "https://$($user.login):$Token@github.com/$Owner/$RepoName.git"
git remote remove origin 2>$null
git remote add origin $remote
git push -u origin $Branch
git remote set-url origin "https://github.com/$Owner/$RepoName.git"

Write-Host 'Enabling GitHub Pages...' -ForegroundColor Cyan
try {
  Invoke-RestMethod -Uri "$repoPath/pages" -Headers $headers -TimeoutSec 25 | Out-Null
  Write-Host 'Pages already enabled.'
} catch {
  $pagesBody = @{ source = @{ branch = $Branch; path = '/' } } | ConvertTo-Json
  Invoke-RestMethod -Uri "$repoPath/pages" -Method Post -Headers $headers -Body $pagesBody -ContentType 'application/json' -TimeoutSec 30 | Out-Null
  Write-Host 'Pages enabled.' -ForegroundColor Green
}

Write-Host ''
Write-Host "Repo:  https://github.com/$Owner/$RepoName" -ForegroundColor Green
Write-Host "Site:  https://$($user.login.ToLower()).github.io/$RepoName/" -ForegroundColor Green
Write-Host ''
Write-Host 'Pages takes about a minute to build. Hard-refresh (Ctrl+Shift+R) if you see the old version.'
