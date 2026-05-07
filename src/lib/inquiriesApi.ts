import type { Inquiry } from '@/types';
import { apiClient } from './apiClient';
import { loadStoredInquiries, saveStoredInquiries } from './inquiries';

const inquiryEventName = 'buybusiness:inquiries-updated';

function dispatchInquiriesUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(inquiryEventName));
}

export function subscribeInquiryUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(inquiryEventName, listener);

  return () => {
    window.removeEventListener(inquiryEventName, listener);
  };
}

async function migrateInquiriesToServer() {
  const localInquiries = loadStoredInquiries();
  if (localInquiries.length === 0) return;

  try {
    for (const inquiry of localInquiries) {
      await apiClient.inquiries.create(inquiry);
    }
    localStorage.removeItem('buybusiness.inquiries');
    console.log('Inquiries migrated to server successfully');
  } catch (error) {
    console.error('Failed to migrate inquiries:', error);
  }
}

export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (!token) {
      await migrateInquiriesToServer();
      return [];
    }

    const inquiries = await apiClient.inquiries.getAll();
    return inquiries;
  } catch (error) {
    console.error('Failed to fetch inquiries from server, falling back to local storage:', error);
    return loadStoredInquiries();
  }
}

export async function getInquiryById(inquiryId: string): Promise<Inquiry | undefined> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (!token) {
      const localInquiries = loadStoredInquiries();
      return localInquiries.find((inquiry: Inquiry) => inquiry.id === inquiryId);
    }

    return await apiClient.inquiries.getById(inquiryId);
  } catch (error) {
    console.error('Failed to fetch inquiry from server:', error);
    return loadStoredInquiries().find((inquiry: Inquiry) => inquiry.id === inquiryId);
  }
}

export async function createInquiry(inquiry: Partial<Inquiry>): Promise<Inquiry> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      const newInquiry = await apiClient.inquiries.create(inquiry);
      dispatchInquiriesUpdated();
      return newInquiry;
    } else {
      const newInquiry = inquiry as Inquiry;
      saveStoredInquiries([newInquiry, ...loadStoredInquiries()]);
      dispatchInquiriesUpdated();
      return newInquiry;
    }
  } catch (error) {
    console.error('Failed to create inquiry:', error);
    throw error;
  }
}

export async function addInquiryFollowUp(inquiryId: string, message: string): Promise<void> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      await apiClient.inquiries.addFollowUp(inquiryId, message);
      dispatchInquiriesUpdated();
    }
  } catch (error) {
    console.error('Failed to add inquiry follow-up:', error);
    throw error;
  }
}