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
export interface BuyerUser {
  id: string;
  email: string;
  contactName: string;
  businessName: string;
  businessType: string;
  phoneNumber: string;
  country: string;
}

// 购物车项类型定义
export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface StoredCartItem {
  productId: string;
  quantity: number;
}

export interface CartDisplayItem {
  productId: string;
  quantity: number;
  product: Product;
  brand: Brand;
}

export interface FavoriteState {
  productIds: string[];
  brandIds: string[];
}

export interface CompareState {
  productIds: string[];
  brandIds: string[];
}

export type RecentViewType = 'product' | 'brand';

export interface RecentView {
  entityType: RecentViewType;
  entityId: string;
  viewedAt: string;
}

export type InquirySource = 'product' | 'brand' | 'cart' | 'general';

export type InquiryStatus = 'submitted' | 'reviewing' | 'quoted' | 'closed';
export type InquiryActivityType = 'created' | 'buyer_follow_up' | 'advisor_update' | 'status_change';
export type InquiryActivityAuthor = 'buyer' | 'advisor' | 'system';

export interface InquiryLineItem {
  productId: string;
  productName: string;
  brandId: string;
  brandName: string;
  quantity: number;
  minOrderQuantity: number;
  unitPrice: number;
}

export interface InquiryActivity {
  id: string;
  createdAt: string;
  type: InquiryActivityType;
  author: InquiryActivityAuthor;
  title: string;
  message: string;
  status?: InquiryStatus;
}

export interface Inquiry {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: InquiryStatus;
  source: InquirySource;
  buyerName: string;
  email: string;
  company: string;
  role: string;
  destinationCountry: string;
  targetPrice: string;
  needSample: boolean;
  message: string;
  brandId?: string;
  brandName?: string;
  productId?: string;
  productName?: string;
  items: InquiryLineItem[];
  activities: InquiryActivity[];
  lastFollowUpAt?: string;
}

export type OrderStatus = 'submitted' | 'processing' | 'ready_to_ship' | 'completed';

export interface OrderLineItem {
  productId: string;
  productName: string;
  brandId: string;
  brandName: string;
  quantity: number;
  unitPrice: number;
  minOrderQuantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  contactName: string;
  email: string;
  company: string;
  destinationCountry: string;
  shippingAddress: string;
  paymentMethod: string;
  notes: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderLineItem[];
  paypalPaymentId?: string;
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
