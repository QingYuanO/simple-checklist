import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { jsonWithSuccess } from 'remix-toast';
import EditInfoForm from '~/components/EditInfoForm';
import { editInfoSchema } from '~/lib/validate';

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
  return <EditInfoForm />;
}
