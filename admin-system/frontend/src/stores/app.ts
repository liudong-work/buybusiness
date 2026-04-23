import { defineStore } from 'pinia';
import { apiClient } from '../api/client';

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  owner: string;
  dueLabel: string;
  status: 'warning' | 'processing' | 'success';
}

export interface ProductSku {
  id: string;
  skuCode: string;
  specSummaryZh: string;
  specSummaryEn: string;
  inventory: number;
}

export interface ProductRecord {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: string;
  price: string;
  inventory: number;
  status: 'active' | 'draft' | 'low_stock';
  updatedAt: string;
  coverImage: string;
  images: string[];
  specs: string[];
  skus: ProductSku[];
  englishReady: boolean;
}

export interface ProductPayload {
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: string;
  price: string;
  inventory: number;
  status: ProductRecord['status'];
  coverImage: string;
  images: string[];
  specs: string[];
  skus: ProductSku[];
}

export interface OrderRecord {
  id: string;
  buyer: string;
  destination: string;
  amount: string;
  status: 'submitted' | 'processing' | 'ready_to_ship' | 'completed' | 'exception';
  updatedAt: string;
  exceptionStatus: 'none' | 'pending' | 'resolved';
  sourceInquiryId: string;
  sourceQuoteVersion: string;
}

export interface OrderItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
}

export interface OrderTimelineStep {
  label: string;
  time: string;
  done: boolean;
  current: boolean;
}

export interface OrderDetail extends OrderRecord {
  contactName: string;
  contactPhone: string;
  paymentMethod: string;
  shippingAddress: string;
  internalNote: string;
  logisticsCompany: string;
  trackingNumber: string;
  estimatedShipDate: string;
  shippingNote: string;
  packageCount: number;
  boxMark: string;
  exceptionReason: string;
  items: OrderItem[];
  timeline: OrderTimelineStep[];
}

export interface OrderShippingPayload {
  logisticsCompany: string;
  trackingNumber: string;
  estimatedShipDate: string;
  shippingNote: string;
  packageCount: number;
  boxMark: string;
}

export interface BatchOrderShippingPayload extends OrderShippingPayload {
  orderIds: string[];
}

export interface OrderExceptionPayload {
  reason: string;
  resolved: boolean;
}

export interface InquiryRecord {
  id: string;
  buyer: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'follow_up' | 'quoted' | 'converted';
  updatedAt: string;
  latestQuoteVersion: string;
  convertedOrderId: string;
}

export interface InquiryItem {
  productName: string;
  quantity: number;
  moq: number;
  priceHint: string;
}

export interface InquiryActivity {
  id: string;
  author: string;
  role: 'buyer' | 'seller' | 'system';
  message: string;
  createdAt: string;
}

export interface InquiryNote {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface InquiryQuoteItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  note: string;
}

export interface InquiryQuote {
  id: string;
  version: string;
  author: string;
  currency: string;
  validUntil: string;
  shippingFee: number;
  leadTime: string;
  paymentTerms: string;
  note: string;
  totalAmount: string;
  createdAt: string;
  items: InquiryQuoteItem[];
}

export interface InquiryDetail extends InquiryRecord {
  company: string;
  email: string;
  destination: string;
  owner: string;
  targetPrice: string;
  needSample: boolean;
  items: InquiryItem[];
  activities: InquiryActivity[];
  internalNotes: InquiryNote[];
  quotes: InquiryQuote[];
}

export interface InquiryOwnerPayload {
  owner: string;
}

export interface InquiryQuotePayload {
  author: string;
  currency: string;
  validUntil: string;
  shippingFee: number;
  leadTime: string;
  paymentTerms: string;
  note: string;
  items: InquiryQuoteItem[];
}

export interface InquiryConvertPayload {
  quoteId: string;
  contactName: string;
  contactPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  internalNote: string;
}

interface InquiryConvertResponse {
  inquiry: InquiryDetail;
  order: OrderDetail;
}

export interface SettingsRecord {
  shopName: string;
  contactEmail: string;
  contactPhone: string;
  defaultLeadTime: string;
  samplePolicy: string;
  defaultPaymentTerms: string;
  defaultSampleFeePolicy: string;
}

export interface MemberRecord {
  username: string;
  displayName: string;
  email: string;
  role: 'seller_admin' | 'ops_manager' | 'sales_manager' | 'viewer';
  status: 'active' | 'invited' | 'disabled';
  lastLogin: string;
  lastLoginDevice: string;
  permissions: string[];
}

export interface InviteMemberPayload {
  username: string;
  displayName: string;
  email: string;
  role: MemberRecord['role'];
  tempPassword: string;
}

export interface RoleRecord {
  key: MemberRecord['role'];
  label: string;
  description: string;
  permissions: string[];
  memberCount: number;
}

export interface OperationLogRecord {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface LoginLogRecord {
  id: string;
  username: string;
  displayName: string;
  status: 'success' | 'failed';
  reason: string;
  deviceName: string;
  ipAddress: string;
  createdAt: string;
}

export interface ShipmentBatchRecord {
  id: string;
  orderIds: string[];
  orderCount: number;
  logisticsCompany: string;
  trackingNumber: string;
  estimatedShipDate: string;
  shippingNote: string;
  packageCount: number;
  boxMark: string;
  printed: boolean;
  createdAt: string;
}

interface DashboardResponse {
  metrics: DashboardMetric[];
  tasks: DashboardTask[];
}

function mapOrderRecord(order: OrderDetail): OrderRecord {
  return {
    id: order.id,
    buyer: order.buyer,
    destination: order.destination,
    amount: order.amount,
    status: order.status,
    updatedAt: order.updatedAt,
    exceptionStatus: order.exceptionStatus,
    sourceInquiryId: order.sourceInquiryId,
    sourceQuoteVersion: order.sourceQuoteVersion,
  };
}

function mapInquiryRecord(inquiry: InquiryDetail): InquiryRecord {
  return {
    id: inquiry.id,
    buyer: inquiry.buyer,
    topic: inquiry.topic,
    priority: inquiry.priority,
    status: inquiry.status,
    updatedAt: inquiry.updatedAt,
    latestQuoteVersion: inquiry.latestQuoteVersion,
    convertedOrderId: inquiry.convertedOrderId,
  };
}

export const useAppStore = defineStore('seller-admin-app', {
  state: () => ({
    metrics: [] as DashboardMetric[],
    tasks: [] as DashboardTask[],
    products: [] as ProductRecord[],
    orders: [] as OrderRecord[],
    inquiries: [] as InquiryRecord[],
    settings: null as SettingsRecord | null,
    members: [] as MemberRecord[],
    roles: [] as RoleRecord[],
    operationLogs: [] as OperationLogRecord[],
    loginLogs: [] as LoginLogRecord[],
    shipmentBatches: [] as ShipmentBatchRecord[],
    loading: false,
  }),
  actions: {
    async loadDashboard() {
      this.loading = true;
      try {
        const { data } = await apiClient.get<DashboardResponse>('/dashboard');
        this.metrics = data.metrics;
        this.tasks = data.tasks;
      } finally {
        this.loading = false;
      }
    },
    async loadProducts() {
      const { data } = await apiClient.get<ProductRecord[]>('/products');
      this.products = data;
    },
    async createProduct(payload: ProductPayload) {
      const { data } = await apiClient.post<ProductRecord>('/products', payload);
      this.products = [data, ...this.products];
      return data;
    },
    async updateProduct(productId: string, payload: ProductPayload) {
      const { data } = await apiClient.put<ProductRecord>(`/products/${productId}`, payload);
      this.products = this.products.map((item) => (item.id === productId ? data : item));
      return data;
    },
    async publishProduct(productId: string) {
      const { data } = await apiClient.put<ProductRecord>(`/products/${productId}/publish`);
      this.products = this.products.map((item) => (item.id === productId ? data : item));
      return data;
    },
    async unpublishProduct(productId: string) {
      const { data } = await apiClient.put<ProductRecord>(`/products/${productId}/unpublish`);
      this.products = this.products.map((item) => (item.id === productId ? data : item));
      return data;
    },
    async deleteProduct(productId: string) {
      await apiClient.delete(`/products/${productId}`);
      this.products = this.products.filter((item) => item.id !== productId);
    },
    async loadOrders() {
      const { data } = await apiClient.get<OrderRecord[]>('/orders');
      this.orders = data;
    },
    async getOrderDetail(orderId: string) {
      const { data } = await apiClient.get<OrderDetail>(`/orders/${orderId}`);
      return data;
    },
    async updateOrderStatus(orderId: string, status: OrderRecord['status']) {
      const { data } = await apiClient.put<OrderDetail>(`/orders/${orderId}/status`, { status });
      this.orders = this.orders.map((item) => (item.id === orderId ? mapOrderRecord(data) : item));
      return data;
    },
    async updateOrderShipping(orderId: string, payload: OrderShippingPayload) {
      const { data } = await apiClient.put<OrderDetail>(`/orders/${orderId}/shipping`, payload);
      this.orders = this.orders.map((item) => (item.id === orderId ? mapOrderRecord(data) : item));
      return data;
    },
    async batchUpdateOrderShipping(payload: BatchOrderShippingPayload) {
      const { data } = await apiClient.post<OrderDetail[]>('/orders/batch-shipping', payload);
      const mapped = new Map(data.map((item) => [item.id, mapOrderRecord(item)]));
      this.orders = this.orders.map((item) => mapped.get(item.id) ?? item);
      return data;
    },
    async markOrderException(orderId: string, payload: OrderExceptionPayload) {
      const { data } = await apiClient.put<OrderDetail>(`/orders/${orderId}/exception`, payload);
      this.orders = this.orders.map((item) => (item.id === orderId ? mapOrderRecord(data) : item));
      return data;
    },
    async loadInquiries() {
      const { data } = await apiClient.get<InquiryRecord[]>('/inquiries');
      this.inquiries = data;
    },
    async getInquiryDetail(inquiryId: string) {
      const { data } = await apiClient.get<InquiryDetail>(`/inquiries/${inquiryId}`);
      return data;
    },
    async replyInquiry(inquiryId: string, payload: { author: string; message: string }) {
      const { data } = await apiClient.post<InquiryDetail>(`/inquiries/${inquiryId}/reply`, payload);
      this.inquiries = this.inquiries.map((item) => (item.id === inquiryId ? mapInquiryRecord(data) : item));
      return data;
    },
    async addInquiryNote(inquiryId: string, payload: { author: string; message: string }) {
      const { data } = await apiClient.post<InquiryDetail>(`/inquiries/${inquiryId}/notes`, payload);
      this.inquiries = this.inquiries.map((item) => (item.id === inquiryId ? mapInquiryRecord(data) : item));
      return data;
    },
    async updateInquiryStatus(inquiryId: string, status: InquiryRecord['status']) {
      const { data } = await apiClient.put<InquiryDetail>(`/inquiries/${inquiryId}/status`, { status });
      this.inquiries = this.inquiries.map((item) => (item.id === inquiryId ? mapInquiryRecord(data) : item));
      return data;
    },
    async updateInquiryOwner(inquiryId: string, payload: InquiryOwnerPayload) {
      const { data } = await apiClient.put<InquiryDetail>(`/inquiries/${inquiryId}/owner`, payload);
      this.inquiries = this.inquiries.map((item) => (item.id === inquiryId ? mapInquiryRecord(data) : item));
      return data;
    },
    async createInquiryQuote(inquiryId: string, payload: InquiryQuotePayload) {
      const { data } = await apiClient.post<InquiryDetail>(`/inquiries/${inquiryId}/quotes`, payload);
      this.inquiries = this.inquiries.map((item) => (item.id === inquiryId ? mapInquiryRecord(data) : item));
      return data;
    },
    async convertInquiryToOrder(inquiryId: string, payload: InquiryConvertPayload) {
      const { data } = await apiClient.post<InquiryConvertResponse>(`/inquiries/${inquiryId}/convert`, payload);
      this.inquiries = this.inquiries.map((item) => (item.id === inquiryId ? mapInquiryRecord(data.inquiry) : item));
      this.orders = [mapOrderRecord(data.order), ...this.orders];
      return data;
    },
    async loadSettings() {
      const { data } = await apiClient.get<SettingsRecord>('/settings');
      this.settings = data;
    },
    async saveSettings(payload: SettingsRecord) {
      const { data } = await apiClient.put<SettingsRecord>('/settings', payload);
      this.settings = data;
      return data;
    },
    async loadMembers() {
      const { data } = await apiClient.get<MemberRecord[]>('/members');
      this.members = data;
    },
    async inviteMember(payload: InviteMemberPayload) {
      const { data } = await apiClient.post<MemberRecord>('/members', payload);
      this.members = [data, ...this.members];
      return data;
    },
    async updateMemberRole(username: string, role: MemberRecord['role']) {
      const { data } = await apiClient.put<MemberRecord>(`/members/${username}/role`, { role });
      this.members = this.members.map((item) => (item.username === username ? data : item));
      return data;
    },
    async updateMemberStatus(username: string, status: MemberRecord['status']) {
      const { data } = await apiClient.put<MemberRecord>(`/members/${username}/status`, { status });
      this.members = this.members.map((item) => (item.username === username ? data : item));
      return data;
    },
    async resetMemberPassword(username: string, newPassword: string) {
      const { data } = await apiClient.put<MemberRecord>(`/members/${username}/reset-password`, { newPassword });
      this.members = this.members.map((item) => (item.username === username ? data : item));
      return data;
    },
    async loadRoles() {
      const { data } = await apiClient.get<RoleRecord[]>('/roles');
      this.roles = data;
    },
    async loadOperationLogs() {
      const { data } = await apiClient.get<OperationLogRecord[]>('/operation-logs');
      this.operationLogs = data;
    },
    async loadLoginLogs(username = '') {
      const { data } = await apiClient.get<LoginLogRecord[]>('/login-logs', {
        params: username ? { username } : undefined,
      });
      this.loginLogs = data;
    },
    async loadShipmentBatches() {
      const { data } = await apiClient.get<ShipmentBatchRecord[]>('/shipment-batches');
      this.shipmentBatches = data;
    },
    async getShipmentBatchDetail(batchId: string) {
      const { data } = await apiClient.get<ShipmentBatchRecord>(`/shipment-batches/${batchId}`);
      return data;
    },
    async markShipmentBatchPrinted(batchId: string) {
      const { data } = await apiClient.put<ShipmentBatchRecord>(`/shipment-batches/${batchId}/printed`);
      this.shipmentBatches = this.shipmentBatches.map((item) => (item.id === batchId ? data : item));
      return data;
    },
    async changePassword(payload: { username: string; currentPassword: string; newPassword: string }) {
      await apiClient.post('/auth/change-password', payload);
    },
  },
});
