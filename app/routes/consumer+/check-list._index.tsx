import { CheckList } from '@prisma/client';
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Ghost } from 'lucide-react';
import CheckListCard from '~/components/CheckListCard';
import Header from '~/components/Header';
import { Button, buttonVariants } from '~/components/ui/button';
import { authUser } from '~/services/auth.server';
import { typedjson, useTypedFetcher, useTypedLoaderData } from 'remix-typedjson';
import CheckListStatusTabs from '~/components/CheckListStatusTabs';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { useDebouncedCallback } from 'use-debounce';
import { Link, useSubmit } from '@remix-run/react';
import { checkListStatusEnum } from '~/lib/validate';
import { useSetAtom } from 'jotai';
import { selectedGoodsListFamily } from '~/lib/atom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

export type LoaderType = { checkList: CheckList[] };

export const meta: MetaFunction = () => {
  return [{ title: '我的清单' }];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const user = await authUser(request, context);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const statusQuery = status && status !== 'ALL' ? { status } : {};

  const checkList = await context.db.checkList.findMany({
    where: { userId: user?.id ?? '', ...statusQuery },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return typedjson({ checkList });
};

export const action = async ({ request, context }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  const _action = formData.get('_action') as string;

  const errorTip = _action === 'cancel' ? '修改失败' : ' 删除失败';
  const successTip = _action === 'cancel' ? '修改成功' : ' 删除成功';

  if (!id) {
    return jsonWithError(
      { success: false },
      {
        message: errorTip,
      }
    );
  }

  const checkList = await context.db.checkList.findUnique({
    where: {
      id: id,
    },
  });
  if (!checkList) {
    return jsonWithError(
      { success: false },
      {
        message: errorTip,
      }
    );
  }

  if (_action === 'cancel') {
    await context.db.checkList.update({
      data: {
        status,
      },
      where: {
        id: id,
      },
    });
  }

  if (_action === 'delete') {
    await context.db.checkList.delete({
      where: {
        id: id,
      },
    });
  }

  return jsonWithSuccess(
    {
      success: true,
    },
    {
      message: successTip,
    }
  );
};

export default function ConsumerHome() {
  const loaderData = useTypedLoaderData<typeof loader>();

  const fetcher = useTypedFetcher<typeof loader>({ key: 'fetchCheckList' });
  const submit = useSubmit();
  const setSelectedGoods = useSetAtom(selectedGoodsListFamily({ id: 'update', checkListGoodsList: [] }));
  const checkList = fetcher.data ? fetcher.data.checkList : loaderData.checkList;

  const handleCancelCheckList = useDebouncedCallback(
    // function
    (goods: CheckList) => {
      const formData = new FormData();
      formData.append('id', goods.id);
      formData.append('_action', 'cancel');
      formData.append('status', checkListStatusEnum.Values.CANCEL);
      submit(formData, { method: 'post', replace: true });
    },
    500
  );
  const handleDeleteCheckList = useDebouncedCallback(
    // function
    (goods: CheckList) => {
      const formData = new FormData();
      formData.append('id', goods.id);
      formData.append('_action', 'delete');
      submit(formData, { method: 'delete', replace: true });
    },
    500
  );

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
        <div className='flex flex-col gap-4 px-4 pb-4'>
          {checkList?.map((item) => (
            <CheckListCard
              key={item.id}
              checkList={item as CheckList}
              footer={
                <>
                  {item.status === checkListStatusEnum.Values.WAIT ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant={'secondary'} size='sm'>
                          取消
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>提示</AlertDialogTitle>
                          <AlertDialogDescription>确定取消吗?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancelCheckList(item)}>确定</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='destructive' size='sm'>
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>提示</AlertDialogTitle>
                          <AlertDialogDescription>确定删除吗?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCheckList(item)}>确定</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {item.status === checkListStatusEnum.Values.WAIT ? (
                    <Link
                      onClick={() => {
                        setSelectedGoods([]);
                      }}
                      className={buttonVariants({ variant: 'default', size: 'sm' })}
                      to={`/consumer/check-list/confirm?type=update&id=${item.id}`}
                    >
                      编辑
                    </Link>
                  ) : (
                    <Link
                      onClick={() => {
                        setSelectedGoods([]);
                      }}
                      className={buttonVariants({ variant: 'default', size: 'sm' })}
                      to={`/consumer/check-list/confirm?type=update&id=${item.id}`}
                    >
                      详情
                    </Link>
                  )}
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
