import { Grid, Typography } from "@mui/material"
import { ICart } from "../../interfaces"
import { useContext } from 'react';
import { CartContext } from '../../context/cart/store';
import { currency } from "../../utils";

interface Props {
}

export const OrderSummary: React.FC = () => {

  const { numberOfItems, subTotal, taxes, total } = useContext(CartContext);

  return (
    <Grid container>
      <Grid item xs={6}>
        <Typography>No. Products</Typography>
      </Grid>
      <Grid item xs={6} display='flex' justifyContent={'end'}>
        <Typography>{numberOfItems}</Typography>
      </Grid>
      
      <Grid item xs={6}>
        <Typography>Subtotal</Typography>
      </Grid>
      <Grid item xs={6} display='flex' justifyContent={'end'}>
        <Typography>{currency.format(subTotal)}</Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography>Taxes ({Number(process.env.NEXT_PUBLIC_TAX_RATE) * 100}%)</Typography>
      </Grid>
      <Grid item xs={6} display='flex' justifyContent={'end'}>
        <Typography>{currency.format(taxes)}</Typography>
      </Grid>

      <Grid item xs={6} sx={{mt: 2}}>
        <Typography variant='subtitle1'>Total: </Typography>
      </Grid>
      <Grid item xs={6} display='flex' justifyContent={'end'} sx={{mt: 2}}>
        <Typography variant='subtitle1'>{currency.format(total)}</Typography>
      </Grid>
    </Grid>
  )
}
