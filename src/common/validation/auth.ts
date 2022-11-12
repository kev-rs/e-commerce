import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Required')
})

export const signUpSchema = z.object({
  name: z.string().min(1, 'Please insert your name').max(16),
  email: z.string().min(1, 'Email is required').email(),
  password: z.string().min(1, 'Please insert your password').min(6).max(32),
  confirm_password: z.string().min(1, 'Please confirm your password')
}).refine( val => val.password === val.confirm_password, {
  message: 'Passwords not match',
  path: ['confirm_password']
})

export type ILogin = z.infer<typeof loginSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;