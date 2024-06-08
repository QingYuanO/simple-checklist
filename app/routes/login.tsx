import { AuthorizationError } from 'remix-auth';
import { jsonWithError } from 'remix-toast';
import { FormProvider, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Form, useActionData } from '@remix-run/react';
import { phoneSchema } from '~/lib/validate';
import { authenticator } from '~/services/auth.server';
import { z } from 'zod';

import FormItem from '~/components/FormItem';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

export const schema = z.object({
  account: phoneSchema,

  password: z.string({ required_error: '请输入密码' }).min(6, '最少6位').max(20, '最多20位'),
});

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const formData = await request.clone().formData();
    const submission = parseWithZod(formData, { schema: schema });

    if (submission.status !== 'success') {
      return json(submission.reply());
    }

    return await authenticator.authenticate('user-pass', request, {
      failureRedirect: '/login',
      successRedirect: '/',
      context,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AuthorizationError) {
      return jsonWithError(error, {
        message: error.message,
      });
    }
    return null;
  }
}

export default function Login() {
  const lastResult = useActionData<SubmissionResult>();
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema });
    },

    // Validate the form on blur event triggered
    shouldValidate: 'onBlur',
  });

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-10 px-8 py-20">
      <div className="flex flex-col items-center gap-4">
        <p className="text-2xl font-semibold">Easy 清单</p>
        <p className="text-muted-foreground">易于使用的货物配送清单管理工具</p>
      </div>
      <FormProvider context={form.context}>
        <Form method="POST" id={form.id} onSubmit={form.onSubmit} className="w-full space-y-3 rounded border border-border px-8 py-10">
          <FormItem label="手机号" name={fields.account.name}>
            <Input type="text" placeholder="请输入手机号" name={fields.account.name} />
          </FormItem>
          <FormItem label="密码" name={fields.password.name}>
            <Input type="password" placeholder="请输入密码" name={fields.password.name} />
          </FormItem>

          <Button type="submit" className="w-full">
            登录
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            没有账号将<span className="font-bold text-foreground">自动注册</span>
          </p>
        </Form>
      </FormProvider>
    </div>
  );
}
