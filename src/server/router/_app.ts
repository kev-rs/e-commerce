import { trpc } from '../trpc';
import { authRouter } from './auth';
import { countriesRouter } from './countries';
import { productsRouter } from './products';
import { ordersRouter } from './orders';

export const appRouter = trpc.router({
  products: productsRouter,
  auth: authRouter,
  countries: countriesRouter,
  orders: ordersRouter,
})
export type AppRouter = typeof appRouter;
