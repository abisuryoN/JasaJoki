Get-ChildItem -Path "c:\laragon\www\JasaJoki\frontend" -Recurse -File | Where-Object { $_.Extension -match '\.(jsx|js|html|css|json)$' } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'JasaJoki|jasajoki') {
        $content = $content -replace 'JasaJoki', 'DualCode'
        $content = $content -replace 'jasajoki', 'dualcode'
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Replaced in $_.FullName"
    }
}

$envFile = "c:\laragon\www\JasaJoki\backend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace 'JasaJoki', 'DualCode'
    Set-Content -Path $envFile -Value $envContent -NoNewline
    Write-Host "Replaced in .env"
}
