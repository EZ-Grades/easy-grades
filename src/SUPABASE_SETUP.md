# Supabase Setup Guide for EZ Grades

This guide will help you set up your Supabase project to work with the EZ Grades authentication system.

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Settings > API.

## 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `/supabase/schema.sql` into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- `profiles` table for user profiles
- `chat_history` table for AI assistant conversations
- Row Level Security policies
- Automatic triggers for profile creation and timestamp updates

## 3. Authentication Setup

### Email Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Ensure "Enable email confirmations" is turned ON
3. Set your Site URL to your app's URL (e.g., `http://localhost:5173` for development)
4. Add your production URL to "Redirect URLs" when deploying

### Google OAuth Setup
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your Supabase callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Add authorized domains: your app domain and localhost for development
4. Copy the Client ID and Client Secret to Supabase

### Email Templates (Optional)
1. Go to Authentication > Templates
2. Customize the email confirmation template to match your brand
3. Update the confirmation URL to point to your app

## 4. Testing the Setup

Once you've completed the above steps:

1. Start your development server
2. Try creating a new account - you should receive a confirmation email
3. Test Google OAuth login
4. Check that user profiles are automatically created in the `profiles` table
5. Verify that protected routes work correctly

## 5. Security Checklist

- ✅ Row Level Security is enabled on all tables
- ✅ Policies are in place to protect user data
- ✅ Email confirmation is required for new accounts
- ✅ OAuth providers are properly configured
- ✅ Redirect URLs are whitelisted

## 6. Production Deployment

When deploying to production:

1. Update environment variables with production Supabase URL and keys
2. Add production domain to Supabase Auth settings
3. Update Google OAuth settings with production domain
4. Test all authentication flows in production environment

## Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**: Check if email confirmation is required
2. **Google OAuth not working**: Verify callback URLs and authorized domains
3. **Profile not created**: Check the trigger function and auth webhook
4. **RLS errors**: Ensure policies are correctly set up

### Debug Mode:
Add `console.log` statements in your `useAuth.ts` hook to debug authentication flows.

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables are correct
3. Ensure your database schema matches the TypeScript types
4. Check browser console for client-side errors