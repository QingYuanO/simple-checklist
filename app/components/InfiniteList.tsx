import { Loader2 } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PropsWithChildren } from 'react';

interface InfiniteListProps {
  isLoading: boolean;
  hasData: boolean;
  hasNextPage: boolean;
  total: number;
  fetchNextPage: () => void;
  refetch: () => void;
  empty?: React.ReactNode;
}

export default function InfiniteList(props: PropsWithChildren<InfiniteListProps>) {
  const { isLoading, hasData, hasNextPage, total, children, empty, fetchNextPage, refetch } = props;
  return (
    <div>
      {isLoading ? (
        <div className='mt-20 flex items-center justify-center'>
          <Loader2 className='size-6 animate-spin' />
          <p className='text-sm'>加载中...</p>
        </div>
      ) : hasData ? (
        <InfiniteScroll
          dataLength={total}
          next={fetchNextPage}
          className='flex flex-col gap-4 px-4 pb-4'
          hasMore={!!hasNextPage}
          loader={
            <div className=' flex items-center justify-center'>
              <Loader2 className='size-4' />
              <p className='text-sm'>加载中</p>
            </div>
          }
          endMessage={
            <div className=' flex items-center justify-center'>
              <p className='text-sm text-muted-foreground'>没有更多了</p>
            </div>
          }
          refreshFunction={() => refetch()}
          pullDownToRefresh
          pullDownToRefreshThreshold={60}
          pullDownToRefreshContent={<h3 style={{ textAlign: 'center' }}>&#8595; 下拉加载</h3>}
          releaseToRefreshContent={<h3 style={{ textAlign: 'center' }}>&#8593; 释放刷新</h3>}
        >
          {children}
        </InfiniteScroll>
      ) : (
        empty
      )}
    </div>
  );
}
