import { Form, useActionData, useRouteLoaderData } from '@remix-run/react';
import Header from '~/components/Header';
import { z } from 'zod';
import { FormProvider, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { loader as rootLoader } from '~/root';
import { redirectWithToast } from 'remix-toast';
import FormItem from '~/components/FormItem';

const schema = z.object({
  name: z
    .string({
      required_error: '名称不能为空',
    })
    .min(2, { message: '最小2位' })
    .max(10, { message: '最大 10 位' }),
  phone: z
    .string({
      required_error: '手机号码不能为空',
      invalid_type_error: '手机号码格式错误',
    })
    .regex(/^1[3456789]\d{9}$/, '手机号码格式错误'),
  id: z.string().cuid(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { id, name, phone } = submission.value;
  await context.db.user.update({
    data: {
      name,
      phone,
    },
    where: { id },
  });
  return redirectWithToast('/admin/me', {
    message: '修改成功',
    type: 'success',
  });
}

export default function EditInfo() {
  const { user } = useRouteLoaderData<typeof rootLoader>('root') ?? {};
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },

    // Validate the form on blur event triggered
    shouldValidate: 'onBlur',
  });
  return (
    <div className='py-14'>
      <Header title='修改信息' isBack />

      <FormProvider context={form.context}>
        <Form method='POST' id={form.id} onSubmit={form.onSubmit} className='p-4 space-y-2'>
          <FormItem label='店铺名称' name={fields.name.name}>
            <Input type='text' placeholder='请输入名称' name={fields.name.name} defaultValue={user?.name ?? ''} />
          </FormItem>
          <FormItem label='手机号码' name={fields.phone.name}>
            <Input type='text' placeholder='请输入手机号码' name={fields.phone.name} defaultValue={user?.phone ?? ''} />
          </FormItem>
          <input type='text' hidden name={fields.id.name} defaultValue={user!.id} readOnly />
          {fields.id.errors}
          <Button type='submit' className='w-full'>
            确认
          </Button>
        </Form>
      </FormProvider>
    </div>
  );
}
