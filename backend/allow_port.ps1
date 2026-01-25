# Open Port 8000 for Student Portal Backend
Write-Host "Adding Firewall Rule for Port 8000..."
New-NetFirewallRule -DisplayName "Student Portal Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
Write-Host "Rule Added Successfully!"
Write-Host "You can now access the backend from other devices."
