import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { typedjson, useTypedFetcher, useTypedLoaderData } from 'remix-typedjson';
import { CheckList } from '@prisma/client';
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Link, useFetcher } from '@remix-run/react';
import { selectedGoodsListFamily } from '~/lib/atom';
import { checkListStatusEnum } from '~/lib/validate';
import { authUser } from '~/services/auth.server';
import { useSetAtom } from 'jotai';
import { Ghost } from 'lucide-react';

import CheckListCard from '~/components/CheckListCard';
import CheckListStatusTabs from '~/components/CheckListStatusTabs';
import Header from '~/components/Header';
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
import { Button, buttonVariants } from '~/components/ui/button';

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

  if (!id || !_action) {
    return jsonWithError(
      { success: false, checkList: null },
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
      { success: false, checkList: null },
      {
        message: errorTip,
      }
    );
  }

  if (_action === 'cancel') {
    const checkList = await context.db.checkList.update({
      data: {
        status,
      },
      where: {
        id: id,
      },
    });
    return jsonWithSuccess(
      {
        success: true,
        checkList,
      },
      {
        message: successTip,
      }
    );
  }

  if (_action === 'delete') {
    const checkList = await context.db.checkList.delete({
      where: {
        id: id,
      },
    });
    return jsonWithSuccess(
      {
        success: true,
        checkList,
      },
      {
        message: successTip,
      }
    );
  }

  return jsonWithSuccess(
    {
      success: true,
      checkList: null,
    },
    {
      message: successTip,
    }
  );
};

const updateAtom = selectedGoodsListFamily({ id: 'update', checkListGoodsList: [] });

export default function ConsumerHome() {
  const loaderData = useTypedLoaderData<typeof loader>();

  const fetcher = useTypedFetcher<typeof loader>({ key: 'fetchCheckList' });
  const checkList = fetcher.data ? fetcher.data.checkList : loaderData.checkList;

  return (
    <div className="py-14">
      <Header title="我的清单" isBack />
      <CheckListStatusTabs
        onValueChange={v => {
          const formData = new FormData();
          formData.append('status', v);
          fetcher.submit(formData);
        }}
      />

      {checkList && checkList.length > 0 ? (
        <div className="flex flex-col gap-4 px-4 pb-4">
          {checkList?.map(item => <ActionCheckListCard key={item.id} checkList={item} />)}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center gap-2">
          <Ghost className="size-8 text-zinc-800" />
          <h3 className="font-semibold">暂无数据</h3>
        </div>
      )}
    </div>
  );
}

const DetailLink = ({ id }: { id: string }) => {
  return (
    <Link to={`/check-list/${id}`} className={buttonVariants({ variant: 'default', size: 'sm' })}>
      详情
    </Link>
  );
};

const ActionCheckListCard = (props: { checkList: CheckList }) => {
  const { checkList } = props;
  const setSelectedGoods = useSetAtom(updateAtom);
  const fetcher = useFetcher<typeof action>();
  const isLoading = fetcher.state === 'submitting';

  return (
    <CheckListCard
      checkList={checkList as CheckList}
      footer={
        <>
          {{
            WAIT: (
              <div className="space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={'secondary'} size="sm" disabled={isLoading}>
                      {isLoading ? '取消中...' : '取消'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>提示</AlertDialogTitle>
                      <AlertDialogDescription>确定取消吗?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <fetcher.Form method="post">
                        <AlertDialogAction className="w-full" type="submit" name="_action" value="cancel">
                          确定
                        </AlertDialogAction>
                        <input type="hidden" name="id" readOnly defaultValue={checkList.id} />
                        <input type="hidden" name="status" readOnly defaultValue={checkListStatusEnum.Values.CANCEL} />
                      </fetcher.Form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ),
            CANCEL: (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isLoading}>
                    {isLoading ? '删除中...' : '删除'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>提示</AlertDialogTitle>
                    <AlertDialogDescription>确定删除吗?</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <fetcher.Form method="post">
                      <AlertDialogAction className="w-full" type="submit" name="_action" value="delete">
                        确定
                      </AlertDialogAction>
                      <input type="hidden" name="id" readOnly defaultValue={checkList.id} />
                    </fetcher.Form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ),
          }[checkList.status as string] ?? <span></span>}

          {checkList.status === checkListStatusEnum.Values.WAIT ? (
            <Link
              onClick={() => {
                setSelectedGoods([]);
              }}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
              to={`/consumer/check-list/confirm?type=update&id=${checkList.id}`}
            >
              编辑
            </Link>
          ) : (
            <DetailLink id={checkList.id} />
          )}
        </>
      }
    />
  );
};
