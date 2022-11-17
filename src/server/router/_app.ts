import { trpc } from '../trpc';
import { authRouter } from './auth';
import { countriesRouter } from './countries';
import { productsRouter } from './products';
import { ordersRouter } from './orders';
import { adminRouter } from './admin';

export const appRouter = trpc.router({
  products: productsRouter,
  countries: countriesRouter,
  orders: ordersRouter,
  admin: adminRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter;
