import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { createAccountMessage } from '@/lib/createAccountMessage';
import { DEPLOY_SALT } from '@/config';

export async function getAccountBySignerAddress(signerAddress: string, deploySalt?: string) {
  const supabase = supabaseClient;
  const saltToUse = deploySalt || DEPLOY_SALT;
  console.log('Checking for existing account with signerAddress:', signerAddress, 'and deploySalt:', saltToUse);

  try {
    // Query the main accounts table to include deploySalt in the filter
    const { data: allData, error: allError } = await supabase
      .from('accounts')
      .select('signerAddress, createdAt, triggerAddress, delegation')
      .eq('signerAddress', signerAddress)
      .eq('deploySalt', saltToUse);

    if (allError) {
      console.error('Supabase error details:', {
        code: allError.code,
        message: allError.message,
        details: allError.details,
        hint: allError.hint,
      });
      throw allError;
    }

    // Return the first match if any, otherwise null
    const data = allData && allData.length > 0 ? allData[0] : null;
    console.log('Existing account found:', !!data);
    return data;
  } catch (error) {
    console.error('Network or other error:', error);
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
