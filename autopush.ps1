$branch = "main"
$remote = "origin"

while ($true) {
    git fetch $remote
    git pull --rebase --autostash $remote $branch

    if (git status --porcelain) {
        git add -A
        git commit -m "auto: $(Get-Date -Format s)"
        git push $remote $branch
        Write-Host "Pushed at $(Get-Date -Format T)"
    }

    Start-Sleep -Seconds 15
}
