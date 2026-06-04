import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TicketService } from '../ticketService';
import { TicketCategory, TicketSeverity, CATEGORY_LABELS, SEVERITY_LABELS } from '../types';
import { 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  User, 
  Mail, 
  Tag, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface TicketFormProps {
  onSuccess: (ticketId: string, customerEmail: string) => void;
}

const SLA_INFO: Record<TicketSeverity, { text: string; color: string; icon: any }> = {
  low: { text: 'Within 48 hours', color: 'text-emerald-600 bg-emerald-55', icon: Clock },
  medium: { text: 'Within 24 hours', color: 'text-sky-600 bg-sky-55', icon: Clock },
  high: { text: 'Within 6 hours', color: 'text-amber-600 bg-amber-55', icon: AlertTriangle },
  critical: { text: 'Priority Response: Within 1-2 hours', color: 'text-rose-600 bg-rose-55', icon: AlertTriangle }
};

export default function TicketForm({ onSuccess }: TicketFormProps) {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [category, setCategory] = useState<TicketCategory>('technical');
  const [severity, setSeverity] = useState<TicketSeverity>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !subject.trim() || !description.trim()) {
      setErrorMsg('Please, fill out all fields.');
      return;
    }
    if (description.length < 10) {
      setErrorMsg('Description must be at least 10 characters long.');
      return;
    }
    
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const ticket = await TicketService.createTicket({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        category,
        severity,
        subject: subject.trim(),
        description: description.trim()
      });
      
      // Notify parent of success
      onSuccess(ticket.id, ticket.customerEmail);
      
      // Clear form
      setCustomerName('');
      setCustomerEmail('');
      setCategory('technical');
      setSeverity('medium');
      setSubject('');
      setDescription('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to log ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SLA = SLA_INFO[severity];
  const SlaIcon = SLA.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-10 md:p-12">
      <div className="mb-10 text-left">
        <h2 className="font-display font-semibold text-3xl text-gray-900 tracking-tight leading-tight mb-2.5">
          Submit a Ticket
        </h2>
        <p className="text-gray-500 leading-relaxed text-sm">
          Our support team is here to help. Fill out the details below and we'll respond as soon as possible, usually within 4 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information (Two-column grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Full Name
            </label>
            <div className="relative">
              <input
                id="form-customer-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-sm transition-all duration-150"
                placeholder="Alex Thompson"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Email Address
            </label>
            <div className="relative">
              <input
                id="form-customer-email"
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-sm transition-all duration-150"
                placeholder="alex@company.com"
              />
            </div>
          </div>
        </div>

        {/* Category & Urgency Selection (Two-column grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Issue Category
            </label>
            <select
              id="form-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-sm transition-all duration-150 cursor-pointer"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Urgency Level
            </label>
            <select
              id="form-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as TicketSeverity)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-sm transition-all duration-150 cursor-pointer"
            >
              {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Minimalist SLA Warning/Indication Badge */}
        <div className="p-4 rounded-xl border border-gray-200/50 bg-gray-50/50 flex items-start gap-3 transition-colors duration-200 text-gray-600">
          <div className="mt-0.5 text-indigo-600">
            <SlaIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Estimated Response SLA</div>
            <div className="text-sm font-medium">{SLA.text}</div>
          </div>
        </div>

        {/* Issue Subject */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Issue Title / Subject
          </label>
          <input
            id="form-subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-sm transition-all duration-150"
            placeholder="My billing invoice matches the wrong card"
          />
        </div>

        {/* Description TextArea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Detailed Explanation
          </label>
          <textarea
            id="form-description"
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-sm transition-all duration-150 resize-none"
            placeholder="Please provide as much detail as possible (steps to reproduce, error codes, systems, etc.). Minimum 10 characters."
          />
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Action */}
        <button
          id="btn-submit-ticket"
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging Ticket...
            </>
          ) : (
            <>
              Send Support Ticket
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
