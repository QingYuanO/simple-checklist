import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Form, Link, useRouteLoaderData } from '@remix-run/react';
import { cn } from '~/lib/utils';
import { loader as rootLoader } from '~/root';
import { authenticator } from '~/services/auth.server';
import { ChevronRight, Smartphone, User } from 'lucide-react';

import { Button } from '~/components/ui/button';

export const meta: MetaFunction = () => {
  return [{ title: '我的' }];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = await context.db.user.findFirst({ where: { isAdmin: true } });
  return typedjson({ shopUser: user });
};

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.logout(request, {
    redirectTo: '/login',
  });
}

export default function ConsumerMe() {
  const { user } = useRouteLoaderData<typeof rootLoader>('root') ?? {};
  const { shopUser } = useTypedLoaderData<typeof loader>();
  return (
    <div className="flex flex-col">
      <div className="space-y-2 border-b border-border p-4">
        <p className="flex items-center gap-2 text-xl font-bold">
          <User />
          {user?.name}
        </p>
        <p className="flex items-center gap-2">
          <Smartphone className="size-4" />
          {user?.phone}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 p-4">
        <Link to="/consumer/edit-info" className="flex items-center justify-between rounded border border-border p-4">
          <div>修改信息</div>
          <ChevronRight />
        </Link>
        <Link to="/consumer/check-list" className="flex items-center justify-between rounded border border-border p-4">
          <div>我的清单</div>
          <ChevronRight />
        </Link>
        <div className="flex items-center justify-between rounded border border-border p-4">
          <a className="w-full" href={`tel:${shopUser?.phone}`}>
            商家电话
          </a>
          <ChevronRight />
        </div>
      </div>
      <div className="fixed bottom-16 left-0 flex w-full justify-center">
        <Form method="POST">
          <Button variant="link" className={cn('w-32 text-sm text-muted-foreground')}>
            退出登录
          </Button>
        </Form>
      </div>
    </div>
  );
}
