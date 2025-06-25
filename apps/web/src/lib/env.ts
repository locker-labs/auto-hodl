const env: Record<string, string> = {
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID ?? '',
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL ?? '',
  NEXT_PUBLIC_PRIVATE_KEY_DELEGATE: process.env.NEXT_PUBLIC_PRIVATE_KEY_DELEGATE ?? '',
};

Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

export { env };
