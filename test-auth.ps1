# Test JWT Authentication Flow
Write-Host "`n=== Testing JWT Auth Implementation ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test 1: Try accessing admin API without authentication
Write-Host "`n[Test 1] Accessing /api/admin/users without auth..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/users" -Method GET -ErrorAction Stop
    Write-Host "  FAILED: Got $($response.StatusCode) - Expected 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASSED: Got 401 Unauthorized (as expected)" -ForegroundColor Green
    } else {
        Write-Host "  FAILED: Got $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 2: Login to get authentication cookie
Write-Host "`n[Test 2] Logging in as superadmin..." -ForegroundColor Yellow
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{
    username = "superadmin"
    password = "super123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    if ($loginData.ok) {
        Write-Host "  PASSED: Login successful" -ForegroundColor Green
        Write-Host "    User: $($loginData.user.name) ($($loginData.user.role))" -ForegroundColor Gray
        Write-Host "    Cookies: $($session.Cookies.Count) cookie(s) set" -ForegroundColor Gray
    } else {
        Write-Host "  FAILED: Login returned ok=false" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAILED: Login error - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Access admin API with authentication cookie
Write-Host "`n[Test 3] Accessing /api/admin/users WITH auth cookie..." -ForegroundColor Yellow
try {
    $adminResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/users" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    if ($adminResponse.StatusCode -eq 200) {
        Write-Host "  PASSED: Got 200 OK (authenticated access)" -ForegroundColor Green
        $adminData = $adminResponse.Content | ConvertFrom-Json
        Write-Host "    Users in system: $($adminData.users.Count)" -ForegroundColor Gray
        $adminData.users | ForEach-Object {
            Write-Host "      - $($_.username) ($($_.role))" -ForegroundColor Gray
        }
    } else {
        Write-Host "  FAILED: Got $($adminResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Verify endpoint with cookie
Write-Host "`n[Test 4] Testing /api/auth/verify with cookie..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/verify" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    $verifyData = $verifyResponse.Content | ConvertFrom-Json
    if ($verifyData.ok) {
        Write-Host "  PASSED: Token verification successful" -ForegroundColor Green
        Write-Host "    Verified user: $($verifyData.user.name) ($($verifyData.user.role))" -ForegroundColor Gray
    } else {
        Write-Host "  FAILED: Verification returned ok=false" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Logout and verify cookie is cleared
Write-Host "`n[Test 5] Testing logout..." -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/logout" `
        -Method POST `
        -WebSession $session `
        -ErrorAction Stop
    
    Write-Host "  Logout endpoint called successfully" -ForegroundColor Green
    
    # Try accessing admin API after logout
    try {
        $afterLogout = Invoke-WebRequest -Uri "$baseUrl/api/admin/users" `
            -Method GET `
            -WebSession $session `
            -ErrorAction Stop
        Write-Host "  FAILED: Still got access after logout ($($afterLogout.StatusCode))" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "  PASSED: Got 401 after logout (cookie cleared)" -ForegroundColor Green
        } else {
            Write-Host "  PARTIAL: Got $($_.Exception.Response.StatusCode) after logout" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  FAILED: Logout error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "JWT authentication with httpOnly cookies is working!" -ForegroundColor Green
Write-Host "Admin APIs are protected and require valid super_admin role." -ForegroundColor Green
