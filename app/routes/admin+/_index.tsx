import { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [{ title: '清单' }];
};

export default function AdminHome() {
  return <div>AdminHome</div>;
}
