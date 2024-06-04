import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getInventoryStatusText } from '~/lib/utils';
import { CheckListSchema, checkListStatusEnum } from '~/lib/validate';
import { authUser } from '~/services/auth.server';

import Header from '~/components/Header';

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  await authUser(request, context);

  const id = params.id;

  if (!id) {
    return typedjson({ checkList: null });
  }

  const checkList = await context.db.checkList.findUnique({ where: { id }, include: { User: true } });

  return typedjson({ checkList });
};

export default function CheckListDetail() {
  const { checkList } = useTypedLoaderData<typeof loader>();
  const goodsList = JSON.parse(checkList?.goodsList || '[]') as CheckListSchema['goodsList'];
  return (
    <div className="pt-14">
      <Header title="清单详情" isBack />
      <div className="flex flex-col gap-4 p-4 print:text-sm">
        <div className="flex flex-col gap-2">
          <div className="text-lg">用户信息</div>
          <div className="grid grid-cols-2 gap-2 divide-y rounded-lg border border-border bg-card py-2 shadow print:gap-1 print:rounded print:py-2 print:shadow-none">
            <div className="col-span-2 flex items-center justify-between gap-1 px-4 pt-2 first:pt-0 print:px-2 print:pt-1">
              <p className="text font-bold">姓名</p>
              <p className="text-sm text-muted-foreground">{checkList?.User?.name}</p>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-1 px-4 pt-2 first:pt-0 print:px-2 print:pt-1">
              <p className="text font-bold">电话</p>
              <p className="text-sm text-muted-foreground">{checkList?.phone}</p>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-1 px-4 pt-2 first:pt-0 print:px-2 print:pt-1">
              <p className="text font-bold">地址</p>
              <p className="w-2/3 text-end text-sm text-muted-foreground">{checkList?.address ?? '未填写'}</p>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-1 px-4 pt-2 first:pt-0 print:px-2 print:pt-1">
              <p className="text font-bold">状态</p>
              <p className="text-sm text-muted-foreground">{getInventoryStatusText(checkList?.status as checkListStatusEnum)}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-lg">商品</div>
          <div className="grid grid-cols-2 gap-2 divide-y rounded-lg border border-border bg-card py-2 shadow print:gap-1 print:rounded print:py-2 print:shadow-none">
            {goodsList.map(item => (
              <div key={item.id} className="col-span-2 flex flex-col gap-2 px-4 pt-2 first:pt-0 print:px-2 print:pt-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text font-bold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">x{item.num}件</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {checkList?.memo && (
          <div className="flex flex-col gap-2">
            <div className="text-lg">备注</div>
            <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow print:gap-1 print:rounded print:p-2 print:shadow-none">
              {checkList.memo}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
