export type TicketCategory = 'technical' | 'billing' | 'account' | 'feature_request' | 'other';
export type TicketSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string; // TCK-YYYYMMDD-XXXX
  subject: string;
  description: string;
  category: TicketCategory;
  severity: TicketSeverity;
  customerName: string;
  customerEmail: string;
  status: TicketStatus;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  staffNotes?: string;
}

export interface TicketFilters {
  status: TicketStatus | 'all';
  category: TicketCategory | 'all';
  severity: TicketSeverity | 'all';
  search: string;
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Technical Issue',
  billing: 'Billing & Payments',
  account: 'Account Access',
  feature_request: 'Feature Request',
  other: 'General Inquiry'
};

export const SEVERITY_LABELS: Record<TicketSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};
