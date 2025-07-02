import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { createAccountMessage } from '@/lib/createAccountMessage';
import { DEPLOY_SALT } from '@/config';
import type { EChainMode } from '@/enums/chainMode.enums';

export async function getAccountBySignerAddress(signerAddress: string) {
  console.log('Checking for existing account with signerAddress:', signerAddress);

  try {
    const response = await fetch(`/api/v1/accounts/check?signerAddress=${encodeURIComponent(signerAddress)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check account');
    }

    const result = await response.json();
    console.log('Account check result:', result);
    return result.data; // Returns the account data or null
  } catch (error) {
    console.error('Error checking existing account:', error);
    throw error;
  }
}

// Secure function that requires wallet signature
export async function createAccountWithSignature(account: {
  signerAddress: string;
  tokenSourceAddress: string;
  triggerAddress: string;
  delegation: any;
  savingsAddress?: string;
  chainId: string;
  chainMode: EChainMode;
  circleAddress?: string;
}) {
  console.log('Creating account with signature verification:', account);

  try {
    // Create timestamp for the signature challenge
    const timestamp = Date.now();

    // Create message using helper function
    const message = createAccountMessage({
      ...account,
      deploySalt: DEPLOY_SALT,
      timestamp,
    });

    // Request signature from MetaMask using personal_sign
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [
        `0x${Buffer.from(message, 'utf8').toString('hex')}`, // Message in hex format
        account.signerAddress,
      ],
    });

    console.log('Signature obtained:', signature);

    // Call the secure API endpoint
    const response = await fetch('/api/v1/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...account,
        signature,
        timestamp,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create account');
    }

    const result = await response.json();
    console.log('Account created successfully via secure API:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error creating account with signature:', error);
    throw error;
  }
}

// Legacy function for backward compatibility (less secure)
export async function createAccount(account: {
  signerAddress: string;
  tokenSourceAddress: string;
  triggerAddress: string;
  delegation: any;
  savingsAddress?: string;
}) {
  const supabase = supabaseClient;
  console.log('Saving account to database:', account);

  // Use upsert to handle the case where signerAddress already exists
  const { data, error } = await supabase
    .from('accounts')
    .upsert([account], {
      onConflict: 'signerAddress',
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    console.error('Error creating/updating account:', error);
    throw error;
  }

  console.log('Account created/updated successfully:', data);
  return data;
}
