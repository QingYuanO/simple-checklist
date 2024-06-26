import { Goods } from '@prisma/client';
import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import { authUser } from '~/services/auth.server';

export type GoodsFetchResponse = {
  pages: Goods[];
  nextPage: number | null;
  total: number;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await authUser(request, context);
  const { searchParams } = new URL(request.url);
  const page = z.coerce.number().parse(searchParams.get('page') ?? 1);
  const word = searchParams.get('word') ?? '';
  const take = 8;
  const count = await context.db.goods.count();

  const pages = await context.db.goods.findMany({
    take,
    skip: (page - 1) * take,
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      ...(!user?.isAdmin ? { isActivity: true } : {}),
      name: {
        contains: word,
      },
    },
  });
  const hasMore = Math.ceil(count / take) > page;
  return { pages, nextPage: hasMore ? page + 1 : null, total: count };
};

export const fetchGoods = async (params: { page: number; word?: string }) => {
  const res = await fetch(`/api/goods?page=${params.page}&word=${params.word ?? ''}`);
  return res.json() as Promise<GoodsFetchResponse>;
};
