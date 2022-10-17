import { Box, Button } from '@mui/material'
import { ValidSizes } from '../../server/db';

interface Props {
  selectedSize?: ValidSizes;
  sizes: ValidSizes[];
  handleSize: (size: ValidSizes) => void;
}

export const ItemSize: React.FC<Props> = ({ selectedSize, sizes, handleSize }) => {
  return (
    <Box>
      {sizes.map((size) => (
        <Button 
          key={size}
          size='small'
          color={selectedSize === size ? 'primary' : 'info'}
          onClick={() => handleSize(size)}
        >{size}</Button>
      ))}
    </Box>
  )
}
