import { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [{ title: '我的' }];
};

export default function ConsumerMe() {
  return <div>ConsumerMe</div>;
}
