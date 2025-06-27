# Database Migration Deployment

This document explains how to set up and use the automated database migration deployment system.

## Overview

The GitHub workflow `deploy-migrations.yml` automatically deploys Supabase database migrations when:

- **Push to `main` branch**: Automatically deploys to your Supabase project
- **Manual trigger**: Can be manually triggered via GitHub Actions
- **Migration changes**: Only runs when migration files change

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

- `SUPABASE_PROJECT_ID` - Your Supabase project ID (Reference ID)
- `SUPABASE_ACCESS_TOKEN` - Supabase access token
- `SUPABASE_DB_PASSWORD` - Your database password

## How to Set Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact names listed above

### Getting Supabase Values

#### Project ID (Reference ID)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Copy the **Reference ID** (this is your `SUPABASE_PROJECT_ID`)

#### Access Token
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click your **profile avatar** in the top right corner
3. Select **Access Tokens** from the dropdown menu
4. Click **Generate new token**
5. Give it a name (e.g., "GitHub Actions")
6. Set appropriate scopes (typically "All access" for migrations)
7. Click **Generate token**
8. **Copy the token immediately** (you won't be able to see it again)

**Important**: The access token acts as your authentication for all Supabase CLI operations, including database migrations. Keep it secure and never commit it to your repository.

#### Database Password
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Look for **Database password** section
5. If you don't remember it, click **Reset database password**
6. Copy the password and save it securely

**Note**: This is the password you set when creating your Supabase project. It's needed for direct database connections during migration deployment.

## Workflow Triggers

### Automatic Deployment
- **Push to `main`**: Automatically deploys migrations to your Supabase project
- **Migration file changes**: Only triggers when files in `apps/web/supabase/migrations/` change

### Manual Deployment
1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy Database Migrations** workflow
3. Click **Run workflow**
4. Click **Run workflow** to confirm

## What the Workflow Does

1. **Supabase CLI Setup**: Installs and configures Supabase CLI
2. **Credential Verification**: Ensures all required secrets are configured
3. **Project Linking**: Links to your Supabase project
4. **Migration Deployment**: Runs `supabase db push` to apply all migrations
5. **Type Generation**: Generates updated TypeScript types from the new schema
6. **Auto-commit**: Commits the updated types back to the repository
7. **Verification**: Runs a diff to verify migrations were applied correctly

## Migration File Structure

Migrations should be placed in:
```
apps/web/supabase/migrations/
├── 20250626234639_create_accounts.sql
├── 20250627020240_accounts_view.sql
└── ... (future migrations)
```

## Migration Files

The workflow automatically applies all migration files in sequence. Migrations should be environment-agnostic and work consistently across different deployments.

## Rollback Strategy

If a migration fails or needs to be rolled back:

1. **Create a rollback migration**: Write a new migration file that undoes the problematic changes
2. **Deploy the rollback**: Push the rollback migration through the normal workflow
3. **Emergency rollback**: For critical issues, you can manually connect to the database and run SQL commands

## Monitoring and Troubleshooting

### Checking Deployment Status
1. Go to **Actions** tab in GitHub
2. Look for the **Deploy Database Migrations** workflow runs
3. Click on any run to see detailed logs

### Common Issues

#### "Cannot find project ref. Have you run supabase link?"
- **Cause**: The `supabase link` command failed or wasn't run in the correct directory
- **Solution**: Ensure the link command runs in the `apps/web` directory before migrations
- **Check**: Verify your `SUPABASE_PROJECT_ID` is the correct Reference ID from Supabase dashboard

#### "No such container: supabase_db_*" 
- **Cause**: Trying to run local Supabase commands in a remote deployment context
- **Solution**: This error occurs when using `supabase status` or other local commands in GitHub Actions
- **Note**: GitHub Actions deploys to remote Supabase projects, not local containers

#### "Access denied" 
- **Cause**: Invalid or insufficient permissions on access token
- **Solution**: Check that your Supabase access token is valid and has the right permissions
- **Check**: Regenerate the access token with "All access" permissions

#### "Project not found"
- **Cause**: Incorrect project ID
- **Solution**: Verify the project ID is correct (it should be the Reference ID, not the project name)
- **Check**: Go to Settings → General in your Supabase project to get the Reference ID

#### "Migration conflicts"
- **Cause**: New migrations conflict with existing schema
- **Solution**: Ensure migrations don't conflict with existing schema
- **Check**: Test migrations locally first with `supabase db reset`

#### "failed SASL auth (invalid SCRAM server-final-message received from server)"
- **Cause**: Database password authentication failure, often due to special characters or incorrect password
- **Solution**: 
  1. Verify your database password is correct in GitHub secrets
  2. If the password contains special characters, try resetting it to use only alphanumeric characters
  3. Go to Supabase Dashboard → Settings → Database → Reset database password
  4. Update the `SUPABASE_DB_PASSWORD` secret with the new password
- **Check**: Test the password by connecting to your database directly using a PostgreSQL client

### Manual Migration (Emergency)
If the automated workflow fails, you can run migrations manually:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
cd apps/web
supabase db push
```

## Security Notes

- Never commit database passwords or access tokens to the repository
- Use GitHub secrets for all sensitive information
- Regularly rotate access tokens
- Monitor workflow runs for any suspicious activity
- Ensure proper access controls on your Supabase projects

## Testing Migrations

Before merging to main:

1. **Test locally**: Use `supabase db reset` to test migrations locally
2. **Verify schema**: Check that the database schema matches expectations
3. **Test application**: Ensure your application works with the new schema
4. **Review changes**: Have migrations reviewed before merging

## Support

If you encounter issues with the deployment workflow:

1. Check the GitHub Actions logs for detailed error messages
2. Verify all required secrets are set correctly
3. Test the migration locally first
4. Contact the development team if issues persist 