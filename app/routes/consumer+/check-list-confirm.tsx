import { LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import Header from '~/components/Header';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids')?.split(',');
  console.log(ids);
  const goods = await context.db.goods.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return json({ goods });
};

export default function CheckListConfirm() {
  const { goods } = useLoaderData<typeof loader>();
  const [memo, setMemo] = useState('');

  const [name, setName] = useState('');
  return (
    <div className='pt-14'>
      <Header title='确认清单' isBack />
      <div className='p-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='name'>清单名称</Label>
            <Input id='name' value={name} onInput={(e) => setName(e.currentTarget.value)} placeholder='请输入清单名称' />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='memo'>备注</Label>
            <Textarea id='memo' placeholder='备注信息，告知店家一些注意事项' value={memo} onInput={(e) => setMemo(e.currentTarget.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
