// app/services/auth.server.ts
import { Authenticator, AuthorizationError } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import { sessionStorage } from '~/services/session.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<{ id: string; isAdmin: boolean }>(sessionStorage, {
  sessionKey: 'sessionKey',
  sessionErrorKey: 'sessionErrorKey',
});

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    const openid = form.get('openid') as string;
    console.log('openid', openid);

    const user = await context?.db.user.findUnique({ where: { openid } });
    console.log('user', user);
    if (!user) {
      throw new AuthorizationError('Bad Credentials: Password must be a string');
    }

    return user;
  }),
  'wechat'
);
