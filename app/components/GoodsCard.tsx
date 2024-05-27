import { Goods } from '@prisma/client';
import { XSquare, PlusSquare } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';

interface GoodsCardProps {
  goods: Goods;
  isSelected: boolean;
  num?: number;
  onSwitchSelectGoods: (goods: Goods) => void;
}

export default function GoodsCard(props: GoodsCardProps) {
  const { goods, onSwitchSelectGoods, isSelected } = props;
  return (
    <div
      key={goods.id}
      className={cn('flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow', isSelected && 'border-foreground border-2')}
    >
      <div className='flex flex-col gap-1'>
        <p className='text font-bold'>{goods.name}</p>
        <p className='text-sm text-muted-foreground'>{goods.description}</p>
      </div>
      <div className='flex items-center justify-between gap-2'>
        <div>{isSelected && <div className='text-sm text-foreground'>已添加</div>}</div>
        <Button className='p-0 h-fit' variant='ghost' onClick={() => onSwitchSelectGoods(goods)}>
          {isSelected ? <XSquare className='cursor-pointer text-red-300' /> : <PlusSquare className='cursor-pointer' />}
        </Button>
      </div>
    </div>
  );
}
