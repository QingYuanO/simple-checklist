import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import stylesheet from '~/tailwind.css?url';
import { authenticator } from './services/auth.server';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: stylesheet }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const sessionUser = await authenticator.isAuthenticated(request);
  const user = sessionUser?.id
    ? await context.db.user.findUnique({
        where: { id: sessionUser?.id },
      })
    : null;

  return json({
    user,
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='bg-background text-foreground '>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
