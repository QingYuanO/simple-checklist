import { Link, useLocation } from '@remix-run/react';

import { buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface TabBarProps {
  routes: {
    pathname: string;
    icon: React.ReactElement;
    name: string;
  }[];
}

export default function TabBar(props: TabBarProps) {
  const { routes } = props;
  const { pathname } = useLocation();

  return (
    <div className='fixed bottom-0 left-0 right-0 z-10 box-content flex h-14 safe-b items-center shadow justify-around border-t border-border bg-background text-sm text-zinc-400 sm:mx-auto sm:max-w-2xl'>
      {routes.map((route) => (
        <Link
          key={route.pathname}
          to={{ pathname: route.pathname }}
          replace
          className={buttonVariants({
            variant: 'ghost',
            className: cn('my-2', pathname === route.pathname && 'text-foreground'),
          })}
        >
          {route.icon}
          {route.name}
        </Link>
      ))}
    </div>
  );
}
