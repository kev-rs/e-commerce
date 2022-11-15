import { z } from "zod"

export type Dashboard = {
  numberOfOrders: number; // count
  paidOrders: number; // isPaid = true
  notPaidOrders: number; // isPaid = false
  numberOfClients: number; // role = client
  numberOfProducts: number; // count
  productsWithNoInventory: number; // 0
  lowInventory: number; // products w/ 10 or less in stock
}

const type = z.enum(['shirts', 'pants', 'hoodies', 'hats']);
const gender = z.enum(['men', 'women', 'kid', 'unisex']);
const size = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
const sizes = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']).array();

export const adminSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  inStock: z.number().min(0, 'Minimun 0'),
  price: z.number().min(1, 'Required'),
  slug: z.string().min(1, 'Required').superRefine((val, ctx) => {
    if(val.trim().includes(' ')) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'there cannot be spaces' });
  }).transform(val => val.trim().replaceAll("'", "")),
  tags: z.string().min(1, 'Required').array().optional(),
  type: type,
  gender: gender,
  sizes: sizes,
  images: z.string().array().min(2, 'Minimum 2 images').optional().default([]),
})

export type TypeValue = 'title' | 'description' | 'inStock' | 'price' | 'slug' | 'tags' | 'type' | 'gender' | 'sizes';

export type AdminSchema = z.infer<typeof adminSchema>;
export type ProductType = z.infer<typeof type>;
export type TypeGender = z.infer<typeof gender>;
export type TypeSizes = z.infer<typeof sizes>;
export type TypeSize = z.infer<typeof size>;
