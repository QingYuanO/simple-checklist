import { MetaFunction } from '@remix-run/cloudflare';
import Header from '~/components/Header';
import { Goods } from '@prisma/client';
import { useSearchParams } from '@remix-run/react';
import { selectedGoodsListFamily } from '~/lib/atom';
import { useAtom } from 'jotai/react';
import GoodsCard from '~/components/GoodsCard';
import GoodsList from '~/components/GoodsList';

export const meta: MetaFunction = () => {
  return [{ title: '添加商品' }];
};

export default function Components() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as string;

  const [selectedGoods, setSelectedGoods] = useAtom(selectedGoodsListFamily({ id: type, checkListGoodsList: [] }));

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
      <Header title='添加商品' isBack />
      <GoodsList
        renderItem={(goods) => {
          const isSelected = !!selectedGoods.find((item) => item.goods.id === goods.id);
          return <GoodsCard key={goods.id} goods={goods} onSwitchSelectGoods={handleSwitchSelectGoods} isSelected={isSelected} />;
        }}
      />
    </div>
  );
}
