import { WorkOS } from '@workos-inc/node';
import { env } from './env';

export const workos = new WorkOS(env.workosApiKey, {
  clientId: env.workosClientId,
});
