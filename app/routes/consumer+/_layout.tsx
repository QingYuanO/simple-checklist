import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, redirect, useLocation } from '@remix-run/react';
import { Store, User } from 'lucide-react';
import TabBar from '~/components/TabBar';
import { authUser } from '~/services/auth.server';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await authUser(request, context);
  return !user?.isAdmin ? redirect('/admin') : null;
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
