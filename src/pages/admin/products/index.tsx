import {  InferGetStaticPropsType } from 'next';
import { Add, AddOutlined, AdminPanelSettingsOutlined, Delete } from '@mui/icons-material';
import { AdminLayout } from '../../../components'
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetterParams } from "@mui/x-data-grid";
import { Box, Button, CardMedia, Chip, Grid, IconButton, Link, Modal, Popover, Typography } from '@mui/material';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../../server/router/_app';
import { createContext } from '../../../server/context';
import superjson from 'superjson';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { trpc } from '../../../utils/trpc';
import { useState } from 'react';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ProductsPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ products }) => {
  // const [ open, setOpen ] = useState(false);
  const [ productToDelete, setProductToDelete ] = useState<string>('');
  // const handleOpen = (id: string) => {
  //   setOpen(true);
  //   setProductToDelete(id)
  // }
  // const handleClose = () => setOpen(false);

  // const handleDelete = () => {
  //   mutation.mutate({ id: productToDelete })
  //   setOpen(false);
  // }

  const utils = trpc.useContext();
  const { data } = trpc.admin.products.get.useQuery(undefined, {
    initialData: products,
  });
  const mutation = trpc.admin.products.delete.useMutation({
    onError: (err) => {
      console.log(err)
    },
    onSuccess: async () => {
      // utils.admin.products.get.invalidate(undefined, { refetchPage: () => true }, { cancelRefetch: false });
      await utils.admin.products.get.invalidate();
    },
  });
  const router = useRouter();

  const columns: GridColDef[] = [
    // { field: 'orderId', headerName: 'Order ID', width: 250 },
    { field: 'img', headerName: 'Photo', renderCell: ({ row }) => (
      <a href={`/product/${row.slug}`} target='_blank' rel='noreferrer'>
        <CardMedia
          component={'img'}
          className='fadeIn'
          image={`/products/${row.img}`}
          alt={row.title}
        />
      </a>
    ) },
    { field: 'title', headerName: 'Title', width: 300, renderCell: ({ row }) => (
      <NextLink href={`/admin/products/${row.slug}`} passHref>
        <Link underline='always'>{row.title}</Link>
      </NextLink>
    ) },
    { field: 'gender', headerName: 'Gender' },
    { field: 'type', headerName: 'Type' },
    { field: 'inStock', headerName: 'In stock' },
    { field: 'price', headerName: 'Price' },
    { field: 'sizes', headerName: 'Sizes', width: 250 },
    { field: 'delete', headerName: '', width: 60, renderCell: ({ row }) => {
  
      return (
        <>
          <CardMedia>
            <IconButton onClick={(e) => handleOpen(e, row.id)}>
            {/* <IconButton> */}
              <Delete />
            </IconButton>
          </CardMedia>
          {/* <div>
            <Button aria-describedby={id} variant="contained" onClick={handleOpen}>
              Open Popover
            </Button>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
            </Popover>
          </div> */}
        </>
      )
    }},
  ];

  const rows = data!.map( p  => ({
    id: p.id,img: p.images[0], title: p.title, gender: p.gender, type: p.type, inStock: p.inStock, price: `$${p.price}`, sizes: p.sizes.join(', '), slug: p.slug
  }));

  const [ anchorEl, setAnchorEl ] = useState<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setProductToDelete(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    mutation.mutate({ id: productToDelete })
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <AdminLayout title='Products' subTitle='Products maintenance' icon={<AdminPanelSettingsOutlined />}>
      <div>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
        >
          <Box display='flex' gap={2} sx={{ padding: 2 }}>
            <Button color='error' variant='contained' onClick={handleDelete}>Delete</Button>
            <Button variant='contained' color='inherit' onClick={handleClose}>Cancel</Button>
          </Box>
        </Popover>
      </div>
      {/* <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} display={'flex'} flexDirection='column' alignItems={'center'} gap={2}>
          <Typography>Are you sure ?</Typography>
          <Box display='flex' gap={2}>
            <Button color='error' variant='contained' onClick={handleDelete}>Delete</Button>
            <Button variant='contained' color='primary' onClick={handleClose}>Cancel</Button>
          </Box>
        </Box>
      </Modal> */}
      <Grid container className='fadeIn'>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mb: 2 }}>
          <Button
            variant='contained' 
            color='secondary'
            startIcon={<AddOutlined />}
            onClick={() => router.push('/admin/products/create')}
          >New</Button>
        </Box>
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
  });

  const products = await ssg.admin.products.get.fetch();

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)) as typeof products
    }
  }
}

export default ProductsPage;