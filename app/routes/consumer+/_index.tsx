import { Goods } from '@prisma/client';
import { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { selectedGoodsListFamily } from '~/lib/atom';
import { cn } from '~/lib/utils';
import { useAtom } from 'jotai/react';
import { Ghost } from 'lucide-react';

import GoodsCard from '~/components/GoodsCard';
import GoodsList from '~/components/GoodsList';
import Header from '~/components/Header';
import { Button } from '~/components/ui/button';

export const meta: MetaFunction = () => {
  return [{ title: '商品' }];
};

export default function Components() {
  // const [selectedGoods, setSelectedGoods] = useAtom(selectedGoodsListAtom);
  const [selectedGoods, setSelectedGoods] = useAtom(selectedGoodsListFamily({ id: 'add', checkListGoodsList: [] }));

  const handleSwitchSelectGoods = (goods: Goods) => {
    const isSelected = selectedGoods.find(item => item.goods.id === goods.id);
    if (isSelected) {
      setSelectedGoods(selectedGoods.filter(item => item.goods.id !== goods.id));
    } else {
      setSelectedGoods(prev => [...prev, { num: 1, goods }]);
    }
  };

  return (
    <div className={cn('pb-14 pt-14', selectedGoods.length > 0 && 'pb-28')}>
      <Header title="商品" />
      <GoodsList
        renderItem={goods => {
          const isSelected = !!selectedGoods.find(item => item.goods.id === goods.id);
          return <GoodsCard key={goods.id} goods={goods} onSwitchSelectGoods={handleSwitchSelectGoods} isSelected={isSelected} />;
        }}
        empty={
          <div className="mt-20 flex flex-col items-center gap-2">
            <Ghost className="size-8 text-zinc-800" />
            <h3 className="font-semibold">暂无商品</h3>
          </div>
        }
      />
      {selectedGoods.length > 0 && (
        <div className="fixed inset-x-0 bottom-14 z-10 mx-auto box-content flex h-14 max-w-2xl items-center justify-between border-t border-border bg-background px-4 shadow safe-b">
          <div className="text-sm">已添加商品{selectedGoods.length}件</div>
          <Button variant={'default'} size="sm" asChild>
            <Link to={`/consumer/check-list/confirm?type=add`}>确认清单</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
