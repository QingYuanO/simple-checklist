import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, redirect, useLocation } from '@remix-run/react';
import { Store, User } from 'lucide-react';
import TabBar from '~/components/TabBar';
import { authenticator } from '~/services/auth.server';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/wechat-auth',
  });
  const dbUser = await context.db.user.findUnique({ where: { id: sessionUser?.id ?? '' } });
  if (dbUser) {
    return dbUser.isAdmin ? redirect('/admin') : null;
  } else {
    return redirect('/wechat-auth');
  }
};

export default function ConsumerLayout() {
  const { pathname } = useLocation();
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
      {routes.map((item) => item.pathname).includes(pathname) && <TabBar routes={routes} />}
    </div>
  );
}
