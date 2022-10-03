import { Grid } from "@mui/material"
import { ProductCard } from "./ProductCard";
import { SeedProduct } from '../../db';

interface Props {
  products: SeedProduct[]
}

export const ProductList: React.FC<Props> = ({ products }) => {
  return (
    <Grid container spacing={4}>
      {products.map((product) => (<ProductCard {...product} key={product.id} />))}
    </Grid>
  )
}
