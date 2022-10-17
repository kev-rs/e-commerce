import NextLink from 'next/link';
import { Box, Button, CardActionArea, CardMedia, Grid, Link, Typography } from "@mui/material";
import { ItemCounter } from "../ui";
import { RemoveCircleOutline } from "@mui/icons-material";
import { ICart } from '../../interfaces';
import { useContext } from 'react';
import { CartContext } from '../../context/cart/store';

interface Props {
  editable?: boolean;
};

export const CartList: React.FC<Props> = ({ editable = false }) => {

  const { cart, updateProduct, removeProduct } = useContext(CartContext);

  const handleUpdate = (amount: number, maxValue: number, product: ICart) => {
    updateProduct({...product, amount: Math.min(Math.max(product.amount + amount, 1), maxValue > 0 ? maxValue : 4)})
  }

  const handleRemove = (product: ICart) => {
    removeProduct(product);
  }

  return (
    <>
      {cart.map(product => (
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
                ? <ItemCounter amount={product.amount} maxValue={product.inStock} handleAmount={( amount, maxValue ) => handleUpdate(amount, maxValue, product)}  />
                : <Typography variant='h4'>Amount: {product.amount}</Typography>}
            </Box>
          </Grid>
          <Grid item xs={2} display='flex' alignItems='center' flexDirection={'column'}>
            <Typography variant='subtitle1'>${product.price}</Typography>
            {editable && (
              <Button variant='text' color='secondary' onClick={() => handleRemove(product)}>
                <RemoveCircleOutline />
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
    </>
  )
}
