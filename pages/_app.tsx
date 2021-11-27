import type { AppProps } from 'next/app';
import { SessionProvider, useSession } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';
import Header from '../components/Header';
import React, { useEffect } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import theme from '../styles/theme';
import { useRouter } from 'next/router';

function Auth({ children }: React.PropsWithChildren<{}>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isUser = !!session?.user;
  useEffect(() => {
    // Do nothing while loading
    if (status === 'loading') {
      return;
    }
    if (!isUser) {
      console.log('here');
      router.replace('/');
    }
  }, [isUser, router, status]);

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

  console.log(Component.auth);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ChakraProvider theme={theme}>
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
