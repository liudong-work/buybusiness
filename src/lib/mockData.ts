import { Brand, Product, Category } from '@/types';

// 模拟品牌数据
export const mockBrands: Brand[] = [
  {
    id: '1',
    name: 'Flowerhead Tea',
    description: 'Artisanal tea blends inspired by California landscapes',
    logo: '/brands/flowerhead-tea.jpg',
    category: 'Food & Drink',
    values: ['Women Owned', 'Eco-Friendly'],
    location: 'Los Angeles, California',
    rating: 4.8,
    productCount: 45,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Tula House',
    description: 'Sustainable home decor and furniture',
    logo: '/brands/tula-house.jpg',
    category: 'Home Decor',
    values: ['Eco-Friendly', 'Handmade'],
    location: 'Brooklyn, New York',
    rating: 4.9,
    productCount: 120,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Dotter',
    description: 'Modern women\'s fashion and accessories',
    logo: '/brands/dotter.jpg',
    category: 'Women',
    values: ['Women Owned', 'AAPI Owned'],
    location: 'Los Angeles, California',
    rating: 4.7,
    productCount: 89,
    isFeatured: true
  }
];

// 模拟产品数据
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Artisanal Tea Collection',
    description: 'Premium tea blends with organic ingredients',
    price: 25.99,
    images: ['/products/tea-1.jpg', '/products/tea-2.jpg'],
    brandId: '1',
    category: 'Food & Drink',
    tags: ['organic', 'premium', 'gourmet'],
    minOrderQuantity: 12,
    inStock: true,
    rating: 4.8,
    reviewCount: 156
  },
  {
    id: '2',
    name: 'Sustainable Wooden Chair',
    description: 'Handcrafted wooden chair from reclaimed materials',
    price: 189.99,
    images: ['/products/chair-1.jpg', '/products/chair-2.jpg'],
    brandId: '2',
    category: 'Home Decor',
    tags: ['sustainable', 'handmade', 'wood'],
    minOrderQuantity: 6,
    inStock: true,
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: '3',
    name: 'Modern Everyday Tote',
    description: 'Lightweight canvas tote designed for boutique retail shelves',
    price: 42.5,
    images: ['/products/tote-1.jpg', '/products/tote-2.jpg'],
    brandId: '3',
    category: 'Women',
    tags: ['fashion', 'everyday', 'boutique'],
    minOrderQuantity: 10,
    inStock: true,
    rating: 4.7,
    reviewCount: 63
  }
];

// 模拟分类数据
export const mockCategories: Category[] = [
  { id: '1', name: 'Home Decor', icon: '🏠', productCount: 12500 },
  { id: '2', name: 'Food & Drink', icon: '🍽️', productCount: 8900 },
  { id: '3', name: 'Women', icon: '👩', productCount: 23400 },
  { id: '4', name: 'Beauty & Wellness', icon: '💄', productCount: 15600 },
  { id: '5', name: 'Jewelry', icon: '💎', productCount: 7800 },
  { id: '6', name: 'Kids & Baby', icon: '👶', productCount: 11200 }
];

// 价值观标签
export const valueTags = [
  'Women Owned',
  'AAPI Owned', 
  'Black Owned',
  'Latino Owned',
  'LGBTQI+ Owned',
  'Eco-Friendly',
  'Organic',
  'Handmade',
  'Not on Amazon',
  'Gives back'
];

export function getBrandById(id: string) {
  return mockBrands.find((brand) => brand.id === id);
}

export function getProductById(id: string) {
  return mockProducts.find((product) => product.id === id);
}

export function getProductsByBrandId(brandId: string) {
  return mockProducts.filter((product) => product.brandId === brandId);
}
