import { CheckList } from '@prisma/client';
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Ghost } from 'lucide-react';
import CheckListCard from '~/components/CheckListCard';
import Header from '~/components/Header';
import { Button } from '~/components/ui/button';
import { authUser } from '~/services/auth.server';
import { typedjson, useTypedFetcher, useTypedLoaderData } from 'remix-typedjson';
import CheckListStatusTabs from '~/components/CheckListStatusTabs';

export type LoaderType = { checkList: CheckList[] };

export const meta: MetaFunction = () => {
  return [{ title: '我的清单' }];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const user = await authUser(request, context);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const statusQuery = status && status !== 'ALL' ? { status } : {};

  const checkList = await context.db.checkList.findMany({ where: { userId: user?.id ?? '', ...statusQuery } });

  return typedjson({ checkList });
};

export default function ConsumerHome() {
  const loaderData = useTypedLoaderData<typeof loader>();

  const fetcher = useTypedFetcher<typeof loader>({ key: 'fetchCheckList' });

  const checkList = fetcher.data ? fetcher.data.checkList : loaderData.checkList;

  return (
    <div className='py-14'>
      <Header title='我的清单' isBack />
      <CheckListStatusTabs
        onValueChange={(v) => {
          const formData = new FormData();
          formData.append('status', v);
          fetcher.submit(formData);
        }}
      />

      {checkList && checkList.length > 0 ? (
        <div className='flex flex-col gap-4 p-4'>
          {checkList?.map((item) => (
            <CheckListCard
              key={item.id}
              checkList={item as CheckList}
              footer={
                <>
                  <Button variant={'secondary'} size='sm' asChild>
                    {item.status === 'WAIT' && <span>取消</span>}
                  </Button>
                  <Button variant={'default'} size='sm'>
                    详情
                  </Button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div className='mt-20 flex flex-col items-center gap-2'>
          <Ghost className='size-8 text-zinc-800' />
          <h3 className='font-semibold'>暂无数据</h3>
        </div>
      )}
    </div>
  );
}
