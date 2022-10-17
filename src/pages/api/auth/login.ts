import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../server/db'
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.body as { email: string, password: string };
  if(!auth) return;

  // find user
  const user = await prisma.user.findUnique({ where: { email: auth.email } });

  // validations
  if(!user) return res.status(404).json({ message: 'Email not found' });
  if(auth.password !== user.password) return res.status(401).json({ message: 'Invalid credentials' });

  // user authed from db
  const userAuthed = await prisma.user.update({
    where: { email: auth.email }, 
    data: { status: 'online' },
    select: { email: true, name: true, status: true },
  });

  // create jwt -> token
  const token = jwt.sign({
    exp: (Date.now() / 1000) + 60 * 60 * 24 * 30,
    email: userAuthed.email,
    name: userAuthed.name,
  }, `${process.env.JWT_SECRET_KEY}`);

  // create cookie
  const serialized = cookie.serialize('AuthToken', token, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })

  // set cookie 
  res.setHeader('Set-Cookie', serialized);

  // return user authed
  return res.status(200).json(userAuthed);
}