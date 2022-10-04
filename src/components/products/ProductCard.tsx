import { useMemo, useState } from 'react';
import NextLink from 'next/link'
import { Box, Card, CardActionArea, Grid, Link, Typography } from "@mui/material"
import { SeedProduct } from '../../db';
import Image from 'mui-image';

export const ProductCard: React.FC<SeedProduct> = (product) => {

  const [isHovered, setIsHovered] = useState(false);

  const productImage = useMemo(() => {
    return isHovered
      ? `/products/${product.images[1]}`
      : `/products/${product.images[0]}`
  }, [ isHovered, product.images ]);

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
              <Image
                src={productImage}
                // duration={2000}
                // easing='ease-in-out'
                // showLoading={true}
                errorIcon={true}
                shift="right"
                distance="400px"
                shiftDuration={800}
                bgColor="inherit"
                alt={product.title || 'loading'}
              />
            </CardActionArea>
          </Link>
        </NextLink>
      </Card>

      <Box sx={{ mt: 1 }} className='fadeIn'>
        <Typography fontWeight={700}>{product.title}</Typography>
        <Typography fontWeight={500}>${product.price}</Typography>
      </Box>
    </Grid>
  )
}
