import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';
import type { AppRouter } from '../server/router/_app';

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // browser should use relative path    

  if (process.env.HOST_NAME) return process.env.HOST_NAME; // reference for vercel.com

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // reference for vercel.com
    
  if (process.env.RENDER_INTERNAL_HOSTNAME) return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`; // reference for render.com
    
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: superjson, // optional - adds superjson serialization
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Set custom request headers on every request from tRPC
           * @link https://trpc.io/docs/v10/header
           */
          headers() {
            if (ctx?.req) {
              // To use SSR properly, you need to forward the client's headers to the server
              // This is so you can pass through things like cookies when we're server-side rendering
              // return { ...ctx.req.headers, 'x-ssr': '1', };
              // If you're using Node 18, omit the "connection" header
              const {
                connection: _connection,
                ...headers
              } = ctx.req.headers;
              return {
                ...headers,
                // Optional: inform server that it's an SSR request
                'x-ssr': '1',
              };
            }
            return {};
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 1000 * 20,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // refetchInterval: 3
            // enabled: false,
            // refetchOnMount: false,
          },
        }
      },
    };
  },
  ssr: false,
  // ssr: true,
  // responseMeta({ ctx, clientErrors }) {
  //   if (clientErrors.length) {
  //     //! propagate http first error from API calls
  //     return {
  //       status: clientErrors[0].data?.httpStatus ?? 500,
  //     };
  //   }
  //   //! cache request for 1 day + revalidate once every second
  //   const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
  //   return {
  //     headers: {
  //       'cache-control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
  //     },
  //   };
  // },
});




// import { httpBatchLink } from '@trpc/client';
// import { createTRPCNext } from '@trpc/next';
// import type { AppRouter } from '../server/router/_app';
// import superjson from 'superjson';

// function getBaseUrl() {
//   if (typeof window !== 'undefined') return ''; // browser should use relative path    

//   if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // reference for vercel.com
    
//   if (process.env.RENDER_INTERNAL_HOSTNAME) return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`; // reference for render.com
    
//   // assume localhost
//   return `http://localhost:${process.env.PORT ?? 3000}`;
// }

// export const trpc = createTRPCNext<AppRouter>({
//   config({ ctx }) {
//     return {
//       transformer: superjson,
//       links: [
//         httpBatchLink({
//           url: `${getBaseUrl()}/api/trpc`,
//         }),
//       ],
//     };
//   },
//   ssr: true,
// });
