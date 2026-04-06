# Skrill Sandbox Simulator

This is a self-contained local simulator for Skrill-style sandbox testing. It gives you:

- virtual sandbox account creation
- local OAuth token issuance
- mock send-money preview and execution flows
- OTP challenge and verification for strong customer authentication
- live request and activity monitoring in the browser
- file-backed state so accounts and transactions survive a server restart

## Run locally

From this folder:

```powershell
npm start
```

Then open:

[http://localhost:5050](http://localhost:5050)

## What is included

- `POST /sandbox/oauth2/token`
- `GET /sandbox/mobile/v1/accounts`
- `GET /sandbox/mobile/v1/transactions/all-transactions-history`
- `GET /sandbox/mobile/me/send-money/preview`
- `POST /sandbox/mobile/me/send-money`
- `POST /sandbox/mobile/api/2fa/v1/sms-challenge`
- `POST /sandbox/mobile/api/2fa/v1/otp-verify`
- `POST /sandbox/mobile/me/send-money/{slipId}/finalize`

## Notes

- This is a local simulator, not an official Skrill-hosted sandbox.
- The app clearly avoids any live credentials, live wallets, or live traffic.
- The seeded data is stored in `data/sandbox-state.json`.
- The UI includes unsupported sandbox-only exclusions for account closure, monthly statements, shipping preferences, and Skrill Shops support.

## Why this simulator exists

The prompt text mixed Skrill and PayPal account-creation steps. This project keeps the request focused on Skrill-style local testing, while still giving you a safe environment to rehearse account creation, transaction previews, SCA, and transaction monitoring before wiring a real integration.
