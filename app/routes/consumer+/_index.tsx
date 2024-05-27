import { MetaFunction } from '@remix-run/cloudflare';
import { useInfiniteQuery } from '@tanstack/react-query';
import Header from '~/components/Header';
import { fetchGoods, GoodsFetchResponse } from '../api+/goods';
import InfiniteList from '~/components/InfiniteList';
import { cn } from '~/lib/utils';
import { Goods } from '@prisma/client';
import { PlusSquare, XSquare } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Link } from '@remix-run/react';
import { selectedGoodsListAtom } from '~/lib/atom';
import { useAtom } from 'jotai/react';
import GoodsCard from '~/components/GoodsCard';

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
  const goodsList = data ? data.pages.map((page) => page.pages).flat() : [];
  // const [selectedGoods, setSelectedGoods] = useState<string[]>([]);

  const [selectedGoods, setSelectedGoods] = useAtom(selectedGoodsListAtom);

  const handleSwitchSelectGoods = (goods: Goods) => {
    const isSelected = selectedGoods.find((item) => item.goods.id === goods.id);
    if (isSelected) {
      setSelectedGoods(selectedGoods.filter((item) => item.goods.id !== goods.id));
    } else {
      setSelectedGoods((prev) => [...prev, { num: 1, goods }]);
    }
  };

  return (
    <div className='pt-14 pb-28'>
      <Header title='商品' />
      <InfiniteList
        refetch={refetch}
        total={goodsList?.length ?? 0}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        hasData={!!goodsList.length}
      >
        <div className='flex flex-col gap-2'>
          {goodsList.map((goods) => {
            const isSelected = !!selectedGoods.find((item) => item.goods.id === goods.id);
            return <GoodsCard key={goods.id} goods={goods} onSwitchSelectGoods={handleSwitchSelectGoods} isSelected={isSelected} />;
          })}
        </div>
      </InfiniteList>
      {selectedGoods.length > 0 && (
        <div className='fixed inset-x-0 bottom-14 box-content safe-b z-10 flex h-14 items-center justify-between border-t border-border bg-background px-4 shadow sm:mx-auto sm:max-w-2xl'>
          <div className='text-sm'>已添加商品{selectedGoods.length}件</div>
          <Button variant={'default'} size='sm' asChild>
            <Link to={`/consumer/check-list/confirm`}>确认清单</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
