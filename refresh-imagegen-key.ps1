$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$promptFile = Join-Path $projectRoot 'tmp/imagegen/interior-carousel-prompts.jsonl'
$packageDir = Join-Path $projectRoot 'tmp/imagegen/site-packages'
$pythonExe = Join-Path $env:LOCALAPPDATA 'Python/pythoncore-3.14-64/python.exe'
$codexHomeDir = Join-Path $env:USERPROFILE '.codex'
$imageGenCli = Join-Path $codexHomeDir 'skills/.system/imagegen/scripts/image_gen.py'

if (-not (Test-Path -LiteralPath $promptFile)) {
  throw 'The prepared image prompts are missing from tmp/imagegen.'
}
if (-not (Test-Path -LiteralPath (Join-Path $packageDir 'openai'))) {
  throw 'The OpenAI package is missing. Reopen this Codex task so dependencies can be prepared.'
}
if (-not (Test-Path -LiteralPath $pythonExe)) {
  throw 'Python was not found at the configured local installation path.'
}
if (-not (Test-Path -LiteralPath $imageGenCli)) {
  throw 'The Codex image generation CLI was not found.'
}

$secureKey = Read-Host 'Paste the new OpenAI API key here (input is hidden)' -AsSecureString
$keyPointer = [IntPtr]::Zero
try {
  $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  if ([string]::IsNullOrWhiteSpace($plainKey)) {
    throw 'No API key was entered.'
  }

  [Environment]::SetEnvironmentVariable('OPENAI_API_KEY', $plainKey, 'User')
  $env:OPENAI_API_KEY = $plainKey
  $plainKey = $null
} finally {
  if ($keyPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  }
  if ($secureKey) { $secureKey.Dispose() }
}

$env:PYTHONPATH = $packageDir
$oldErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
  $PSNativeCommandUseErrorActionPreference = $false
  $cliOutput = & $pythonExe $imageGenCli generate-batch --input $promptFile --out-dir (Join-Path $projectRoot 'output/imagegen') --concurrency 3 2>&1
  $cliExitCode = $LASTEXITCODE
} finally {
  $ErrorActionPreference = $oldErrorActionPreference
}
$cliText = $cliOutput | Out-String

if ($cliExitCode -eq 0) {
  Write-Output 'The API accepted the key and all image jobs completed.'
  Get-ChildItem (Join-Path $projectRoot 'output/imagegen') -Filter '*.png' |
    Select-Object Name, Length
} elseif ($cliText -match 'invalid_api_key|Incorrect API key') {
  Write-Error 'The API rejected this key. Create a new secret key on the OpenAI Platform and run this script again.'
} elseif ($cliText -match 'insufficient_quota|no credits remaining|credit_balance_exhausted') {
  Write-Error 'The key was accepted, but the API account has no available credits. Add API credits, then run this script again.'
} else {
  Write-Error 'Image generation failed. The raw API output was suppressed so it cannot reveal key details.'
}
