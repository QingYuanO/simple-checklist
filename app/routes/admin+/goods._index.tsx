import { useEffect } from 'react';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { Goods } from '@prisma/client';
import { ActionFunctionArgs } from '@remix-run/cloudflare';
import { Link, useActionData, useFetcher } from '@remix-run/react';
import { useQueryClient } from '@tanstack/react-query';
import { Ghost } from 'lucide-react';

import GoodsList from '~/components/GoodsList';
import Header from '~/components/Header';
import { Button, buttonVariants } from '~/components/ui/button';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get('id') as string;
  const _action = formData.get('_action') as string;
  if (!id || !_action) {
    return jsonWithError(
      { success: false, goods: null },
      {
        message: '修改失败',
      }
    );
  }

  const goods = await context.db.goods.findUnique({
    where: {
      id: id,
    },
  });
  if (!goods) {
    return jsonWithError(
      { success: false, goods: null },
      {
        message: '修改失败',
      }
    );
  }

  if (_action === 'switchActivity') {
    const goodsData = await context.db.goods.update({
      data: {
        isActivity: !goods.isActivity,
      },
      where: {
        id: id,
      },
    });
    return jsonWithSuccess(
      {
        success: true,
        goods: goodsData,
      },
      {
        message: '修改成功',
      }
    );
  }
}

export default function Components() {
  const lastResult = useActionData<typeof action>();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (lastResult?.success) {
      queryClient.invalidateQueries({ queryKey: ['goods'] });
    }
  }, [lastResult, queryClient]);

  return (
    <div className="pt-14 safe-b">
      <Header
        title="管理商品"
        rightContent={
          <Link to="/admin/goods/edit" className={buttonVariants({ variant: 'link', size: 'sm', className: 'pr-0' })}>
            添加
          </Link>
        }
        isBack
      />
      <GoodsList
        renderItem={goods => (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow">
            <div className="flex flex-col gap-1">
              <p className="text font-bold">{goods.name}</p>
              <p className="text-sm text-muted-foreground">{goods.description}</p>
            </div>
            <div className="flex justify-end gap-2">
              <SwitchActiveButton goods={goods} />

              <Link
                to={`/admin/goods/edit/${goods.id}`}
                className={buttonVariants({
                  variant: 'default',
                  size: 'sm',
                })}
              >
                修改
              </Link>
            </div>
          </div>
        )}
        empty={
          <div className="mt-20 flex flex-col items-center gap-2">
            <Ghost className="size-8 text-zinc-800" />
            <h3 className="font-semibold">你还没有商品</h3>
            <Link to="/admin/goods/edit" className={buttonVariants({ variant: 'secondary' })}>
              立即创建
            </Link>
          </div>
        }
      />
    </div>
  );
}

const SwitchActiveButton = (props: { goods: Goods }) => {
  const { goods } = props;
  const fetcher = useFetcher<typeof action>();
  const isLoading = fetcher.state === 'submitting';

  const isActivity = fetcher.formData
    ? fetcher.formData.get('isActivity') === '1'
    : fetcher.data
      ? fetcher.data.goods?.isActivity
      : goods.isActivity;

  return (
    <fetcher.Form method="post">
      <Button
        type="submit"
        name="_action"
        value="switchActivity"
        size="sm"
        variant={isActivity ? 'destructive' : 'secondary'}
        disabled={isLoading}
      >
        {isActivity ? '下架' : '上架'}
      </Button>
      <input type="hidden" name="id" readOnly defaultValue={goods.id} />
      <input type="hidden" name="isActivity" readOnly defaultValue={goods.isActivity ? '0' : '1'} />
    </fetcher.Form>
  );
};
