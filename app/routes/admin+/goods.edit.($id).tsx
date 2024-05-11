import { FormProvider, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useParams } from '@remix-run/react';
import { redirectWithToast } from 'remix-toast';
import { z } from 'zod';
import FormItem from '~/components/FormItem';
import Header from '~/components/Header';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';

const schema = z.object({
  name: z.string().min(1, '用户名不能为空').max(30, '用户名不能超过30个字符'),
  description: z.string().min(5, '最少输入5个字符').max(100, '不能超过100个字符'),
  id: z.string().cuid().optional(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { id, name, description } = submission.value;

  await context.db.goods.upsert({
    where: { id },
    update: {
      name,
      description,
    },
    create: {
      description,
      name,
    },
  });
  return redirectWithToast('/admin/goods', {
    message: id ? '修改成功' : '添加成功',
    type: 'success',
  });
}

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  if (params.id) {
    const goods = await context.db.goods.findUnique({ where: { id: params.id } });
    return json({ goods });
  }

  return json({ goods: null });
};

export default function GoodsEdit() {
  const params = useParams();

  const { goods } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: 'onBlur',
  });

  return (
    <div className='pt-14'>
      <Header title={params.id ? '编辑商品' : '添加商品'} isBack />
      <FormProvider context={form.context}>
        <Form method='POST' id={form.id} onSubmit={form.onSubmit} className='p-4 space-y-2'>
          <FormItem label='名称' name={fields.name.name}>
            <Input type='text' placeholder='请输入名称' name={fields.name.name} defaultValue={goods?.name ?? ''} />
          </FormItem>
          <FormItem label='描述' name={fields.description.name}>
            <Textarea placeholder='请输入描述' name={fields.description.name} defaultValue={goods?.description ?? ''} />
          </FormItem>
          <input type='text' hidden name={fields.id.name} defaultValue={goods?.id} readOnly />
          {fields.id.errors}
          <Button type='submit' className='w-full'>
            {params.id ? '修改' : '创建'}
          </Button>
        </Form>
      </FormProvider>
    </div>
  );
}
