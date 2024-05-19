import { MetaFunction } from '@remix-run/cloudflare';
import Header from '~/components/Header';

export const meta: MetaFunction = () => {
  return [{ title: '我的清单' }];
};

export default function ConsumerHome() {
  return (
    <div className='py-14'>
      <Header title='我的清单' isBack />
    </div>
  );
}
