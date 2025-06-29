import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { http } from 'viem';
import { PIMLICO_API_URL } from '@/config';

export const pimlicoClient = createPimlicoClient({
  transport: http(PIMLICO_API_URL),
});
