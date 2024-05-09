import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { useSubmit } from '@remix-run/react';
import { useEffect } from 'react';
import { authenticator } from '~/services/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {});
  if (user) {
    return user.isAdmin ? redirect('/admin') : redirect('/consumer');
  }

  return null;
};

export async function action({ request, context }: ActionFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
  const { WECHAT_APPID } = context.cloudflare.env;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectUri = 'http://192.168.3.2/wechat-auth';
  const oauth2 = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WECHAT_APPID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
  if (!code) {
    return redirect(oauth2);
  }

  return await authenticator.authenticate('wechat-auth', request, {
    successRedirect: '/',
    failureRedirect: '/wechat-auth',
    context,
  });
}
export default function WechatAuth() {
  const submit = useSubmit();

  useEffect(() => {
    submit('/wechat-auth', { method: 'POST' });
  }, [submit]);
  return <div></div>;
}
