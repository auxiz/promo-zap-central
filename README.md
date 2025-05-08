
# Promozap Central

Integration between WhatsApp and Shopee Affiliate APIs for automated link conversion.

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_BACKEND_API_URL=http://168.231.98.177:4000
   ```

2. For production deployment, set the appropriate backend API URL:
   ```
   VITE_BACKEND_API_URL=https://your-production-backend.com
   ```

## Important Security Note

Shopee API credentials (AppID and Secret Key) are **NEVER** stored in the frontend code. 
These credentials are securely managed by the backend service only.

## Development

To run the development server:

```bash
npm run dev
```

## Building

To build the application:

```bash
npm run build
```
