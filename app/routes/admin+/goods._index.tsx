import { LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { Ghost } from 'lucide-react';
import Header from '~/components/Header';
import { Button, buttonVariants } from '~/components/ui/button';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const goodsList = await context.db.goods.findMany();
  return json({ goodsList });
};

export default function Goods() {
  const { goodsList } = useLoaderData<typeof loader>();
  return (
    <div className='pt-14'>
      <Header
        title='管理商品'
        rightContent={
          <Link to='/admin/goods/edit' className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            添加
          </Link>
        }
        isBack
      />
      {goodsList && goodsList.length > 0 ? (
        <div className='flex flex-col gap-4 p-4'>
          {goodsList?.map((goods) => (
            <div key={goods.id} className='flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow'>
              <div className='flex flex-col gap-1'>
                <p className='text font-bold'>{goods.name}</p>
                <p className='text-sm text-muted-foreground'>{goods.description}</p>
              </div>
              <div className='flex justify-end gap-2'>
                <Button size='sm' variant={goods.isActivity ? 'destructive' : 'secondary'}>
                  {goods.isActivity ? '下架' : '上架'}
                </Button>
                <Link
                  to={`/admin/goods/edit/${goods.id}`}
                  className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                  })}
                >
                  修改
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='mt-20 flex flex-col items-center gap-2'>
          <Ghost className='size-8 text-zinc-800' />
          <h3 className='font-semibold'>你还没有商品</h3>
          <Link to='/admin/goods/edit' className={buttonVariants({ variant: 'secondary' })}>
            立即创建
          </Link>
        </div>
      )}
    </div>
  );
}
