import { ReactNode, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Goods } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchGoods, GoodsFetchResponse } from '~/routes/api+/goods';

import InfiniteList from './InfiniteList';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface GoodsListProps {
  renderItem: (item: Goods) => JSX.Element;
  empty?: ReactNode;
}

export default function GoodsList(props: GoodsListProps) {
  const { renderItem } = props;
  const [word, setWord] = useState('');
  const { data, hasNextPage, fetchNextPage, refetch, isLoading } = useInfiniteQuery({
    queryKey: ['goods'],
    queryFn: async ({ pageParam }) => await fetchGoods({ page: pageParam, word }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: GoodsFetchResponse) => lastPage.nextPage,
  });

  const goodsList = data ? data.pages.map(page => page.pages).flat() : [];
  return (
    <Fragment>
      <div className="sticky top-14 z-50 flex w-full items-center space-x-2 bg-white px-4 py-4">
        <Input type="text" value={word} placeholder="输入商品名搜索" onInput={e => setWord(e.currentTarget.value)} />
        <Button onClick={() => refetch()}>搜索</Button>
      </div>
      <InfiniteList
        refetch={refetch}
        total={goodsList?.length ?? 0}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        hasData={!!goodsList.length}
        empty={props.empty}
      >
        <div className="flex flex-col gap-2">
          {goodsList.map(goods => (
            <Fragment key={goods.id}>{renderItem(goods)}</Fragment>
          ))}
        </div>
      </InfiniteList>
    </Fragment>
  );
}
