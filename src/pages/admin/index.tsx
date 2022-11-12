import { GetServerSidePropsContext, InferGetStaticPropsType } from 'next';
import { AttachMoneyOutlined, CreditCardOffOutlined, DashboardOutlined, GroupOutlined, CategoryOutlined, CancelPresentationOutlined, ProductionQuantityLimitsOutlined, AccessTimeOutlined } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { AdminLayout } from '../../components'
import { SummaryTile } from '../../components/admin';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../server/router/_app';
import { createContext } from '../../server/context';
import superjson from 'superjson';
import { trpc } from '../../utils/trpc';
import { useEffect, useState } from 'react';


// const AdminDashboard: React.FC = () => {
const AdminDashboard: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {

  const utils = trpc.useContext();
  const { data } = trpc.admin.dash.useQuery(undefined, {
    initialData: {...props.data},
    refetchIntervalInBackground: true,
    refetchOnReconnect: true,
  });

  const [ time, setTime ] = useState<number>(30);

  useEffect(() => {
    const interval = setInterval(() => {
      // setTime(prev => prev > 0 ? prev - 1 : 30);
      setTime(prev => {
        if((prev > 0)) return prev - 1;
        // utils.admin.users.invalidate(undefined, { refetchPage: () => true });
        utils.admin.dash.invalidate(undefined, { refetchPage: () => true });
        return 30;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ utils.admin.dash ]);

  return (
    <AdminLayout title='Dashboard' subTitle='' icon={<DashboardOutlined />}>
      <Grid container spacing={2}>
        
        <SummaryTile 
          title={data!.numberOfOrders}
          subTitle="Total orders"
          icon={<CreditCardOffOutlined color='secondary' sx={{fontSize: 40}} />}
        />
        
        <SummaryTile 
          title={data!.paidOrders}
          subTitle="Paid orders"
          icon={<AttachMoneyOutlined color='success' sx={{fontSize: 40}} />}
        />
        
        <SummaryTile 
          title={data!.notPaidOrders}
          subTitle="Pending orders"
          icon={<CreditCardOffOutlined color='error' sx={{fontSize: 40}} />}
        />
        
        <SummaryTile 
          title={data!.numberOfClients}
          subTitle="Clients"
          icon={<GroupOutlined color='primary' sx={{fontSize: 40}} />}
        />
        
        <SummaryTile 
          title={data!.numberOfProducts}
          subTitle="Products"
          icon={<CategoryOutlined color='warning' sx={{fontSize: 40}} />}
        />
        
        <SummaryTile 
          title={data!.productsWithNoInventory}
          subTitle="Without stock"
          icon={<CancelPresentationOutlined color='error' sx={{fontSize: 40}} />}
        />
        
        <SummaryTile 
          title={data!.lowInventory}
          subTitle="Low inventory"
          icon={<ProductionQuantityLimitsOutlined color='warning' sx={{fontSize: 40}} />}
        />
        
        <SummaryTile 
          title={time}
          subTitle="Refresh in: "
          icon={<AccessTimeOutlined color='secondary' sx={{fontSize: 40}} />}
        />

      </Grid>
    </AdminLayout>
  )
}

export const getStaticProps = async () => {

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  })

  const data = await ssg.admin.dash.fetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
      data,
    }
  }
}

export default AdminDashboard;
