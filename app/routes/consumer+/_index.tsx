import { MetaFunction } from '@remix-run/cloudflare';
import { useInfiniteQuery } from '@tanstack/react-query';
import Header from '~/components/Header';
import { fetchGoods, GoodsFetchResponse } from '../api+/goods';
import InfiniteList from '~/components/InfiniteList';
import { cn } from '~/lib/utils';
import { Goods } from '@prisma/client';
import { useState } from 'react';
import { PlusSquare, XSquare } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{ title: '商品' }];
};

export default function Components() {
  const { data, hasNextPage, fetchNextPage, refetch, isLoading } = useInfiniteQuery({
    queryKey: ['goods'],
    queryFn: async ({ pageParam }) => await fetchGoods(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: GoodsFetchResponse) => lastPage.nextPage,
  });
  const goods = data ? data.pages.map((page) => page.pages).flat() : [];
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);

  const handleSwitchSelectGoods = (goods: Goods) => {
    const isSelected = selectedGoods.find((item) => item === goods.id);
    if (isSelected) {
      setSelectedGoods(selectedGoods.filter((item) => item !== goods.id));
    } else {
      setSelectedGoods((prev) => [...prev, goods.id]);
    }
  };

  return (
    <div className='pt-14 pb-28'>
      <Header title='商品' />
      <InfiniteList
        refetch={refetch}
        total={goods?.length ?? 0}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        hasData={!!goods.length}
      >
        <div className='flex flex-col gap-2'>
          {goods.map((goods) => {
            const isSelected = !!selectedGoods.find((item) => item === goods.id);
            return (
              <div
                key={goods.id}
                className={cn(
                  'flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow',
                  isSelected && 'border-foreground border-2'
                )}
              >
                <div className='flex flex-col gap-1'>
                  <p className='text font-bold'>{goods.name}</p>
                  <p className='text-sm text-muted-foreground'>{goods.description}</p>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <div>{isSelected && <div className='text-sm text-foreground'>已添加</div>}</div>
                  <Button className='p-0 h-fit' variant='ghost' onClick={() => handleSwitchSelectGoods(goods)}>
                    {isSelected ? <XSquare className='cursor-pointer text-red-300' /> : <PlusSquare className='cursor-pointer' />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </InfiniteList>
      {selectedGoods.length > 0 && (
        <div className='fixed inset-x-0 bottom-14 box-content safe-b z-10 flex h-14 items-center justify-between border-t border-border bg-background px-4 shadow sm:mx-auto sm:max-w-2xl'>
          <div className='text-sm'>已添加商品{selectedGoods.length}件</div>
          <Button variant={'default'} size='sm' asChild>
            <Link to={`/consumer/check-list-confirm?ids=${selectedGoods}`}>确认清单</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
