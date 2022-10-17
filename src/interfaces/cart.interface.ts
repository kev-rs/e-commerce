import { ValidSizes, ValidTypes } from "../server/db";

export interface ICart {
  id: string;
  image: string;
  inStock: number;
  price: number;
  size?: ValidSizes;
  slug: string;
  title: string;
  gender: 'men'|'women'|'kid'|'unisex';
  amount: number;
}