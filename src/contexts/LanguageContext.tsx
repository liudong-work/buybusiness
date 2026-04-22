'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

const translations: Record<string, Record<Language, string>> = {
  siteName: { zh: '外贸批发平台', en: 'Global Wholesale' },
  navHome: { zh: '首页', en: 'Home' },
  navBrands: { zh: '供应商', en: 'Brands' },
  navCategories: { zh: '分类', en: 'Categories' },
  navAbout: { zh: '关于我们', en: 'About' },
  navContact: { zh: '联系我们', en: 'Contact' },
  navCart: { zh: '购物车', en: 'Cart' },
  signup: { zh: '免费注册', en: 'Sign Up Free' },
  login: { zh: '登录', en: 'Login' },
  heroBadge: { zh: '已有 100,000+ 供应商入驻', en: '100,000+ Suppliers Joined' },
  heroTitle1: { zh: '发现优质中国供应商', en: 'Discover Quality Chinese Suppliers' },
  heroTitle2: { zh: '开启全球贸易之旅', en: 'Start Your Global Trade Journey' },
  heroSubtitle1: { zh: '连接全球零售商与中国制造，一站式批发采购平台', en: 'Connecting global retailers with Chinese manufacturing, one-stop wholesale platform' },
  heroSubtitle2: { zh: '支持支付宝、微信支付，提供专业中文客服', en: 'Support Alipay, WeChat Pay, with professional customer service' },
  heroCta1: { zh: '立即注册采购', en: 'Start Sourcing Now' },
  heroCta2: { zh: '浏览供应商', en: 'Browse Suppliers' },
  statSuppliers: { zh: '优质供应商', en: 'Quality Suppliers' },
  statProducts: { zh: '产品SKU', en: 'Product SKUs' },
  statRetailers: { zh: '全球零售商', en: 'Global Retailers' },
  statCountries: { zh: '服务国家', en: 'Countries Served' },
  categoriesTitle: { zh: '按分类浏览产品', en: 'Browse by Category' },
  categoriesSubtitle: { zh: '涵盖家居装饰、食品饮料、女装服饰等热门品类', en: 'Covering home decor, food & drink, women fashion and more' },
  hotCategories: { zh: '热门分类', en: 'Hot Categories' },
  featuredBrands: { zh: '发现优质品牌', en: 'Discover Quality Brands' },
  featuredBrandsSubtitle: { zh: '来自全国各地的优质制造商和品牌供应商', en: 'Quality manufacturers and brand suppliers from across the country' },
  selectedSuppliers: { zh: '精选供应商', en: 'Selected Suppliers' },
  qualitySupplier: { zh: '优质供应商', en: 'Quality Supplier' },
  viewDetails: { zh: '查看详情', en: 'View Details' },
  viewAllBrands: { zh: '查看全部供应商', en: 'View All Suppliers' },
  valuesTitle: { zh: '按价值观选择供应商', en: 'Choose Suppliers by Values' },
  valuesSubtitle: { zh: '选择符合您价值观的合作伙伴', en: 'Choose partners that match your values' },
  valueSustainable: { zh: '可持续发展', en: 'Sustainable' },
  valueFairTrade: { zh: '公平贸易', en: 'Fair Trade' },
  valueWomenOwned: { zh: '女性创业', en: 'Women Owned' },
  valueLocalMade: { zh: '本土制造', en: 'Local Made' },
  valueRecycled: { zh: '循环利用', en: 'Recycled' },
  valueCarbonNeutral: { zh: '碳中和', en: 'Carbon Neutral' },
  valueCrueltyFree: { zh: '零残忍', en: 'Cruelty Free' },
  valueOrganic: { zh: '有机认证', en: 'Organic Certified' },
  valueHandmade: { zh: '手工制作', en: 'Handmade' },
  valueInnovative: { zh: '创新设计', en: 'Innovative Design' },
  suppliers: { zh: '供应商', en: 'Suppliers' },
  testimonialsTitle: { zh: '全球零售商的信赖之选', en: 'Trusted by Global Retailers' },
  testimonialsSubtitle: { zh: '听听他们怎么说', en: 'Hear what they say' },
  customerReviews: { zh: '客户评价', en: 'Customer Reviews' },
  ctaTitle: { zh: '准备好开始您的批发之旅了吗？', en: 'Ready to Start Your Wholesale Journey?' },
  ctaSubtitle: { zh: '免费注册，立即访问 100,000+ 优质供应商', en: 'Sign up free, access 100,000+ quality suppliers now' },
  ctaButton: { zh: '立即免费注册', en: 'Sign Up Free Now' },
  ctaContact: { zh: '联系我们', en: 'Contact Us' },
  footerDescription: { zh: '连接全球零售商与中国制造的领先B2B批发平台，提供一站式采购解决方案。', en: 'Leading B2B wholesale platform connecting global retailers with Chinese manufacturing.' },
  footerBuyers: { zh: '采购商', en: 'For Buyers' },
  footerSuppliers: { zh: '供应商', en: 'For Suppliers' },
  footerAbout: { zh: '关于我们', en: 'About Us' },
  footerFreeSignup: { zh: '免费注册', en: 'Free Signup' },
  footerBrowseBrands: { zh: '浏览供应商', en: 'Browse Brands' },
  footerBuyingGuide: { zh: '采购指南', en: 'Buying Guide' },
  footerFAQ: { zh: '常见问题', en: 'FAQ' },
  footerApply: { zh: '入驻申请', en: 'Apply Now' },
  footerSupplierPortal: { zh: '供应商后台', en: 'Supplier Portal' },
  footerOperationsGuide: { zh: '运营指南', en: 'Operations Guide' },
  footerSuccessStories: { zh: '成功案例', en: 'Success Stories' },
  footerCompany: { zh: '公司介绍', en: 'Company' },
  footerContact: { zh: '联系我们', en: 'Contact' },
  footerJoinUs: { zh: '加入我们', en: 'Join Us' },
  footerPrivacy: { zh: '隐私政策', en: 'Privacy Policy' },
  footerRights: { zh: '保留所有权利', en: 'All rights reserved' },
  footerPaymentMethods: { zh: '支持支付方式', en: 'Payment Methods' },
  alipay: { zh: '支付宝', en: 'Alipay' },
  wechat: { zh: '微信', en: 'WeChat' },
  unionpay: { zh: '银联', en: 'UnionPay' },
  contactTitle: { zh: '联系我们', en: 'Contact Us' },
  contactSubtitle: { zh: '我们随时为您提供帮助，开启高效批发采购之旅', en: 'We are here to help you start your wholesale journey' },
  emailSupport: { zh: '邮件支持', en: 'Email Support' },
  phoneSupport: { zh: '电话咨询', en: 'Phone Support' },
  onlineChat: { zh: '在线客服', en: 'Online Chat' },
  headquarters: { zh: '总部地址', en: 'Headquarters' },
  replyWithin24h: { zh: '24小时内回复', en: 'Reply within 24h' },
  businessHours: { zh: '周一至周五 9:00-18:00', en: 'Mon-Fri 9:00-18:00' },
  avgResponseTime: { zh: '平均响应时间 < 2分钟', en: 'Avg response < 2 min' },
  welcomeVisit: { zh: '欢迎预约来访', en: 'Welcome to visit' },
  sendMessage: { zh: '发送消息', en: 'Send Message' },
  sendMessageDesc: { zh: '填写以下表单，我们会尽快回复您', en: 'Fill in the form below and we will reply soon' },
  sendSuccess: { zh: '发送成功！', en: 'Sent Successfully!' },
  sendSuccessDesc: { zh: '我们已收到您的消息，将在24小时内回复', en: 'We received your message and will reply within 24 hours' },
  inquiryType: { zh: '咨询类型', en: 'Inquiry Type' },
  generalInquiry: { zh: '一般咨询', en: 'General Inquiry' },
  retailerSupport: { zh: '采购商支持', en: 'Retailer Support' },
  brandPartnership: { zh: '品牌合作', en: 'Brand Partnership' },
  wholesalePricing: { zh: '批发价格', en: 'Wholesale Pricing' },
  technicalSupport: { zh: '技术支持', en: 'Technical Support' },
  billingQuestion: { zh: '账单问题', en: 'Billing Question' },
  name: { zh: '姓名', en: 'Name' },
  email: { zh: '邮箱', en: 'Email' },
  companyName: { zh: '公司名称', en: 'Company Name' },
  phoneNumber: { zh: '电话号码', en: 'Phone Number' },
  country: { zh: '国家/地区', en: 'Country/Region' },
  subject: { zh: '主题', en: 'Subject' },
  message: { zh: '详细消息', en: 'Message' },
  namePlaceholder: { zh: '请输入您的姓名', en: 'Enter your name' },
  emailPlaceholder: { zh: 'example@email.com', en: 'example@email.com' },
  companyPlaceholder: { zh: '请输入公司名称', en: 'Enter company name' },
  phonePlaceholder: { zh: '+86 138-0000-0000', en: '+1 555-000-0000' },
  subjectPlaceholder: { zh: '请简要描述您的咨询主题', en: 'Briefly describe your inquiry' },
  messagePlaceholder: { zh: '请详细描述您的需求或问题...', en: 'Describe your needs or questions in detail...' },
  sending: { zh: '发送中...', en: 'Sending...' },
  sendButton: { zh: '发送消息', en: 'Send Message' },
  quickHelp: { zh: '快速帮助', en: 'Quick Help' },
  faq: { zh: '常见问题解答', en: 'FAQ' },
  liveChat: { zh: '在线客服支持', en: 'Live Chat Support' },
  gettingStarted: { zh: '新手入门指南', en: 'Getting Started Guide' },
  businessHoursTitle: { zh: '工作时间', en: 'Business Hours' },
  monFri: { zh: '周一至周五', en: 'Monday - Friday' },
  saturday: { zh: '周六', en: 'Saturday' },
  sunday: { zh: '周日', en: 'Sunday' },
  closed: { zh: '休息', en: 'Closed' },
  globalOffices: { zh: '全球办公室', en: 'Global Offices' },
  globalOfficesDesc: { zh: '我们在全球设有多个办公室，为您提供本地化服务', en: 'Multiple offices worldwide for localized service' },
  readyToStart: { zh: '准备好开始了吗？', en: 'Ready to Start?' },
  readyToStartDesc: { zh: '免费注册，立即访问全球优质供应商和批发价格', en: 'Sign up free, access global quality suppliers and wholesale prices' },
  browseBrands: { zh: '浏览供应商', en: 'Browse Suppliers' },
  aboutTitle: { zh: '关于我们', en: 'About Us' },
  aboutSubtitle: { zh: '连接全球零售商与中国制造的领先B2B批发平台', en: 'Leading B2B wholesale platform connecting global retailers with Chinese manufacturing' },
  ourMission: { zh: '我们的使命', en: 'Our Mission' },
  ourVision: { zh: '我们的愿景', en: 'Our Vision' },
  coreValues: { zh: '核心价值', en: 'Core Values' },
  missionDesc: { zh: '通过技术创新和优质服务，降低全球贸易门槛，让每一个零售商都能轻松获取优质商品，让每一个供应商都能触达全球市场。', en: 'Through technological innovation and quality service, lower the barrier to global trade.' },
  visionDesc: { zh: '成为全球领先的B2B批发交易平台，连接100万供应商和500万零售商。', en: 'Become the leading global B2B wholesale platform, connecting 1M suppliers and 5M retailers.' },
  integrity: { zh: '诚信合作', en: 'Integrity' },
  integrityDesc: { zh: '建立透明、信任的商业关系', en: 'Build transparent, trusted business relationships' },
  innovation: { zh: '创新驱动', en: 'Innovation' },
  innovationDesc: { zh: '持续创新技术和服务', en: 'Continuous innovation in technology and service' },
  quality: { zh: '品质至上', en: 'Quality First' },
  qualityDesc: { zh: '严格把控产品质量', en: 'Strict quality control' },
  growth: { zh: '共同成长', en: 'Grow Together' },
  growthDesc: { zh: '与供应商和零售商共同成长', en: 'Grow together with suppliers and retailers' },
  milestones: { zh: '发展历程', en: 'Milestones' },
  milestonesDesc: { zh: '我们的成长轨迹', en: 'Our growth journey' },
  teamTitle: { zh: '核心团队', en: 'Core Team' },
  teamDesc: { zh: '由行业资深专家组成的领导团队', en: 'Leadership team of industry experts' },
  joinUs: { zh: '加入我们', en: 'Join Us' },
  joinUsDesc: { zh: '一起开启全球贸易新篇章', en: 'Start a new chapter in global trade together' },
  cartTitle: { zh: '我的购物车', en: 'My Cart' },
  cartEmpty: { zh: '购物车是空的', en: 'Cart is empty' },
  cartItems: { zh: '共 {count} 件商品', en: '{count} items' },
  startShopping: { zh: '开始浏览供应商，添加您喜欢的产品', en: 'Start browsing suppliers and add products you like' },
  minOrder: { zh: '最小起订量', en: 'Min Order' },
  pieces: { zh: '件', en: 'pcs' },
  delete: { zh: '删除', en: 'Delete' },
  orderSummary: { zh: '订单摘要', en: 'Order Summary' },
  subtotal: { zh: '小计', en: 'Subtotal' },
  shipping: { zh: '运费', en: 'Shipping' },
  free: { zh: '免费', en: 'Free' },
  freeShippingHint: { zh: '再消费 ${amount} 即可享受免运费', en: 'Spend ${amount} more for free shipping' },
  total: { zh: '总计', en: 'Total' },
  checkout: { zh: '去结算', en: 'Checkout' },
  net60: { zh: '支持 Net 60 付款条件', en: 'Net 60 payment terms available' },
  returns: { zh: '60 天内接受退货', en: '60-day returns accepted' },
  securePayment: { zh: '安全支付保障', en: 'Secure payment guaranteed' },
  quickSignup: { zh: '快速注册', en: 'Quick Signup' },
  verifyPhone: { zh: '验证手机', en: 'Verify Phone' },
  signupStep1: { zh: '只需几步，开启批发采购之旅', en: 'Just a few steps to start your wholesale journey' },
  signupStep2: { zh: '请输入收到的验证码', en: 'Enter the verification code received' },
  phoneNumberLabel: { zh: '手机号码', en: 'Phone Number' },
  phonePlaceholder2: { zh: '请输入您的手机号码', en: 'Enter your phone number' },
  businessType: { zh: '您是？', en: 'You are?' },
  selectIdentity: { zh: '请选择您的身份', en: 'Select your identity' },
  retailer: { zh: '零售商/采购商', en: 'Retailer/Buyer' },
  supplier: { zh: '供应商/厂家', en: 'Supplier/Manufacturer' },
  both: { zh: '既是采购商也是供应商', en: 'Both buyer and supplier' },
  agreeTerms: { zh: '我已阅读并同意', en: 'I have read and agree to' },
  serviceAgreement: { zh: '服务协议', en: 'Service Agreement' },
  privacyPolicy: { zh: '隐私政策', en: 'Privacy Policy' },
  verificationCode: { zh: '验证码', en: 'Verification Code' },
  codePlaceholder: { zh: '请输入6位验证码', en: 'Enter 6-digit code' },
  resend: { zh: '重新发送', en: 'Resend' },
  codeSentTo: { zh: '验证码已发送至', en: 'Code sent to' },
  getCode: { zh: '获取验证码', en: 'Get Code' },
  completeSignup: { zh: '完成注册', en: 'Complete Signup' },
  alreadyHaveAccount: { zh: '已有账号？', en: 'Already have an account?' },
  loginNow: { zh: '立即登录', en: 'Login Now' },
  orUse: { zh: '或使用以下方式', en: 'Or use' },
  wechatLogin: { zh: '微信登录', en: 'WeChat Login' },
  alipayLogin: { zh: '支付宝登录', en: 'Alipay Login' },
  benefits: { zh: '平台优势', en: 'Platform Benefits' },
  benefitSuppliers: { zh: '100,000+ 供应商', en: '100,000+ Suppliers' },
  benefitSuppliersDesc: { zh: '优质制造商和品牌', en: 'Quality manufacturers and brands' },
  benefitWholesale: { zh: '批发价格', en: 'Wholesale Prices' },
  benefitWholesaleDesc: { zh: '享受最低采购价', en: 'Enjoy lowest wholesale prices' },
  benefitLogistics: { zh: '全球物流', en: 'Global Logistics' },
  benefitLogisticsDesc: { zh: '快速安全配送', en: 'Fast and secure delivery' },
  benefitProtection: { zh: '交易保障', en: 'Trade Protection' },
  benefitProtectionDesc: { zh: '安全支付和退货', en: 'Secure payment and returns' },
  pageNotFound: { zh: '页面未找到', en: 'Page Not Found' },
  pageNotFoundDesc: { zh: '抱歉，您访问的页面不存在', en: 'Sorry, the page you visited does not exist' },
  backToHome: { zh: '返回首页', en: 'Back to Home' },
  errorTitle: { zh: '出错了', en: 'Something Went Wrong' },
  errorDesc: { zh: '抱歉，发生了一些错误', en: 'Sorry, an error occurred' },
  retry: { zh: '重试', en: 'Retry' },
};
