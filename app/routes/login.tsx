// app/routes/login.tsx

import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { authenticator } from '~/services/auth.server';
import { getSession } from '~/services/session.server';
// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ request, context }: ActionFunctionArgs) {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  console.log(authenticator.sessionKey);

  return await authenticator.authenticate('wechat', request, {
    successRedirect: '/',
    failureRedirect: '/login',
    context,
  });
  
}

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to /dashboard directly
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
  const session = await getSession(request.headers.get('cookie'));
  const error = session.get(authenticator.sessionErrorKey);
  console.log(error);

  return json({ error });
}
export default function Screen() {
  const results = useLoaderData<typeof loader>();
  return (
    <Form method='post'>
      <Input type='text' name='openid' placeholder='Email' required />
      {results.error && <p>{results.error.message}</p>}

      <Button>Sign In</Button>
    </Form>
  );
}
