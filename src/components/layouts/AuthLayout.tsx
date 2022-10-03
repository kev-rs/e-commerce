import { ShoppingCart } from '@mui/icons-material';
import { Box, IconButton, Link, Typography } from '@mui/material';
import Head from "next/head"
import NextLink from 'next/link';

interface Props {
  title: string;
  children: JSX.Element | JSX.Element[];
}

export const AuthLayout: React.FC<Props> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <NextLink href='/' passHref>
          <Link fontSize={40}>
            Tesla Shop
            <ShoppingCart />
          </Link>
        </NextLink>
      </Box>

      <main>
        <Box display='flex' justifyContent='center' alignItems='center' height='calc(100vh - 200px)'>
          {children}
        </Box>
      </main>
    </>
  )
}
