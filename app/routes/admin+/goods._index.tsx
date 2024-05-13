import { Goods } from '@prisma/client';
import { LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { Ghost, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { z } from 'zod';
import Header from '~/components/Header';
import { Button, buttonVariants } from '~/components/ui/button';

type LoaderData = {
  pages: Goods[];
  nextPage: number | null;
  total: number;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const page = z.coerce.number().parse(searchParams.get('page') ?? 1);
  const take = 8;
  const count = await context.db.goods.count();

  const pages = await context.db.goods.findMany({
    take,
    skip: (page - 1) * take,
    orderBy: {
      createdAt: 'desc',
    },
  });
  const hasMore = Math.ceil(count / take) > page;
  return { pages, nextPage: hasMore ? page + 1 : null, total: count };
};

export default function Components() {
  const initPages = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();

  const [items, setItems] = useState<Goods[]>(initPages.pages);

  useEffect(() => {
    if (!fetcher.data || fetcher.state === 'loading') {
      return;
    }

    if (fetcher.data) {
      const newItems = fetcher.data.pages;
      setItems((prevAssets) => [...prevAssets, ...newItems]);
    }
  }, [fetcher]);

  const nextPage = fetcher.data ? fetcher.data?.nextPage : initPages.nextPage;

  return (
    <div className='pt-14 safe-b'>
      <Header
        title='管理商品'
        rightContent={
          <Link to='/admin/goods/edit' className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            添加
          </Link>
        }
        isBack
      />

      {items && items.length > 0 ? (
        <div className='flex flex-col gap-4 p-4'>
          {items.map((goods) => (
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
          <InView
            as='div'
            onChange={(inView) => {
              if (inView && nextPage) {
                fetcher.load(`?index&page=${nextPage}`);
              }
            }}
          >
            {nextPage ? (
              <div className=' flex items-center justify-center'>
                <Loader2 className='size-4 animate-spin' />
                <p className='text-sm'>加载中</p>
              </div>
            ) : (
              <div className=' flex items-center justify-center'>
                <p className='text-sm text-muted-foreground'>没有更多了</p>
              </div>
            )}
          </InView>
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
