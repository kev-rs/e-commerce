import type { AppProps } from 'next/app';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { lightTheme } from '../themes';
import '../styles/globals.css';
import { UiProvider } from '../context';
import { trpc } from '../utils/trpc';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CartProvider } from '../context/cart/CartProvider';
import { AuthProvider } from '../context/user/AuthProvider';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
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
  )
}

export default trpc.withTRPC(MyApp);
