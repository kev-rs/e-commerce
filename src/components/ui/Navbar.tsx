import NextLink from 'next/link';
import { SearchOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import { AppBar, Badge, Box, Button, IconButton, Link, Toolbar, Typography } from '@mui/material';
import { useRouter } from 'next/router';

export const Navbar = () => {

  const router = useRouter();

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

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
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

        <IconButton>
          <SearchOutlined />
        </IconButton>

        <NextLink href='/cart' passHref>
          <Link>
            <IconButton>
              <Badge badgeContent={2} color='secondary'>
                <ShoppingCartOutlined />
              </Badge>
            </IconButton>
          </Link>
        </NextLink>

        <Button>Menu</Button>
      </Toolbar>
    </AppBar>
  )
}
