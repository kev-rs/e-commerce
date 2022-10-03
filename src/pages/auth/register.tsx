
import { Box, Button, Grid, Link, TextField, Typography } from '@mui/material';
import NextLink from 'next/link';
import { AuthLayout } from '../../components';

const RegisterPage = () => {
  return (
    <AuthLayout title='Register - TeslaShop.com'>
      <Box sx={{width: 350, padding: '10px 20px'}}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h1' component='h1' sx={{textAlign: 'center'}}>Sign up</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField label='Name' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12}>
            <TextField label='Email' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12}>
            <TextField label='Password' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12}>
            <TextField label='Confirm password' variant='filled' fullWidth />
          </Grid>

          <Grid item xs={12}>
            <Button color='primary' size='large' fullWidth>Sign up</Button>
          </Grid>

          <Grid item xs={12} display='flex' justifyContent='center'>
            <NextLink href='/auth/login' passHref>
              <Link underline='always'>Already registered</Link>
            </NextLink>
          </Grid>
        </Grid>

      </Box>
    </AuthLayout>
  )
}

export default RegisterPage