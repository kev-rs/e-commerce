import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { PriceCheckOutlined } from '@mui/icons-material';
import { ShopLayout } from '../components';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';


// import { trpc } from '../utils/trpc';
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   typescript: true,
//   apiVersion: '2022-08-01'
// });

const Success: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ session_id }) => {

  // const { data } = trpc.orders.update.useQuery({ session_id });

  const router = useRouter();

  return (
    <ShopLayout title='success' pageInfo='Payment successful'>
      <div className='success-wrapper'>
        <div className='success'>
          <p className='icon'>
            <PriceCheckOutlined />
          </p>
          <h2 className='title'>Thank you for your order!</h2>
          <p className='email-msg'>Check your email inbox for the receipt.</p>
          <p className='description'>
            If you have any questions, please email
            <a className='email' href="mailto:order@example.com">
              order@example.com
            </a>
          </p>

          <button type='button' className='btn' onClick={() => router.push('/')}>Continue Shopping</button>
        </div>
      </div>
    </ShopLayout>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const { session_id } = ctx.query as { session_id: string };

  if(!session) return { redirect: { destination: `/auth/login?p=/checkout/history`, permanent: false } };
  if(!session_id) return { redirect: { destination: '/checkout/history', permanent: false } };

  const res = await fetch(`${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${ctx.req.headers.host ?? 'localhost:3000'}/api/stripe?session_id=${session_id}&auth=${session.user?.id}`);
  const data = await res.json();
  // console.log(data);

  return {
    props: {
      session_id: JSON.stringify(session_id),
    }
  }
}

export default Success;