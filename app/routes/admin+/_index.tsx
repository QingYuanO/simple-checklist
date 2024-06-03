import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { typedjson, useTypedFetcher, useTypedLoaderData } from 'remix-typedjson';
import { CheckList } from '@prisma/client';
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useSubmit } from '@remix-run/react';
import { checkListStatusEnum } from '~/lib/validate';
import { Ghost } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

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
import { Button } from '~/components/ui/button';

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

  await context.db.checkList.update({
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
  const submit = useSubmit();

  const checkList = fetcher.data ? fetcher.data.checkList : loaderData.checkList;

  const handleChangeCheckListStatus = useDebouncedCallback((data: CheckList, status: checkListStatusEnum) => {
    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('status', status);
    submit(formData, { method: 'post', replace: true });
  }, 500);

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
          {checkList?.map(item => (
            <CheckListCard
              key={item.id}
              checkList={item as CheckList}
              footer={
                <>
                  <Button variant={'secondary'} size="sm" asChild>
                    <a href={`tel:${item.phone}`}>拨打电话</a>
                  </Button>
                  {DETAIL_STATUS.includes(item.status as checkListStatusEnum) && (
                    <Button variant="default" size="sm">
                      详情
                    </Button>
                  )}
                  {item.status === checkListStatusEnum.Values.PROGRESS && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm">
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
                          <AlertDialogAction onClick={() => handleChangeCheckListStatus(item, checkListStatusEnum.Values.DONE)}>
                            确定
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {item.status === checkListStatusEnum.Values.WAIT && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm">
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
                          <AlertDialogAction onClick={() => handleChangeCheckListStatus(item, checkListStatusEnum.Values.PROGRESS)}>
                            确定
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              }
            />
          ))}
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
