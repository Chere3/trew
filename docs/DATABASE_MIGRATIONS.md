# Database Migrations Guide

This project uses PostgreSQL as the database and manages migrations through two systems:

1. **Better-Auth Migrations** - For authentication-related tables
2. **node-pg-migrate** - For application-specific tables

## Better-Auth Migrations

Better-auth manages its own schema for authentication tables (`user`, `session`, `account`, `verification`).

### Generate Better-Auth Schema

To generate the PostgreSQL schema for better-auth tables:

```bash
npx @better-auth/cli@latest generate
```

This will create SQL migration files in the `better-auth_migrations/` directory.

### Apply Better-Auth Migrations

To apply the better-auth migrations to your PostgreSQL database:

```bash
npm run auth:migrate
```

Or directly:

```bash
npx @better-auth/cli@latest migrate
```

The CLI will automatically detect your PostgreSQL connection from the `DATABASE_URL` environment variable.

**Note for Self-Signed Certificates:** If your database uses a self-signed SSL certificate (common with managed databases like Aiven), the migration script automatically handles this by temporarily disabling certificate verification during migrations. This is safe for the migration process but ensure your database connection is otherwise secure.

### Better-Auth Migration Files

Better-auth migration files are stored in `better-auth_migrations/` and are automatically generated. Do not manually edit these files.

## Application Migrations (node-pg-migrate)

Application-specific tables (`chat`, `message`, `token_usage`, `user_semantic_memory`) are managed using node-pg-migrate.

### Configuration

Migrations are configured in `.migraterc.json`:
- Migration files are stored in `migrations/` directory
- Migration files use TypeScript format

### Create a New Migration

To create a new migration file:

```bash
npm run migrate:create <migration-name>
```

This will create a new migration file in `migrations/` with up and down functions.

### Apply Migrations

To apply all pending migrations:

```bash
npm run migrate
```

**Note for Self-Signed Certificates:** The migration script automatically handles self-signed SSL certificates by temporarily disabling certificate verification during migrations. This is safe for the migration process.

### Rollback Migrations

To rollback the last migration:

```bash
npm run migrate:down
```

## Migration Execution Order

When setting up a new database or after pulling changes:

1. **First, apply better-auth migrations:**
   ```bash
   npm run auth:migrate
   ```

2. **Then, apply application migrations:**
   ```bash
   npm run migrate
   ```

This order is important because application tables have foreign key constraints referencing better-auth's `user` table.

## Environment Variables

Make sure your `.env` file contains:

```env
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
```

The connection string format supports various PostgreSQL connection options. For remote databases, SSL is typically required.

## Troubleshooting

### Migration Errors

If you encounter migration errors:

1. Check that your `DATABASE_URL` is correct
2. Ensure the database exists and is accessible
3. Verify that better-auth migrations are applied before application migrations
4. Check PostgreSQL logs for detailed error messages

### Connection Issues

If you have connection issues:

- Verify network connectivity to the database
- Check firewall rules
- Ensure SSL mode matches your database configuration
- Verify credentials in `DATABASE_URL`

## Migration Files Structure

### Better-Auth Migrations

Located in `better-auth_migrations/`:
- Auto-generated SQL files
- Named with timestamps
- Do not edit manually

### Application Migrations

Located in `migrations/`:
- TypeScript files
- Each migration exports `up` and `down` functions
- Use node-pg-migrate's `pgm` API for schema changes

Example migration structure:

```typescript
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions = {};

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Migration logic here
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Rollback logic here
}
```
