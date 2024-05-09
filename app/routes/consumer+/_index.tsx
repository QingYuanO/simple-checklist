import { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [{ title: '商品' }];
};

export default function ConsumerHome() {
  return <div>ConsumerHome</div>;
}
