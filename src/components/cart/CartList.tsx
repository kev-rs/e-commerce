import { Box, Button, CardActionArea, CardMedia, Grid, Link, Typography } from "@mui/material"
import { initialData } from "../../database/products"
import NextLink from 'next/link';
import { ItemCounter } from "../ui";
import { RemoveCircleOutline } from "@mui/icons-material";

const productsInCart = [
  initialData.products[0],
  initialData.products[1],
  initialData.products[2],
]

interface Props {
  editable?: boolean;
}

export const CartList: React.FC<Props> = ({ editable=false }) => {
  return (
    <>
      {productsInCart.map(product => (
        <Grid container spacing={2} key={product.slug} sx={{ mb: 1 }}>
          <Grid item xs={3}>
            <NextLink href={`/product/${product.slug}`} passHref>
              <Link>
                <CardActionArea>
                  <CardMedia
                    image={`/products/${product.images[0]}`}
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
              <Typography variant='body1'>Size: {product.sizes[0]}</Typography>

              {editable
                ? <ItemCounter />
                : <Typography variant='h4'>Amount: 3</Typography>}

            </Box>
          </Grid>
          <Grid item xs={2} display='flex' alignItems='center' flexDirection={'column'}>
            <Typography variant='subtitle1'>${product.price}</Typography>
            {editable && (
              <Button variant='text' color='secondary'>
                <RemoveCircleOutline />
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
    </>
  )
}
