import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import NextLink from 'next/link';
import { Chip, Grid, Typography, Link } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ShopLayout } from "../../components";
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../server/router/_app';
import { createContext } from '../../server/context';
import superjson from 'superjson';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import type { Order as OrderDB, ShippingAddress } from '../../server/db';
import { useMemo } from 'react';

type Order = OrderDB & { shippingAddress: ShippingAddress }

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'fullname', headerName: 'Full name', width: 300 },
  {
    field: 'paid',
    headerName: 'Paid out',
    description: 'Show info if order is paid out',
    width: 200,
    renderCell: (params: GridRenderCellParams) => {
      return (
        params.row.paid
          ? <Chip color='success' label='Paid out' variant='outlined' />
          : <Chip color='error' label='unpaid' variant='outlined' />
      )
    }
  },
  {
    field: 'order', headerName: 'Order', width: 200, sortable: false, renderCell: ({ row }: GridRenderCellParams) => (
      <NextLink href={`/orders/${row.orderId}`} passHref>
        <Link underline="always">Show order</Link>
      </NextLink>
    )
  }
];

const HistoryPage: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const rows = useMemo(() => {
    return orders.map(({ id, paidOut, shippingAddress, userId }, i) => ({ id: i + 1, paid: paidOut, fullname: `${shippingAddress.name} ${shippingAddress.lastName}`, orderId: id }));
  }, [ orders ]);

  return (
    <ShopLayout title='Order history - TeslaShop.com' pageInfo="Your order-history">
      <Typography variant='h1' component='h1'>Orders history</Typography>

      <Grid container className='fadeIn'>
        <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
          />
        </Grid>
      </Grid>
    </ShopLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {

  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if(!session) return { redirect: { destination: '/auth/login?p=/orders/history', permanent: false }};

  const ssg = await createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  })

  const user = await ssg.orders.getAll.fetch({ email: session.user!.email! })

  if(!user) return { redirect: { destination: '/', permanent: false } };
  return {
    props: {
      trpcState: ssg.dehydrate(),
      orders: user.orders,
    }
  }
}

export default HistoryPage;
