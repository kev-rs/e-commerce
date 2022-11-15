import {  InferGetStaticPropsType } from 'next';
import { AdminPanelSettingsOutlined } from '@mui/icons-material';
import { AdminLayout } from '../../../components'
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetterParams } from "@mui/x-data-grid";
import { Chip, Grid } from '@mui/material';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../../server/router/_app';
import { createContext } from '../../../server/context';
import superjson from 'superjson';

const columns: GridColDef[] = [
  { field: 'orderId', headerName: 'Order ID', width: 250 },
  { field: 'email', headerName: 'Email', width: 140 },
  { field: 'user', headerName: 'User', width: 70 },
  { field: 'name', headerName: 'Customer', width: 80 },
  { field: 'total', headerName: 'Total amount', width: 98 },
  { field: 'paidOut', headerName: 'Paid Out', width: 100, renderCell: (params: GridRenderCellParams) => {
    return (
      params.row.paidOut
        ? <Chip color='success' label='Paid out' variant='outlined' />
        : <Chip color='error' label='Pending' variant='outlined' />
    )
  } },
  { field: 'inStock', headerName: 'No. Products', width: 100 },
  { field: 'order', headerName: 'Show order', width: 100, renderCell: ({ row }) => (
    <a href={`/admin/orders/${row.id}`} target='_blank' rel='noreferrer'>Show order</a>
  ) },
  { field: 'createdAt', headerName: 'Created at', width: 200 },
];

const OrdersPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ orders }) => {

  const rows = orders.map((o) => ({
    orderId: o.id, email: o.user.email, user: o.user.name, name: `${o.shippingAddress.name} ${o.shippingAddress.lastName}`, total: `$${o.total}`, paidOut: o.paidOut,
    inStock: o.numberOfItems, id: o.id, createdAt: o.createdAt
  }))

  return (
    <AdminLayout title='Orders' subTitle='Orders maintenance' icon={<AdminPanelSettingsOutlined />}>
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
    </AdminLayout>
  )
}

export const getStaticProps = async () => {

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  })

  const orders = await ssg.admin.orders.fetch();

  return {
    props: {
      orders: JSON.parse(JSON.stringify(orders)) as typeof orders
    }
  }
}

export default OrdersPage;