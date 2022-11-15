import { type GetServerSidePropsContext, type InferGetServerSidePropsType, type GetServerSideProps } from 'next'
import { AdminLayout } from '../../../components/layouts'
import { DriveFileRenameOutline, SaveOutlined, UploadOutlined } from '@mui/icons-material';
import { Box, Button, capitalize, Card, CardActions, CardMedia, Checkbox, Chip, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from '../../../server/router/_app';
import { createContext } from '../../../server/context';
import superjson from 'superjson';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '../../../utils/trpc';
import { useRouter } from 'next/router';
import { adminSchema, type AdminSchema as FormValues, type ProductType, type TypeGender, type TypeValue, type TypeSize } from '../../../common/validation/admin';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import api from '../../../services/api';
import Cookies from 'js-cookie';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import cookies from 'cookie';
import { z } from 'zod';


const validTypes: ProductType[] = ['shirts', 'pants', 'hoodies', 'hats'];
const validGender: TypeGender[] = ['men', 'women', 'kid', 'unisex'];
const validSizes: TypeSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

const ProductAdminPage: React.FC<{ product?: FormValues, slug: string }> = ({ product }) => {
  const [ newTag, setNewTag ] = useState<string>('');

  const router = useRouter();

  const utils = trpc.useContext();
  const mutation = trpc.admin.products.upsert.useMutation({
    onSuccess: () => {
      utils.admin.products.invalidate();
      router.push(`/admin/products`);
    }
  });

  const { register, handleSubmit: submit, formState: { errors, isSubmitSuccessful, isSubmitted }, getValues, setValue, setError, clearErrors } = useForm<FormValues>({
    resolver: zodResolver(adminSchema),
    mode: 'all',
    shouldFocusError: true,
    defaultValues: {
      ...product,
      slug: product?.title.trim().replaceAll(' ', '_').replaceAll("'", '').toLowerCase(),
      tags: product?.tags || [],
      images: product?.images
    },
  });
  
  const handleChange = ({ name, value }: { name: TypeValue; value: ProductType | TypeGender | TypeSize }): void => {
    if(name === 'sizes') {
      const set = new Set(getValues('sizes'))
      if(set.has(value as TypeSize)) {
        set.delete(value as TypeSize)
        // @ts-ignore
        return setValue('sizes', [...set], { shouldValidate: true });
      }
      set.add(value as TypeSize);
      // @ts-ignore
      return setValue('sizes', [...set], { shouldValidate: true });
    }
    setValue(name, value, { shouldValidate: true });
  };


  const handleTags = () => {
    const tag = z.string().min(1, 'Required').trim()
    const newTagValue = newTag.trim().toLowerCase()
    const check = tag.safeParse(newTagValue);
    if(!(check.success)) return setError('tags', { message: check.error.issues[0].message });;
    clearErrors('tags')
    
    let tags = getValues('tags') || [];
    setNewTag('')
    if(tags.includes(newTagValue)) return;
    tags.push(newTagValue);
  }

  const onDeleteTag = (tag: string) => {
    setValue('tags', [...getValues('tags') || []].filter(t => t !== tag), { shouldValidate: true });
  }

  const handleSubmit: SubmitHandler<FormValues> = ( data ) => {
    mutation.mutate(data, { onError: console.log });
  }

  const handleUpload =async (e: ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files || e.target.files.length < 1) return;    
    try {
      // @ts-ignore
      for(const file of e.target.files) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<{ file: { secure_url: string; public_id: string; } }>('/admin/upload', formData);
        setValue('images', [...getValues('images') ?? [], data.file.secure_url], { shouldValidate: true });
      }
    } catch (err) {
      console.log(err);
    }
  }

  const handleDelete = async (url: string) => {
    setValue('images', getValues('images')?.filter(img => img !== url), { shouldValidate: true });
  }

  const FileInputRef = useRef<HTMLInputElement>(null);

  return (
    <AdminLayout
      title={'Product'}
      subTitle={product ? `Editing: ${product.title}` : 'Create product'}
      icon={<DriveFileRenameOutline />}
    >
      <form onSubmit={submit(handleSubmit)}>
        <Box display='flex' justifyContent='end' sx={{ mb: 1 }}>
          <LoadingButton
            color="secondary"
            startIcon={<SaveOutlined />}
            variant='contained'
            sx={{ width: '150px' }}
            type="submit"
            loading={isSubmitted && isSubmitSuccessful}
            loadingPosition='end'
          >
            { isSubmitted && isSubmitSuccessful ? 'Saving...' : 'Save' }
          </LoadingButton>
        </Box>

        <Grid container spacing={2}>
          {/* Data */}
          <Grid item xs={12} sm={6}>

            <TextField
              label="Title"
              variant="filled"
              fullWidth
              sx={{ mb: 1 }}
              // { ...register('title', { onChange: (e: ChangeEvent<HTMLInputElement>) => { setValue('slug', e.target.value.split(' ').join('_').replaceAll("'", '').toLowerCase()) } }) }
              { ...register('title', { onChange: (e: ChangeEvent<HTMLInputElement>) => { setValue('slug', e.target.value.trim().replaceAll(' ', '_').replaceAll("'", '').toLowerCase()) } }) }
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <TextField
              label="Description"
              variant="filled"
              fullWidth
              multiline
              sx={{ mb: 1 }}
              { ...register('description') }
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <TextField
              label="Inventory"
              type='number'
              variant="filled"
              fullWidth
              sx={{ mb: 1 }}
              { ...register('inStock', { valueAsNumber: true }) }
              error={!!errors.inStock}
              helperText={errors.inStock?.message}
            />

            <TextField
              label="Price"
              type='number'
              variant="filled"
              fullWidth
              sx={{ mb: 1 }}
              { ...register('price', { valueAsNumber: true }) }
              error={!!errors.price}
              helperText={errors.price?.message}
            />

            <Divider sx={{ my: 1 }} />

            <FormControl sx={{ mb: 1 }}>
              <FormLabel>Type</FormLabel>
              <RadioGroup
                row
                value={ getValues('type') }
                onChange={ e => handleChange({ name: 'type', value: e.target.value as ProductType }) }
              >
                {
                  validTypes.map(option => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio color='secondary' />}
                      label={capitalize(option)}
                    />
                  ))
                }
              </RadioGroup>
            </FormControl>

            <FormControl sx={{ mb: 1 }}>
              <FormLabel>Género</FormLabel>
              <RadioGroup
                row
                value={ getValues('gender') }
                onChange={ e => handleChange({ name: 'gender', value: e.target.value as TypeGender }) }
              >
                {
                  validGender.map(option => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio color='secondary' />}
                      label={capitalize(option)}
                    />
                  ))
                }
              </RadioGroup>
            </FormControl>

            <FormGroup>
              <FormLabel>Sizes</FormLabel>
              {
                validSizes.map(size => (
                  <FormControlLabel 
                    key={size} 
                    control={<Checkbox checked={getValues('sizes')?.includes(size)} />} 
                    label={size} 
                    onChange={() => handleChange({ name: 'sizes', value: size })}
                  />
                ))
              }
            </FormGroup>

          </Grid>

          {/* Tags e imagenes */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Slug - URL"
              variant="filled"
              fullWidth
              sx={{ mb: 1 }}
              { ...register('slug') }
              error={!!errors.slug}
              helperText={errors.slug?.message}
            />

            <TextField
              label="Tags"
              variant="filled"
              fullWidth
              sx={{ mb: 1 }}
              // { ...register('tags', { onChange: (e) => setNewTag(e.target.value) }) }
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyUp={(e) => e.code === 'Space' ? handleTags() : undefined}
              error={!!errors.tags}
              helperText={errors.tags?.message ?? "Press [space] to add"}
            />

            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              listStyle: 'none',
              p: 0,
              m: 0,
            }}
              component="ul">
              {
                [...getValues('tags') || []].map((tag) => {
                  return (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => onDeleteTag(tag)}
                      color="primary"
                      size='small'
                      sx={{ ml: 1, mt: 1 }}
                    />
                  );
                })}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display='flex' flexDirection="column">
              <FormLabel sx={{ mb: 1 }}>Images</FormLabel>
              <Button
                color="secondary"
                fullWidth
                startIcon={<UploadOutlined />}
                sx={{ mb: 3 }}
                onClick={() => FileInputRef.current?.click()}
              >
                Upload image
              </Button>
              
              <input 
                ref={FileInputRef}
                type='file'
                multiple
                accept='image/png, image/gif, image/jpg, image/jpeg'
                style={{ display: 'none' }}
                onChange={handleUpload}
              />

              <Chip
                sx={{ display: getValues('images')?.length >= 2 ? 'none' : 'flex', textAlign: 'center' }}
                label="Minimum 2 images"
                color='error'
                variant='outlined'
                className='alert'
              />

              <Grid container spacing={2}>
                {
                  getValues('images')?.map(img => {
                    return (
                    <Grid item xs={4} sm={3} key={img}>
                      <Card>
                        <CardMedia
                          component='img'
                          className='fadeIn'
                          image={img.startsWith('https') ? img : `/products/${img}`}
                          alt={img}
                        />
                        <CardActions>
                          <Button fullWidth color="error" onClick={() => handleDelete(img)}>
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  )}
                  )
                }
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </form>
    </AdminLayout>
  )
}


export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const slug = ctx.params?.slug;
  if(!slug) return { redirect: { destination: '/admin/products', permanent: false } };

  if(ctx.query.slug === 'create') return {
    props: {
      product: null
    }
  }

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  })

  const product = await ssg.products.getProductBySlug.fetch({ slug: ctx.query.slug as string });  
  
  return {
    props: {
      trpcState: ssg.dehydrate(),
      product,
      slug,
    }
  }
}


export default ProductAdminPage;
