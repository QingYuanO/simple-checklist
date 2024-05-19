import { z } from 'zod';

export const editInfoSchema = z.object({
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
