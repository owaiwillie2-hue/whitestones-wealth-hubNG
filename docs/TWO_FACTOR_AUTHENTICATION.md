# Two-Factor Authentication (2FA) System

## Overview
The platform uses Google Authenticator-compatible TOTP (Time-based One-Time Password) for two-factor authentication.

## Features
- ✅ QR code generation for easy setup
- ✅ Manual secret key entry option
- ✅ 6-digit verification codes
- ✅ 30-second code rotation
- ✅ Compatible with Google Authenticator, Authy, and other TOTP apps

## How to Enable 2FA

### For Users:

1. **Navigate to Settings**
   - Go to Dashboard → Settings → Security tab

2. **Enable 2FA**
   - Click the "Enable" button under Two-Factor Authentication

3. **Scan QR Code**
   - Install an authenticator app on your phone (Google Authenticator, Authy, etc.)
   - Open the app and scan the QR code displayed
   - Alternatively, manually enter the secret key shown

4. **Verify Setup**
   - Enter the 6-digit code from your authenticator app
   - Click "Verify and Enable"

5. **Login with 2FA**
   - After enabling 2FA, you'll be prompted for a verification code each time you log in
   - Enter your email and password as normal
   - Then enter the 6-digit code from your authenticator app

## How to Disable 2FA

1. Go to Dashboard → Settings → Security tab
2. Click the "Disable" button under Two-Factor Authentication
3. Confirm the action

## Technical Details

### Database Schema
The following fields are added to the `profiles` table:
- `two_factor_secret`: Stores the TOTP secret (encrypted at rest)
- `two_factor_enabled`: Boolean flag indicating if 2FA is active

### Authentication Flow

1. **Login Request**
   - User enters email and password
   - System authenticates credentials

2. **2FA Check**
   - If 2FA is enabled, user is prompted for verification code
   - User enters 6-digit code from authenticator app
   - System validates the code against stored secret

3. **Access Granted**
   - Upon successful verification, user is logged in
   - Activity is logged in the activity_logs table

### Security Considerations
- Secrets are stored securely in the database
- TOTP codes are valid for 30 seconds
- A small time window (±30 seconds) is allowed for clock drift
- Failed 2FA attempts are logged
- Users should store backup codes (future enhancement)

## Supported Authenticator Apps
- Google Authenticator (iOS, Android)
- Authy (iOS, Android, Desktop)
- Microsoft Authenticator (iOS, Android)
- 1Password (iOS, Android, Desktop)
- Any TOTP-compatible authenticator app

## Troubleshooting

### "Invalid Code" Error
- Ensure your device's time is synchronized
- Try the next code (wait 30 seconds)
- Check that you're using the correct account in your authenticator app

### Lost Access to Authenticator App
- Contact support for account recovery
- Admin users can disable 2FA for a user account from the admin panel

## Future Enhancements
- [ ] Backup codes generation
- [ ] SMS-based 2FA option
- [ ] Email-based 2FA option
- [ ] Recovery email verification
- [ ] 2FA enforcement for admin accounts
