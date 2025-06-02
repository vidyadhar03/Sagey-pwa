# Sagey PWA

A Progressive Web App for Spotify music insights and analysis.

## Troubleshooting

### Persistent Loading State or 403 Forbidden Errors

If you're experiencing persistent loading states in the home tab layout or seeing 403 Forbidden errors in the console after a recent update, this is likely due to updated Spotify permissions. Here's how to fix it:

1. **Disconnect your Spotify account:**
   - Go to the app settings or profile section
   - Click "Disconnect" or "Logout" from Spotify

2. **Reconnect your Spotify account:**
   - Click "Connect Spotify" again
   - You'll be redirected to Spotify's authorization page
   - Make sure to grant all requested permissions, including:
     - Access to your recently played tracks
     - Access to your top tracks and artists
     - Access to your currently playing track

3. **Clear browser cache (if needed):**
   - Clear your browser's cookies and cache for the app
   - Refresh the page and try connecting again

The app now requires additional permissions to show your listening statistics and top genres. These permissions are necessary for the home tab insights to work properly.

## Development

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
