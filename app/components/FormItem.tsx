import { type FieldName, useField } from '@conform-to/react';
import { Label } from '@radix-ui/react-label';
import { cn } from '~/lib/utils';
import { PropsWithChildren } from 'react';

type FormItemProps = {
  name: FieldName<string>;
  label?: string;
};

export default function FormItem(props: PropsWithChildren<FormItemProps>) {
  const [, form] = useField(props.name);
  return (
    <div className='space-y-2'>
      <Label>{props.label}</Label>
      {props.children}
      <p className={cn('text-sm font-medium text-red-500')}>{form.errors}</p>
    </div>
  );
}
