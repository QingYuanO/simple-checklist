import { LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Outlet, redirect } from '@remix-run/react';
import { ClipboardList, User } from 'lucide-react';
import TabBar from '~/components/TabBar';
import { authenticator } from '~/services/auth.server';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/wechat-auth',
  });
  if (!sessionUser.isAdmin) {
    return redirect('/consumer');
  }

  const user = await context.db.user.findUnique({ where: { id: sessionUser.id } });

  return json({ user });
};

export default function ConsumerLayout() {
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
      <TabBar routes={routes} />
    </div>
  );
}
