import NextLink from 'next/link';
import { Box, Button, CardActionArea, CardMedia, Grid, Link, Typography } from "@mui/material";
import { ItemCounter } from "../ui";
import { RemoveCircleOutline } from "@mui/icons-material";
import { ICart } from '../../interfaces';
import { useContext } from 'react';
import { CartContext } from '../../context/cart/store';
import type { Order as OrderDB, Product } from '@prisma/client';

type Order = OrderDB & { products: Product[] }

interface Props {
  editable?: boolean;
  order?: Order;
};

export const CartList: React.FC<Props> = ({ editable = false, order }) => {

  const { cart, updateProduct, removeProduct } = useContext(CartContext);

  const handleUpdate = (amount: number, maxValue: number, product: ICart) => {
    updateProduct({...product, amount: Math.min(Math.max(product.amount + amount, 1), maxValue > 0 ? maxValue : 4)})
  }

  const handleRemove = (product: ICart) => {
    removeProduct(product);
  }

  return (
    <>
      {(order ? order.products : cart).map(product => (
        <Grid container spacing={2} key={product.slug + product.size} sx={{ mb: 1 }}>
          <Grid item xs={3}>
            <NextLink href={`/product/${product.slug}`} passHref>
              <Link>
                <CardActionArea>
                  <CardMedia
                    image={`/products/${product.image}`}
                    component='img'
                    sx={{ borderRadius: 5 }}
                  />
                </CardActionArea>
              </Link>
            </NextLink>
          </Grid>
          <Grid item xs={7}>
            <Box display='flex' flexDirection={'column'}>
              <Typography variant='body1'>{product.title}</Typography>
              <Typography variant='body1'>Size: {product.size}</Typography>

              {editable
                ? <ItemCounter amount={product.amount} maxValue={(product as ICart).inStock} handleAmount={( amount, maxValue ) => handleUpdate(amount, maxValue, product as ICart)}  />
                : <Typography variant='h6'>amount: {product.amount}</Typography>}
            </Box>
          </Grid>
          <Grid item xs={2} display='flex' alignItems='center' flexDirection={'column'}>
            <Typography variant='subtitle1'>${product.price}</Typography>
            {editable && (
              <Button variant='text' color='secondary' onClick={() => handleRemove(product as ICart)}>
                <RemoveCircleOutline />
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
    </>
  )
}
