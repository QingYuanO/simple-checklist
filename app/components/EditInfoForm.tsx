import { useEffect } from 'react';
import { FormProvider, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { User } from '@prisma/client';
import { Form, useActionData, useNavigate, useNavigation } from '@remix-run/react';
import { editInfoSchema } from '~/lib/validate';
import { Loader2 } from 'lucide-react';

import FormItem from '~/components/FormItem';
import Header from '~/components/Header';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

export default function EditInfoForm({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';
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
    <div className="py-14">
      <Header title="修改信息" isBack />

      <FormProvider context={form.context}>
        <Form method="POST" id={form.id} onSubmit={form.onSubmit} className="space-y-2 p-4">
          <FormItem label="名称" name={fields.name.name}>
            <Input type="text" placeholder="请输入名称" name={fields.name.name} defaultValue={user?.name ?? ''} />
          </FormItem>
          <FormItem label="手机号码" name={fields.phone.name}>
            <Input type="text" placeholder="请输入手机号码" name={fields.phone.name} defaultValue={user?.phone ?? ''} />
          </FormItem>
          <input type="text" hidden name={fields.id.name} defaultValue={user!.id} readOnly />
          {fields.id.errors}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}确认
          </Button>
        </Form>
      </FormProvider>
    </div>
  );
}
