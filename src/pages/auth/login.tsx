import { Box, Grid, TextField, Typography, Link, Chip, Divider, Button } from '@mui/material'
import { AuthLayout } from '../../components'
import NextLink from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { ErrorOutline, LoginOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import LoadingButton from '@mui/lab/LoadingButton';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { signIn, getProviders } from 'next-auth/react';
import { authOptions } from '../api/auth/[...nextauth]';
import { type ILogin as FormValues, loginSchema } from '../../common/validation/auth';

type CookieResponse = [string, string];

const Login = () => {
  const router = useRouter();
  const [ providers, setProviders ] = useState<any>({});
  useEffect(() => {
    getProviders().then(setProviders);
  }, []);
  const user: CookieResponse = JSON.parse(Cookies.get('data-form') || '[]');
  const { register, handleSubmit, setError, formState: { errors, isSubmitSuccessful, isSubmitted, isSubmitting }, getValues } = useForm<FormValues>({
    defaultValues: { email: user[0] || '', password: user[1] || '' },
    mode: 'all',
    resolver: zodResolver(loginSchema),
  });
  // const utils = trpc.useContext();
  // const mutation = trpc.auth.login.useMutation({
  //   onSuccess: (data) => {
  //     utils.auth.user.invalidate();
  //     auth_user(data)
  //     reset();
      // if(router.query.p) return router.push(`${router.query.p}`)
      // router.back();
  //   },
  //   onError: (err) => {
  //     err.data?.code === 'NOT_FOUND'
  //       ? setError('email', { message: err.message, type: 'wrongE' })
  //       : setError('password', { message: err.message, type: 'wrong' })
  //   },
  // })

  useEffect(() => {
    router.prefetch(`${router.query.p}`)
  }, [ router ]);
  // const handleLogin: SubmitHandler<FormValues> = (data) => mutation.mutate(data);
  const handleLogin: SubmitHandler<FormValues> = async (data) => {
    const res = await signIn('credentials', { ...data, redirect: false });
    if(res?.error) return setError('password', { type: 'wrong', message: 'Your password is incorrect' }, { shouldFocus: true });
    router.push(router.query.p?.toString() || router.query.callbackUrl?.toString() || '/')
  }


  return (
    <AuthLayout title='Login - TeslaShop.com'>
      <Box sx={{ width: 350, padding: '10px 20px' }} component='form' onSubmit={handleSubmit(handleLogin)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h1' component='h1' sx={{ textAlign: 'center' }} color='blue'>Sign in</Typography>
            <Chip
              label={errors.password?.message}
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
              // error={mutation.error?.data?.code === 'NOT_FOUND' || !!errors.email?.message}
              error={errors.email?.type !== 'wrongE' && !!errors.email?.message}
              helperText={errors.email?.type !== 'wrongE' && errors.email?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Password'
              variant='outlined'
              fullWidth {...register('password')}
              // error={mutation.error?.data?.code === 'UNAUTHORIZED' || !!errors.password?.message}
              error={errors.password?.type !== 'wrong' && Boolean(errors.password?.message)}
              helperText={errors.password?.type !== 'wrong' && errors.password?.message}
            />
          </Grid>

          <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center'}}>
            {/* <Button color='primary' size='large' fullWidth type='submit' variant='outlined'>Sign in</Button> */}
            <LoadingButton
              size="small"
              color="secondary"
              type='submit'
              // loading={mutation.isLoading || !!mutation.data}
              loading={isSubmitting || isSubmitSuccessful}
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

          <Grid item xs={12} display='flex' justifyContent='center' flexDirection='column'>
            <Divider sx={{ width: '100%', mb: 2 }} />
            {
              Object.values(providers).map(( provider: any ) => provider.id !== 'credentials' && (
                <Button
                  key={provider.id}
                  variant='outlined'
                  color='primary'
                  sx={{mb: 1}}
                  onClick={() => signIn(provider.id)}
                >
                  {provider.name}
                </Button>
              ))
            }
          </Grid>
        </Grid>
      </Box>
    </AuthLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const { callbackUrl } = ctx.query as { callbackUrl: string }
  const { p = '/' } = ctx.query as { p: string };
  if(session) return { redirect: { destination: callbackUrl ? callbackUrl : p, permanent: false } };

  return {
    props: {
      session
    }
  }
}

export default Login