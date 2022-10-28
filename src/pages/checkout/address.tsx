import { Box, Grid, TextField, Typography } from '@mui/material'
import { ShopLayout } from '../../components'
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useState, useContext } from 'react';
import { LoginOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { CartContext } from '../../context/cart/store';
import { trpc } from '../../utils/trpc';

const schema = z.object({
  name: z.string().min(1, 'Required').optional(),
  lastName: z.string().min(1, 'Required').optional(),
  address: z.string().min(1, 'Required').optional(),
  address2: z.string().optional().optional(),
  postal: z.string().min(1, 'Required').optional(),
  city: z.string().min(1, 'Required').optional(),
  country: z.string().min(1, 'Required').optional(),
  phone: z.string().min(1, 'Required').optional()
})

export type UserInfo = z.infer<typeof schema>

const AddressPage = () => {

  const router = useRouter();
  const { updateAddress } = useContext(CartContext);
  const [ info ] = useState<UserInfo>(JSON.parse(Cookies.get('user-info') || '{}'));

  const { register, handleSubmit, formState: { errors, isSubmitSuccessful, isSubmitted, isSubmitting } } = useForm<UserInfo>({
    resolver: zodResolver(schema),
    mode: 'all',
    shouldFocusError: true,
    defaultValues: info
  });

  const handleCheck: SubmitHandler<UserInfo> = (data) => {
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
            <TextField
              variant='filled'
              label='Country'
              fullWidth
              error={!!errors.country}
              {...register('country')}
              helperText={errors.country?.message}
            />
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
            loading={isSubmitting || isSubmitSuccessful}
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