import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';

import stylesheet from '~/tailwind.css?url';
import { authenticator } from './services/auth.server';
import { getToast } from 'remix-toast';

import { ToastContainer, toast as notify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: stylesheet }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const sessionUser = await authenticator.isAuthenticated(request);
  const user = sessionUser?.id
    ? await context.db.user.findUnique({
        where: { id: sessionUser.id },
      })
    : null;
  const { toast, headers } = await getToast(request);

  return json(
    {
      user,
      toast,
    },
    { headers }
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { toast } = useLoaderData<typeof loader>();
  useEffect(() => {
    if (toast) {
      // notify on a toast message
      notify(toast.message, { type: toast.type, autoClose: 1000 });
    }
  }, [toast]);
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
        <ToastContainer />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
