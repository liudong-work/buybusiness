from typing import List, Optional

from pydantic import BaseModel
from typing_extensions import Literal


RoleCode = Literal["seller_admin", "ops_manager", "sales_manager", "viewer"]
MemberStatus = Literal["active", "invited", "disabled"]
ProductStatus = Literal["active", "draft", "low_stock"]
OrderStatus = Literal["submitted", "processing", "ready_to_ship", "completed", "exception"]
InquiryStatus = Literal["new", "follow_up", "quoted", "converted"]
BuyerInquirySource = Literal["product", "brand", "cart", "general"]
BuyerInquiryStatus = Literal["submitted", "reviewing", "quoted", "closed"]


class DashboardMetric(BaseModel):
    label: str
    value: str
    delta: str


class DashboardTask(BaseModel):
    id: str
    title: str
    owner: str
    dueLabel: str
    status: Literal["warning", "processing", "success"]


class DashboardResponse(BaseModel):
    metrics: List[DashboardMetric]
    tasks: List[DashboardTask]


class ProductSku(BaseModel):
    id: str
    skuCode: str
    specSummaryZh: str
    specSummaryEn: str
    inventory: int


class ProductRecord(BaseModel):
    id: str
    nameZh: str
    nameEn: str
    descriptionZh: str
    descriptionEn: str
    category: str
    price: str
    inventory: int
    status: ProductStatus
    updatedAt: str
    coverImage: str
    images: List[str]
    specs: List[str]
    skus: List[ProductSku]
    englishReady: bool


class ProductPayload(BaseModel):
    nameZh: str
    nameEn: str
    descriptionZh: str
    descriptionEn: str
    category: str
    price: str
    inventory: int
    status: ProductStatus
    coverImage: str
    images: List[str]
    specs: List[str]
    skus: List[ProductSku]


class OrderRecord(BaseModel):
    id: str
    buyer: str
    destination: str
    amount: str
    status: OrderStatus
    updatedAt: str
    exceptionStatus: Literal["none", "pending", "resolved"]
    sourceInquiryId: str
    sourceQuoteVersion: str


class OrderItem(BaseModel):
    productName: str
    sku: str
    quantity: int
    unitPrice: str


class OrderTimelineStep(BaseModel):
    label: str
    time: str
    done: bool
    current: bool


class OrderDetail(OrderRecord):
    contactName: str
    contactPhone: str
    paymentMethod: str
    shippingAddress: str
    internalNote: str
    logisticsCompany: str
    trackingNumber: str
    estimatedShipDate: str
    shippingNote: str
    packageCount: int
    boxMark: str
    exceptionReason: str
    items: List[OrderItem]
    timeline: List[OrderTimelineStep]


class OrderStatusPayload(BaseModel):
    status: OrderStatus


class OrderShippingPayload(BaseModel):
    logisticsCompany: str
    trackingNumber: str
    estimatedShipDate: str
    shippingNote: str
    packageCount: int
    boxMark: str


class BatchOrderShippingPayload(OrderShippingPayload):
    orderIds: List[str]


class OrderExceptionPayload(BaseModel):
    reason: str
    resolved: bool = False


class InquiryRecord(BaseModel):
    id: str
    buyer: str
    topic: str
    priority: Literal["high", "medium", "low"]
    status: InquiryStatus
    updatedAt: str
    latestQuoteVersion: str
    convertedOrderId: str


class InquiryItem(BaseModel):
    productId: str = ""
    brandId: str = ""
    brandName: str = ""
    productName: str
    quantity: int
    moq: int
    priceHint: str


class InquiryActivity(BaseModel):
    id: str
    author: str
    role: Literal["buyer", "seller", "system"]
    message: str
    createdAt: str


class InquiryNote(BaseModel):
    id: str
    author: str
    message: str
    createdAt: str


class InquiryQuoteItem(BaseModel):
    productName: str
    sku: str
    quantity: int
    unitPrice: float
    note: str


class InquiryQuote(BaseModel):
    id: str
    version: str
    author: str
    currency: str
    validUntil: str
    shippingFee: float
    leadTime: str
    paymentTerms: str
    note: str
    totalAmount: str
    createdAt: str
    items: List[InquiryQuoteItem]


class InquiryDetail(InquiryRecord):
    company: str
    email: str
    destination: str
    owner: str
    buyerRole: str = ""
    targetPrice: str
    needSample: bool
    items: List[InquiryItem]
    activities: List[InquiryActivity]
    internalNotes: List[InquiryNote]
    quotes: List[InquiryQuote]
    buyerAccountId: str = ""
    source: BuyerInquirySource = "general"
    brandId: str = ""
    brandName: str = ""
    productId: str = ""
    productName: str = ""


class InquiryReplyPayload(BaseModel):
    author: str
    message: str


class InquiryNotePayload(BaseModel):
    author: str
    message: str


class InquiryStatusPayload(BaseModel):
    status: InquiryStatus


class InquiryOwnerPayload(BaseModel):
    owner: str


class InquiryQuotePayload(BaseModel):
    author: str
    currency: str
    validUntil: str
    shippingFee: float
    leadTime: str
    paymentTerms: str
    note: str
    items: List[InquiryQuoteItem]


class InquiryConvertPayload(BaseModel):
    quoteId: str
    contactName: str
    contactPhone: str
    shippingAddress: str
    paymentMethod: str
    internalNote: str


class InquiryConvertResponse(BaseModel):
    inquiry: InquiryDetail
    order: OrderDetail


class AuthUser(BaseModel):
    username: str
    displayName: str
    role: RoleCode
    permissions: List[str]


class LoginPayload(BaseModel):
    username: str
    password: str
    deviceName: str = ""


class LoginResponse(BaseModel):
    accessToken: str
    user: AuthUser


class BuyerAccountRecord(BaseModel):
    id: str
    email: str
    contactName: str
    businessName: str
    businessType: str
    phoneNumber: str
    country: str
    createdAt: str
    lastLoginAt: str


class BuyerAuthUser(BaseModel):
    id: str
    email: str
    contactName: str
    businessName: str
    businessType: str
    phoneNumber: str
    country: str


class BuyerRegisterPayload(BaseModel):
    contactName: str
    email: str
    password: str
    businessName: str
    businessType: str
    phoneNumber: str
    country: str


class BuyerLoginPayload(BaseModel):
    email: str
    password: str
    deviceName: str = ""


class BuyerLoginResponse(BaseModel):
    accessToken: str
    user: BuyerAuthUser


class BuyerInquiryLineItem(BaseModel):
    productId: str
    productName: str
    brandId: str
    brandName: str
    quantity: int
    minOrderQuantity: int
    unitPrice: float


class BuyerInquiryActivity(BaseModel):
    id: str
    createdAt: str
    type: Literal["created", "buyer_follow_up", "advisor_update", "status_change"]
    author: Literal["buyer", "advisor", "system"]
    title: str
    message: str
    status: Optional[BuyerInquiryStatus] = None


class BuyerInquiryRecord(BaseModel):
    id: str
    createdAt: str
    updatedAt: str
    status: BuyerInquiryStatus
    source: BuyerInquirySource
    buyerName: str
    email: str
    company: str
    role: str
    destinationCountry: str
    targetPrice: str
    needSample: bool
    message: str
    brandId: str = ""
    brandName: str = ""
    productId: str = ""
    productName: str = ""
    items: List[BuyerInquiryLineItem]
    activities: List[BuyerInquiryActivity]
    lastFollowUpAt: Optional[str] = None


class BuyerInquiryPayload(BaseModel):
    source: BuyerInquirySource
    buyerName: str
    company: str
    role: str
    destinationCountry: str
    targetPrice: str
    message: str
    needSample: bool
    brandId: str = ""
    brandName: str = ""
    productId: str = ""
    productName: str = ""
    items: List[BuyerInquiryLineItem]


class BuyerInquiryFollowUpPayload(BaseModel):
    message: str


class SettingsRecord(BaseModel):
    shopName: str
    contactEmail: str
    contactPhone: str
    defaultLeadTime: str
    samplePolicy: str
    defaultPaymentTerms: str
    defaultSampleFeePolicy: str
    paypalClientId: str = ""
    paypalClientSecret: str = ""
    paypalSandboxMode: bool = True
    enablePayPal: bool = False


class MemberRecord(BaseModel):
    username: str
    displayName: str
    email: str
    role: RoleCode
    status: MemberStatus
    lastLogin: str
    lastLoginDevice: str = ""
    permissions: List[str]


class InviteMemberPayload(BaseModel):
    username: str
    displayName: str
    email: str
    role: RoleCode
    tempPassword: str


class UpdateMemberRolePayload(BaseModel):
    role: RoleCode


class UpdateMemberStatusPayload(BaseModel):
    status: MemberStatus


class ChangePasswordPayload(BaseModel):
    username: str
    currentPassword: str
    newPassword: str


class ResetPasswordPayload(BaseModel):
    newPassword: str


class LoginLogRecord(BaseModel):
    id: str
    username: str
    displayName: str
    status: Literal["success", "failed"]
    reason: str
    deviceName: str
    ipAddress: str
    createdAt: str


class ShipmentBatchRecord(BaseModel):
    id: str
    orderIds: List[str]
    orderCount: int
    logisticsCompany: str
    trackingNumber: str
    estimatedShipDate: str
    shippingNote: str
    packageCount: int
    boxMark: str
    printed: bool
    createdAt: str


class RoleRecord(BaseModel):
    key: RoleCode
    label: str
    description: str
    permissions: List[str]
    memberCount: int


class OperationLogRecord(BaseModel):
    id: str
    actor: str
    action: str
    target: str
    createdAt: str


class PayPalPaymentRequest(BaseModel):
    orderId: str
    amount: float
    currency: str = "USD"
    returnUrl: str
    cancelUrl: str


class PayPalPaymentResponse(BaseModel):
    paymentId: str
    approvalUrl: str
    status: str


class PayPalPaymentCaptureRequest(BaseModel):
    paymentId: str
    payerId: str


class PayPalPaymentStatus(BaseModel):
    paymentId: str
    status: Literal["created", "approved", "failed", "canceled"]
    amount: float
    currency: str
    createdAt: str
    updatedAt: str


class CartItem(BaseModel):
    productId: str
    quantity: int


class CartResponse(BaseModel):
    items: List[CartItem]
    total: float


class FavoriteItem(BaseModel):
    productId: str = ""
    brandId: str = ""


class FavoritesResponse(BaseModel):
    products: List[str]
    brands: List[str]


class CompareItem(BaseModel):
    productId: str = ""
    brandId: str = ""


class CompareResponse(BaseModel):
    products: List[str]
    brands: List[str]
