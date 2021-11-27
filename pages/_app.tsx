import type { AppProps } from 'next/app';
import { SessionProvider, useSession } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';
import Header from '../components/Header';
import React, { useEffect } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';

function Auth({ children }: React.PropsWithChildren<{}>) {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    // if (!isUser) signIn(); // If not authenticated, force log in
  }, [isUser, status]);

  if (isUser) {
    return children as React.ReactElement;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>;
}

interface ExtendedAppProps<P = {}> extends AppProps<P> {
  Component: NextComponentType<NextPageContext, any, P> & { auth?: boolean };
}

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: ExtendedAppProps) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ChakraProvider>
          <SessionProvider session={session}>
            <Header />
            {Component.auth ? (
              <Auth>
                <Component {...pageProps} />
              </Auth>
            ) : (
              <Component {...pageProps} />
            )}
          </SessionProvider>
        </ChakraProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
