import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchGoods, GoodsFetchResponse } from '~/routes/api+/goods';
import InfiniteList from './InfiniteList';
import { Goods } from '@prisma/client';
import { Fragment } from 'react/jsx-runtime';

interface GoodsListProps {
  renderItem: (item: Goods) => JSX.Element;
}

export default function GoodsList(props: GoodsListProps) {
  const { renderItem } = props;
  const { data, hasNextPage, fetchNextPage, refetch, isLoading } = useInfiniteQuery({
    queryKey: ['goods'],
    queryFn: async ({ pageParam }) => await fetchGoods(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: GoodsFetchResponse) => lastPage.nextPage,
  });
  const goodsList = data ? data.pages.map((page) => page.pages).flat() : [];
  return (
    <InfiniteList
      refetch={refetch}
      total={goodsList?.length ?? 0}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      hasData={!!goodsList.length}
    >
      <div className='flex flex-col gap-2'>
        {goodsList.map((goods) => (
          <Fragment key={goods.id}>{renderItem(goods)}</Fragment>
        ))}
      </div>
    </InfiniteList>
  );
}
