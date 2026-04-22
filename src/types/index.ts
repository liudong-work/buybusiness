// 品牌类型定义
export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  values: string[];
  location: string;
  rating: number;
  productCount: number;
  isFeatured: boolean;
}

// 产品类型定义
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  brandId: string;
  category: string;
  tags: string[];
  minOrderQuantity: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

// 分类类型定义
export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

// 用户类型定义
export interface User {
  id: string;
  email: string;
  name: string;
  businessType: string;
  location: string;
}

// 购物车项类型定义
export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

// SEO 配置类型
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage?: string;
  structuredData?: object;
}