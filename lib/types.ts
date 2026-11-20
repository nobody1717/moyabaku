export type Lang = "az" | "ru";
export type Status = "in_stock" | "preorder";
export type Category = "outerwear" | "shoes" | "sets";
export type L10n = { az: string; ru: string };

export interface Product {
  id: string;
  category: Category;
  status: Status;
  /** Ориентировочный срок доставки при предзаказе, дней: например "10–14" */
  preorderDays: string;
  price: number;
  sizes: string[];
  images: string[];
  name: L10n;
  description: L10n;
}

export interface CartLine {
  productId: string;
  size: string;
  qty: number;
}

export const CATEGORIES: Category[] = ["outerwear", "shoes", "sets"];
export const CONTACTS = {
  handle: "@moya.baku",
  tgHandle: "MOYABAKU",
  phone: "+994 55 223 26 13",
  phoneRaw: "994552232613",
  instagram: "https://instagram.com/moya.baku",
  tiktok: "https://www.tiktok.com/@moya.baku",
  telegram: "https://t.me/MOYABAKU",
  whatsapp: "https://wa.me/994552232613",
};
