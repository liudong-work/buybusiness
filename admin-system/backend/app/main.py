from typing import List

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from .data import (
    DASHBOARD_TASKS,
    add_inquiry_note,
    add_inquiry_quote,
    add_inquiry_reply,
    authenticate_user,
    batch_update_order_shipping,
    change_password,
    convert_inquiry_to_order,
    create_product_record,
    delete_product_record,
    get_dashboard_metrics,
    get_inquiry_detail,
    get_order_detail,
    get_settings_record,
    get_shipment_batch,
    get_user_by_token,
    initialize_data_store,
    invite_member,
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
    reset_member_password,
    update_settings,
    update_inquiry_owner,
    update_inquiry_status,
    update_member_role,
    update_member_status,
    update_order_shipping,
    update_order_status,
    update_product_record,
)
from .schemas import (
    AuthUser,
    BatchOrderShippingPayload,
    ChangePasswordPayload,
    DashboardResponse,
    InquiryDetail,
    InquiryConvertPayload,
    InquiryConvertResponse,
    InquiryNotePayload,
    InquiryOwnerPayload,
    InquiryQuotePayload,
    InquiryReplyPayload,
    InquiryStatusPayload,
    InviteMemberPayload,
    LoginPayload,
    LoginLogRecord,
    LoginResponse,
    MemberRecord,
    OperationLogRecord,
    OrderDetail,
    OrderExceptionPayload,
    OrderShippingPayload,
    OrderStatusPayload,
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
    description="Mock seller admin API for the marketplace management console.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:3001", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    initialize_data_store()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(payload: LoginPayload, request: Request):
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else (request.client.host if request.client else "")
    try:
        user = authenticate_user(
            payload.username,
            payload.password,
            device_name=payload.deviceName,
            ip_address=client_ip,
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    return LoginResponse(accessToken="seller-admin-token-{}".format(user.username), user=user)


@app.get("/api/v1/auth/me", response_model=AuthUser)
def me(token: str):
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


@app.post("/api/v1/auth/change-password")
def change_own_password(payload: ChangePasswordPayload):
    try:
        changed = change_password(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not changed:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}


@app.get("/api/v1/dashboard", response_model=DashboardResponse)
def dashboard():
    return DashboardResponse(metrics=get_dashboard_metrics(), tasks=DASHBOARD_TASKS)


@app.get("/api/v1/products", response_model=List[ProductRecord])
def list_products():
    return list_products_data()


@app.post("/api/v1/products", response_model=ProductRecord)
def create_product(payload: ProductPayload):
    return create_product_record(payload)


@app.put("/api/v1/products/{product_id}", response_model=ProductRecord)
def update_product(product_id: str, payload: ProductPayload):
    updated = update_product_record(product_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@app.put("/api/v1/products/{product_id}/publish", response_model=ProductRecord)
def publish_product(product_id: str):
    try:
        updated = publish_product_record(product_id, True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@app.put("/api/v1/products/{product_id}/unpublish", response_model=ProductRecord)
def unpublish_product(product_id: str):
    updated = publish_product_record(product_id, False)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@app.delete("/api/v1/products/{product_id}")
def delete_product(product_id: str):
    deleted = delete_product_record(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}


@app.get("/api/v1/orders")
def list_orders():
    return list_order_records()


@app.get("/api/v1/orders/{order_id}", response_model=OrderDetail)
def get_order(order_id: str):
    order = get_order_detail(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.put("/api/v1/orders/{order_id}/status", response_model=OrderDetail)
def change_order_status(order_id: str, payload: OrderStatusPayload):
    updated = update_order_status(order_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated


@app.put("/api/v1/orders/{order_id}/shipping", response_model=OrderDetail)
def update_shipping(order_id: str, payload: OrderShippingPayload):
    try:
        updated = update_order_shipping(order_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated


@app.post("/api/v1/orders/batch-shipping", response_model=List[OrderDetail])
def batch_shipping(payload: BatchOrderShippingPayload):
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
        raise HTTPException(status_code=400, detail=str(exc))
    return updated_orders


@app.get("/api/v1/shipment-batches", response_model=List[ShipmentBatchRecord])
def shipment_batches():
    return list_shipment_batches()


@app.get("/api/v1/shipment-batches/{batch_id}", response_model=ShipmentBatchRecord)
def shipment_batch_detail(batch_id: str):
    batch = get_shipment_batch(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Shipment batch not found")
    return batch


@app.put("/api/v1/shipment-batches/{batch_id}/printed", response_model=ShipmentBatchRecord)
def shipment_batch_printed(batch_id: str):
    batch = mark_shipment_batch_printed(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Shipment batch not found")
    return batch


@app.put("/api/v1/orders/{order_id}/exception", response_model=OrderDetail)
def update_order_exception(order_id: str, payload: OrderExceptionPayload):
    try:
        updated = mark_order_exception(order_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated


@app.get("/api/v1/inquiries")
def list_inquiries():
    return list_inquiry_records()


@app.get("/api/v1/inquiries/{inquiry_id}", response_model=InquiryDetail)
def get_inquiry(inquiry_id: str):
    inquiry = get_inquiry_detail(inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry


@app.post("/api/v1/inquiries/{inquiry_id}/reply", response_model=InquiryDetail)
def reply_inquiry(inquiry_id: str, payload: InquiryReplyPayload):
    updated = add_inquiry_reply(inquiry_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return updated


@app.post("/api/v1/inquiries/{inquiry_id}/notes", response_model=InquiryDetail)
def note_inquiry(inquiry_id: str, payload: InquiryNotePayload):
    updated = add_inquiry_note(inquiry_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return updated


@app.put("/api/v1/inquiries/{inquiry_id}/status", response_model=InquiryDetail)
def change_inquiry_status(inquiry_id: str, payload: InquiryStatusPayload):
    updated = update_inquiry_status(inquiry_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return updated


@app.put("/api/v1/inquiries/{inquiry_id}/owner", response_model=InquiryDetail)
def change_inquiry_owner(inquiry_id: str, payload: InquiryOwnerPayload):
    updated = update_inquiry_owner(inquiry_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return updated


@app.post("/api/v1/inquiries/{inquiry_id}/quotes", response_model=InquiryDetail)
def create_inquiry_quote(inquiry_id: str, payload: InquiryQuotePayload):
    updated = add_inquiry_quote(inquiry_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return updated


@app.post("/api/v1/inquiries/{inquiry_id}/convert", response_model=InquiryConvertResponse)
def convert_inquiry(inquiry_id: str, payload: InquiryConvertPayload):
    try:
        order = convert_inquiry_to_order(inquiry_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not order:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    inquiry = get_inquiry_detail(inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return InquiryConvertResponse(inquiry=inquiry, order=order)


@app.get("/api/v1/settings")
def get_settings():
    return get_settings_record()


@app.put("/api/v1/settings", response_model=SettingsRecord)
def save_settings(payload: SettingsRecord):
    return update_settings(payload)


@app.get("/api/v1/members", response_model=List[MemberRecord])
def list_members():
    return list_member_records()


@app.post("/api/v1/members", response_model=MemberRecord)
def create_member(payload: InviteMemberPayload):
    try:
        return invite_member(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.put("/api/v1/members/{username}/role", response_model=MemberRecord)
def change_member_role(username: str, payload: UpdateMemberRolePayload):
    updated = update_member_role(username, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Member not found")
    return updated


@app.put("/api/v1/members/{username}/status", response_model=MemberRecord)
def change_member_status(username: str, payload: UpdateMemberStatusPayload):
    updated = update_member_status(username, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Member not found")
    return updated


@app.put("/api/v1/members/{username}/reset-password", response_model=MemberRecord)
def reset_password(username: str, payload: ResetPasswordPayload):
    try:
        updated = reset_member_password(username, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=404, detail="Member not found")
    return updated


@app.get("/api/v1/roles", response_model=List[RoleRecord])
def list_roles():
    return list_role_records()


@app.get("/api/v1/operation-logs", response_model=List[OperationLogRecord])
def operation_logs():
    return list_operation_logs()


@app.get("/api/v1/login-logs", response_model=List[LoginLogRecord])
def login_logs(username: str = Query(default="")):
    return list_login_logs(username=username)
