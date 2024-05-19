import { Form, useActionData, useNavigate, useRouteLoaderData } from '@remix-run/react';
import Header from '~/components/Header';
import { FormProvider, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { loader as rootLoader } from '~/root';
import FormItem from '~/components/FormItem';
import { useEffect } from 'react';
import { editInfoSchema } from '~/lib/validate';

export default function EditInfoForm() {
  const navigate = useNavigate();
  const { user } = useRouteLoaderData<typeof rootLoader>('root') ?? {};
  const lastResult = useActionData<SubmissionResult>();
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editInfoSchema });
    },

    // Validate the form on blur event triggered
    shouldValidate: 'onBlur',
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      navigate(-1);
    }
  }, [lastResult, navigate]);
  return (
    <div className='py-14'>
      <Header title='修改信息' isBack />

      <FormProvider context={form.context}>
        <Form method='POST' id={form.id} onSubmit={form.onSubmit} className='p-4 space-y-2'>
          <FormItem label='名称' name={fields.name.name}>
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
