import { Box, Button } from '@mui/material'
import { ValidSizes } from '../../db'

interface Props {
  selectedSize: ValidSizes;
  sizes: ValidSizes[];
}

export const ItemSize: React.FC<Props> = ({ selectedSize, sizes }) => {
  return (
    <Box>
      {sizes.map((size) => (
        <Button 
          key={size}
          size='small'
          color={selectedSize === size ? 'primary' : 'info'}
        >{size}</Button>
      ))}
    </Box>
  )
}
