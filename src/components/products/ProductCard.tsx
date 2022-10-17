import { useMemo, useState } from 'react';
import NextLink from 'next/link'
import { Box, Card, CardActionArea, CardMedia, Chip, Grid, Link, Skeleton, Typography } from "@mui/material"
import { Gender } from '../../server/db';

type Product = {
  title: string;
  images: string[];
  price: number;
  inStock: number;
  slug: string;
  gender: Gender
}

interface Props {
  loading: boolean;
}

export const ProductCard: React.FC<Product & Props> = (product) => {
  const [isHovered, setIsHovered] = useState(false);
  let isLoading = product.loading;

  const productImage = useMemo(() => {
    if (isLoading) return ``
    return isHovered
      ? `/products/${product.images[1]}`
      : `/products/${product.images[0]}`
  }, [isHovered, product.images, isLoading]);

  return (
    <Grid
      item xs={6}
      sm={4}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card>
        <NextLink href={`/product/${product.slug}`} prefetch={false}>
          <Link>
            <CardActionArea>
              {
                product.inStock === 0 && (
                  <Chip
                    color='error'
                    label='Sold out'
                    sx={{ position: 'absolute', zIndex: 99, top: '10px', left: '10px' }}
                  />
                )
              }
              {isLoading
                ? <Skeleton sx={{ height: 300 }} animation="wave" variant="rectangular" />
                : (
                  <CardMedia
                    component='img'
                    className='fadeIn'
                    image={productImage}
                    alt={product.title}
                  />
                )
              }
            </CardActionArea>
          </Link>
        </NextLink>
      </Card>

      <Box sx={{ mt: 1 }} className='fadeIn'>
        {isLoading
          ? (
            <>
              <Skeleton animation="wave" variant="text" width='70%' />
              <Skeleton animation="wave" variant="text" width='10%' />
            </>
          )
          : (
            <>
              <Typography fontWeight={700}>{product.title}</Typography>
              <Typography fontWeight={500}>${product.price}</Typography>
            </>
          )
        }
      </Box>
    </Grid>
  )
}
