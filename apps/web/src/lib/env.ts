// Client-side environment variables (available in browser)
const clientEnv: Record<string, string> = {
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID ?? '',
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL ?? '',
  NEXT_PUBLIC_DELEGATE_ADDRESS: process.env.NEXT_PUBLIC_DELEGATE_ADDRESS ?? '',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  NEXT_PUBLIC_DEPLOY_SALT: process.env.NEXT_PUBLIC_DEPLOY_SALT ?? '',
};

// Server-side environment variables (only available on server)
const serverEnv: Record<string, string> = {
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE ?? '',
  PRIVATE_KEY_DELEGATE: process.env.PRIVATE_KEY_DELEGATE ?? '',
};

// Validate client-side variables
Object.entries(clientEnv).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

// Validate server-side variables only on the server
if (typeof window === 'undefined') {
  Object.entries(serverEnv).forEach(([key, value]) => {
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  });
}

// Combine all environment variables
const env: Record<string, string> = {
  ...clientEnv,
  ...serverEnv,
};

console.log('env');
console.log(env);
export { env };
