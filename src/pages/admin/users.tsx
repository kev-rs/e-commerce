import { useState, useEffect } from 'react';
import { GetServerSidePropsContext, InferGetStaticPropsType, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { PeopleOutline } from '@mui/icons-material'
import { AdminLayout } from '../../components'
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetterParams } from "@mui/x-data-grid";
import { Grid, MenuItem, Select } from '@mui/material';
import { trpc } from '../../utils/trpc';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../server/router/_app';
import { createContext } from '../../server/context';
import superjson from 'superjson';
import type { Role, User, Order, UserStatus, Prisma } from '../../server/db';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

interface IUser {
  orders: Order[];
  id: string;
  name: string;
  status: UserStatus;
  email: string;
  _count: Prisma.UserCountOutputType;
  role: Role;
}

// const UsersPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
const UsersPage: React.FC<{ users: IUser[] }> = (props) => {

  const router = useRouter();
  // const utils = trpc.useContext();
  const { data } = trpc.admin.users.get.useQuery(undefined, {
    initialData: props.users,
  });
  const [ users, setUsers ] = useState<typeof props.users>([]);
  const mutation = trpc.admin.users.update.useMutation();

  useEffect(() => {
    if(data) setUsers(data);
  }, [ data ]);

  const handleRole = ({ role, userId }: { role: Role; userId: string }) => {
    const previousUsers = [...users];
    const updated_users = users.map( user => ({ ...user, role: user.id === userId ? role : user.role }));
    setUsers(updated_users);
    mutation.mutate({ userId, role }, {
      onError: () => {
        setUsers(previousUsers);
      },
      onSuccess: ({ role }) => {
        if(role === 'client') router.reload();
        // utils.admin.users.invalidate(undefined, { refetchPage: () => true });
      }
    });
  }

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'name', headerName: 'Full name', width: 300 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 300,
      renderCell: ({ row }) => {
        return (
          <Select
            value={row.role}
            label="Role"
            onChange={e => handleRole({ role: e.target.value as Role, userId: row.id as string })}
            sx={{ width: 300 }}
          >
            <MenuItem value='admin'>Admin</MenuItem>
            <MenuItem value='client'>Client</MenuItem>
            <MenuItem value='super_user'>Super user</MenuItem>
            <MenuItem value='SEO'>SEO</MenuItem>
          </Select>
        )
      }
    },
  ];

  const rows = users.map( user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }))

  return (
    <AdminLayout title='Users' subTitle='User maintenance ' icon={<PeopleOutline />}>
      <Grid container className='fadeIn'>
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

// export async function getStaticProps() {
export async function getServerSideProps(ctx: GetServerSidePropsContext) {

  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if(!session) return { redirect: { destination: '/', permanent: false } };

  if(session.user?.role !== 'admin') return { redirect: { destination: '/', permanent: false } };

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  })

  const users = await ssg.admin.users.get.fetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
      users: JSON.parse(JSON.stringify(users))
    }
  }
}

export default UsersPage