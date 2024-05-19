import { MetaFunction } from '@remix-run/cloudflare';
import { Link, useRouteLoaderData } from '@remix-run/react';
import { User, Smartphone, ChevronRight } from 'lucide-react';
import { loader as rootLoader } from '~/root';
export const meta: MetaFunction = () => {
  return [{ title: '我的' }];
};

export default function ConsumerMe() {
  const { user } = useRouteLoaderData<typeof rootLoader>('root') ?? {};
  
  return (
    <div className='flex flex-col'>
      <div className='space-y-2 border-b border-border p-4'>
        <p className='flex items-center gap-2 text-xl font-bold'>
          <User />
          {user?.name}
        </p>
        <p className='flex items-center gap-2'>
          <Smartphone className='size-4' />
          {user?.phone}
        </p>
      </div>

      <div className='mt-4 flex flex-col gap-4 p-4'>
        <Link to='/consumer/edit-info' className='flex items-center justify-between rounded border border-border p-4'>
          <div>修改信息</div>
          <ChevronRight />
        </Link>
        <Link to='/consumer/check-list' className='flex items-center justify-between rounded border border-border p-4'>
          <div>我的清单</div>
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}
