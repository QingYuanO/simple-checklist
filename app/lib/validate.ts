import { z } from 'zod';

export const phoneSchema = z
  .string({
    required_error: '手机号码不能为空',
    invalid_type_error: '手机号码格式错误',
  })
  .regex(/^1[3456789]\d{9}$/, '手机号码格式错误');

export const editInfoSchema = z.object({
  name: z
    .string({
      required_error: '名称不能为空',
    })
    .min(2, { message: '最小2位' })
    .max(10, { message: '最大 10 位' }),
  phone: phoneSchema,
  id: z.string().cuid(),
});

/**
 * 清单状态
 * WAIT 等待确认
 * REFUSE 拒绝
 *
 * CANCEL 客户取消
 * PROGRESS 处理中
 * DONE 已完成
 */
export const checkListStatusEnum = z.enum(['WAIT', 'PROGRESS', 'CANCEL', 'DONE', 'REFUSE']);
export type checkListStatusEnum = z.infer<typeof checkListStatusEnum>;

export const checkListSchema = z.object({
  name: z
    .string({
      required_error: '名称不能为空',
    })
    .min(2, { message: '最小2位' })
    .max(10, { message: '最大 10 位' }),
  memo: z.string().optional(),
  address: z.string().optional(),
  shopOwnerMemo: z.string().optional(),
  phone: phoneSchema,
  goodsList: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      num: z.number(),
      description: z.string().optional(),

      cover: z.string().optional(),
    })
  ),
  status: checkListStatusEnum,
});
