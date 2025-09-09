# auto-push.ps1  (repo kökünde)
while ($true) {
  git add -A
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    git commit -m "auto: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')"
    git push
  }
  Start-Sleep -Seconds 30
}
# Bu dosya, her 30 saniyede bir değişiklikleri kontrol eder ve varsa otomatik olarak commit ve push yapar.