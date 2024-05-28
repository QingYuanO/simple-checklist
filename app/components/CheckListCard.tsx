import { CheckList, Goods } from '@prisma/client';
import { ReactNode } from 'react';
import { getInventoryStatusColor, getInventoryStatusText } from '~/lib/utils';
import { checkListStatusEnum } from '~/lib/validate';

interface CheckListCardProps {
  checkList: CheckList;
  footer?: ReactNode;
}

export default function CheckListCard(props: CheckListCardProps) {
  const { checkList, footer } = props;
  const goodsList = JSON.parse(checkList.goodsList) as Goods[];
  return (
    <div className='flex flex-col gap-2 divide-y divide-border rounded-lg border border-border bg-card p-4 shadow'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center justify-between'>
          <p className='text font-bold'>{checkList.name}</p>
          <p style={{ color: getInventoryStatusColor(checkList.status as checkListStatusEnum) }} className='text-sm'>
            {getInventoryStatusText(checkList.status as checkListStatusEnum)}
          </p>
        </div>
        <p className='text-sm text-muted-foreground'>{checkList.memo}</p>
      </div>
      <div className='flex flex-col gap-1 pt-2'>
        <p className='text-sm text-foreground'>电话：{checkList?.phone}</p>
        <p className='text-sm text-foreground'>商品：共{goodsList.length}种</p>
      </div>
      <div className='flex justify-between pt-2'>{footer}</div>
    </div>
  );
}
