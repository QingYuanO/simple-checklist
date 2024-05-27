import { FormProvider, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Goods } from '@prisma/client';
import { ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { Form, useActionData, useNavigate, useNavigation, useRouteLoaderData } from '@remix-run/react';
import { useAtom } from 'jotai/react';
import { Fragment, useEffect } from 'react';
import { jsonWithSuccess } from 'remix-toast';
import FormItem from '~/components/FormItem';
import GoodsCard from '~/components/GoodsCard';
import Header from '~/components/Header';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { selectedGoodsListAtom } from '~/lib/atom';
import { checkListSchema, checkListStatusEnum } from '~/lib/validate';
import { authUser } from '~/services/auth.server';
import { loader as rootLoader } from '~/root';

export async function action({ request, context }: ActionFunctionArgs) {
  const user = await authUser(request, context);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: checkListSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { name, memo, goodsList, address, status, phone } = submission.value;
  console.log(JSON.stringify(goodsList));

  await context.db.checkList.create({
    data: {
      name,
      memo,
      status,
      address,
      phone,
      goodsList: JSON.stringify(goodsList),
      userId: user?.id ?? '',
    },
  });
  return jsonWithSuccess(submission, {
    message: '提交成功',
  });
}

export default function CheckListConfirm() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { user } = useRouteLoaderData<typeof rootLoader>('root') ?? {};
  const [selectedGoods, setSelectedGoods] = useAtom(selectedGoodsListAtom);

  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: checkListSchema });
    },

    // Validate the form on blur event triggered
    shouldValidate: 'onBlur',
    defaultValue: {
      goodsList: selectedGoods.map((item) => {
        return {
          id: item.goods.id,
          name: item.goods.name,
          num: item.num,
          description: item.goods.description,
          cover: item.goods.cover,
        };
      }),
    },
  });

  const goodsList = fields.goodsList.getFieldList();

  useEffect(() => {
    if (lastResult?.status === 'success') {
      navigate(-1);
      setSelectedGoods([]);
    }
  }, [lastResult, navigate, setSelectedGoods]);

  const handleDeleteSelectGoods = (goods: Goods) => {
    setSelectedGoods(selectedGoods.filter((item) => item.goods.id !== goods.id));
  };

  return (
    <div className='pt-14'>
      <Header title='确认清单' isBack />
      <FormProvider context={form.context}>
        <Form className='p-4' method='POST' id={form.id} onSubmit={form.onSubmit}>
          <div className='flex flex-col gap-4'>
            {selectedGoods.map((item) => (
              <GoodsCard key={item.goods.id} goods={item.goods} onSwitchSelectGoods={handleDeleteSelectGoods} isSelected />
            ))}
            <div className='flex flex-col gap-2'>
              <FormItem label='清单名称' name={fields.name.name}>
                <Input type='text' placeholder='请输入名称' name={fields.name.name} />
              </FormItem>
            </div>
            <div className='flex flex-col gap-2'>
              <FormItem label='手机号码' name={fields.phone.name}>
                <Input type='text' placeholder='请输入手机号码' name={fields.phone.name} defaultValue={user?.phone ?? ''} />
              </FormItem>
            </div>
            <div className='flex flex-col gap-2'>
              <FormItem label='地址' name={fields.address.name}>
                <Input type='text' placeholder='请输入地址' name={fields.address.name} />
              </FormItem>
            </div>
            <div className='flex flex-col gap-2'>
              <FormItem label='备注' name={fields.memo.name}>
                <Textarea name={fields.memo.name} placeholder='备注信息，告知店家一些注意事项' />
              </FormItem>
            </div>

            {goodsList.map((item) => {
              const goodsFields = item.getFieldset();
              return (
                <Fragment key={item.id}>
                  <input hidden name={goodsFields.id.name} defaultValue={goodsFields.id.value} />
                  <input hidden name={goodsFields.name.name} defaultValue={goodsFields.name.value} />
                  <input hidden name={goodsFields.description.name} defaultValue={goodsFields.description.value ?? ''} />
                  <input hidden name={goodsFields.cover.name} defaultValue={goodsFields.cover.value ?? ''} />
                  <input hidden name={goodsFields.num.name} defaultValue={goodsFields.num.value} />
                </Fragment>
              );
            })}
            <input hidden name='status' defaultValue={checkListStatusEnum.Values.WAIT} />
          </div>
          <div className='mt-4 flex h-14 w-full items-center '>
            <Button variant='default' className='w-full' type='submit' disabled={navigation.state !== 'idle'}>
              {navigation.state !== 'idle' ? '提交中...' : '提交'}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </div>
  );
}
