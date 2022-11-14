import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Divider, Drawer, IconButton, Input, InputAdornment, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from "@mui/material"
import { AccountCircleOutlined, AdminPanelSettings, CategoryOutlined, ConfirmationNumberOutlined, DashboardOutlined, EscalatorWarningOutlined, FemaleOutlined, LoginOutlined, MaleOutlined, SearchOutlined, VpnKeyOutlined } from "@mui/icons-material"
import { UIContext } from "../../context";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { AuthContext } from '../../context/user/store';
import Cookies from 'js-cookie';
import { signOut } from 'next-auth/react';

const schema = z.object({
  query: z.string().min(1, 'Required')
})

type FormValues = { query: string };

export const SideMenu = () => {
  // const utils = trpc.useContext();
  // const mutation = trpc.auth.logout.useMutation({
  //   onSuccess: () => {
  //     setStatus(false);
  //     Cookies.remove('data-form');
  //     utils.auth.user.invalidate()
  //   }
  // });
  const { status, setStatus } = useContext(UIContext);
  const { status: auth_status, user } = useContext(AuthContext);
  const router = useRouter();

  const navigateTo = (url: string) => {
    router.push(url);
    setStatus(false);
  }

  const { register, handleSubmit, unregister, watch } = useForm<FormValues>({
    defaultValues: { query: '' },
    mode: 'all',
    resolver: zodResolver(schema),
  });

  const handleSearch: SubmitHandler<FormValues> = (data, e) => {
    navigateTo(`/search?q=${data.query}`);
  }

  const query = watch('query');
  useEffect(() => {
    if (query) return unregister('query');
  }, [unregister, query]);

  const handleLogout = () => {
    signOut();
    Cookies.remove('user-info');
    Cookies.remove('cart');
    setStatus(false);
    // mutation.mutate();
  }

  const handleLogin = () => {
    navigateTo(`/auth/login?p=${router.asPath}`)
  }


  return (
    <Drawer
      open={status}
      anchor='right'
      sx={{ backdropFilter: 'blur(4px)', transition: 'all 0.5s ease-out' }}
      onClose={() => setStatus(false)}
    >
      <Box sx={{ width: 250, paddingTop: 5 }}>
        <List>
          <ListItem>
            <form onSubmit={handleSubmit(handleSearch)}>
              <Input
                autoFocus
                type='text'
                placeholder="Search..."
                {...register('query')}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchOutlined />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </form>
          </ListItem>
          {
            auth_status === 'offline'
              ? (
                <>
                  <ListItem button onClick={handleLogin}>
                    <ListItemIcon>
                      <VpnKeyOutlined />
                    </ListItemIcon>
                    <ListItemText primary={'Sign in'} />
                  </ListItem>
                </>
              )
              : (
                <>
                  <ListItem button>
                    <ListItemIcon>
                      <AccountCircleOutlined />
                    </ListItemIcon>
                    <ListItemText primary={'Dashboard'} />
                  </ListItem>

                  <ListItem button onClick={() => navigateTo('/orders/history')}>
                    <ListItemIcon>
                      <ConfirmationNumberOutlined />
                    </ListItemIcon>
                    <ListItemText primary={'My orders'} />
                  </ListItem>


                  <ListItem button sx={{ display: { xs: '', sm: 'none' } }} onClick={() => navigateTo('/category/men')}>
                    <ListItemIcon>
                      <MaleOutlined />
                    </ListItemIcon>
                    <ListItemText primary={'Man'} />
                  </ListItem>

                  <ListItem button sx={{ display: { xs: '', sm: 'none' } }} onClick={() => navigateTo('/category/women')}>
                    <ListItemIcon>
                      <FemaleOutlined />
                    </ListItemIcon>
                    <ListItemText primary={'Women'} />
                  </ListItem>

                  <ListItem button sx={{ display: { xs: '', sm: 'none' } }} onClick={() => navigateTo('/category/kid')}>
                    <ListItemIcon>
                      <EscalatorWarningOutlined />
                    </ListItemIcon>
                    <ListItemText primary={'Kids'} />
                  </ListItem>

                  <ListItem button onClick={handleLogout}>
                    <ListItemIcon>
                      <LoginOutlined />
                    </ListItemIcon>
                    <ListItemText primary={'Sign out'} />
                  </ListItem>


                  {/* Admin */}
                  {
                    user?.role === 'admin'
                    && (
                      <>
                        <Divider />
                        <ListSubheader>Admin Panel</ListSubheader>

                        <ListItem 
                          button
                          onClick={() => navigateTo('/admin')}
                        >
                          <ListItemIcon>
                            <DashboardOutlined />
                          </ListItemIcon>
                          <ListItemText primary={'Dashboard'} />
                        </ListItem>

                        <ListItem button onClick={() => navigateTo('/admin/products')}>
                          <ListItemIcon>
                            <CategoryOutlined />
                          </ListItemIcon>
                          <ListItemText primary={'Products'} />
                        </ListItem>

                        <ListItem button onClick={() => navigateTo('/admin/orders')}>
                          <ListItemIcon>
                            <ConfirmationNumberOutlined />
                          </ListItemIcon>
                          <ListItemText primary={'Orders'} />
                        </ListItem>

                        <ListItem 
                          button
                          onClick={() => navigateTo('/admin/users')}
                        >
                          <ListItemIcon>
                            <AdminPanelSettings />
                          </ListItemIcon>
                          <ListItemText primary={'Users'} />
                        </ListItem>
                      </>
                    )
                  }

                </>
              )
          }
        </List>
      </Box>
    </Drawer>
  )
}