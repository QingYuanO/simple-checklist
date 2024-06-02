import { Goods } from '@prisma/client';
import { atomWithStorage, atomFamily } from 'jotai/utils';
import { atom } from 'jotai';

export type CheckListGoodsList = {
  num: number;
  memo?: string;
  goods: Goods;
};
export const selectedGoodsListAtom = atomWithStorage<CheckListGoodsList[]>('inventoryGoods', []);

export const selectedGoodsListFamily = atomFamily(
  ({ checkListGoodsList }: { id: string; checkListGoodsList: CheckListGoodsList[] }) => atom(checkListGoodsList),
  (a, b) => a.id === b.id
);

export const addSelectedGoodsListAtom = selectedGoodsListFamily({ id: 'add', checkListGoodsList: [] });
export const updateSelectedGoodsListAtom = selectedGoodsListFamily({ id: 'update', checkListGoodsList: [] });
