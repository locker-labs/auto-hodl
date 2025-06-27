## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## DB

### Generate migrtion from diff
1. Run supabase locally: `supabase start`
2. Make changes to ui at: http://localhost:54323/
3. Generate migrations: `supabase db diff -f MIGRATION_NAME`
4. Confirm with reset (optional): `supabase db reset`

### Manually create migration
`supabase migration new MIGRATION_NAME`

## Generate types
`supabase gen types typescript --local > src/types/database.types.ts`