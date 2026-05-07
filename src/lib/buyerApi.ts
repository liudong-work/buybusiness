import type { BuyerUser, Inquiry } from '@/types';
import {
  clearStoredBuyerSession,
  getStoredBuyerAccessToken,
  setStoredBuyerSession,
  type BuyerSession,
} from '@/lib/buyerAuth';

interface BuyerAuthResponse extends BuyerSession {}

const inquiryEventName = 'buybusiness:inquiries-updated';

function dispatchInquiryUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(inquiryEventName));
}

export function subscribeBuyerInquiryUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(inquiryEventName, listener);
  return () => window.removeEventListener(inquiryEventName, listener);
}

async function requestJson<T>(path: string, init: RequestInit = {}, requiresAuth = true): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = getStoredBuyerAccessToken();
    if (!token) {
      throw new Error('请先登录后再继续操作。');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let detail = '请求失败，请稍后重试。';
    try {
      const data = (await response.json()) as { detail?: string };
      detail = data.detail || detail;
    } catch {
      // Ignore non-JSON errors and use the fallback detail.
    }

    if (response.status === 401 && requiresAuth) {
      clearStoredBuyerSession();
    }

    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export async function registerBuyer(payload: {
  contactName: string;
  email: string;
  password: string;
  businessName: string;
  businessType: string;
  phoneNumber: string;
  country: string;
}) {
  const session = await requestJson<BuyerAuthResponse>(
    '/buyer/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    false
  );
  setStoredBuyerSession(session);
  return session;
}

export async function loginBuyer(payload: { email: string; password: string; deviceName?: string }) {
  const session = await requestJson<BuyerAuthResponse>(
    '/buyer/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    false
  );
  setStoredBuyerSession(session);
  return session;
}

export async function fetchBuyerProfile() {
  return requestJson<BuyerUser>('/buyer/auth/me');
}

export async function fetchBuyerInquiries() {
  return requestJson<Inquiry[]>('/buyer/inquiries');
}

export async function fetchBuyerInquiryDetail(inquiryId: string) {
  return requestJson<Inquiry>(`/buyer/inquiries/${inquiryId}`);
}

export async function createBuyerInquiry(payload: {
  source: Inquiry['source'];
  buyerName: string;
  company: string;
  role: string;
  destinationCountry: string;
  targetPrice: string;
  message: string;
  needSample: boolean;
  brandId?: string;
  brandName?: string;
  productId?: string;
  productName?: string;
  items: Inquiry['items'];
}) {
  const inquiry = await requestJson<Inquiry>('/buyer/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  dispatchInquiryUpdated();
  return inquiry;
}

export async function createBuyerInquiryFollowUp(inquiryId: string, message: string) {
  const inquiry = await requestJson<Inquiry>(`/buyer/inquiries/${inquiryId}/follow-ups`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  dispatchInquiryUpdated();
  return inquiry;
}
