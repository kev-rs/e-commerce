import { Box, Button, Grid, TextField, Typography, Link } from '@mui/material'
import { AuthLayout } from '../../components'
import NextLink from 'next/link';

const Login = () => {
  return (
    <AuthLayout title='Login - TeslaShop.com'>
      <Box sx={{width: 350, padding: '10px 20px'}}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h1' component='h1' sx={{textAlign: 'center'}}>Sign in</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField label='Email' variant='filled' fullWidth />
          </Grid>
          
          <Grid item xs={12}>
            <TextField label='Password' type='password' variant='filled' fullWidth />
          </Grid>
          
          <Grid item xs={12}>
            <Button color='primary' size='large' fullWidth>Sign in</Button>
          </Grid>
          
          <Grid item xs={12} display='flex' justifyContent='center'>
            <NextLink href='/auth/register' passHref>
              <Link underline='always'>Create account</Link>
            </NextLink>
          </Grid>
        </Grid>
      </Box>
    </AuthLayout>
  )
}

export default Login