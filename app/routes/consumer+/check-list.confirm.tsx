import { FormProvider, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { CheckList, Goods } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useNavigate, useNavigation, useRouteLoaderData, useSearchParams } from '@remix-run/react';
import { useAtom } from 'jotai/react';
import { Fragment, useEffect } from 'react';
import { jsonWithSuccess } from 'remix-toast';
import FormItem from '~/components/FormItem';
import GoodsCard from '~/components/GoodsCard';
import Header from '~/components/Header';
import { Button, buttonVariants } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { CheckListGoodsList, selectedGoodsListFamily } from '~/lib/atom';
import { CheckListSchema, checkListSchema, checkListStatusEnum } from '~/lib/validate';
import { authUser } from '~/services/auth.server';
import { loader as rootLoader } from '~/root';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') as string;
  if (!id) {
    return typedjson({ checkList: null });
  }

  const checkList = await context.db.checkList.findUnique({ where: { id } });

  return typedjson({ checkList });
};

export async function action({ request, context }: ActionFunctionArgs) {
  const user = await authUser(request, context);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: checkListSchema });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') as string;

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { name, memo, goodsList, address, status, phone } = submission.value;

  await context.db.checkList.upsert({
    create: {
      name,
      memo,
      status,
      address,
      phone,
      goodsList: JSON.stringify(goodsList),
      userId: user?.id ?? '',
    },
    update: {
      name,
      memo,
      address,
      phone,
      goodsList: JSON.stringify(goodsList),
    },
    where: {
      id: id ?? '',
    },
  });
  return jsonWithSuccess(submission, {
    message: '提交成功',
  });
}

const getRemoteGoodsList = (checkList: CheckList | null) => {
  return (checkList?.goodsList ? JSON.parse(checkList.goodsList) : []).map((item: CheckListSchema['goodsList'][number]) => ({
    goods: item,
    num: item.num,
  })) as CheckListGoodsList[];
};

export default function CheckListConfirm() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { user } = useRouteLoaderData<typeof rootLoader>('root') ?? {};
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as string;

  const [selectedGoods, setSelectedGoods] = useAtom(selectedGoodsListFamily({ id: type, checkListGoodsList: [] }));

  const { checkList } = useTypedLoaderData<typeof loader>();
  const remoteGoodsList = getRemoteGoodsList(checkList);

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
  // const goodsListField = fields.goodsList.getFieldList();
  useEffect(() => {
    if (checkList && selectedGoods.length === 0) {
      const remoteGoodsList = getRemoteGoodsList(checkList);
      setSelectedGoods(remoteGoodsList);
    }
  }, [checkList, selectedGoods, setSelectedGoods]);

  useEffect(() => {
    if (lastResult?.status === 'success') {
      navigate(-1);
      setSelectedGoods([]);
    }
  }, [lastResult, navigate, setSelectedGoods]);

  const defaultPhone = checkList?.phone ? checkList.phone : user?.phone ?? '';

  const handleDeleteSelectGoods = (goods: Goods) => {
    setSelectedGoods(selectedGoods.filter((item) => item.goods.id !== goods.id));
  };

  return (
    <div className='pt-14'>
      <Header
        title='确认清单'
        isBack
        rightContent={
          <Link to={`/consumer/add-goods?type=${type}`} className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'pr-0' })}>
            添加
          </Link>
        }
      />
      <FormProvider context={form.context}>
        <Form className='p-4' method='POST' id={form.id} onSubmit={form.onSubmit}>
          <div className='flex flex-col gap-2'>
            <FormItem label='清单名称' name={fields.name.name}>
              <Input type='text' placeholder='请输入名称' name={fields.name.name} defaultValue={checkList?.name ?? ''} />
            </FormItem>

            <FormItem label='手机号码' name={fields.phone.name}>
              <Input type='text' placeholder='请输入手机号码' name={fields.phone.name} defaultValue={defaultPhone} />
            </FormItem>

            <FormItem label='地址' name={fields.address.name}>
              <Input type='text' placeholder='请输入地址' name={fields.address.name} defaultValue={checkList?.address ?? ''} />
            </FormItem>

            <FormItem label='备注' name={fields.memo.name}>
              <Textarea name={fields.memo.name} placeholder='备注信息，告知店家一些注意事项' defaultValue={checkList?.memo ?? ''} />
            </FormItem>

            {selectedGoods.map((item, index) => {
              return (
                <Fragment key={item.goods.id}>
                  <GoodsCard
                    goods={item.goods}
                    rightContent={
                      !remoteGoodsList.map((it) => it.goods.id).includes(item.goods.id) ? (
                        <span className=' text-yellow-300 font-normal text-sm'>未保存</span>
                      ) : null
                    }
                    footerContent={
                      <div className='flex justify-between'>
                        <span>数量</span>
                        <Input
                          type='number'
                          className='w-16 h-8'
                          min={1}
                          max={1000}
                          step={1}
                          placeholder='数量'
                          name={`goodsList.[${index}].num`}
                          defaultValue={item.num}
                        />
                      </div>
                    }
                    onSwitchSelectGoods={handleDeleteSelectGoods}
                    isSelected
                  />
                  <input hidden name={`goodsList.[${index}].id`} defaultValue={item.goods.id ?? ''} />
                  <input hidden name={`goodsList.[${index}].name`} defaultValue={item.goods.name ?? ''} />
                  <input hidden name={`goodsList.[${index}].description`} defaultValue={item.goods.description ?? ''} />
                  <input hidden name={`goodsList.[${index}].cover`} defaultValue={item.goods.cover ?? ''} />
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
