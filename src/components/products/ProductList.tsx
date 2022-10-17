import { Grid } from "@mui/material"
import { ProductCard } from "./ProductCard";
import { Gender } from '../../server/db'

interface Props {
  products: {
    title: string;
    images: string[];
    price: number;
    inStock: number;
    slug: string;
    gender: Gender
  }[],
  loading: boolean;
}

export const ProductList: React.FC<Props> = ({ products, loading }) => {
  return (
    <Grid container spacing={4}>
      {(loading ? Array.from(new Array(3)) : products).map((product, i) => (<ProductCard {...product} loading={loading} key={loading ? i : product.slug} />))}
    </Grid>
  )
}
