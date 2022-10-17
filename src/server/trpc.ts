import { Context } from './context';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson'

export const trpc = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});
