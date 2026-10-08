/**
 * Channel3 API Type Definitions
 * Models the official POST https://api.trychannel3.com/v1/search request and response structures.
 */

export interface Channel3SearchRequest {
  query: string;
  limit?: number;
  page_token?: string;
}

export interface Channel3Brand {
  id: string;
  name: string;
}

export interface Channel3Image {
  url: string;
  cleaned_url?: string;
  is_main_image?: boolean;
  shot_type?: string;
  alt_text?: string;
}

export interface Channel3Price {
  price: number;
  compare_at_price?: number | null;
  currency: string;
}

export interface Channel3Offer {
  url: string;
  domain: string;
  price: Channel3Price;
  availability?: string;
  condition?: string;
  max_commission_rate?: number;
  dimensions?: unknown;
  merchant?: {
    name?: string;
    id?: string;
  };
}

export interface Channel3ProductRaw {
  id: string;
  title: string;
  description?: string;
  brands?: Channel3Brand[];
  images?: Channel3Image[];
  category?: string | string[];
  gender?: string;
  age?: string;
  materials?: string[];
  key_features?: string[];
  colors?: string[];
  offers?: Channel3Offer[];
  variants?: unknown[];
  structured_attributes?: Record<string, unknown>;
  ratings?: unknown[];
}

export interface Channel3SearchResponse {
  products?: Channel3ProductRaw[];
  next_page_token?: string;
  total_results?: number;
}
