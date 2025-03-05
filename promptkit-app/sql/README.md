# SQL Functions for PromptKit

This directory contains SQL functions that need to be deployed to your Supabase project.

## Functions

1. `increment_view_count.sql` - Increments the view count for a prompt
2. `increment_copy_count.sql` - Increments the copy count for a prompt

## Deployment Options

### Option 1: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of each SQL file
5. Run the query

### Option 2: Using the Deployment Script

We've provided a script to automatically deploy these functions:

1. Make sure you have the following environment variables set in your `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Run the deployment script:
   ```
   node scripts/deploy-sql-functions.js
   ```

### Option 3: Manual Deployment via Supabase CLI

If you have the Supabase CLI installed:

1. Navigate to the project root
2. Run:
   ```
   supabase functions deploy
   ```

## Troubleshooting

If you encounter issues with the RPC functions:

1. Check that the functions exist in your Supabase project
2. Verify that the function signatures match exactly
3. Ensure your database has the necessary tables and columns
4. Check that your RLS policies allow the function to be executed 