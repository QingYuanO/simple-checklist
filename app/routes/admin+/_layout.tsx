import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, redirect, useLocation } from '@remix-run/react';
import { ClipboardList, User } from 'lucide-react';
import TabBar from '~/components/TabBar';
import { authenticator } from '~/services/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/wechat-auth',
  });
  if (!sessionUser.isAdmin) {
    return redirect('/consumer');
  }

  return null;
};

export default function ConsumerLayout() {
  const { pathname } = useLocation();
  const routes = [
    {
      name: '清单',
      icon: <ClipboardList className='mr-0.5 size-4' />,
      pathname: '/admin',
    },
    {
      name: '我的',
      icon: <User className='mr-0.5 size-4' />,
      pathname: '/admin/me',
    },
  ];

  return (
    <div>
      <Outlet />
      {routes.map((item) => item.pathname).includes(pathname) && <TabBar routes={routes} />}
    </div>
  );
}
