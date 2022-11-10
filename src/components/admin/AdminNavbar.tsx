import { useContext } from 'react';
import NextLink from 'next/link';
import { Menu } from '@mui/icons-material';
import { AppBar, Box, Button, IconButton, Link, Toolbar, Typography } from '@mui/material';
import { UIContext } from '../../context';

export const AdminNavbar = () => {

  const { status, setStatus } = useContext(UIContext);

  return (
    <AppBar>
      <Toolbar>
        <NextLink href='/' passHref>
          <Link display={'flex'} alignItems='center'>
            <Typography variant='h6'>Tesla</Typography>
            <Typography sx={{ ml: 0.5 }} >Shop</Typography>
          </Link>
        </NextLink>

        <Box flex={1} />

        <Button 
          onClick={() => setStatus(!status)}
          sx={{display: { xs: 'none', sm: 'block' }}}
        >Menu</Button>

        <IconButton
          onClick={() => setStatus(!status)}
        >
          <Menu sx={{display: { xs: 'block', sm: 'none' }}} />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
