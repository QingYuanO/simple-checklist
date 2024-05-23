// app/services/auth.server.ts
import { AppLoadContext, redirect } from '@remix-run/cloudflare';
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
  new FormStrategy(async ({ context, request }) => {
    const { WECHAT_APPID, WECHAT_APP_SECRET } = context!.cloudflare.env;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    const res = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`
    );
    const { openid } = (await res.json()) as { errcode?: number; openid?: string };

    if (!openid) {
      throw new AuthorizationError('Invalid code');
    }
    const user = await context!.db.user.findUnique({ where: { openid } });
    if (!user) {
      const newUser = await context!.db.user.create({ data: { openid, name: openid.slice(0, 5) } });
      return newUser!;
    }
    //用于开发
    await context?.db.user.update({
      data: {
        isAdmin: false,
      },
      where: { openid },
    });
    console.log(user);

    return user;
  }),
  'wechat-auth'
);

export const authUser = async (request: Request, context: AppLoadContext) => {
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/wechat-auth',
  });

  const dbUser = await context.db.user.findUnique({ where: { id: sessionUser?.id ?? '' } });
  if (dbUser) {
    return dbUser;
  } else {
    redirect('/wechat-auth');
    return null;
  }
};
