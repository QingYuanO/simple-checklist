import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';

import { authenticator } from '~/services/auth.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    {
      name: 'description',
      content: 'Welcome to Remix! Using Vite and Cloudflare!',
    },
  ];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/wechat-auth',
  });
  console.log(user);

  if (user) {
    return user.isAdmin ? redirect('/admin') : redirect('/consumer');
  }

  return null;
};
export default function Index() {
  return null;
}
