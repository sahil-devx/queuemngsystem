# Email Configuration for Queue System

## Development Mode (Current Setup)

The forgot password functionality is currently configured for development mode. When SMTP is not properly configured:

1. **OTP is displayed in the backend console** with clear formatting
2. **OTP is returned to the frontend** as `devOtp` in the API response
3. **Email preview is available** at `/api/auth/dev/email-preview` endpoint
4. **No actual emails are sent** to avoid requiring real SMTP credentials during development

## Testing the Forgot Password Flow

1. **Start the backend server**: `npm start` (runs on port 5000)
2. **Start the frontend server**: `npm run dev` (runs on port 5173)
3. **Navigate to**: http://localhost:5173/forgot-password
4. **Enter any email** (registered or not)
5. **Check the backend console** for the OTP or use the OTP displayed on the frontend
6. **Complete the password reset flow**

## Production Configuration

To enable actual email sending in production, update the `config.env` file:

### Option 1: Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
SMTP_FROM=Queue System <your-gmail@gmail.com>
```

### Option 2: Mailtrap (Development/Staging)
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
SMTP_FROM=Queue System <noreply@queuesystem.dev>
```

### Option 3: Other SMTP Providers
```env
SMTP_HOST=your-smtp-provider.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=Queue System <noreply@yourdomain.com>
```

## Gmail Setup Instructions

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this app password in the `SMTP_PASS` field
5. Update `SMTP_USER` with your Gmail address

## Environment Variables

- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port (587 for TLS, 465 for SSL)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `SMTP_FROM`: From email address and name
- `OTP_EXPIRY_MINUTES`: OTP validity period (default: 10 minutes)

## API Endpoints

- `POST /api/auth/forgot-password/send-otp` - Send OTP to email
- `POST /api/auth/forgot-password/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password/reset` - Reset password
- `GET /api/auth/dev/email-preview` - Preview sent emails (development only)

## Security Notes

- The system prevents account enumeration by always returning success messages
- OTPs are hashed before storing in the database
- OTPs expire after the configured time period
- Development mode should never be used in production

## Troubleshooting

1. **If emails don't send**: Check SMTP credentials and network connectivity
2. **If OTP verification fails**: Ensure OTP is used before expiry time
3. **If Gmail authentication fails**: Use App Password, not regular password
4. **Check backend console** for detailed error messages and development OTP display
