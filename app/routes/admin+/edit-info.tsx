import { jsonWithSuccess } from 'remix-toast';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { editInfoSchema } from '~/lib/validate';
import { authUser } from '~/services/auth.server';

import EditInfoForm from '~/components/EditInfoForm';

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const user = await authUser(request, context);

  return typedjson({ user });
};

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: editInfoSchema });

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
  return jsonWithSuccess(submission, {
    message: '修改成功',
  });
}

export default function EditInfo() {
  const { user } = useTypedLoaderData<typeof loader>();
  return <EditInfoForm user={user} />;
}
