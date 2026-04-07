import type { Totals } from "./pricing";

export type Size = "A4" | "A3";
export type Color = "siyah_beyaz" | "renkli";
export type Side = "tek" | "cift";
export type BindingType = "none" | "spiral" | "american";

export interface OrderFormData {
  size: Size | "";
  color: Color | "";
  side: Side | "";
  bindingType: BindingType | "";
  ciltCount: number;
  pageCount: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export type PriceBreakdown = Totals;
