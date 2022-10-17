import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material"
import { Box, IconButton, Typography } from "@mui/material"

interface Props {
  amount: number;
  handleAmount: (amount: number, max: number) => void;
  maxValue: number;
}

export const ItemCounter: React.FC<Props> = ({ amount, handleAmount, maxValue }) => {

  return (
    <Box display={'flex'} alignItems='center'>
      <IconButton onClick={() => handleAmount(-1, maxValue)}>
        <RemoveCircleOutline />
      </IconButton>

      <Typography sx={{width: 40, textAlign: 'center'}}>{ amount }</Typography>

      <IconButton onClick={() => handleAmount(1, maxValue)}>
        <AddCircleOutline />
      </IconButton>
    </Box>
  )
}
