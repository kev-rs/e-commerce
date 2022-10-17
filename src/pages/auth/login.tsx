import { Box, Grid, TextField, Typography, Link, Chip } from '@mui/material'
import { AuthLayout } from '../../components'
import NextLink from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';
import { ErrorOutline, LoginOutlined } from '@mui/icons-material';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/user/store';
import Cookies from 'js-cookie';
import LoadingButton from '@mui/lab/LoadingButton';


const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Required')
})

type CookieResponse = [string, string]

type FormValues = z.infer<typeof schema>

const Login = () => {
  const router = useRouter();
  console.log({query: router.query})
  const { auth_user } = useContext(AuthContext);
  const user: CookieResponse = JSON.parse(Cookies.get('data-form') || '[]');
  const { register, handleSubmit, setError, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: { email: user[0] || '', password: user[1] || '' },
    mode: 'all',
    resolver: zodResolver(schema),
  });
  const utils = trpc.useContext();
  const mutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      utils.auth.user.invalidate();
      auth_user(data)
      reset();
      if(router.query.p) return router.push(`${router.query.p}`)
      router.back();
    },
    onError: (err) => {
      err.data?.code === 'NOT_FOUND'
        ? setError('email', { message: err.message, type: 'wrongE' })
        : setError('password', { message: err.message, type: 'wrong' })
    },
  })

  useEffect(() => {
    router.prefetch(`${router.query.p}`)
  }, [ router ]);

  const handleLogin: SubmitHandler<FormValues> = (data) => mutation.mutate(data);

  return (
    <AuthLayout title='Login - TeslaShop.com'>
      <Box sx={{ width: 350, padding: '10px 20px' }} component='form' onSubmit={handleSubmit(handleLogin)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h1' component='h1' sx={{ textAlign: 'center' }}>Sign in</Typography>
            <Chip
              label={mutation.error?.data?.code === 'NOT_FOUND' ? 'We cannot find an account with that email' : errors.password?.message}
              variant='filled'
              color='error'
              icon={<ErrorOutline />}
              sx={{
                display: errors.email?.type === 'wrongE' || errors.password?.type === 'wrong' ? 'flex' : 'none'
              }}
              className='fadeIn'
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Email'
              variant='outlined'
              fullWidth
              {...register('email')}
              error={mutation.error?.data?.code === 'NOT_FOUND' || !!errors.email?.message}
              helperText={errors.email?.type !== 'wrongE' && errors.email?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Password'
              variant='outlined'
              fullWidth {...register('password')}
              error={mutation.error?.data?.code === 'UNAUTHORIZED' || !!errors.password?.message}
              helperText={errors.password?.type !== 'wrong' && errors.password?.message}
            />
          </Grid>

          <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center'}}>
            {/* <Button color='primary' size='large' fullWidth type='submit' variant='outlined'>Sign in</Button> */}
            <LoadingButton
              size="small"
              color="secondary"
              type='submit'
              loading={mutation.isLoading || !!mutation.data}
              loadingPosition="start"
              startIcon={<LoginOutlined />}
              variant="outlined"
            >Sign in</LoadingButton>
          </Grid>

          <Grid item xs={12} display='flex' justifyContent='center'>
            <NextLink href={`/auth/register?p=${router.query.p || ''}`} passHref>
              <Link underline='always'>Create account</Link>
            </NextLink>
          </Grid>
        </Grid>
      </Box>
    </AuthLayout>
  )
}

export default Login