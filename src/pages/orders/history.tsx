import { Chip, Grid, Typography, Link } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ShopLayout } from "../../components";
import NextLink from 'next/link';

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
    field: 'order', headerName: 'Order', width: 200,sortable: false, renderCell: ({ row }: GridRenderCellParams) => (
      <NextLink href={`/orders/${row.id}`} passHref>
        <Link underline="always">Show order</Link>
      </NextLink>
    )
  }
];

const rows = [
  { id: 1, paid: true, fullname: 'Kev BS'},
  { id: 2, paid: false, fullname: 'Dev Sol'},
  { id: 3, paid: true, fullname: 'Melissa Salazar'},
  { id: 4, paid: false, fullname: 'Frank Saliza'},
  { id: 5, paid: true, fullname: 'Fila Sass'},
]

const HistoryPage = () => {
  return (
    <ShopLayout title='Order history - TeslaShop.com' pageInfo="Your order-history">
      <Typography variant='h1' component='h1'>Orders history</Typography>

      <Grid container>
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

export default HistoryPage;
