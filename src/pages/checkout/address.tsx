import { Box, Button, FormControl, Grid, MenuItem, Select, Skeleton, TextField, Typography } from '@mui/material'
import { ShopLayout } from '../../components'
import { trpc } from '../../utils/trpc'
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useState, useContext } from 'react';
import { LoginOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { CartContext } from '../../context/cart/store';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  address: z.string().min(1, 'Required'),
  address2: z.string().optional(),
  postal: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required')
})

export type UserInfo = z.infer<typeof schema>

const AddressPage = () => {

  const router = useRouter();
  const { updateAddress } = useContext(CartContext);
  const [ info ] = useState<UserInfo>(JSON.parse(Cookies.get('user-info') || '{}'));
  const { data, isSuccess, isLoading, isFetching } = trpc.countries.getAll.useQuery();

  const { register, handleSubmit, formState: { errors, isSubmitSuccessful, isSubmitted, isSubmitting } } = useForm<UserInfo>({
    resolver: zodResolver(schema),
    mode: 'all',
    shouldFocusError: true,
    defaultValues: info
  });

  const handleCheck: SubmitHandler<UserInfo> = ( data ) => {
    updateAddress(data);
    router.push('/checkout/summary');
  }

  return (
    <ShopLayout title='Checkout' pageInfo='Confirm address destination'>
      <form onSubmit={handleSubmit(handleCheck)}>
        <Typography variant='h1' component='h1'>Address</Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField helperText={errors.name?.message} error={!!errors.name} {...register('name')} label='Name' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField helperText={errors.lastName?.message} error={!!errors.lastName} {...register('lastName')} label='Last name' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField helperText={errors.address?.message} error={!!errors.address} {...register('address')} label='Address' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField helperText={errors.address2?.message} error={!!errors.address2} {...register('address2')} label='Address 2' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField helperText={errors.postal?.message} error={!!errors.postal} {...register('postal')} label='Postal Code' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField helperText={errors.city?.message} error={!!errors.city} {...register('city')} label='City' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            {
              !isSuccess
                ? <Skeleton animation='wave' variant="rectangular" sx={{height: 60}} />
                : (
                  <>
                    <FormControl fullWidth>
                      <TextField
                        select
                        variant='filled'
                        label='Country'
                        defaultValue={info.country}
                        error={!!errors.country}
                        {...register('country')}
                      >
                        {data?.map((c) => <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>)}
                      </TextField>
                    </FormControl>
                  </>
                )
            }

          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField helperText={errors.phone?.message} error={!!errors.phone} {...register('phone')} label='Phone' variant='filled' fullWidth />
          </Grid>
        </Grid>

        <Box sx={{ mt: 5 }} display='flex' justifyContent={'center'}>
          {/* <Button type='submit' color='secondary' className='circular-btn' size='large'>Check order</Button> */}
          <LoadingButton
              size="small"
              color="secondary"
              type='submit'
              loading={isSubmitting || isSubmitted}
              loadingPosition="start"
              startIcon={<LoginOutlined />}
              variant="outlined"
            >
              Check order
            </LoadingButton>
        </Box>
      </form>
    </ShopLayout>
  )
}

export default AddressPage