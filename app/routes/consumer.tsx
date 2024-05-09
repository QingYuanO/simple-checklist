import { Outlet } from '@remix-run/react';
import { Store, User } from 'lucide-react';
import TabBar from '~/components/TabBar';

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
