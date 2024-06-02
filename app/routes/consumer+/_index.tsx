import { MetaFunction } from '@remix-run/cloudflare';
import Header from '~/components/Header';
import { Goods } from '@prisma/client';
import { Button } from '~/components/ui/button';
import { Link } from '@remix-run/react';
import { selectedGoodsListFamily } from '~/lib/atom';
import { useAtom } from 'jotai/react';
import GoodsCard from '~/components/GoodsCard';
import GoodsList from '~/components/GoodsList';

export const meta: MetaFunction = () => {
  return [{ title: '商品' }];
};

export default function Components() {
  // const [selectedGoods, setSelectedGoods] = useAtom(selectedGoodsListAtom);
  const [selectedGoods, setSelectedGoods] = useAtom(selectedGoodsListFamily({ id: 'add', checkListGoodsList: [] }));

  const handleSwitchSelectGoods = (goods: Goods) => {
    const isSelected = selectedGoods.find((item) => item.goods.id === goods.id);
    if (isSelected) {
      setSelectedGoods(selectedGoods.filter((item) => item.goods.id !== goods.id));
    } else {
      setSelectedGoods((prev) => [...prev, { num: 1, goods }]);
    }
  };

  return (
    <div className='pt-14 pb-28'>
      <Header title='商品' />
      <GoodsList
        renderItem={(goods) => {
          const isSelected = !!selectedGoods.find((item) => item.goods.id === goods.id);
          return <GoodsCard key={goods.id} goods={goods} onSwitchSelectGoods={handleSwitchSelectGoods} isSelected={isSelected} />;
        }}
      />
      {selectedGoods.length > 0 && (
        <div className='fixed inset-x-0 bottom-14 box-content safe-b z-10 flex h-14 items-center justify-between border-t border-border bg-background px-4 shadow sm:mx-auto sm:max-w-2xl'>
          <div className='text-sm'>已添加商品{selectedGoods.length}件</div>
          <Button variant={'default'} size='sm' asChild>
            <Link to={`/consumer/check-list/confirm?type=add`}>确认清单</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
