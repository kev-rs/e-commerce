import { trpc } from '../trpc';

export const countriesRouter = trpc.router({
  getAll: trpc.procedure.query( ({ ctx }) => {
    return ctx.prisma.countries.findMany();
  })
})
