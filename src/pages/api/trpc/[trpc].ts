import { appRouter, AppRouter } from '../../../server/router/_app'
import * as trpcNext from '@trpc/server/adapters/next';
import { createContext } from '../../../server/context';

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // send to bug reporting
      console.error('Something went wrong', error);
      return;
    }
    console.error('Something went wrong', error);
  }
});

