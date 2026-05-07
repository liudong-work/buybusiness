from typing import Callable, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .data import (
    DASHBOARD_TASKS,
    add_buyer_inquiry_follow_up,
    add_compare_brand,
    add_compare_product,
    add_favorite_brand,
    add_favorite_product,
    add_inquiry_note,
    add_inquiry_quote,
    add_inquiry_reply,
    authenticate_buyer_user,
    authenticate_user,
    batch_update_order_shipping,
    change_password,
    clear_cart,
    convert_inquiry_to_order,
    create_buyer_inquiry,
    create_session,
    create_product_record,
    delete_product_record,
    get_buyer_by_token,
    get_buyer_inquiry_detail,
    get_cart_items,
    get_compare_items,
    get_dashboard_metrics,
    get_favorites,
    get_inquiry_detail,
    get_order_detail,
    get_settings_record,
    get_shipment_batch,
    get_user_by_token,
    initialize_data_store,
    invite_member,
    list_buyer_inquiries,
    list_inquiry_records,
    list_login_logs,
    list_member_records,
    list_operation_logs,
    list_order_records,
    list_products_data,
    list_role_records,
    list_shipment_batches,
    mark_shipment_batch_printed,
    mark_order_exception,
    publish_product_record,
    register_buyer_account,
    remove_compare_brand,
    remove_compare_product,
    remove_favorite_brand,
    remove_favorite_product,
    remove_cart_item,
    reset_member_password,
    update_cart_item,
    update_inquiry_owner,
    update_inquiry_status,
    update_member_role,
    update_member_status,
    update_order_shipping,
    update_order_status,
    update_product_record,
    update_settings,
)
from .schemas import (
    AuthUser,
    BatchOrderShippingPayload,
    BuyerAuthUser,
    BuyerInquiryFollowUpPayload,
    BuyerInquiryPayload,
    BuyerInquiryRecord,
    BuyerLoginPayload,
    BuyerLoginResponse,
    BuyerRegisterPayload,
    CartItem,
    CartResponse,
    ChangePasswordPayload,
    CompareResponse,
    DashboardResponse,
    FavoriteItem,
    FavoritesResponse,
    InquiryDetail,
    InquiryConvertPayload,
    InquiryConvertResponse,
    InquiryNotePayload,
    InquiryOwnerPayload,
    InquiryQuotePayload,
    InquiryReplyPayload,
    InquiryStatusPayload,
    InviteMemberPayload,
    LoginLogRecord,
    LoginPayload,
    LoginResponse,
    MemberRecord,
    OperationLogRecord,
    OrderDetail,
    OrderExceptionPayload,
    OrderRecord,
    OrderShippingPayload,
    OrderStatusPayload,
    PayPalPaymentCaptureRequest,
    PayPalPaymentRequest,
    PayPalPaymentResponse,
    PayPalPaymentStatus,
    ProductPayload,
    ProductRecord,
    ResetPasswordPayload,
    RoleRecord,
    SettingsRecord,
    ShipmentBatchRecord,
    UpdateMemberRolePayload,
    UpdateMemberStatusPayload,
)


app = FastAPI(
    title="Seller Admin API",
    description="Seller admin and buyer inquiry API for the marketplace project.",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:3001", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


@app.on_event("startup")
def startup():
    initialize_data_store()


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else ""


def require_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    if not credentials or credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return credentials.credentials


def require_admin_user(token: str = Depends(require_token)) -> AuthUser:
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired admin session")
    return user


def require_buyer_user(token: str = Depends(require_token)) -> BuyerAuthUser:
    user = get_buyer_by_token(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired buyer session")
    return user


def require_permissions(*permissions: str) -> Callable[[AuthUser], AuthUser]:
    def dependency(current_user: AuthUser = Depends(require_admin_user)) -> AuthUser:
        missing = [permission for permission in permissions if permission not in current_user.permissions]
        if missing:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        return current_user

    return dependency


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(payload: LoginPayload, request: Request):
    try:
        user = authenticate_user(
            payload.username,
            payload.password,
            device_name=payload.deviceName,
            ip_address=get_client_ip(request),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    token = create_session("admin", user.username, "seller-admin-session-")
    return LoginResponse(accessToken=token, user=user)


@app.get("/api/v1/auth/me", response_model=AuthUser)
def me(current_user: AuthUser = Depends(require_admin_user)):
    return current_user


@app.post("/api/v1/auth/change-password")
def change_own_password(payload: ChangePasswordPayload, current_user: AuthUser = Depends(require_admin_user)):
    safe_payload = ChangePasswordPayload(
        username=current_user.username,
        currentPassword=payload.currentPassword,
        newPassword=payload.newPassword,
    )
    try:
        changed = change_password(safe_payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if not changed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"success": True}


@app.post("/api/v1/buyer/auth/register", response_model=BuyerLoginResponse)
def buyer_register(payload: BuyerRegisterPayload):
    try:
        user = register_buyer_account(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    token = create_session("buyer", user.id, "buyer-session-")
    return BuyerLoginResponse(accessToken=token, user=user)


@app.post("/api/v1/buyer/auth/login", response_model=BuyerLoginResponse)
def buyer_login(payload: BuyerLoginPayload):
    try:
        user = authenticate_buyer_user(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    token = create_session("buyer", user.id, "buyer-session-")
    return BuyerLoginResponse(accessToken=token, user=user)


@app.get("/api/v1/buyer/auth/me", response_model=BuyerAuthUser)
def buyer_me(current_user: BuyerAuthUser = Depends(require_buyer_user)):
    return current_user


@app.get("/api/v1/dashboard", response_model=DashboardResponse)
def dashboard(current_user: AuthUser = Depends(require_permissions("dashboard.view"))):
    return DashboardResponse(metrics=get_dashboard_metrics(), tasks=DASHBOARD_TASKS)


@app.get("/api/v1/products", response_model=List[ProductRecord])
def list_products(current_user: AuthUser = Depends(require_permissions("products.manage"))):
    return list_products_data()


@app.post("/api/v1/products", response_model=ProductRecord)
def create_product(payload: ProductPayload, current_user: AuthUser = Depends(require_permissions("products.manage"))):
    return create_product_record(payload)


@app.put("/api/v1/products/{product_id}", response_model=ProductRecord)
def update_product(
    product_id: str,
    payload: ProductPayload,
    current_user: AuthUser = Depends(require_permissions("products.manage")),
):
    updated = update_product_record(product_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return updated


@app.put("/api/v1/products/{product_id}/publish", response_model=ProductRecord)
def publish_product(product_id: str, current_user: AuthUser = Depends(require_permissions("products.manage"))):
    try:
        updated = publish_product_record(product_id, True)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return updated


@app.put("/api/v1/products/{product_id}/unpublish", response_model=ProductRecord)
def unpublish_product(product_id: str, current_user: AuthUser = Depends(require_permissions("products.manage"))):
    updated = publish_product_record(product_id, False)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return updated


@app.delete("/api/v1/products/{product_id}")
def delete_product(product_id: str, current_user: AuthUser = Depends(require_permissions("products.manage"))):
    deleted = delete_product_record(product_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return {"success": True}


@app.post("/api/v1/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: AuthUser = Depends(require_permissions("products.manage")),
):
    import os
    import uuid
    from pathlib import Path
    
    upload_dir = Path("uploads/images")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / unique_filename
    
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    return {
        "url": f"/uploads/images/{unique_filename}",
        "filename": unique_filename,
        "size": len(content)
    }


@app.get("/api/v1/orders", response_model=List[OrderRecord])
def list_orders(current_user: AuthUser = Depends(require_permissions("orders.manage"))):
    return list_order_records()


@app.get("/api/v1/orders/{order_id}", response_model=OrderDetail)
def get_order(order_id: str, current_user: AuthUser = Depends(require_permissions("orders.manage"))):
    order = get_order_detail(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@app.put("/api/v1/orders/{order_id}/status", response_model=OrderDetail)
def change_order_status(
    order_id: str,
    payload: OrderStatusPayload,
    current_user: AuthUser = Depends(require_permissions("orders.manage")),
):
    updated = update_order_status(order_id, payload.status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return updated


@app.put("/api/v1/orders/{order_id}/shipping", response_model=OrderDetail)
def update_shipping(
    order_id: str,
    payload: OrderShippingPayload,
    current_user: AuthUser = Depends(require_permissions("orders.manage")),
):
    try:
        updated = update_order_shipping(order_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return updated


@app.post("/api/v1/orders/batch-shipping", response_model=List[OrderDetail])
def batch_shipping(
    payload: BatchOrderShippingPayload,
    current_user: AuthUser = Depends(require_permissions("orders.manage")),
):
    shipping_payload = OrderShippingPayload(
        logisticsCompany=payload.logisticsCompany,
        trackingNumber=payload.trackingNumber,
        estimatedShipDate=payload.estimatedShipDate,
        shippingNote=payload.shippingNote,
        packageCount=payload.packageCount,
        boxMark=payload.boxMark,
    )
    try:
        updated_orders = batch_update_order_shipping(payload.orderIds, shipping_payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return updated_orders


@app.get("/api/v1/shipment-batches", response_model=List[ShipmentBatchRecord])
def shipment_batches(current_user: AuthUser = Depends(require_permissions("orders.manage"))):
    return list_shipment_batches()


@app.get("/api/v1/shipment-batches/{batch_id}", response_model=ShipmentBatchRecord)
def shipment_batch_detail(batch_id: str, current_user: AuthUser = Depends(require_permissions("orders.manage"))):
    batch = get_shipment_batch(batch_id)
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment batch not found")
    return batch


@app.put("/api/v1/shipment-batches/{batch_id}/printed", response_model=ShipmentBatchRecord)
def shipment_batch_printed(batch_id: str, current_user: AuthUser = Depends(require_permissions("orders.manage"))):
    batch = mark_shipment_batch_printed(batch_id)
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment batch not found")
    return batch


@app.put("/api/v1/orders/{order_id}/exception", response_model=OrderDetail)
def update_order_exception(
    order_id: str,
    payload: OrderExceptionPayload,
    current_user: AuthUser = Depends(require_permissions("orders.manage")),
):
    try:
        updated = mark_order_exception(order_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return updated


@app.get("/api/v1/orders/export")
def export_orders(
    status: Optional[str] = Query(None),
    current_user: AuthUser = Depends(require_permissions("orders.manage")),
):
    orders_list = list_order_records()
    if status:
        orders_list = [order for order in orders_list if order.status == status]
    
    import csv
    from io import StringIO
    
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "订单号", "买家", "目的地", "金额", "状态", 
        "物流公司", "运单号", "预计发货日期", "创建时间"
    ])
    
    for order in orders_list:
        writer.writerow([
            order.id,
            order.buyer,
            order.destination,
            order.amount,
            order.status,
            "",
            "",
            "",
            order.createdAt,
        ])
    
    output.seek(0)
    return {
        "data": output.read(),
        "count": len(orders_list),
        "filename": f"orders_{status or 'all'}_{datetime.now().strftime('%Y%m%d')}.csv"
    }


@app.get("/api/v1/inquiries")
def list_inquiries(current_user: AuthUser = Depends(require_permissions("inquiries.manage"))):
    return list_inquiry_records()


@app.get("/api/v1/inquiries/export")
def export_inquiries(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    current_user: AuthUser = Depends(require_permissions("inquiries.manage")),
):
    inquiries_list = list_inquiry_records()
    if status:
        inquiries_list = [inq for inq in inquiries_list if inq.status == status]
    if priority:
        inquiries_list = [inq for inq in inquiries_list if inq.priority == priority]
    
    import csv
    from io import StringIO
    
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "询盘号", "买家", "公司", "主题", "优先级", "状态", 
        "负责人", "最新报价版本", "创建时间"
    ])
    
    for inquiry in inquiries_list:
        writer.writerow([
            inquiry.id,
            inquiry.buyer,
            "",
            inquiry.topic,
            inquiry.priority,
            inquiry.status,
            inquiry.latestQuoteVersion if hasattr(inquiry, 'latestQuoteVersion') else "",
            inquiry.updatedAt,
        ])
    
    output.seek(0)
    return {
        "data": output.read(),
        "count": len(inquiries_list),
        "filename": f"inquiries_{status or 'all'}_{datetime.now().strftime('%Y%m%d')}.csv"
    }


@app.post("/api/v1/inquiries/batch-assign")
def batch_assign_inquiries(
    inquiryIds: List[str],
    owner: str,
    current_user: AuthUser = Depends(require_permissions("inquiries.manage")),
):
    updated_count = 0
    for inquiry_id in inquiryIds:
        updated = update_inquiry_owner(inquiry_id, InquiryOwnerPayload(owner=owner))
        if updated:
            updated_count += 1
    return {"success": True, "updatedCount": updated_count, "totalRequested": len(inquiryIds)}


@app.get("/api/v1/inquiries/{inquiry_id}", response_model=InquiryDetail)
def get_inquiry(inquiry_id: str, current_user: AuthUser = Depends(require_permissions("inquiries.manage"))):
    inquiry = get_inquiry_detail(inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return inquiry


@app.post("/api/v1/inquiries/{inquiry_id}/reply", response_model=InquiryDetail)
def reply_inquiry(
    inquiry_id: str,
    payload: InquiryReplyPayload,
    current_user: AuthUser = Depends(require_permissions("inquiries.manage")),
):
    updated = add_inquiry_reply(inquiry_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return updated


@app.post("/api/v1/inquiries/{inquiry_id}/notes", response_model=InquiryDetail)
def note_inquiry(
    inquiry_id: str,
    payload: InquiryNotePayload,
    current_user: AuthUser = Depends(require_permissions("inquiries.manage")),
):
    updated = add_inquiry_note(inquiry_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return updated


@app.put("/api/v1/inquiries/{inquiry_id}/status", response_model=InquiryDetail)
def change_inquiry_status(
    inquiry_id: str,
    payload: InquiryStatusPayload,
    current_user: AuthUser = Depends(require_permissions("inquiries.manage")),
):
    updated = update_inquiry_status(inquiry_id, payload.status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return updated


@app.put("/api/v1/inquiries/{inquiry_id}/owner", response_model=InquiryDetail)
def change_inquiry_owner(
    inquiry_id: str,
    payload: InquiryOwnerPayload,
    current_user: AuthUser = Depends(require_permissions("inquiries.manage")),
):
    updated = update_inquiry_owner(inquiry_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return updated


@app.post("/api/v1/inquiries/{inquiry_id}/quotes", response_model=InquiryDetail)
def create_inquiry_quote(
    inquiry_id: str,
    payload: InquiryQuotePayload,
    current_user: AuthUser = Depends(require_permissions("inquiries.manage")),
):
    updated = add_inquiry_quote(inquiry_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return updated


@app.post("/api/v1/inquiries/{inquiry_id}/convert", response_model=InquiryConvertResponse)
def convert_inquiry(
    inquiry_id: str,
    payload: InquiryConvertPayload,
    current_user: AuthUser = Depends(require_permissions("inquiries.manage")),
):
    try:
        order = convert_inquiry_to_order(inquiry_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    inquiry = get_inquiry_detail(inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return InquiryConvertResponse(inquiry=inquiry, order=order)


@app.get("/api/v1/buyer/inquiries", response_model=List[BuyerInquiryRecord])
def buyer_inquiries(current_user: BuyerAuthUser = Depends(require_buyer_user)):
    return list_buyer_inquiries(current_user.id)


@app.post("/api/v1/buyer/inquiries", response_model=BuyerInquiryRecord)
def buyer_create_inquiry(
    payload: BuyerInquiryPayload,
    current_user: BuyerAuthUser = Depends(require_buyer_user),
):
    try:
        return create_buyer_inquiry(current_user, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@app.get("/api/v1/buyer/inquiries/{inquiry_id}", response_model=BuyerInquiryRecord)
def buyer_get_inquiry(inquiry_id: str, current_user: BuyerAuthUser = Depends(require_buyer_user)):
    inquiry = get_buyer_inquiry_detail(current_user.id, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return inquiry


@app.post("/api/v1/buyer/inquiries/{inquiry_id}/follow-ups", response_model=BuyerInquiryRecord)
def buyer_follow_up_inquiry(
    inquiry_id: str,
    payload: BuyerInquiryFollowUpPayload,
    current_user: BuyerAuthUser = Depends(require_buyer_user),
):
    try:
        inquiry = add_buyer_inquiry_follow_up(current_user, inquiry_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return inquiry


@app.get("/api/v1/settings", response_model=SettingsRecord)
def get_settings(current_user: AuthUser = Depends(require_permissions("settings.manage"))):
    return get_settings_record()


@app.put("/api/v1/settings", response_model=SettingsRecord)
def save_settings(payload: SettingsRecord, current_user: AuthUser = Depends(require_permissions("settings.manage"))):
    return update_settings(payload)


@app.get("/api/v1/members", response_model=List[MemberRecord])
def list_members(current_user: AuthUser = Depends(require_permissions("accounts.manage"))):
    return list_member_records()


@app.post("/api/v1/members", response_model=MemberRecord)
def create_member(
    payload: InviteMemberPayload,
    current_user: AuthUser = Depends(require_permissions("accounts.manage")),
):
    try:
        return invite_member(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@app.put("/api/v1/members/{username}/role", response_model=MemberRecord)
def change_member_role(
    username: str,
    payload: UpdateMemberRolePayload,
    current_user: AuthUser = Depends(require_permissions("accounts.manage")),
):
    updated = update_member_role(username, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return updated


@app.put("/api/v1/members/{username}/status", response_model=MemberRecord)
def change_member_status(
    username: str,
    payload: UpdateMemberStatusPayload,
    current_user: AuthUser = Depends(require_permissions("accounts.manage")),
):
    updated = update_member_status(username, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return updated


@app.put("/api/v1/members/{username}/reset-password", response_model=MemberRecord)
def reset_password(
    username: str,
    payload: ResetPasswordPayload,
    current_user: AuthUser = Depends(require_permissions("accounts.manage")),
):
    try:
        updated = reset_member_password(username, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return updated


@app.get("/api/v1/roles", response_model=List[RoleRecord])
def list_roles(current_user: AuthUser = Depends(require_permissions("accounts.manage"))):
    return list_role_records()


@app.get("/api/v1/operation-logs", response_model=List[OperationLogRecord])
def operation_logs(current_user: AuthUser = Depends(require_permissions("accounts.manage"))):
    return list_operation_logs()


@app.get("/api/v1/login-logs", response_model=List[LoginLogRecord])
def login_logs(
    username: str = Query(default=""),
    current_user: AuthUser = Depends(require_permissions("accounts.manage")),
):
    return list_login_logs(username=username)


@app.post("/api/v1/paypal/create-payment", response_model=PayPalPaymentResponse)
def create_paypal_payment(
    request: PayPalPaymentRequest,
    current_user: AuthUser = Depends(require_permissions("orders.manage")),
):
    from .data import create_paypal_payment
    return create_paypal_payment(request)


@app.post("/api/v1/paypal/capture-payment", response_model=PayPalPaymentStatus)
def capture_paypal_payment(
    request: PayPalPaymentCaptureRequest,
    current_user: AuthUser = Depends(require_permissions("orders.manage")),
):
    from .data import capture_paypal_payment
    return capture_paypal_payment(request)


@app.get("/api/v1/paypal/payment/{payment_id}", response_model=PayPalPaymentStatus)
def get_paypal_payment_status(
    payment_id: str,
    current_user: AuthUser = Depends(require_permissions("orders.manage")),
):
    from .data import get_paypal_payment_status
    return get_paypal_payment_status(payment_id)


@app.get("/api/v1/settings/paypal")
def get_paypal_settings(
    current_user: AuthUser = Depends(require_permissions("settings.manage")),
):
    settings = get_settings_record()
    return {
        "clientId": settings.paypalClientId,
        "sandboxMode": settings.paypalSandboxMode,
        "enabled": settings.enablePayPal,
    }


@app.get("/api/v1/cart", response_model=CartResponse)
def get_cart(
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    items = get_cart_items(buyer_id)
    total = sum(item["quantity"] for item in items)
    return CartResponse(items=items, total=total)


@app.post("/api/v1/cart", response_model=CartItem)
def add_to_cart(
    item: CartItem,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    return add_cart_item(buyer_id, item.productId, item.quantity)


@app.put("/api/v1/cart/{product_id}", response_model=CartItem)
def update_cart(
    product_id: str,
    quantity: int,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    return update_cart_item(buyer_id, product_id, quantity)


@app.delete("/api/v1/cart/{product_id}")
def remove_from_cart(
    product_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    remove_cart_item(buyer_id, product_id)


@app.delete("/api/v1/cart")
def clear_cart_endpoint(
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    clear_cart(buyer_id)


@app.get("/api/v1/favorites", response_model=FavoritesResponse)
def get_favorites_endpoint(
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    return get_favorites(buyer_id)


@app.post("/api/v1/favorites/products/{product_id}")
def add_favorite_product_endpoint(
    product_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    add_favorite_product(buyer_id, product_id)


@app.delete("/api/v1/favorites/products/{product_id}")
def remove_favorite_product_endpoint(
    product_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    remove_favorite_product(buyer_id, product_id)


@app.post("/api/v1/favorites/brands/{brand_id}")
def add_favorite_brand_endpoint(
    brand_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    add_favorite_brand(buyer_id, brand_id)


@app.delete("/api/v1/favorites/brands/{brand_id}")
def remove_favorite_brand_endpoint(
    brand_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    remove_favorite_brand(buyer_id, brand_id)


@app.get("/api/v1/compare", response_model=CompareResponse)
def get_compare_endpoint(
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    return get_compare_items(buyer_id)


@app.post("/api/v1/compare/products/{product_id}")
def add_compare_product_endpoint(
    product_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    add_compare_product(buyer_id, product_id)


@app.delete("/api/v1/compare/products/{product_id}")
def remove_compare_product_endpoint(
    product_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    remove_compare_product(buyer_id, product_id)


@app.post("/api/v1/compare/brands/{brand_id}")
def add_compare_brand_endpoint(
    brand_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    add_compare_brand(buyer_id, brand_id)


@app.delete("/api/v1/compare/brands/{brand_id}")
def remove_compare_brand_endpoint(
    brand_id: str,
    current_user: BuyerAuthUser = Depends(require_buyer_auth),
):
    buyer_id = current_user.id
    remove_compare_brand(buyer_id, brand_id)
