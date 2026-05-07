import hashlib
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from uuid import uuid4
from fastapi import HTTPException

from .schemas import (
    AuthUser,
    BuyerAccountRecord,
    BuyerAuthUser,
    BuyerInquiryActivity,
    BuyerInquiryFollowUpPayload,
    BuyerInquiryLineItem,
    BuyerInquiryPayload,
    BuyerInquiryRecord,
    BuyerLoginPayload,
    BuyerRegisterPayload,
    ChangePasswordPayload,
    DashboardMetric,
    DashboardTask,
    InquiryActivity,
    InquiryConvertPayload,
    InquiryDetail,
    InquiryItem,
    InquiryNote,
    InquiryNotePayload,
    InquiryOwnerPayload,
    InquiryQuote,
    InquiryQuoteItem,
    InquiryQuotePayload,
    InquiryRecord,
    InquiryReplyPayload,
    InviteMemberPayload,
    LoginLogRecord,
    MemberRecord,
    OperationLogRecord,
    OrderDetail,
    OrderExceptionPayload,
    OrderItem,
    OrderRecord,
    OrderShippingPayload,
    OrderTimelineStep,
    PayPalPaymentCaptureRequest,
    PayPalPaymentRequest,
    PayPalPaymentResponse,
    PayPalPaymentStatus,
    ProductPayload,
    ProductRecord,
    ProductSku,
    ResetPasswordPayload,
    RoleRecord,
    SettingsRecord,
    ShipmentBatchRecord,
    UpdateMemberRolePayload,
    UpdateMemberStatusPayload,
)


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "storage"
DB_PATH = DATA_DIR / "seller_admin.sqlite3"


ROLE_DEFINITIONS: Dict[str, Dict[str, object]] = {
    "seller_admin": {
        "label": "管理员",
        "description": "负责整个平台卖家后台的配置、成员与业务全局管理。",
        "permissions": [
            "dashboard.view",
            "products.manage",
            "orders.manage",
            "inquiries.manage",
            "settings.manage",
            "accounts.manage",
        ],
    },
    "ops_manager": {
        "label": "运营",
        "description": "负责订单处理、询盘跟进和日常运营任务。",
        "permissions": [
            "dashboard.view",
            "orders.manage",
            "inquiries.manage",
        ],
    },
    "sales_manager": {
        "label": "销售",
        "description": "负责商品上新、询盘报价和重点客户跟进。",
        "permissions": [
            "dashboard.view",
            "products.manage",
            "inquiries.manage",
        ],
    },
    "viewer": {
        "label": "访客",
        "description": "仅允许查看概览数据，不参与具体操作。",
        "permissions": [
            "dashboard.view",
        ],
    },
}


DASHBOARD_TASKS = [
    DashboardTask(id="task-1", title="确认陶瓷系列样品交期并回传给客户", owner="王敏", dueLabel="今天 16:00 前", status="warning"),
    DashboardTask(id="task-2", title="检查厨房用品的低库存预警", owner="刘畅", dueLabel="明天 10:00 前", status="processing"),
    DashboardTask(id="task-3", title="完成欧洲买家的账期政策更新", owner="赵磊", dueLabel="本周内", status="success"),
]


def now_label() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def permissions_for_role(role: str) -> List[str]:
    return list(ROLE_DEFINITIONS[role]["permissions"])


def build_auth_user(member: MemberRecord) -> AuthUser:
    return AuthUser(
        username=member.username,
        displayName=member.displayName,
        role=member.role,
        permissions=permissions_for_role(member.role),
    )


def build_buyer_auth_user(account: BuyerAccountRecord) -> BuyerAuthUser:
    return BuyerAuthUser(
        id=account.id,
        email=account.email,
        contactName=account.contactName,
        businessName=account.businessName,
        businessType=account.businessType,
        phoneNumber=account.phoneNumber,
        country=account.country,
    )


def english_ready(payload: ProductPayload) -> bool:
    has_english = bool(payload.nameEn.strip() and payload.descriptionEn.strip())
    has_assets = bool(payload.coverImage.strip() and payload.images and payload.specs and payload.skus)
    skus_ready = all(item.specSummaryEn.strip() for item in payload.skus)
    return has_english and has_assets and skus_ready


def sync_product_english_state(product: ProductRecord) -> ProductRecord:
    payload = ProductPayload(
        nameZh=product.nameZh,
        nameEn=product.nameEn,
        descriptionZh=product.descriptionZh,
        descriptionEn=product.descriptionEn,
        category=product.category,
        price=product.price,
        inventory=product.inventory,
        status=product.status,
        coverImage=product.coverImage,
        images=product.images,
        specs=product.specs,
        skus=product.skus,
    )
    product.englishReady = english_ready(payload)
    if product.status == "active" and product.inventory < 100:
        product.status = "low_stock"
    if product.status == "low_stock" and product.inventory >= 100:
        product.status = "active"
    return product


def build_order_timeline(status: str) -> List[OrderTimelineStep]:
    if status == "exception":
        steps = [
            ("已提交", "2026-04-23 08:10", True, False),
            ("处理中", "2026-04-23 09:45", True, False),
            ("异常处理", now_label(), True, True),
            ("恢复发货", "--", False, False),
        ]
    else:
        steps = [
            ("已提交", "2026-04-23 08:10", status in ["submitted", "processing", "ready_to_ship", "completed"], status == "submitted"),
            ("处理中", "2026-04-23 09:45", status in ["processing", "ready_to_ship", "completed"], status == "processing"),
            ("待发货", "2026-04-24 14:20", status in ["ready_to_ship", "completed"], status == "ready_to_ship"),
            ("已完成", "2026-04-26 18:30", status == "completed", status == "completed"),
        ]
    return [OrderTimelineStep(label=label, time=time, done=done, current=current) for label, time, done, current in steps]


def next_quote_version(quotes: List[InquiryQuote]) -> str:
    return "V{}".format(len(quotes) + 1)


def calculate_quote_total(currency: str, items: List[InquiryQuoteItem], shipping_fee: float) -> str:
    total = shipping_fee
    for item in items:
        total += item.quantity * item.unitPrice
    return "{} {:.2f}".format(currency, total)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def model_to_dict(model):
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def model_from_dict(model_cls, data):
    if hasattr(model_cls, "model_validate"):
        return model_cls.model_validate(data)
    return model_cls.parse_obj(data)


def json_dumps(data) -> str:
    return json.dumps(data, ensure_ascii=False)


def json_loads(raw: str):
    return json.loads(raw)


def db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(str(DB_PATH))
    connection.row_factory = sqlite3.Row
    return connection


def table_count(connection: sqlite3.Connection, table_name: str) -> int:
    row = connection.execute("SELECT COUNT(1) AS total FROM {}".format(table_name)).fetchone()
    return int(row["total"]) if row else 0


def ensure_schema(connection: sqlite3.Connection):
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS members (
            username TEXT PRIMARY KEY,
            payload TEXT NOT NULL,
            password_hash TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS buyers (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            payload TEXT NOT NULL,
            password_hash TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            updated_at TEXT NOT NULL,
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            updated_at TEXT NOT NULL,
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inquiries (
            id TEXT PRIMARY KEY,
            updated_at TEXT NOT NULL,
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS operation_logs (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS login_logs (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS shipment_batches (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            payload TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            subject_type TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS paypal_payments (
            payment_id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            status TEXT NOT NULL,
            return_url TEXT NOT NULL,
            cancel_url TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(buyer_id, product_id),
            FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer_id TEXT NOT NULL,
            product_id TEXT,
            brand_id TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(buyer_id, product_id),
            UNIQUE(buyer_id, brand_id),
            FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS compare (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer_id TEXT NOT NULL,
            product_id TEXT,
            brand_id TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(buyer_id, product_id),
            UNIQUE(buyer_id, brand_id),
            FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE
        );
        """
    )
    connection.commit()


def seed_members() -> List[Tuple[MemberRecord, str]]:
    return [
        (
            MemberRecord(
                username="admin",
                displayName="李华",
                email="admin@northstar-supply.example",
                role="seller_admin",
                status="active",
                lastLogin="2026-04-23 10:20",
                lastLoginDevice="Mac Chrome",
                permissions=permissions_for_role("seller_admin"),
            ),
            "admin123",
        ),
        (
            MemberRecord(
                username="ops",
                displayName="运营专员",
                email="ops@northstar-supply.example",
                role="ops_manager",
                status="active",
                lastLogin="2026-04-23 09:48",
                lastLoginDevice="Windows Edge",
                permissions=permissions_for_role("ops_manager"),
            ),
            "ops123",
        ),
        (
            MemberRecord(
                username="sales",
                displayName="销售负责人",
                email="sales@northstar-supply.example",
                role="sales_manager",
                status="active",
                lastLogin="2026-04-22 18:18",
                lastLoginDevice="iPad Safari",
                permissions=permissions_for_role("sales_manager"),
            ),
            "sales123",
        ),
        (
            MemberRecord(
                username="viewer",
                displayName="老板查看账号",
                email="boss@northstar-supply.example",
                role="viewer",
                status="invited",
                lastLogin="尚未登录",
                lastLoginDevice="",
                permissions=permissions_for_role("viewer"),
            ),
            "viewer123",
        ),
    ]


def seed_products() -> List[ProductRecord]:
    return [
        ProductRecord(
            id="PROD-1001",
            nameZh="陶瓷餐具礼盒套装",
            nameEn="Stoneware Dining Gift Set",
            descriptionZh="主打节庆礼品与家居渠道，支持定制包装与混款组合。",
            descriptionEn="Designed for gifting and home collections with custom packaging and assorted set options.",
            category="家居餐厨",
            price="$28.00",
            inventory=640,
            status="active",
            updatedAt="2026-04-23 10:20",
            coverImage="https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80",
            images=[
                "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
            ],
            specs=["餐盘 10.5 寸", "汤碗 5.5 寸", "礼盒包装", "可混款组合"],
            skus=[
                ProductSku(id="SKU-1001-A", skuCode="NW-DINE-001-A", specSummaryZh="米白礼盒 4 件套", specSummaryEn="Ivory gift box set of 4", inventory=220),
                ProductSku(id="SKU-1001-B", skuCode="NW-DINE-001-B", specSummaryZh="墨蓝礼盒 6 件套", specSummaryEn="Ink blue gift box set of 6", inventory=420),
            ],
            englishReady=True,
        ),
        ProductRecord(
            id="PROD-1002",
            nameZh="玻璃烛台三件套",
            nameEn="Glass Candle Holder Trio",
            descriptionZh="适合节庆陈列和礼品店铺，当前库存偏低，建议尽快补货。",
            descriptionEn="Ideal for seasonal displays and gift shops, with current inventory running low.",
            category="节庆礼品",
            price="$12.50",
            inventory=84,
            status="low_stock",
            updatedAt="2026-04-23 09:10",
            coverImage="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
            images=[
                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=800&q=80",
            ],
            specs=["三尺寸组合", "透明玻璃", "礼盒套装"],
            skus=[
                ProductSku(id="SKU-1002-A", skuCode="NW-CAND-014-A", specSummaryZh="透明款", specSummaryEn="Clear glass", inventory=40),
                ProductSku(id="SKU-1002-B", skuCode="NW-CAND-014-B", specSummaryZh="琥珀款", specSummaryEn="Amber glass", inventory=44),
            ],
            englishReady=True,
        ),
        ProductRecord(
            id="PROD-1003",
            nameZh="有机棉流苏盖毯",
            nameEn="",
            descriptionZh="新品草稿，正在补充英文卖点、包装尺寸和发货说明。",
            descriptionEn="",
            category="家纺软装",
            price="$19.80",
            inventory=0,
            status="draft",
            updatedAt="2026-04-22 18:40",
            coverImage="",
            images=[],
            specs=["130 x 180 cm", "有机棉", "流苏收边"],
            skus=[
                ProductSku(id="SKU-1003-A", skuCode="NW-TEXT-102-A", specSummaryZh="米色款", specSummaryEn="", inventory=0),
            ],
            englishReady=False,
        ),
    ]


def seed_orders() -> List[OrderDetail]:
    return [
        OrderDetail(
            id="ORD-90211",
            buyer="West Elm 零售集团",
            destination="美国 洛杉矶",
            amount="$14,280",
            status="processing",
            updatedAt="2026-04-23 09:45",
            exceptionStatus="none",
            sourceInquiryId="",
            sourceQuoteVersion="",
            contactName="Emily Zhao",
            contactPhone="+1 415 555 1932",
            paymentMethod="Net 30",
            shippingAddress="1200 E 7th St, Los Angeles, CA",
            internalNote="优先安排 4 月底出货，买家要求外箱贴 SKU 标签。",
            logisticsCompany="DHL Global Forwarding",
            trackingNumber="DHL-20260423-8821",
            estimatedShipDate="2026-04-24",
            shippingNote="整柜优先，外箱需贴 SKU 与目的仓标签。",
            packageCount=28,
            boxMark="WE / LOS ANGELES / SKU LABEL",
            exceptionReason="",
            items=[
                OrderItem(productName="陶瓷餐具礼盒套装", sku="NW-DINE-001", quantity=180, unitPrice="$28.00"),
                OrderItem(productName="玻璃烛台三件套", sku="NW-CAND-014", quantity=120, unitPrice="$12.50"),
            ],
            timeline=build_order_timeline("processing"),
        ),
        OrderDetail(
            id="ORD-90212",
            buyer="Nord Atelier",
            destination="德国 柏林",
            amount="$8,940",
            status="ready_to_ship",
            updatedAt="2026-04-23 08:20",
            exceptionStatus="none",
            sourceInquiryId="",
            sourceQuoteVersion="",
            contactName="Lena Hoffmann",
            contactPhone="+49 30 5558 9002",
            paymentMethod="TT 50/50",
            shippingAddress="Landsberger Allee 227, Berlin",
            internalNote="已完成打托，等待货代确认提货时间。",
            logisticsCompany="Maersk",
            trackingNumber="MAE-20260423-1092",
            estimatedShipDate="2026-04-25",
            shippingNote="已完成提货预约，等仓库放行。",
            packageCount=18,
            boxMark="NA / BERLIN / READY TO SHIP",
            exceptionReason="",
            items=[
                OrderItem(productName="有机棉流苏盖毯", sku="NW-TEXT-102", quantity=240, unitPrice="$19.80"),
            ],
            timeline=build_order_timeline("ready_to_ship"),
        ),
        OrderDetail(
            id="ORD-90213",
            buyer="Maison Layer",
            destination="法国 巴黎",
            amount="$6,320",
            status="completed",
            updatedAt="2026-04-22 17:30",
            exceptionStatus="resolved",
            sourceInquiryId="",
            sourceQuoteVersion="",
            contactName="Camille Martin",
            contactPhone="+33 1 88 555 720",
            paymentMethod="Card",
            shippingAddress="18 Rue du Commerce, Paris",
            internalNote="客户已确认收货，后续可跟进复购系列。",
            logisticsCompany="UPS",
            trackingNumber="UPS-20260420-7714",
            estimatedShipDate="2026-04-20",
            shippingNote="已妥投，无异常签收。",
            packageCount=22,
            boxMark="ML / PARIS / GIFT COLLECTION",
            exceptionReason="妥投前曾有地址确认异常，已解决。",
            items=[
                OrderItem(productName="玻璃烛台三件套", sku="NW-CAND-014", quantity=220, unitPrice="$12.50"),
            ],
            timeline=build_order_timeline("completed"),
        ),
    ]


def seed_inquiries() -> List[InquiryDetail]:
    return [
        InquiryDetail(
            id="INQ-3001",
            buyer="Willow & Pine",
            topic="节庆组合款 MOQ 与样品申请",
            priority="high",
            status="follow_up",
            updatedAt="2026-04-23 10:05",
            latestQuoteVersion="",
            convertedOrderId="",
            company="Willow & Pine Home",
            email="buying@willowpine.example",
            destination="美国",
            owner="王敏",
            targetPrice="$18-$22",
            needSample=True,
            items=[
                InquiryItem(productName="陶瓷餐具礼盒套装", quantity=300, moq=120, priceHint="$28.00"),
                InquiryItem(productName="玻璃烛台三件套", quantity=240, moq=60, priceHint="$12.50"),
            ],
            activities=[
                InquiryActivity(id="ACT-1", author="买家", role="buyer", message="希望先确认 MOQ、样品费和大货交期。", createdAt="2026-04-23 08:40"),
                InquiryActivity(id="ACT-2", author="王敏", role="seller", message="已收到需求，正在确认样品方案与交期。", createdAt="2026-04-23 10:05"),
            ],
            internalNotes=[
                InquiryNote(id="NOTE-1", author="王敏", message="优先推进，客户历史成交潜力较高。", createdAt="2026-04-23 10:10"),
            ],
            quotes=[],
        ),
        InquiryDetail(
            id="INQ-3002",
            buyer="Habitat Source",
            topic="自有品牌包装方案确认",
            priority="medium",
            status="new",
            updatedAt="2026-04-23 08:52",
            latestQuoteVersion="",
            convertedOrderId="",
            company="Habitat Source",
            email="ops@habitatsource.example",
            destination="加拿大",
            owner="刘畅",
            targetPrice="先看报价",
            needSample=False,
            items=[
                InquiryItem(productName="有机棉流苏盖毯", quantity=180, moq=80, priceHint="$19.80"),
            ],
            activities=[
                InquiryActivity(id="ACT-3", author="买家", role="buyer", message="想了解自有品牌外箱、吊牌和内卡是否可以一并定制。", createdAt="2026-04-23 08:52"),
            ],
            internalNotes=[],
            quotes=[],
        ),
        InquiryDetail(
            id="INQ-3003",
            buyer="North Strand",
            topic="报价确认中，待补充物流成本",
            priority="low",
            status="quoted",
            updatedAt="2026-04-22 16:40",
            latestQuoteVersion="V2",
            convertedOrderId="",
            company="North Strand Retail",
            email="team@northstrand.example",
            destination="英国",
            owner="赵磊",
            targetPrice="$11-$13",
            needSample=False,
            items=[
                InquiryItem(productName="玻璃烛台三件套", quantity=400, moq=60, priceHint="$12.50"),
            ],
            activities=[
                InquiryActivity(id="ACT-4", author="买家", role="buyer", message="请补充英国仓交付的运费测算。", createdAt="2026-04-22 14:10"),
                InquiryActivity(id="ACT-5", author="赵磊", role="seller", message="已发送基础报价，等待物流成本确认后补全最终方案。", createdAt="2026-04-22 16:40"),
            ],
            internalNotes=[
                InquiryNote(id="NOTE-2", author="赵磊", message="等货代回包后直接补充最终报价。", createdAt="2026-04-22 16:42"),
            ],
            quotes=[
                InquiryQuote(
                    id="QUOTE-3003-1",
                    version="V1",
                    author="赵磊",
                    currency="USD",
                    validUntil="2026-04-26",
                    shippingFee=280.0,
                    leadTime="18 天",
                    paymentTerms="30% 定金，70% 发货前付清",
                    note="首版基础报价，不含英国仓尾程费用。",
                    totalAmount="USD 5280.00",
                    createdAt="2026-04-22 15:30",
                    items=[
                        InquiryQuoteItem(productName="玻璃烛台三件套", sku="NW-CAND-014-A", quantity=400, unitPrice=12.50, note="透明款"),
                    ],
                ),
                InquiryQuote(
                    id="QUOTE-3003-2",
                    version="V2",
                    author="赵磊",
                    currency="USD",
                    validUntil="2026-04-28",
                    shippingFee=560.0,
                    leadTime="18 天",
                    paymentTerms="30% 定金，70% 发货前付清",
                    note="补充英国仓交付的物流预估费用。",
                    totalAmount="USD 5560.00",
                    createdAt="2026-04-22 16:35",
                    items=[
                        InquiryQuoteItem(productName="玻璃烛台三件套", sku="NW-CAND-014-A", quantity=400, unitPrice=12.50, note="透明款"),
                    ],
                ),
            ],
        ),
    ]


def seed_settings() -> SettingsRecord:
    return SettingsRecord(
        shopName="北辰供应链",
        contactEmail="seller@northstar-supply.example",
        contactPhone="+86 138 0000 1234",
        defaultLeadTime="15-20 个工作日",
        samplePolicy="通过初筛的批发询盘可在 3 个工作日内安排样品。",
        defaultPaymentTerms="30% 定金，70% 发货前付清",
        defaultSampleFeePolicy="样品费下单后可返还，默认 3 个工作日内出样。",
    )


def seed_operation_logs() -> List[OperationLogRecord]:
    return [
        OperationLogRecord(id="LOG-1001", actor="李华", action="登录后台", target="管理员账号 admin", createdAt="2026-04-23 10:20"),
        OperationLogRecord(id="LOG-1002", actor="王敏", action="更新询盘负责人", target="INQ-3001 -> 王敏", createdAt="2026-04-23 10:12"),
        OperationLogRecord(id="LOG-1003", actor="赵磊", action="录入报价版本", target="INQ-3003 / V2", createdAt="2026-04-22 16:35"),
        OperationLogRecord(id="LOG-1004", actor="运营专员", action="保存发货信息", target="ORD-90212", createdAt="2026-04-23 08:26"),
    ]


def seed_login_logs() -> List[LoginLogRecord]:
    return [
        LoginLogRecord(
            id="LOGIN-1001",
            username="admin",
            displayName="李华",
            status="success",
            reason="登录成功",
            deviceName="Mac Chrome",
            ipAddress="127.0.0.1",
            createdAt="2026-04-23 10:20",
        ),
        LoginLogRecord(
            id="LOGIN-1002",
            username="ops",
            displayName="运营专员",
            status="success",
            reason="登录成功",
            deviceName="Windows Edge",
            ipAddress="127.0.0.1",
            createdAt="2026-04-23 09:48",
        ),
        LoginLogRecord(
            id="LOGIN-1003",
            username="sales",
            displayName="销售负责人",
            status="success",
            reason="登录成功",
            deviceName="iPad Safari",
            ipAddress="127.0.0.1",
            createdAt="2026-04-22 18:18",
        ),
        LoginLogRecord(
            id="LOGIN-1004",
            username="viewer",
            displayName="老板查看账号",
            status="failed",
            reason="账号待激活，请联系管理员启用",
            deviceName="Windows Chrome",
            ipAddress="127.0.0.1",
            createdAt="2026-04-22 10:06",
        ),
    ]


def save_member(connection: sqlite3.Connection, member: MemberRecord, password_hash: Optional[str] = None):
    existing = connection.execute("SELECT password_hash FROM members WHERE username = ?", (member.username,)).fetchone()
    effective_hash = password_hash or (existing["password_hash"] if existing else "")
    connection.execute(
        "REPLACE INTO members (username, payload, password_hash) VALUES (?, ?, ?)",
        (member.username, json_dumps(model_to_dict(member)), effective_hash),
    )


def save_buyer(connection: sqlite3.Connection, buyer: BuyerAccountRecord, password_hash: Optional[str] = None):
    existing = connection.execute("SELECT password_hash FROM buyers WHERE id = ?", (buyer.id,)).fetchone()
    effective_hash = password_hash or (existing["password_hash"] if existing else "")
    connection.execute(
        "REPLACE INTO buyers (id, email, payload, password_hash) VALUES (?, ?, ?, ?)",
        (buyer.id, buyer.email.lower(), json_dumps(model_to_dict(buyer)), effective_hash),
    )


def save_session(connection: sqlite3.Connection, token: str, subject_type: str, subject_id: str):
    connection.execute(
        "REPLACE INTO sessions (token, subject_type, subject_id, created_at) VALUES (?, ?, ?, ?)",
        (token, subject_type, subject_id, now_label()),
    )


def save_product(connection: sqlite3.Connection, product: ProductRecord):
    sync_product_english_state(product)
    connection.execute(
        "REPLACE INTO products (id, updated_at, payload) VALUES (?, ?, ?)",
        (product.id, product.updatedAt, json_dumps(model_to_dict(product))),
    )


def save_order(connection: sqlite3.Connection, order: OrderDetail):
    connection.execute(
        "REPLACE INTO orders (id, updated_at, payload) VALUES (?, ?, ?)",
        (order.id, order.updatedAt, json_dumps(model_to_dict(order))),
    )


def save_inquiry(connection: sqlite3.Connection, inquiry: InquiryDetail):
    connection.execute(
        "REPLACE INTO inquiries (id, updated_at, payload) VALUES (?, ?, ?)",
        (inquiry.id, inquiry.updatedAt, json_dumps(model_to_dict(inquiry))),
    )


def save_settings_record(connection: sqlite3.Connection, settings: SettingsRecord):
    connection.execute(
        "REPLACE INTO settings (id, payload) VALUES (1, ?)",
        (json_dumps(model_to_dict(settings)),),
    )


def save_operation_log(connection: sqlite3.Connection, log: OperationLogRecord):
    connection.execute(
        "REPLACE INTO operation_logs (id, created_at, payload) VALUES (?, ?, ?)",
        (log.id, log.createdAt, json_dumps(model_to_dict(log))),
    )


def save_login_log(connection: sqlite3.Connection, log: LoginLogRecord):
    connection.execute(
        "REPLACE INTO login_logs (id, username, status, created_at, payload) VALUES (?, ?, ?, ?, ?)",
        (log.id, log.username, log.status, log.createdAt, json_dumps(model_to_dict(log))),
    )


def save_shipment_batch(connection: sqlite3.Connection, batch: ShipmentBatchRecord):
    connection.execute(
        "REPLACE INTO shipment_batches (id, created_at, payload) VALUES (?, ?, ?)",
        (batch.id, batch.createdAt, json_dumps(model_to_dict(batch))),
    )


def initialize_data_store():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = db_connection()
    try:
        ensure_schema(connection)

        if table_count(connection, "settings") == 0:
            save_settings_record(connection, seed_settings())
        if table_count(connection, "members") == 0:
            for member, password in seed_members():
                save_member(connection, member, hash_password(password))
        if table_count(connection, "products") == 0:
            for product in seed_products():
                save_product(connection, product)
        if table_count(connection, "orders") == 0:
            for order in seed_orders():
                save_order(connection, order)
        if table_count(connection, "inquiries") == 0:
            for inquiry in seed_inquiries():
                save_inquiry(connection, inquiry)
        if table_count(connection, "operation_logs") == 0:
            for log in seed_operation_logs():
                save_operation_log(connection, log)
        if table_count(connection, "login_logs") == 0:
            for log in seed_login_logs():
                save_login_log(connection, log)

        connection.commit()
    finally:
        connection.close()


def read_member(username: str) -> Optional[Tuple[MemberRecord, str]]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload, password_hash FROM members WHERE username = ?", (username,)).fetchone()
        if not row:
            return None
        member = model_from_dict(MemberRecord, json_loads(row["payload"]))
        member.permissions = permissions_for_role(member.role)
        return member, row["password_hash"]
    finally:
        connection.close()


def read_buyer_by_email(email: str) -> Optional[Tuple[BuyerAccountRecord, str]]:
    normalized_email = email.strip().lower()
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload, password_hash FROM buyers WHERE email = ?", (normalized_email,)).fetchone()
        if not row:
            return None
        buyer = model_from_dict(BuyerAccountRecord, json_loads(row["payload"]))
        return buyer, row["password_hash"]
    finally:
        connection.close()


def read_buyer_by_id(buyer_id: str) -> Optional[Tuple[BuyerAccountRecord, str]]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload, password_hash FROM buyers WHERE id = ?", (buyer_id,)).fetchone()
        if not row:
            return None
        buyer = model_from_dict(BuyerAccountRecord, json_loads(row["payload"]))
        return buyer, row["password_hash"]
    finally:
        connection.close()


def read_session(token: str) -> Optional[Tuple[str, str]]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT subject_type, subject_id FROM sessions WHERE token = ?", (token,)).fetchone()
        if not row:
            return None
        return row["subject_type"], row["subject_id"]
    finally:
        connection.close()


def read_settings_record() -> SettingsRecord:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM settings WHERE id = 1").fetchone()
        if not row:
            settings = seed_settings()
            save_settings_record(connection, settings)
            connection.commit()
            return settings
        return model_from_dict(SettingsRecord, json_loads(row["payload"]))
    finally:
        connection.close()


def read_all_products() -> List[ProductRecord]:
    connection = db_connection()
    try:
        rows = connection.execute("SELECT payload FROM products ORDER BY updated_at DESC").fetchall()
        products = []
        dirty = False
        for row in rows:
            product = model_from_dict(ProductRecord, json_loads(row["payload"]))
            original_status = product.status
            original_ready = product.englishReady
            sync_product_english_state(product)
            products.append(product)
            if product.status != original_status or product.englishReady != original_ready:
                save_product(connection, product)
                dirty = True
        if dirty:
            connection.commit()
        return products
    finally:
        connection.close()


def read_product(product_id: str) -> Optional[ProductRecord]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM products WHERE id = ?", (product_id,)).fetchone()
        if not row:
            return None
        product = model_from_dict(ProductRecord, json_loads(row["payload"]))
        original_status = product.status
        original_ready = product.englishReady
        sync_product_english_state(product)
        if product.status != original_status or product.englishReady != original_ready:
            save_product(connection, product)
            connection.commit()
        return product
    finally:
        connection.close()


def read_all_orders() -> List[OrderDetail]:
    connection = db_connection()
    try:
        rows = connection.execute("SELECT payload FROM orders ORDER BY updated_at DESC").fetchall()
        return [model_from_dict(OrderDetail, json_loads(row["payload"])) for row in rows]
    finally:
        connection.close()


def read_order(order_id: str) -> Optional[OrderDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not row:
            return None
        return model_from_dict(OrderDetail, json_loads(row["payload"]))
    finally:
        connection.close()


def read_all_inquiries() -> List[InquiryDetail]:
    connection = db_connection()
    try:
        rows = connection.execute("SELECT payload FROM inquiries ORDER BY updated_at DESC").fetchall()
        return [model_from_dict(InquiryDetail, json_loads(row["payload"])) for row in rows]
    finally:
        connection.close()


def read_inquiry(inquiry_id: str) -> Optional[InquiryDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM inquiries WHERE id = ?", (inquiry_id,)).fetchone()
        if not row:
            return None
        return model_from_dict(InquiryDetail, json_loads(row["payload"]))
    finally:
        connection.close()


def read_all_logs() -> List[OperationLogRecord]:
    connection = db_connection()
    try:
        rows = connection.execute("SELECT payload FROM operation_logs ORDER BY created_at DESC, rowid DESC").fetchall()
        return [model_from_dict(OperationLogRecord, json_loads(row["payload"])) for row in rows]
    finally:
        connection.close()


def read_all_login_logs(username: str = "") -> List[LoginLogRecord]:
    connection = db_connection()
    try:
        if username:
            rows = connection.execute(
                "SELECT payload FROM login_logs WHERE username = ? ORDER BY created_at DESC, rowid DESC",
                (username,),
            ).fetchall()
        else:
            rows = connection.execute("SELECT payload FROM login_logs ORDER BY created_at DESC, rowid DESC").fetchall()
        return [model_from_dict(LoginLogRecord, json_loads(row["payload"])) for row in rows]
    finally:
        connection.close()


def read_all_shipment_batches() -> List[ShipmentBatchRecord]:
    connection = db_connection()
    try:
        rows = connection.execute("SELECT payload FROM shipment_batches ORDER BY created_at DESC, rowid DESC").fetchall()
        return [model_from_dict(ShipmentBatchRecord, json_loads(row["payload"])) for row in rows]
    finally:
        connection.close()


def read_shipment_batch(batch_id: str) -> Optional[ShipmentBatchRecord]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM shipment_batches WHERE id = ?", (batch_id,)).fetchone()
        if not row:
            return None
        return model_from_dict(ShipmentBatchRecord, json_loads(row["payload"]))
    finally:
        connection.close()


def latest_successful_login(connection: sqlite3.Connection, username: str) -> Optional[LoginLogRecord]:
    row = connection.execute(
        "SELECT payload FROM login_logs WHERE username = ? AND status = 'success' ORDER BY created_at DESC, rowid DESC LIMIT 1",
        (username,),
    ).fetchone()
    if not row:
        return None
    return model_from_dict(LoginLogRecord, json_loads(row["payload"]))


def refresh_member_login_snapshot(connection: sqlite3.Connection, member: MemberRecord) -> MemberRecord:
    login_log = latest_successful_login(connection, member.username)
    if login_log:
        member.lastLogin = login_log.createdAt
        member.lastLoginDevice = login_log.deviceName
    elif not getattr(member, "lastLoginDevice", ""):
        member.lastLoginDevice = ""
    member.permissions = permissions_for_role(member.role)
    return member


def next_product_id(connection: sqlite3.Connection) -> str:
    rows = connection.execute("SELECT id FROM products").fetchall()
    numbers = []
    for row in rows:
        try:
            numbers.append(int(row["id"].replace("PROD-", "")))
        except ValueError:
            continue
    return "PROD-{}".format(max(numbers + [1000]) + 1)


def next_buyer_id(connection: sqlite3.Connection) -> str:
    rows = connection.execute("SELECT id FROM buyers").fetchall()
    numbers = []
    for row in rows:
        try:
            numbers.append(int(row["id"].replace("BUY-", "")))
        except ValueError:
            continue
    return "BUY-{}".format(max(numbers + [1000]) + 1)


def next_order_id(connection: sqlite3.Connection) -> str:
    rows = connection.execute("SELECT id FROM orders").fetchall()
    numbers = []
    for row in rows:
        try:
            numbers.append(int(row["id"].replace("ORD-", "")))
        except ValueError:
            continue
    return "ORD-{}".format(max(numbers + [90210]) + 1)


def next_inquiry_id(connection: sqlite3.Connection) -> str:
    rows = connection.execute("SELECT id FROM inquiries").fetchall()
    numbers = []
    for row in rows:
        try:
            numbers.append(int(row["id"].replace("INQ-", "")))
        except ValueError:
            continue
    return "INQ-{}".format(max(numbers + [3000]) + 1)


def next_shipment_batch_id(connection: sqlite3.Connection) -> str:
    rows = connection.execute("SELECT id FROM shipment_batches").fetchall()
    numbers = []
    for row in rows:
        try:
            numbers.append(int(row["id"].replace("BAT-", "")))
        except ValueError:
            continue
    return "BAT-{}".format(max(numbers + [5000]) + 1)


def create_session(subject_type: str, subject_id: str, prefix: str) -> str:
    token = "{}{}".format(prefix, uuid4().hex)
    connection = db_connection()
    try:
        save_session(connection, token, subject_type, subject_id)
        connection.commit()
    finally:
        connection.close()
    return token


def operation_log(actor: str, action: str, target: str):
    connection = db_connection()
    try:
        log = OperationLogRecord(
            id="LOG-{}".format(uuid4().hex[:8].upper()),
            actor=actor,
            action=action,
            target=target,
            createdAt=now_label(),
        )
        save_operation_log(connection, log)
        connection.commit()
    finally:
        connection.close()


def parse_amount(raw_amount: str) -> float:
    cleaned = raw_amount.replace("$", "").replace(",", "").replace("USD", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def get_dashboard_metrics() -> List[DashboardMetric]:
    orders = read_all_orders()
    inquiries = read_all_inquiries()
    products = read_all_products()

    sales_total = sum(parse_amount(order.amount) for order in orders)
    pending_inquiries = [item for item in inquiries if item.status in ["new", "follow_up", "quoted"]]
    active_products = [item for item in products if item.status in ["active", "low_stock"]]
    draft_products = [item for item in products if item.status == "draft"]
    ready_orders = [item for item in orders if item.status == "ready_to_ship"]
    processing_orders = [item for item in orders if item.status == "processing"]

    return [
        DashboardMetric(label="本月销售额", value="${:,.0f}".format(sales_total), delta="当前已累计 {} 笔订单".format(len(orders))),
        DashboardMetric(label="待跟进询盘", value=str(len(pending_inquiries)), delta="其中 {} 条处于跟进中".format(len([item for item in inquiries if item.status == "follow_up"]))),
        DashboardMetric(label="上架商品数", value=str(len(active_products)), delta="另有 {} 个草稿待完善".format(len(draft_products))),
        DashboardMetric(label="待发货订单", value=str(len(ready_orders)), delta="另有 {} 单处于处理中".format(len(processing_orders))),
    ]


def get_settings_record() -> SettingsRecord:
    return read_settings_record()


def get_member(username: str) -> Optional[MemberRecord]:
    found = read_member(username)
    if not found:
        return None
    return found[0]


def list_products_data() -> List[ProductRecord]:
    return read_all_products()


def get_product(product_id: str) -> Optional[ProductRecord]:
    return read_product(product_id)


def create_product_record(payload: ProductPayload) -> ProductRecord:
    connection = db_connection()
    try:
        product = ProductRecord(
            id=next_product_id(connection),
            updatedAt=now_label(),
            englishReady=english_ready(payload),
            **model_to_dict(payload)
        )
        sync_product_english_state(product)
        save_product(connection, product)
        connection.commit()
    finally:
        connection.close()
    operation_log("李华", "新增商品", product.id)
    return product


def update_product_record(product_id: str, payload: ProductPayload) -> Optional[ProductRecord]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM products WHERE id = ?", (product_id,)).fetchone()
        if not row:
            return None
        product = ProductRecord(
            id=product_id,
            updatedAt=now_label(),
            englishReady=english_ready(payload),
            **model_to_dict(payload)
        )
        sync_product_english_state(product)
        save_product(connection, product)
        connection.commit()
    finally:
        connection.close()
    operation_log("李华", "编辑商品", product_id)
    return product


def publish_product_record(product_id: str, published: bool) -> Optional[ProductRecord]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM products WHERE id = ?", (product_id,)).fetchone()
        if not row:
            return None
        product = model_from_dict(ProductRecord, json_loads(row["payload"]))
        sync_product_english_state(product)
        if published:
            if not product.englishReady:
                raise ValueError("英文信息、图片或 SKU 尚未补齐，暂时不能上架。")
            product.status = "low_stock" if product.inventory < 100 else "active"
        else:
            product.status = "draft"
        product.updatedAt = now_label()
        save_product(connection, product)
        connection.commit()
    finally:
        connection.close()
    operation_log("李华", "上架商品" if published else "下架商品", product_id)
    return product


def delete_product_record(product_id: str) -> bool:
    connection = db_connection()
    try:
        deleted = connection.execute("DELETE FROM products WHERE id = ?", (product_id,)).rowcount > 0
        connection.commit()
    finally:
        connection.close()
    if deleted:
        operation_log("李华", "删除商品", product_id)
    return deleted


def list_order_records() -> List[OrderRecord]:
    return [
        OrderRecord(
            id=order.id,
            buyer=order.buyer,
            destination=order.destination,
            amount=order.amount,
            status=order.status,
            updatedAt=order.updatedAt,
            exceptionStatus=order.exceptionStatus,
            sourceInquiryId=order.sourceInquiryId,
            sourceQuoteVersion=order.sourceQuoteVersion,
        )
        for order in read_all_orders()
    ]


def get_order_detail(order_id: str) -> Optional[OrderDetail]:
    return read_order(order_id)


def validate_shipping_payload(payload: OrderShippingPayload):
    if not payload.logisticsCompany.strip():
        raise ValueError("请填写物流公司。")
    if not payload.trackingNumber.strip():
        raise ValueError("请填写运单号或提单号。")
    if not payload.estimatedShipDate.strip():
        raise ValueError("请填写预计发货日期。")
    if payload.packageCount <= 0:
        raise ValueError("箱数必须大于 0。")
    if not payload.boxMark.strip():
        raise ValueError("请填写箱唛信息。")


def update_order_status(order_id: str, status: str) -> Optional[OrderDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not row:
            return None
        order = model_from_dict(OrderDetail, json_loads(row["payload"]))
        order.status = status
        order.updatedAt = now_label()
        if status != "exception":
            order.exceptionStatus = "none"
            order.exceptionReason = ""
        order.timeline = build_order_timeline(status)
        save_order(connection, order)
        connection.commit()
    finally:
        connection.close()
    operation_log("运营专员", "推进订单状态", "{} -> {}".format(order_id, status))
    return order


def update_order_shipping(order_id: str, payload: OrderShippingPayload) -> Optional[OrderDetail]:
    validate_shipping_payload(payload)
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not row:
            return None
        order = model_from_dict(OrderDetail, json_loads(row["payload"]))
        order.logisticsCompany = payload.logisticsCompany
        order.trackingNumber = payload.trackingNumber
        order.estimatedShipDate = payload.estimatedShipDate
        order.shippingNote = payload.shippingNote
        order.packageCount = payload.packageCount
        order.boxMark = payload.boxMark
        order.updatedAt = now_label()
        if order.status in ["submitted", "processing"]:
            order.status = "ready_to_ship"
        order.timeline = build_order_timeline(order.status)
        save_order(connection, order)
        connection.commit()
    finally:
        connection.close()
    operation_log("运营专员", "保存发货信息", order_id)
    return order


def batch_update_order_shipping(order_ids: List[str], payload: OrderShippingPayload) -> List[OrderDetail]:
    validate_shipping_payload(payload)
    updated_orders = []
    for order_id in order_ids:
        updated = update_order_shipping(order_id, payload)
        if updated:
            updated_orders.append(updated)
    if updated_orders:
        connection = db_connection()
        try:
            batch = ShipmentBatchRecord(
                id=next_shipment_batch_id(connection),
                orderIds=[order.id for order in updated_orders],
                orderCount=len(updated_orders),
                logisticsCompany=payload.logisticsCompany,
                trackingNumber=payload.trackingNumber,
                estimatedShipDate=payload.estimatedShipDate,
                shippingNote=payload.shippingNote,
                packageCount=payload.packageCount,
                boxMark=payload.boxMark,
                printed=False,
                createdAt=now_label(),
            )
            save_shipment_batch(connection, batch)
            connection.commit()
        finally:
            connection.close()
        operation_log("运营专员", "批量录入发货", "、".join(order_ids))
    return updated_orders


def mark_order_exception(order_id: str, payload: OrderExceptionPayload) -> Optional[OrderDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not row:
            return None
        order = model_from_dict(OrderDetail, json_loads(row["payload"]))
        order.exceptionReason = payload.reason.strip()
        order.updatedAt = now_label()
        if payload.resolved:
            order.exceptionStatus = "resolved"
            if order.status == "exception":
                order.status = "ready_to_ship" if order.trackingNumber else "processing"
        else:
            if not order.exceptionReason:
                raise ValueError("请填写异常原因。")
            order.exceptionStatus = "pending"
            order.status = "exception"
        order.timeline = build_order_timeline(order.status)
        save_order(connection, order)
        connection.commit()
    finally:
        connection.close()
    operation_log("运营专员", "处理订单异常" if payload.resolved else "标记订单异常", "{} / {}".format(order_id, payload.reason or "恢复"))
    return order


def list_shipment_batches() -> List[ShipmentBatchRecord]:
    return read_all_shipment_batches()


def get_shipment_batch(batch_id: str) -> Optional[ShipmentBatchRecord]:
    return read_shipment_batch(batch_id)


def mark_shipment_batch_printed(batch_id: str) -> Optional[ShipmentBatchRecord]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM shipment_batches WHERE id = ?", (batch_id,)).fetchone()
        if not row:
            return None
        batch = model_from_dict(ShipmentBatchRecord, json_loads(row["payload"]))
        batch.printed = True
        save_shipment_batch(connection, batch)
        connection.commit()
    finally:
        connection.close()
    operation_log("运营专员", "打印发货批次", batch_id)
    return batch


def normalize_buyer_inquiry_status(status: str) -> str:
    mapping = {
        "new": "submitted",
        "follow_up": "reviewing",
        "quoted": "quoted",
        "converted": "closed",
    }
    return mapping.get(status, "reviewing")


def buyer_inquiry_created_at(inquiry: InquiryDetail) -> str:
    if inquiry.activities:
        return inquiry.activities[0].createdAt
    return inquiry.updatedAt


def to_iso_timestamp(value: str) -> str:
    if "T" in value:
        return value
    if len(value) == 16 and " " in value:
        return "{}:00".format(value.replace(" ", "T"))
    return value


def build_buyer_inquiry_topic(payload: BuyerInquiryPayload) -> str:
    if payload.productName.strip():
        return "商品询盘：{}".format(payload.productName.strip())
    if payload.brandName.strip():
        return "品牌询盘：{}".format(payload.brandName.strip())
    if payload.items:
        return "整单询盘：{} 个商品条目".format(len(payload.items))
    return "通用询盘"


def build_buyer_inquiry_priority(payload: BuyerInquiryPayload) -> str:
    if payload.needSample or len(payload.items) >= 2:
        return "high"
    if payload.targetPrice.strip():
        return "medium"
    return "low"


def serialize_buyer_inquiry(inquiry: InquiryDetail) -> BuyerInquiryRecord:
    buyer_follow_up_times = []
    activities: List[BuyerInquiryActivity] = []

    for index, activity in enumerate(inquiry.activities):
        if activity.role == "buyer":
            activity_type = "created" if index == 0 else "buyer_follow_up"
            title = "已提交询盘" if index == 0 else "补充跟进信息"
            author = "buyer"
            if index > 0:
                buyer_follow_up_times.append(activity.createdAt)
        elif activity.role == "seller":
            activity_type = "advisor_update"
            title = "顾问回复"
            author = "advisor"
        else:
            activity_type = "status_change"
            title = "状态更新"
            author = "system"

        activities.append(
            BuyerInquiryActivity(
                id=activity.id,
                createdAt=to_iso_timestamp(activity.createdAt),
                type=activity_type,
                author=author,
                title=title,
                message=activity.message,
                status=normalize_buyer_inquiry_status(inquiry.status) if activity.role == "system" else None,
            )
        )

    return BuyerInquiryRecord(
        id=inquiry.id,
        createdAt=to_iso_timestamp(buyer_inquiry_created_at(inquiry)),
        updatedAt=to_iso_timestamp(inquiry.updatedAt),
        status=normalize_buyer_inquiry_status(inquiry.status),
        source=inquiry.source,
        buyerName=inquiry.buyer,
        email=inquiry.email,
        company=inquiry.company,
        role=inquiry.buyerRole or "采购联系人",
        destinationCountry=inquiry.destination,
        targetPrice=inquiry.targetPrice,
        needSample=inquiry.needSample,
        message=inquiry.activities[0].message if inquiry.activities else "",
        brandId=inquiry.brandId,
        brandName=inquiry.brandName,
        productId=inquiry.productId,
        productName=inquiry.productName,
        items=[
            BuyerInquiryLineItem(
                productId=item.productId,
                productName=item.productName,
                brandId=item.brandId or inquiry.brandId,
                brandName=item.brandName or inquiry.brandName,
                quantity=item.quantity,
                minOrderQuantity=item.moq,
                unitPrice=parse_amount(item.priceHint),
            )
            for item in inquiry.items
        ],
        activities=activities,
        lastFollowUpAt=to_iso_timestamp(buyer_follow_up_times[-1]) if buyer_follow_up_times else None,
    )


def list_buyer_inquiries(buyer_id: str) -> List[BuyerInquiryRecord]:
    return [serialize_buyer_inquiry(inquiry) for inquiry in read_all_inquiries() if inquiry.buyerAccountId == buyer_id]


def get_buyer_inquiry_detail(buyer_id: str, inquiry_id: str) -> Optional[BuyerInquiryRecord]:
    inquiry = read_inquiry(inquiry_id)
    if not inquiry or inquiry.buyerAccountId != buyer_id:
        return None
    return serialize_buyer_inquiry(inquiry)


def create_buyer_inquiry(buyer: BuyerAuthUser, payload: BuyerInquiryPayload) -> BuyerInquiryRecord:
    if not payload.buyerName.strip() or not payload.company.strip() or not payload.destinationCountry.strip() or not payload.message.strip():
        raise ValueError("请补齐联系人、公司、目标市场和需求说明。")

    connection = db_connection()
    try:
        inquiry = InquiryDetail(
            id=next_inquiry_id(connection),
            buyer=payload.buyerName.strip(),
            topic=build_buyer_inquiry_topic(payload),
            priority=build_buyer_inquiry_priority(payload),
            status="new",
            updatedAt=now_label(),
            latestQuoteVersion="",
            convertedOrderId="",
            company=payload.company.strip(),
            email=buyer.email,
            destination=payload.destinationCountry.strip(),
            owner="待分配",
            buyerRole=payload.role.strip(),
            targetPrice=payload.targetPrice.strip(),
            needSample=payload.needSample,
            items=[
                InquiryItem(
                    productId=item.productId,
                    brandId=item.brandId,
                    brandName=item.brandName,
                    productName=item.productName,
                    quantity=item.quantity,
                    moq=item.minOrderQuantity,
                    priceHint="${:.2f}".format(item.unitPrice),
                )
                for item in payload.items
            ],
            activities=[
                InquiryActivity(
                    id="ACT-{}".format(uuid4().hex[:8].upper()),
                    author=payload.buyerName.strip(),
                    role="buyer",
                    message=payload.message.strip(),
                    createdAt=now_label(),
                )
            ],
            internalNotes=[
                InquiryNote(
                    id="NOTE-{}".format(uuid4().hex[:8].upper()),
                    author="系统",
                    message="来自买家前台的新询盘，待销售分配负责人。",
                    createdAt=now_label(),
                )
            ],
            quotes=[],
            buyerAccountId=buyer.id,
            source=payload.source,
            brandId=payload.brandId.strip(),
            brandName=payload.brandName.strip(),
            productId=payload.productId.strip(),
            productName=payload.productName.strip(),
        )
        save_inquiry(connection, inquiry)
        connection.commit()
    finally:
        connection.close()
    operation_log(buyer.contactName, "提交买家询盘", inquiry.id)
    return serialize_buyer_inquiry(inquiry)


def add_buyer_inquiry_follow_up(
    buyer: BuyerAuthUser,
    inquiry_id: str,
    payload: BuyerInquiryFollowUpPayload,
) -> Optional[BuyerInquiryRecord]:
    if not payload.message.strip():
        raise ValueError("请填写跟进内容。")

    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM inquiries WHERE id = ?", (inquiry_id,)).fetchone()
        if not row:
            return None
        inquiry = model_from_dict(InquiryDetail, json_loads(row["payload"]))
        if inquiry.buyerAccountId != buyer.id:
            return None
        if inquiry.status == "converted":
            raise ValueError("该询盘已转成订单，当前不能再追加买家跟进。")

        inquiry.activities.append(
            InquiryActivity(
                id="ACT-{}".format(uuid4().hex[:8].upper()),
                author=buyer.contactName,
                role="buyer",
                message=payload.message.strip(),
                createdAt=now_label(),
            )
        )
        inquiry.activities.append(
            InquiryActivity(
                id="ACT-{}".format(uuid4().hex[:8].upper()),
                author="顾问系统",
                role="seller",
                message="我们已收到你的补充说明，会继续跟进并同步最新进展。",
                createdAt=now_label(),
            )
        )
        inquiry.updatedAt = now_label()
        if inquiry.status == "new":
            inquiry.status = "follow_up"
        save_inquiry(connection, inquiry)
        connection.commit()
    finally:
        connection.close()
    operation_log(buyer.contactName, "补充买家询盘跟进", inquiry_id)
    return serialize_buyer_inquiry(inquiry)


def list_inquiry_records() -> List[InquiryRecord]:
    return [
        InquiryRecord(
            id=inquiry.id,
            buyer=inquiry.buyer,
            topic=inquiry.topic,
            priority=inquiry.priority,
            status=inquiry.status,
            updatedAt=inquiry.updatedAt,
            latestQuoteVersion=inquiry.latestQuoteVersion,
            convertedOrderId=inquiry.convertedOrderId,
        )
        for inquiry in read_all_inquiries()
    ]


def get_inquiry_detail(inquiry_id: str) -> Optional[InquiryDetail]:
    return read_inquiry(inquiry_id)


def add_inquiry_reply(inquiry_id: str, payload: InquiryReplyPayload) -> Optional[InquiryDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM inquiries WHERE id = ?", (inquiry_id,)).fetchone()
        if not row:
            return None
        inquiry = model_from_dict(InquiryDetail, json_loads(row["payload"]))
        inquiry.activities.append(
            InquiryActivity(
                id="ACT-{}".format(uuid4().hex[:8].upper()),
                author=payload.author,
                role="seller",
                message=payload.message,
                createdAt=now_label(),
            )
        )
        inquiry.updatedAt = now_label()
        if inquiry.status == "new":
            inquiry.status = "follow_up"
        save_inquiry(connection, inquiry)
        connection.commit()
    finally:
        connection.close()
    operation_log(payload.author, "追加询盘跟进", inquiry_id)
    return inquiry


def add_inquiry_note(inquiry_id: str, payload: InquiryNotePayload) -> Optional[InquiryDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM inquiries WHERE id = ?", (inquiry_id,)).fetchone()
        if not row:
            return None
        inquiry = model_from_dict(InquiryDetail, json_loads(row["payload"]))
        inquiry.internalNotes.append(
            InquiryNote(
                id="NOTE-{}".format(uuid4().hex[:8].upper()),
                author=payload.author,
                message=payload.message,
                createdAt=now_label(),
            )
        )
        inquiry.updatedAt = now_label()
        save_inquiry(connection, inquiry)
        connection.commit()
    finally:
        connection.close()
    operation_log(payload.author, "新增询盘内部备注", inquiry_id)
    return inquiry


def update_inquiry_status(inquiry_id: str, status: str) -> Optional[InquiryDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM inquiries WHERE id = ?", (inquiry_id,)).fetchone()
        if not row:
            return None
        inquiry = model_from_dict(InquiryDetail, json_loads(row["payload"]))
        inquiry.status = status
        inquiry.updatedAt = now_label()
        inquiry.activities.append(
            InquiryActivity(
                id="ACT-{}".format(uuid4().hex[:8].upper()),
                author="系统",
                role="system",
                message="询盘状态已更新为：{}".format(status),
                createdAt=now_label(),
            )
        )
        save_inquiry(connection, inquiry)
        connection.commit()
    finally:
        connection.close()
    operation_log("系统", "更新询盘状态", "{} -> {}".format(inquiry_id, status))
    return inquiry


def update_inquiry_owner(inquiry_id: str, payload: InquiryOwnerPayload) -> Optional[InquiryDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM inquiries WHERE id = ?", (inquiry_id,)).fetchone()
        if not row:
            return None
        inquiry = model_from_dict(InquiryDetail, json_loads(row["payload"]))
        inquiry.owner = payload.owner
        inquiry.updatedAt = now_label()
        inquiry.internalNotes.append(
            InquiryNote(
                id="NOTE-{}".format(uuid4().hex[:8].upper()),
                author="系统",
                message="负责人已变更为：{}".format(payload.owner),
                createdAt=now_label(),
            )
        )
        save_inquiry(connection, inquiry)
        connection.commit()
    finally:
        connection.close()
    operation_log("系统", "更新询盘负责人", "{} -> {}".format(inquiry_id, payload.owner))
    return inquiry


def add_inquiry_quote(inquiry_id: str, payload: InquiryQuotePayload) -> Optional[InquiryDetail]:
    connection = db_connection()
    try:
        row = connection.execute("SELECT payload FROM inquiries WHERE id = ?", (inquiry_id,)).fetchone()
        if not row:
            return None
        inquiry = model_from_dict(InquiryDetail, json_loads(row["payload"]))
        version = next_quote_version(inquiry.quotes)
        quote = InquiryQuote(
            id="QUOTE-{}".format(uuid4().hex[:8].upper()),
            version=version,
            author=payload.author,
            currency=payload.currency,
            validUntil=payload.validUntil,
            shippingFee=payload.shippingFee,
            leadTime=payload.leadTime,
            paymentTerms=payload.paymentTerms,
            note=payload.note,
            totalAmount=calculate_quote_total(payload.currency, payload.items, payload.shippingFee),
            createdAt=now_label(),
            items=payload.items,
        )
        inquiry.quotes.insert(0, quote)
        inquiry.status = "quoted"
        inquiry.latestQuoteVersion = version
        inquiry.updatedAt = now_label()
        inquiry.activities.append(
            InquiryActivity(
                id="ACT-{}".format(uuid4().hex[:8].upper()),
                author=payload.author,
                role="seller",
                message="已生成报价版本 {}，有效期至 {}。".format(version, payload.validUntil),
                createdAt=now_label(),
            )
        )
        inquiry.internalNotes.insert(
            0,
            InquiryNote(
                id="NOTE-{}".format(uuid4().hex[:8].upper()),
                author=payload.author,
                message="报价 {} 已发送，金额 {}。".format(version, quote.totalAmount),
                createdAt=now_label(),
            ),
        )
        save_inquiry(connection, inquiry)
        connection.commit()
    finally:
        connection.close()
    operation_log(payload.author, "录入报价版本", "{} / {}".format(inquiry_id, version))
    return inquiry


def convert_inquiry_to_order(inquiry_id: str, payload: InquiryConvertPayload) -> Optional[OrderDetail]:
    connection = db_connection()
    try:
        inquiry_row = connection.execute("SELECT payload FROM inquiries WHERE id = ?", (inquiry_id,)).fetchone()
        if not inquiry_row:
            return None

        inquiry = model_from_dict(InquiryDetail, json_loads(inquiry_row["payload"]))
        if inquiry.convertedOrderId:
            raise ValueError("该询盘已经转成订单，无需重复创建。")

        selected_quote = None
        for quote in inquiry.quotes:
            if quote.id == payload.quoteId:
                selected_quote = quote
                break
        if not selected_quote:
            raise ValueError("请选择一个有效的报价版本后再转订单。")
        if not payload.contactName.strip() or not payload.contactPhone.strip() or not payload.shippingAddress.strip():
            raise ValueError("请补齐联系人、联系电话和收货地址。")

        order = OrderDetail(
            id=next_order_id(connection),
            buyer=inquiry.company,
            destination=inquiry.destination,
            amount=selected_quote.totalAmount,
            status="submitted",
            updatedAt=now_label(),
            exceptionStatus="none",
            sourceInquiryId=inquiry.id,
            sourceQuoteVersion=selected_quote.version,
            contactName=payload.contactName,
            contactPhone=payload.contactPhone,
            paymentMethod=payload.paymentMethod.strip() or selected_quote.paymentTerms,
            shippingAddress=payload.shippingAddress,
            internalNote=payload.internalNote.strip() or "由询盘 {} 的 {} 转单生成。".format(inquiry.id, selected_quote.version),
            logisticsCompany="",
            trackingNumber="",
            estimatedShipDate="",
            shippingNote="",
            packageCount=1,
            boxMark="",
            exceptionReason="",
            items=[
                OrderItem(
                    productName=item.productName,
                    sku=item.sku,
                    quantity=item.quantity,
                    unitPrice="{} {:.2f}".format(selected_quote.currency, item.unitPrice),
                )
                for item in selected_quote.items
            ],
            timeline=build_order_timeline("submitted"),
        )

        inquiry.convertedOrderId = order.id
        inquiry.status = "converted"
        inquiry.updatedAt = now_label()
        inquiry.activities.append(
            InquiryActivity(
                id="ACT-{}".format(uuid4().hex[:8].upper()),
                author="系统",
                role="system",
                message="询盘已基于 {} 转成订单 {}。".format(selected_quote.version, order.id),
                createdAt=now_label(),
            )
        )
        inquiry.internalNotes.insert(
            0,
            InquiryNote(
                id="NOTE-{}".format(uuid4().hex[:8].upper()),
                author="系统",
                message="已生成订单 {}，后续进入履约流程。".format(order.id),
                createdAt=now_label(),
            )
        )

        save_order(connection, order)
        save_inquiry(connection, inquiry)
        connection.commit()
    finally:
        connection.close()
    operation_log(inquiry.owner, "询盘转订单", "{} -> {}".format(inquiry.id, order.id))
    return order


def login_reason_for_member(member: Optional[MemberRecord], password_matched: bool) -> str:
    if not member:
        return "账号不存在"
    if member.status == "invited":
        return "账号待激活，请联系管理员启用"
    if member.status == "disabled":
        return "账号已停用，请联系管理员"
    if not password_matched:
        return "密码错误"
    return "登录成功"


def write_login_log(
    username: str,
    display_name: str,
    status: str,
    reason: str,
    device_name: str,
    ip_address: str,
):
    connection = db_connection()
    try:
        log = LoginLogRecord(
            id="LOGIN-{}".format(uuid4().hex[:8].upper()),
            username=username,
            displayName=display_name,
            status=status,
            reason=reason,
            deviceName=device_name.strip() or "未识别设备",
            ipAddress=ip_address.strip() or "unknown",
            createdAt=now_label(),
        )
        save_login_log(connection, log)
        connection.commit()
    finally:
        connection.close()


def authenticate_user(username: str, password: str, device_name: str = "", ip_address: str = "") -> AuthUser:
    found = read_member(username)
    member = found[0] if found else None
    password_hash = found[1] if found else ""
    password_matched = bool(found and hash_password(password) == password_hash)
    reason = login_reason_for_member(member, password_matched)

    if not found or member.status != "active" or not password_matched:
        write_login_log(
            username=username,
            display_name=member.displayName if member else "未知账号",
            status="failed",
            reason=reason,
            device_name=device_name,
            ip_address=ip_address,
        )
        raise ValueError(reason)

    member.lastLogin = now_label()
    member.lastLoginDevice = device_name.strip() or "未识别设备"
    connection = db_connection()
    try:
        save_member(connection, member, password_hash)
        save_login_log(
            connection,
            LoginLogRecord(
                id="LOGIN-{}".format(uuid4().hex[:8].upper()),
                username=member.username,
                displayName=member.displayName,
                status="success",
                reason=reason,
                deviceName=member.lastLoginDevice,
                ipAddress=ip_address.strip() or "unknown",
                createdAt=member.lastLogin,
            ),
        )
        connection.commit()
    finally:
        connection.close()
    operation_log(member.displayName, "登录后台", "账号 {}".format(username))
    return build_auth_user(member)


def register_buyer_account(payload: BuyerRegisterPayload) -> BuyerAuthUser:
    normalized_email = payload.email.strip().lower()
    if not payload.contactName.strip() or not normalized_email or not payload.password.strip() or not payload.businessName.strip():
        raise ValueError("请完整填写注册信息。")
    if len(payload.password.strip()) < 6:
        raise ValueError("密码至少需要 6 位。")
    if read_buyer_by_email(normalized_email):
        raise ValueError("该邮箱已注册，请直接登录。")

    connection = db_connection()
    try:
        account = BuyerAccountRecord(
            id=next_buyer_id(connection),
            email=normalized_email,
            contactName=payload.contactName.strip(),
            businessName=payload.businessName.strip(),
            businessType=payload.businessType.strip(),
            phoneNumber=payload.phoneNumber.strip(),
            country=payload.country.strip(),
            createdAt=now_iso(),
            lastLoginAt=now_iso(),
        )
        save_buyer(connection, account, hash_password(payload.password.strip()))
        connection.commit()
    finally:
        connection.close()
    operation_log(account.contactName, "注册买家账号", account.email)
    return build_buyer_auth_user(account)


def authenticate_buyer_user(email: str, password: str) -> BuyerAuthUser:
    found = read_buyer_by_email(email)
    if not found:
        raise ValueError("账号不存在，请先注册。")
    account, password_hash = found
    if hash_password(password) != password_hash:
        raise ValueError("密码错误，请重新输入。")

    account.lastLoginAt = now_iso()
    connection = db_connection()
    try:
        save_buyer(connection, account, password_hash)
        connection.commit()
    finally:
        connection.close()
    operation_log(account.contactName, "登录买家账号", account.email)
    return build_buyer_auth_user(account)


def get_user_by_token(token: str) -> Optional[AuthUser]:
    session = read_session(token)
    if not session:
        return None
    subject_type, subject_id = session
    if subject_type != "admin":
        return None
    member = get_member(subject_id)
    if not member or member.status != "active":
        return None
    return build_auth_user(member)


def get_buyer_by_token(token: str) -> Optional[BuyerAuthUser]:
    session = read_session(token)
    if not session:
        return None
    subject_type, subject_id = session
    if subject_type != "buyer":
        return None
    found = read_buyer_by_id(subject_id)
    if not found:
        return None
    return build_buyer_auth_user(found[0])


def list_member_records() -> List[MemberRecord]:
    connection = db_connection()
    try:
        rows = connection.execute("SELECT payload FROM members ORDER BY username ASC").fetchall()
        members = []
        for row in rows:
            member = model_from_dict(MemberRecord, json_loads(row["payload"]))
            refresh_member_login_snapshot(connection, member)
            members.append(member)
        return members
    finally:
        connection.close()


def list_role_records() -> List[RoleRecord]:
    counts = {}
    for member in list_member_records():
        counts[member.role] = counts.get(member.role, 0) + 1
    return [
        RoleRecord(
            key=key,
            label=data["label"],
            description=data["description"],
            permissions=list(data["permissions"]),
            memberCount=counts.get(key, 0),
        )
        for key, data in ROLE_DEFINITIONS.items()
    ]


def invite_member(payload: InviteMemberPayload) -> MemberRecord:
    existing = get_member(payload.username)
    if existing:
        raise ValueError("账号已存在，请更换用户名。")
    member = MemberRecord(
        username=payload.username,
        displayName=payload.displayName,
        email=payload.email,
        role=payload.role,
        status="invited",
        lastLogin="尚未登录",
        lastLoginDevice="",
        permissions=permissions_for_role(payload.role),
    )
    connection = db_connection()
    try:
        save_member(connection, member, hash_password(payload.tempPassword))
        connection.commit()
    finally:
        connection.close()
    operation_log("李华", "邀请成员", "{} / {}".format(payload.username, ROLE_DEFINITIONS[payload.role]["label"]))
    return member


def update_member_role(username: str, payload: UpdateMemberRolePayload) -> Optional[MemberRecord]:
    found = read_member(username)
    if not found:
        return None
    member, password_hash = found
    member.role = payload.role
    member.permissions = permissions_for_role(payload.role)
    connection = db_connection()
    try:
        save_member(connection, member, password_hash)
        connection.commit()
    finally:
        connection.close()
    operation_log("李华", "调整成员角色", "{} -> {}".format(username, ROLE_DEFINITIONS[payload.role]["label"]))
    return member


def update_member_status(username: str, payload: UpdateMemberStatusPayload) -> Optional[MemberRecord]:
    found = read_member(username)
    if not found:
        return None
    member, password_hash = found
    member.status = payload.status
    connection = db_connection()
    try:
        save_member(connection, member, password_hash)
        connection.commit()
    finally:
        connection.close()
    operation_log("李华", "调整成员状态", "{} -> {}".format(username, payload.status))
    return member


def reset_member_password(username: str, payload: ResetPasswordPayload) -> Optional[MemberRecord]:
    if len(payload.newPassword.strip()) < 6:
        raise ValueError("新密码至少需要 6 位。")
    found = read_member(username)
    if not found:
        return None
    member, _ = found
    connection = db_connection()
    try:
        save_member(connection, member, hash_password(payload.newPassword.strip()))
        connection.commit()
    finally:
        connection.close()
    operation_log("李华", "重置成员密码", username)
    return member


def change_password(payload: ChangePasswordPayload) -> bool:
    found = read_member(payload.username)
    if not found:
        return False
    member, password_hash = found
    if hash_password(payload.currentPassword) != password_hash:
        raise ValueError("当前密码不正确。")
    connection = db_connection()
    try:
        save_member(connection, member, hash_password(payload.newPassword))
        connection.commit()
    finally:
        connection.close()
    operation_log(member.displayName, "修改密码", payload.username)
    return True


def update_settings(payload: SettingsRecord) -> SettingsRecord:
    connection = db_connection()
    try:
        save_settings_record(connection, payload)
        connection.commit()
    finally:
        connection.close()
    operation_log("李华", "更新店铺设置", payload.shopName)
    return payload


def list_operation_logs() -> List[OperationLogRecord]:
    return read_all_logs()


def list_login_logs(username: str = "") -> List[LoginLogRecord]:
    return read_all_login_logs(username)


def create_paypal_payment(request: PayPalPaymentRequest) -> PayPalPaymentResponse:
    conn = db_connection()
    try:
        payment_id = f"PAY-{uuid4().hex[:16].upper()}"
        approval_url = f"https://www.sandbox.paypal.com/checkoutnow?token={payment_id}"
        
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO paypal_payments (payment_id, order_id, amount, currency, status, return_url, cancel_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'created', ?, ?, ?, ?)
            """,
            (payment_id, request.orderId, request.amount, request.currency, request.returnUrl, request.cancelUrl, now_iso(), now_iso())
        )
        conn.commit()
        
        return PayPalPaymentResponse(
            paymentId=payment_id,
            approvalUrl=approval_url,
            status="created"
        )
    finally:
        conn.close()


def capture_paypal_payment(request: PayPalPaymentCaptureRequest) -> PayPalPaymentStatus:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE paypal_payments
            SET status = 'approved', updated_at = ?
            WHERE payment_id = ?
            """,
            (now_iso(), request.paymentId)
        )
        conn.commit()
        
        return get_paypal_payment_status(request.paymentId)
    finally:
        conn.close()


def get_paypal_payment_status(payment_id: str) -> PayPalPaymentStatus:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT payment_id, status, amount, currency, created_at, updated_at
            FROM paypal_payments
            WHERE payment_id = ?
            """,
            (payment_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        return PayPalPaymentStatus(
            paymentId=row[0],
            status=row[1],
            amount=row[2],
            currency=row[3],
            createdAt=row[4],
            updatedAt=row[5]
        )
    finally:
        conn.close()


def get_cart_items(buyer_id: str) -> List[dict]:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT product_id, quantity
            FROM cart
            WHERE buyer_id = ?
            """,
            (buyer_id,)
        )
        rows = cursor.fetchall()
        return [{"productId": row[0], "quantity": row[1]} for row in rows]
    finally:
        conn.close()


def add_cart_item(buyer_id: str, product_id: str, quantity: int) -> dict:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO cart (buyer_id, product_id, quantity, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(buyer_id, product_id) 
            DO UPDATE SET quantity = quantity + excluded.quantity, updated_at = ?
            """,
            (buyer_id, product_id, quantity, now_iso(), now_iso())
        )
        conn.commit()
        return {"productId": product_id, "quantity": quantity}
    finally:
        conn.close()


def update_cart_item(buyer_id: str, product_id: str, quantity: int) -> dict:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE cart
            SET quantity = ?, updated_at = ?
            WHERE buyer_id = ? AND product_id = ?
            """,
            (quantity, now_iso(), buyer_id, product_id)
        )
        conn.commit()
        return {"productId": product_id, "quantity": quantity}
    finally:
        conn.close()


def remove_cart_item(buyer_id: str, product_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM cart
            WHERE buyer_id = ? AND product_id = ?
            """,
            (buyer_id, product_id)
        )
        conn.commit()
    finally:
        conn.close()


def clear_cart(buyer_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM cart
            WHERE buyer_id = ?
            """,
            (buyer_id,)
        )
        conn.commit()
    finally:
        conn.close()


def get_favorites(buyer_id: str) -> dict:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT product_id, brand_id
            FROM favorites
            WHERE buyer_id = ?
            """,
            (buyer_id,)
        )
        rows = cursor.fetchall()
        products = [row[0] for row in rows if row[0]]
        brands = [row[1] for row in rows if row[1]]
        return {"products": products, "brands": brands}
    finally:
        conn.close()


def add_favorite_product(buyer_id: str, product_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO favorites (buyer_id, product_id, created_at)
            VALUES (?, ?, ?)
            """,
            (buyer_id, product_id, now_iso())
        )
        conn.commit()
    finally:
        conn.close()


def remove_favorite_product(buyer_id: str, product_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM favorites
            WHERE buyer_id = ? AND product_id = ?
            """,
            (buyer_id, product_id)
        )
        conn.commit()
    finally:
        conn.close()


def add_favorite_brand(buyer_id: str, brand_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO favorites (buyer_id, brand_id, created_at)
            VALUES (?, ?, ?)
            """,
            (buyer_id, brand_id, now_iso())
        )
        conn.commit()
    finally:
        conn.close()


def remove_favorite_brand(buyer_id: str, brand_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM favorites
            WHERE buyer_id = ? AND brand_id = ?
            """,
            (buyer_id, brand_id)
        )
        conn.commit()
    finally:
        conn.close()


def get_compare_items(buyer_id: str) -> dict:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT product_id, brand_id
            FROM compare
            WHERE buyer_id = ?
            """,
            (buyer_id,)
        )
        rows = cursor.fetchall()
        products = [row[0] for row in rows if row[0]]
        brands = [row[1] for row in rows if row[1]]
        return {"products": products, "brands": brands}
    finally:
        conn.close()


def add_compare_product(buyer_id: str, product_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO compare (buyer_id, product_id, created_at)
            VALUES (?, ?, ?)
            """,
            (buyer_id, product_id, now_iso())
        )
        conn.commit()
    finally:
        conn.close()


def remove_compare_product(buyer_id: str, product_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM compare
            WHERE buyer_id = ? AND product_id = ?
            """,
            (buyer_id, product_id)
        )
        conn.commit()
    finally:
        conn.close()


def add_compare_brand(buyer_id: str, brand_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO compare (buyer_id, brand_id, created_at)
            VALUES (?, ?, ?)
            """,
            (buyer_id, brand_id, now_iso())
        )
        conn.commit()
    finally:
        conn.close()


def remove_compare_brand(buyer_id: str, brand_id: str) -> None:
    conn = db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM compare
            WHERE buyer_id = ? AND brand_id = ?
            """,
            (buyer_id, brand_id)
        )
        conn.commit()
    finally:
        conn.close()
