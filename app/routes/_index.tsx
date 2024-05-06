import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { db } = context;
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  console.log(context.cloudflare.env);

  const user = await db.user.findMany();
  return json(user);
};

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    {
      name: 'description',
      content: 'Welcome to Remix! Using Vite and Cloudflare!',
    },
  ];
};

export default function Index() {
  const results = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Welcome to Remix (with Vite and Cloudflare)</h1>
      <ul>
        <li>
          <a target='_blank' href='https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/' rel='noreferrer'>
            Cloudflare Pages Docs - Remix guide
          </a>
        </li>
        <li>
          <a target='_blank' href='https://remix.run/docs' rel='noreferrer'>
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
