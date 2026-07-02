# Paylocity Integration

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PAYLOCITY_CLIENT_ID` | Yes (for API sync) | OAuth2 client ID from Paylocity Developer Portal |
| `PAYLOCITY_CLIENT_SECRET` | Yes (for API sync) | OAuth2 client secret |
| `NEXT_PUBLIC_PAYLOCITY_COMPANY_ID` | Yes | Company ID (317433) |

## Setup

1. Register at [Paylocity Developer Portal](https://developers.paylocity.com/)
2. Create an API application and obtain client credentials
3. Set environment variables in `.env.local` (local) or deployment environment (production)
4. The dashboard will automatically detect configured credentials and sync employee data

## Without Credentials

Until API credentials are configured, the Employees page shows:
- Existing HRM employee data (current source)
- A "Connect Paylocity" card linking to your Paylocity portal
- Instructions for admin setup

## Company

- Company ID: `317433`
- Portal URL: `https://go.paylocity.com/Home?__viewedCompanyId=317433`
