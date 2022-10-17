import NextLink from 'next/link';
import { ClearOutlined, Menu, SearchOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import { AppBar, Badge, Box, Button, IconButton, Input, InputAdornment, Link, Toolbar, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { UIContext } from '../../context';
import { CartContext } from '../../context/cart';

export const Navbar = () => {

  const router = useRouter();
  const { status, setStatus } = useContext(UIContext);
  const { numberOfItems } = useContext(CartContext);
  const [visible, setVisible] = useState(false);

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

        <Box sx={{ display: visible ? { xs: 'none', sm: 'none', md: 'block'  } : { xs: 'none', sm: 'block' } }} className='fadeIn'>
          <NextLink href='/category/men' passHref>
            <Link>
              <Button color={router.asPath === '/category/men' ? 'primary' : 'info'}>Man</Button>
            </Link>
          </NextLink>
          <NextLink href='/category/women' passHref>
            <Link>
              <Button color={router.asPath === '/category/women' ? 'primary' : 'info'}>Women</Button>
            </Link>
          </NextLink>
          <NextLink href='/category/kid' passHref>
            <Link>
              <Button color={router.asPath === '/category/kid' ? 'primary' : 'info'}>Kids</Button>
            </Link>
          </NextLink>
        </Box>


        <Box flex={1} />

        <IconButton
          sx={{ display: visible ? 'none' : { xs: 'none', sm: 'block' } }}
          onClick={() => setVisible(true)}
          className='fadeIn'
        >
          <SearchOutlined />
        </IconButton>
        <Input
          type='text'
          autoFocus
          sx={{ display: visible ? { xs: 'none', sm: 'flex'} : 'none' }}
          placeholder="Search..."
          className='fadeIn'
          // {...register('query')}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={() => setVisible(false)}>
                <ClearOutlined />
              </IconButton>
            </InputAdornment>
          }
        />

        <IconButton
          sx={{ display: { xs: 'flex', sm: 'none' } }}
          onClick={() => setStatus(true)}
        >
          <SearchOutlined />
        </IconButton>

        <NextLink href='/cart' passHref>
          <Link>
            <IconButton>
              <Badge badgeContent={numberOfItems > 9 ? '+9' : numberOfItems} color='secondary'>
                <ShoppingCartOutlined />
              </Badge>
            </IconButton>
          </Link>
        </NextLink>

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
