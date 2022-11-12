import type { AppProps } from 'next/app';
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { CssBaseline, ThemeProvider } from '@mui/material';
import { lightTheme } from '../themes';
import '../styles/globals.css';
import { UiProvider } from '../context';
import { trpc } from '../utils/trpc';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CartProvider } from '../context/cart/CartProvider';
import { AuthProvider } from '../context/user/AuthProvider';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {

  return (
    <SessionProvider 
      session={session}
      refetchOnWindowFocus={true}
    >
      <AuthProvider>
        <CartProvider>
          <UiProvider>
            <ThemeProvider theme={lightTheme}>
              <CssBaseline />
              <Component {...pageProps} />
              <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
          </UiProvider>
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  )
}

export default trpc.withTRPC(App);
