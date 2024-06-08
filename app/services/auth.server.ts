// app/services/auth.server.ts
import { Authenticator, AuthorizationError } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { AppLoadContext, redirect } from '@remix-run/cloudflare';
import { sessionStorage } from '~/services/session.server';
import bcryptjs from 'bcryptjs';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<{ id: string; isAdmin: boolean }>(sessionStorage, {
  sessionKey: 'sessionKey',
  sessionErrorKey: 'sessionErrorKey',
});

// const wechatAuth = new FormStrategy(async ({ context, request }) => {
//   const { WECHAT_APPID, WECHAT_APP_SECRET } = context!.cloudflare.env;
//   const { searchParams } = new URL(request.url);
//   const code = searchParams.get('code');

//   const res = await fetch(
//     `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`
//   );
//   const { openid } = (await res.json()) as { errcode?: number; openid?: string };

//   if (!openid) {
//     throw new AuthorizationError('Invalid code');
//   }
//   const user = await context!.db.user.findUnique({ where: { openid } });
//   if (!user) {
//     const newUser = await context!.db.user.create({ data: { openid, name: openid.slice(0, 5) } });
//     return newUser!;
//   }
//   //用于开发
//   await context?.db.user.update({
//     data: {
//       isAdmin: false,
//     },
//     where: { openid },
//   });
//   console.log(user);

//   return user;
// });
// // Tell the Authenticator to use the form strategy
// authenticator.use(wechatAuth, 'wechat-auth');

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    const { ADMIN_ACCOUNT } = context!.cloudflare.env;
    const account = form.get('account') as string;
    const password = form.get('password') as string;
    const salt = bcryptjs.genSaltSync(10);

    if (!account || !password) {
      throw new AuthorizationError('请输入账号和密码');
    }

    const user = await context!.db.user.findUnique({ where: { account } });

    if (!user) {
      const hashPassword = bcryptjs.hashSync(password, salt);
      const newUser = await context!.db.user.create({
        data: { account, name: account, password: hashPassword, isAdmin: account === ADMIN_ACCOUNT, phone: account },
      });
      return newUser!;
    }

    if (user.account === ADMIN_ACCOUNT && !user.isAdmin) {
      const newUser = await context!.db.user.update({
        where: { id: user.id },
        data: { isAdmin: true },
      });
      return newUser;
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new AuthorizationError('密码错误');
    }

    return user;
  }),
  'user-pass'
);

export const authUser = async (request: Request, context: AppLoadContext) => {
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const dbUser = await context.db.user.findUnique({ where: { id: sessionUser?.id ?? '' } });
  if (dbUser) {
    return dbUser;
  } else {
    redirect('/login');
    return null;
  }
};
