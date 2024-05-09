import { Button, buttonVariants } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { ChevronRight, Smartphone, Store } from 'lucide-react';
import { Link, useRouteLoaderData } from '@remix-run/react';
import { loader as rootLoader } from '~/root';

export default function AdminMe() {
  const { user } = useRouteLoaderData<typeof rootLoader>('root') ?? {};

  return (
    <div className='flex flex-col'>
      <div className='space-y-2 border-b border-border p-4'>
        <p className='flex items-center gap-2 text-xl font-bold'>
          <Store />
          {user?.name}
        </p>
        <p className='flex items-center gap-2'>
          <Smartphone className='size-4' />
          {user?.phone ?? '--'}
        </p>
      </div>

      <div className='mt-4 grid grid-cols-2 gap-4 p-4'>
        <CustomCard link='/shop/invite-user' title='修改信息' desc='修改店铺名称、电话号码等' btnText='立即修改' className='col-span-1' />
        <CustomCard link='/shop/goods' title='我的商品' desc='管理商品，删除、添加等' btnText='立即前往' className='col-span-1' />
        <CustomCard link='/shop/user-list' title='用户列表' desc='查看所有用户及其对应的清单' btnText='立即查看' className='col-span-1' />
      </div>
      <div className='fixed bottom-16 left-0  flex w-full justify-center '>
        <Button variant='link' className={cn('w-32 text-sm text-muted-foreground')}>
          退出登录
        </Button>
      </div>
    </div>
  );
}

const CustomCard = (props: { link: string; title: string; desc: string; btnText: string; className?: string }) => {
  const { link, title, desc, className, btnText } = props;
  return (
    <Card className={cn('col-span-1 flex flex-col justify-between', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className='w-full'>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link to={link} className={buttonVariants({ variant: 'secondary' })}>
          {btnText} <ChevronRight className='size-4 text-foreground' />
        </Link>
      </CardContent>
    </Card>
  );
};
