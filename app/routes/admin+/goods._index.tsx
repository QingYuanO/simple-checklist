import { ActionFunctionArgs } from '@remix-run/cloudflare';
import { Link, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Ghost } from 'lucide-react';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import Header from '~/components/Header';
import { Button, buttonVariants } from '~/components/ui/button';

import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Goods } from '@prisma/client';
import { GoodsFetchResponse, fetchGoods } from '../api+/goods';
import InfiniteList from '~/components/InfiniteList';
export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get('id') as string;
  if (!id) {
    return jsonWithError(
      { success: false },
      {
        message: '修改失败',
      }
    );
  }

  const goods = await context.db.goods.findUnique({
    where: {
      id: id,
    },
  });
  if (!goods) {
    return jsonWithError(
      { success: false },
      {
        message: '修改失败',
      }
    );
  }

  await context.db.goods.update({
    data: {
      isActivity: !goods.isActivity,
    },
    where: {
      id: id,
    },
  });

  return jsonWithSuccess(
    {
      success: true,
    },
    {
      message: '修改成功',
    }
  );
}

export default function Components() {
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const submit = useSubmit();

  const { data, hasNextPage, fetchNextPage, refetch, isLoading } = useInfiniteQuery({
    queryKey: ['goods'],
    queryFn: async ({ pageParam }) => await fetchGoods(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: GoodsFetchResponse) => lastPage.nextPage,
  });

  useEffect(() => {
    if (lastResult?.success) {
      queryClient.invalidateQueries({ queryKey: ['goods'] });
    }
  }, [lastResult, queryClient]);

  const handleSwitchActive = useDebouncedCallback(
    // function
    (goods: Goods) => {
      const formData = new FormData();
      formData.append('id', goods.id);
      submit(formData, { method: 'post', replace: true });
    },
    // delay in ms
    500
  );

  const goods = data ? data.pages.map((page) => page.pages).flat() : [];
  return (
    <div className='pt-14 safe-b'>
      <Header
        title='管理商品'
        rightContent={
          <Link to='/admin/goods/edit' className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'pr-0' })}>
            添加
          </Link>
        }
        isBack
      />
      <InfiniteList
        refetch={refetch}
        total={goods?.length ?? 0}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        hasData={!!goods.length}
        empty={
          <div className='mt-20 flex flex-col items-center gap-2'>
            <Ghost className='size-8 text-zinc-800' />
            <h3 className='font-semibold'>你还没有商品</h3>
            <Link to='/admin/goods/edit' className={buttonVariants({ variant: 'secondary' })}>
              立即创建
            </Link>
          </div>
        }
      >
        {goods?.map((goods) => (
          <div key={goods.id} className='flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow'>
            <div className='flex flex-col gap-1'>
              <p className='text font-bold'>{goods.name}</p>
              <p className='text-sm text-muted-foreground'>{goods.description}</p>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                type='submit'
                name='_action'
                value='switchActivity'
                size='sm'
                variant={goods.isActivity ? 'destructive' : 'secondary'}
                disabled={navigation.state !== 'idle'}
                onClick={() => handleSwitchActive(goods)}
              >
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
      </InfiniteList>
    </div>
  );
}
