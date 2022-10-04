import { Box, CircularProgress, Typography } from '@mui/material'

const Loading = () => {
  return (
    <Box
      display={'flex'}
      flexDirection='column'
      justifyContent='center'
      alignItems={'center'}
      height='calc(100vh - 200px)'
    >
      <Typography variant='h2' fontWeight={200} marginBottom={2}>Loading...</Typography>
      <CircularProgress thickness={2} />
    </Box>
  )
}

export default Loading;

