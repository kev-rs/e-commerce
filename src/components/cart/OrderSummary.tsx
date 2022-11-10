import { Grid, Typography } from "@mui/material"
import { ICart } from "../../interfaces"
import { useContext } from 'react';
import { CartContext } from '../../context/cart/store';
import { currency } from "../../utils";
import { Order } from '../../server/db';

export const OrderSummary: React.FC<{ order?: Order }> = ({ order }) => {

  const { numberOfItems, subTotal, taxes, total } = useContext(CartContext);

  return (
    <Grid container>
      <Grid item xs={6}>
        <Typography>No. Products</Typography>
      </Grid>
      <Grid item xs={6} display='flex' justifyContent={'end'}>
        <Typography>{order ? order.numberOfItems: numberOfItems}</Typography>
      </Grid>
      
      <Grid item xs={6}>
        <Typography>Subtotal</Typography>
      </Grid>
      <Grid item xs={6} display='flex' justifyContent={'end'}>
        <Typography>{currency.format(order ? order.subTotal : subTotal)}</Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography>Taxes ({Number(process.env.NEXT_PUBLIC_TAX_RATE) * 100}%)</Typography>
      </Grid>
      <Grid item xs={6} display='flex' justifyContent={'end'}>
        <Typography>{currency.format(order ? order.tax : taxes)}</Typography>
      </Grid>

      <Grid item xs={6} sx={{mt: 2}}>
        <Typography variant='subtitle1'>Total: </Typography>
      </Grid>
      <Grid item xs={6} display='flex' justifyContent={'end'} sx={{mt: 2}}>
        <Typography variant='subtitle1'>{currency.format(order ? order.total : total)}</Typography>
      </Grid>
    </Grid>
  )
}
