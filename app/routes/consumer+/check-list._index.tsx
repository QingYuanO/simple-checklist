import { Goods } from '@prisma/client';
import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Ghost } from 'lucide-react';
import Header from '~/components/Header';
import { Button } from '~/components/ui/button';
import { getInventoryStatusColor, getInventoryStatusText } from '~/lib/utils';
import { checkListStatusEnum } from '~/lib/validate';
import { authUser } from '~/services/auth.server';

export const meta: MetaFunction = () => {
  return [{ title: '我的清单' }];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const user = await authUser(request, context);

  const checkList = await context.db.checkList.findMany({ where: { userId: user?.id ?? '' } });
  return json({ checkList });
};

export default function ConsumerHome() {
  const { checkList } = useLoaderData<typeof loader>();

  return (
    <div className='py-14'>
      <Header title='我的清单' isBack />
      {checkList && checkList.length > 0 ? (
        <div className='flex flex-col gap-4 p-4'>
          {checkList?.map((item) => {
            const goodsList = JSON.parse(item.goodsList) as Goods[];
            return (
              <div key={item.id} className='flex flex-col gap-2 divide-y divide-border rounded-lg border border-border bg-card p-4 shadow'>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center justify-between'>
                    <p className='text font-bold'>{item.name}</p>
                    <p style={{ color: getInventoryStatusColor(item.status as checkListStatusEnum) }} className='text-sm'>
                      {getInventoryStatusText(item.status as checkListStatusEnum)}
                    </p>
                  </div>
                  <p className='text-sm text-muted-foreground'>{item.memo}</p>
                </div>
                <div className='flex flex-col gap-1 pt-2'>
                  <p className='text-sm text-foreground'>电话：{item?.phone}</p>
                  <p className='text-sm text-foreground'>商品：共{goodsList.length}种</p>
                </div>
                <div className='flex justify-between pt-2'>
                  <Button variant={'secondary'} size='sm' asChild>
                    <a href={`tel:${item?.phone}`}>拨打电话</a>
                  </Button>
                  <Button variant={'default'} size='sm'>
                    {item.status === 'WAIT' ? '编辑' : '详情'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='mt-20 flex flex-col items-center gap-2'>
          <Ghost className='size-8 text-zinc-800' />
          <h3 className='font-semibold'>你还没有清单，快去添加吧</h3>
        </div>
      )}
    </div>
  );
}
