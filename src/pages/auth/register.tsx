import { useEffect } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Chip, Grid, Link, TextField, Typography } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AuthLayout } from '../../components';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '../../utils/trpc';
import { ErrorOutline } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

const schema = z.object({
  name: z.string().min(1, 'Please insert your name').max(16),
  email: z.string().min(1, 'Email is required').email(),
  password: z.string().min(1, 'Please insert your password').min(6).max(32),
  confirm_password: z.string().min(1, 'Please confirm your password')
}).refine((val) => val.password === val.confirm_password, {
  message: 'Passwords not match',
  path: ['confirm_password']
});

type FormValues = z.infer<typeof schema>;

const RegisterPage = () => {

  const router = useRouter();
  const { register, formState: { errors }, reset, handleSubmit, setError, getValues } = useForm<FormValues>({
    defaultValues: { name: '', email: '', password: '', confirm_password: '' },
    mode: 'all',
    resolver: zodResolver(schema),
  });
  
  const mutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      const values = getValues(['email', 'password'])
      Cookies.set('data-form', JSON.stringify(values), {
        path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
      });
      reset();
      if(router.query.p) return router.push(`/auth/login?p=${router.query.p}`);
      router.push('/auth/login');
    },
    onError: (err) => {
      setError('email', { message: err.message, type: 'used' }, { shouldFocus: true });
    }
  })

  useEffect(() => {
    router.prefetch(`/auth/login?p=${router.query.p}`);
  }, [ router ]);

  const handleRegister: SubmitHandler<FormValues> = (data) => mutation.mutate(data);

  return (
    <AuthLayout title='Register - TeslaShop.com'>
      <Box sx={{ width: 350, padding: '10px 20px' }} component='form' onSubmit={handleSubmit(handleRegister)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h1' component='h1' sx={{ textAlign: 'center' }}>Sign up</Typography>
            <Chip
              label={errors.email?.type === 'used' && errors.email.message}
              variant='filled'
              color='error'
              icon={<ErrorOutline />}
              sx={{
                display: errors.email?.type === 'used' ? 'flex' : 'none'
              }}
              className='fadeIn'
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Name'
              variant='filled'
              fullWidth
              error={!!errors.name?.message}
              helperText={errors.name?.message}
              {...register('name')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Email'
              variant='filled'
              fullWidth
              error={!!errors.email?.message}
              helperText={errors.email?.type !== 'used' && errors.email?.message}
              {...register('email')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Password'
              variant='filled'
              fullWidth
              error={!!errors.password?.message}
              helperText={errors.password?.message}
              autoComplete={'New password'}
              {...register('password')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label='Confirm password'
              variant='filled'
              fullWidth
              error={!!errors.confirm_password?.message}
              helperText={errors.confirm_password?.message}
              autoComplete={'Confirm password'}
              {...register('confirm_password')}
            />
          </Grid>

          <Grid item xs={12}>
            <Button color='primary' size='large' fullWidth type='submit'>Sign up</Button>
          </Grid>

          <Grid item xs={12} display='flex' justifyContent='center'>
            <NextLink href={`/auth/login?p=${router.query.p || ''}`} passHref>
              <Link underline='always'>Already have an account ?</Link>
            </NextLink>
          </Grid>
        </Grid>

      </Box>
    </AuthLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const { p = '/' } = ctx.query as { p: string };

  if(session) return {
    redirect: { destination: p, permanent: false }
  };

  return {
    props: {
      session
    }
  }
}

export default RegisterPage