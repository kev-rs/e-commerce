import { trpc } from '../trpc';
import { authRouter } from './auth';
import { countriesRouter } from './countries';
import { productsRouter } from './products';

export const appRouter = trpc.router({
  products: productsRouter,
  auth: authRouter,
  countries: countriesRouter,
})
export type AppRouter = typeof appRouter;
