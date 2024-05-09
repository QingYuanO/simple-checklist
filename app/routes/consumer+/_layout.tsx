import { LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Outlet, redirect } from '@remix-run/react';
import { Store, User } from 'lucide-react';
import TabBar from '~/components/TabBar';
import { authenticator } from '~/services/auth.server';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/wechat-auth',
  });
  if (sessionUser.isAdmin) {
    return redirect('/admin');
  }
  const user = await context.db.user.findUnique({ where: { id: sessionUser.id } });
  return json({ user });
};

export default function ConsumerLayout() {
  const routes = [
    {
      name: '商品',
      icon: <Store className='mr-0.5 size-4' />,
      pathname: '/consumer',
    },
    {
      name: '我的',
      icon: <User className='mr-0.5 size-4' />,
      pathname: '/consumer/me',
    },
  ];

  return (
    <div>
      <Outlet />
      <TabBar routes={routes} />
    </div>
  );
}
