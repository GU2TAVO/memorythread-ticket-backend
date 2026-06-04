import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

import { db, isConfigured, handleFirestoreError, OperationType } from './firebase';
import { Ticket, TicketFilters } from './types';

const SALESFORCE_API_BASE = "http://localhost:4000/api";

/**
 * =========================
 * SALESFORCE BRIDGE CALL
 * =========================
 */
async function pushToSalesforce(ticket) {
  const res = await fetch(`${SALESFORCE_API_BASE}/case`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      subject: ticket.subject,
      description: ticket.description,
      customerEmail: ticket.customerEmail,
      customerName: ticket.customerName,
      severity: ticket.severity
    })
  });

  if (!res.ok) {
    throw new Error("Salesforce API failed");
  }

  return await res.json();
}

/**
 * =========================
 * LOCAL STORAGE
 * =========================
 */
const LOCAL_STORAGE_KEY = "customer_support_tickets";

function generateTicketId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";

  for (let i = 0; i < 4; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }

  return `TCK-${dateStr}-${rand}`;
}

function getLocalTickets() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalTickets(tickets) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
}

/**
 * =========================
 * SERVICE
 * =========================
 */
export const TicketService = {

  async createTicket(fields) {
    const id = generateTicketId();
    const now = new Date().toISOString();

    const ticket = {
      ...fields,
      id,
      status: "open",
      createdAt: now,
      updatedAt: now
    };

    let salesforceCaseId = null;

    /**
     * 1. SAVE LOCALLY / FIRESTORE FIRST
     */
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, "tickets", id), ticket);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `tickets/${id}`);
      }
    } else {
      const existing = getLocalTickets();
      existing.unshift(ticket);
      saveLocalTickets(existing);
    }

    /**
     * 2. PUSH TO SALESFORCE (BACKEND)
     */
    try {
      const sf = await pushToSalesforce(ticket);
      salesforceCaseId = sf?.caseId || null;
    } catch (err) {
      console.warn("Salesforce sync failed:", err.message);
    }

    return {
      ...ticket,
      salesforceCaseId
    };
  },

  async getTicket(id) {
    if (isConfigured && db) {
      const snap = await getDoc(doc(db, "tickets", id));
      return snap.exists() ? snap.data() : null;
    }

    return getLocalTickets().find(t => t.id === id) || null;
  },

  async updateTicket(id, updates) {
    const clean = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (isConfigured && db) {
      await updateDoc(doc(db, "tickets", id), clean);
    } else {
      const updated = getLocalTickets().map(t =>
        t.id === id ? { ...t, ...clean } : t
      );
      saveLocalTickets(updated);
    }
  },

  async listTickets(filters) {
    let tickets = [];

    if (isConfigured && db) {
      const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      snap.forEach(d => tickets.push(d.data()));
    } else {
      tickets = getLocalTickets();
    }

    return this.applyFilters(tickets, filters);
  },

  async deleteTicket(id) {
    if (isConfigured && db) {
      await deleteDoc(doc(db, "tickets", id));
    } else {
      saveLocalTickets(getLocalTickets().filter(t => t.id !== id));
    }
  },

  applyFilters(tickets, filters) {
    return tickets.filter(ticket => {
      if (filters.status !== "all" && ticket.status !== filters.status) return false;
      if (filters.category !== "all" && ticket.category !== filters.category) return false;
      if (filters.severity !== "all" && ticket.severity !== filters.severity) return false;

      if (filters.search) {
        const s = filters.search.toLowerCase();
        return (
          ticket.subject.toLowerCase().includes(s) ||
          ticket.description.toLowerCase().includes(s) ||
          ticket.id.toLowerCase().includes(s) ||
          ticket.customerName.toLowerCase().includes(s) ||
          ticket.customerEmail.toLowerCase().includes(s)
        );
      }

      return true;
    });
  }
};