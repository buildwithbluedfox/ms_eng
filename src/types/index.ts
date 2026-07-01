export interface ProductFeature {
  icon: string;
  title: string;
  desc: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  image: string;
  thumbnails?: string[];
  description: string;
  features?: ProductFeature[];
  specs?: ProductSpec[];
  extendedSpecs?: ProductSpec[];
  originalUrl?: string;
  tag?: string;
}
