import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';

import { authenticator } from '~/services/auth.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Easy清单' },
    {
      name: 'description',
      content: '易于使用的货物清单管理',
    },
  ];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/wechat-auth',
  });
  console.log(user);

  return user.isAdmin ? redirect('/admin') : redirect('/consumer');
};
export default function Index() {
  return null;
}
