import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { typedjson, useTypedFetcher, useTypedLoaderData } from 'remix-typedjson';
import { CheckList } from '@prisma/client';
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Link, useFetcher } from '@remix-run/react';
import { checkListStatusEnum } from '~/lib/validate';
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

export const meta: MetaFunction = () => {
  return [{ title: '清单' }];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const statusQuery = status && status !== 'ALL' ? { status } : {};

  const checkList = await context.db.checkList.findMany({
    where: { ...statusQuery },
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

  const errorTip = ' 操作失败';
  const successTip = ' 操作成功';

  if (!id || !status) {
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

  const updateCheckList = await context.db.checkList.update({
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
      checkList: updateCheckList,
    },
    {
      message: successTip,
    }
  );
};

const DETAIL_STATUS = [checkListStatusEnum.Values.DONE, checkListStatusEnum.Values.CANCEL] as checkListStatusEnum[];

export default function AdminHome() {
  const loaderData = useTypedLoaderData<typeof loader>();

  const fetcher = useTypedFetcher<typeof loader>({ key: 'fetchCheckList' });

  const checkList = fetcher.data ? fetcher.data.checkList : loaderData.checkList;

  return (
    <div className="pb-28 pt-14">
      <Header title="我的清单" />
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

const ActionCheckListCard = (props: { checkList: CheckList }) => {
  const fetcher = useFetcher<typeof action>();
  const isLoading = fetcher.state === 'submitting';

  const checkList = fetcher.formData
    ? { ...props.checkList, status: fetcher.formData.get('status') }
    : fetcher.data
      ? fetcher.data.checkList
        ? fetcher.data.checkList
        : props.checkList
      : props.checkList;

  return (
    <CheckListCard
      checkList={checkList as CheckList}
      footer={
        <>
          <Button variant={'secondary'} size="sm" asChild>
            <a href={`tel:${checkList.phone}`}>拨打电话</a>
          </Button>

          {DETAIL_STATUS.includes(checkList.status as checkListStatusEnum) && <DetailLink id={checkList.id} />}
          {checkList.status === checkListStatusEnum.Values.PROGRESS && (
            <div className="space-x-2">
              <DetailLink id={checkList.id} type="outline" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" size="sm" disabled={isLoading}>
                    送达
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>提示</AlertDialogTitle>
                    <AlertDialogDescription>确定已将货物送达吗？</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <fetcher.Form method="post">
                      <AlertDialogAction className="w-full" type="submit">
                        确定
                      </AlertDialogAction>
                      <input type="hidden" name="id" readOnly defaultValue={checkList.id} />
                      <input type="hidden" name="status" readOnly defaultValue={checkListStatusEnum.Values.DONE} />
                    </fetcher.Form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {checkList.status === checkListStatusEnum.Values.WAIT && (
            <div className="space-x-2">
              <DetailLink id={checkList.id} type="outline" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" size="sm" disabled={isLoading}>
                    确认
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>提示</AlertDialogTitle>
                    <AlertDialogDescription>确定接单吗？</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <fetcher.Form method="post">
                      <AlertDialogAction className="w-full" type="submit">
                        确定
                      </AlertDialogAction>
                      <input type="hidden" name="id" readOnly defaultValue={checkList.id} />
                      <input type="hidden" name="status" readOnly defaultValue={checkListStatusEnum.Values.PROGRESS} />
                    </fetcher.Form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </>
      }
    />
  );
};

const DetailLink = ({ id, type }: { id: string; type?: 'outline' | 'default' }) => {
  return (
    <Link to={`/check-list/${id}`} rel="prefetch" className={buttonVariants({ variant: type ?? 'default', size: 'sm' })}>
      详情
    </Link>
  );
};
