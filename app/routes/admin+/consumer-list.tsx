import { LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Ghost } from 'lucide-react';
import Header from '~/components/Header';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter } from '~/components/ui/card';
import { authenticator } from '~/services/auth.server';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const users = await context.db.user.findMany({
    where: {
      id: {
        not: sessionUser.id,
      },
    },
  });

  return json({ users });
};

export default function ConsumerList() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div className='py-14'>
      <Header title='用户列表' isBack />
      {users && users.length > 0 ? (
        <div className='flex flex-col gap-4 p-4'>
          {users.map((user) => (
            <Card key={user.id} className='col-span-1 flex flex-col justify-between'>
              <CardHeader className='p-4 pb-2'>
                <CardTitle>{user.name}</CardTitle>
                {/* <CardDescription className='w-full'>{user.account}</CardDescription> */}
              </CardHeader>
              <CardFooter className='flex justify-between px-4 pb-4'>
                {user.phone ? (
                  <Button size='sm' variant='secondary' asChild>
                    <a href={`tel:${user.phone}`}>拨打电话</a>
                  </Button>
                ) : (
                  <span></span>
                )}

                <div className='flex gap-3'>
                  <Button size='sm' variant='default'>
                    查看
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className='mt-20 flex flex-col items-center gap-2'>
          <Ghost className='size-8 text-zinc-800' />
          <h3 className='font-semibold'>你还没有客户</h3>
          <p className=''>快点邀请吧</p>
        </div>
      )}
    </div>
  );
}
