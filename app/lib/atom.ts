import { Goods } from '@prisma/client';
import { atomWithStorage } from 'jotai/utils';

export type CheckListGoodsList = {
  num: number;
  memo?: string;
  goods: Goods;
};
export const selectedGoodsListAtom = atomWithStorage<CheckListGoodsList[]>('inventoryGoods', []);
