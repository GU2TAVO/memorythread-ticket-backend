import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TicketService } from '../ticketService';
import { Ticket, STATUS_LABELS, SEVERITY_LABELS, CATEGORY_LABELS } from '../types';
import { 
  Search, 
  Clock, 
  Check, 
  HelpCircle, 
  CheckCircle, 
  User, 
  Calendar, 
  AlertTriangle, 
  Tag,
  ArrowRight,
  MessageSquare,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

interface TicketTrackerProps {
  initialTicketId?: string;
}

export default function TicketTracker({ initialTicketId = '' }: TicketTrackerProps) {
  const [ticketId, setTicketId] = useState(initialTicketId);
  const [searchEmail, setSearchEmail] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load ticket automatically if initialTicketId changes
  useEffect(() => {
    if (initialTicketId) {
      setTicketId(initialTicketId);
      handleSearch(null, initialTicketId);
    }
  }, [initialTicketId]);

  const handleSearch = async (e: React.FormEvent | null, idToSearch = ticketId) => {
    if (e) e.preventDefault();
    if (!idToSearch.trim()) return;

    setIsLoading(true);
    setSearchAttempted(true);
    setSuccessMessage(null);

    try {
      const found = await TicketService.getTicket(idToSearch.trim().toUpperCase());
      if (found) {
        // Simple security constraint: if they provide searchEmail, ensure it matches
        if (searchEmail.trim() && found.customerEmail.toLowerCase() !== searchEmail.trim().toLowerCase()) {
          setTicket(null);
        } else {
          setTicket(found);
        }
      } else {
        setTicket(null);
      }
    } catch (err) {
      console.error(err);
      setTicket(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;
    setIsUpdating(true);
    try {
      await TicketService.updateTicket(ticket.id, { status: 'closed' });
      const refreshed = await TicketService.getTicket(ticket.id);
      setTicket(refreshed);
      setSuccessMessage('Ticket marked as closed successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAppendUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !newUpdateText.trim()) return;

    setIsUpdating(true);
    try {
      // Append additional details inside the description
      const updatedDescription = `${ticket.description}\n\n--- Customer Update (${new Date().toLocaleDateString()}): ---\n${newUpdateText.trim()}`;
      await TicketService.updateTicket(ticket.id, { description: updatedDescription });
      const refreshed = await TicketService.getTicket(ticket.id);
      setTicket(refreshed);
      setNewUpdateText('');
      setSuccessMessage('Update added to ticket details.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStepClass = (step: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    if (!ticket) return 'border-slate-200 text-slate-400 bg-slate-50';
    
    const statusOrder = ['open', 'in_progress', 'resolved', 'closed'];
    const currentIdx = statusOrder.indexOf(ticket.status);
    const stepIdx = statusOrder.indexOf(step);

    if (ticket.status === 'closed' && step === 'closed') {
      return 'border-slate-500 text-white bg-slate-600';
    }

    if (stepIdx < currentIdx) {
      return 'border-emerald-500 text-white bg-emerald-500';
    } else if (stepIdx === currentIdx) {
      if (ticket.status === 'resolved') return 'border-emerald-500 text-emerald-600 bg-emerald-50 font-semibold ring-2 ring-emerald-500/10';
      if (ticket.status === 'in_progress') return 'border-indigo-500 text-indigo-600 bg-indigo-50 font-semibold ring-2 ring-indigo-500/10';
      return 'border-blue-500 text-blue-600 bg-blue-50 font-semibold ring-2 ring-indigo-500/10';
    }
    return 'border-slate-200 text-slate-400 bg-white';
  };

  const isCompletedStep = (step: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    if (!ticket) return false;
    const statusOrder = ['open', 'in_progress', 'resolved', 'closed'];
    const currentIdx = statusOrder.indexOf(ticket.status);
    const stepIdx = statusOrder.indexOf(step);
    return stepIdx < currentIdx;
  };

  return (
    <div className="space-y-8">
      {/* Lookup Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-10 md:p-12">
        <div className="text-left">
          <h2 className="font-display font-semibold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
            Track Ticket Status
          </h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Enter your secure support ticket reference code to search live diagnostic progress, notes, and agent updates.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 leading-none">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Ticket Code ID</label>
              <input
                id="tracker-ticket-id"
                type="text"
                required
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="TCK-YYYYMMDD-XXXX"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 font-mono text-sm transition-all"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Your Email (Verification)</label>
              <input
                id="tracker-ticket-email"
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-sm transition-all"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                id="btn-tracker-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Lookup
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Lookup Results */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mb-3" />
            <span className="text-sm font-medium">Fetching secure ticket history...</span>
          </motion.div>
        ) : ticket ? (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Ticket Header & Status Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="bg-gray-50 text-gray-800 font-mono text-xs px-2.5 py-1 rounded-md font-semibold border border-gray-200/60">
                      {ticket.id}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      ticket.status === 'open' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                      ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-gray-150 text-gray-600'
                    }`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-2xl text-gray-900 mt-3 text-balance leading-tight">
                    {ticket.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-400 mt-3">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-300" />
                      {ticket.customerName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-300" />
                      Logged {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Quick Resolve trigger */}
                {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                  <div>
                    <button
                      id="btn-tracker-close"
                      onClick={handleCloseTicket}
                      disabled={isUpdating}
                      className="cursor-pointer border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="h-4 w-4 text-gray-400" />
                      Mark as Settled / Closed
                    </button>
                  </div>
                )}
              </div>

              {/* Status Timeline Progress Card */}
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100/80">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-6">Service Timeline</h4>
                
                <div className="grid grid-cols-4 gap-2 relative">
                  {/* Background progress line */}
                  <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 -z-10" />

                  {/* Open Step */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs mb-3 transition-colors ${getStatusStepClass('open')}`}>
                      {isCompletedStep('open') ? <Check className="h-4 w-4" /> : '1'}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 block">Logged</span>
                  </div>

                  {/* In Progress Step */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs mb-3 transition-colors ${getStatusStepClass('in_progress')}`}>
                      {isCompletedStep('in_progress') ? <Check className="h-4 w-4" /> : '2'}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 block">In Review</span>
                  </div>

                  {/* Resolved Step */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs mb-3 transition-colors ${getStatusStepClass('resolved')}`}>
                      {isCompletedStep('resolved') ? <Check className="h-4 w-4" /> : '3'}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 block">Resolved</span>
                  </div>

                  {/* Closed Step */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs mb-3 transition-colors ${getStatusStepClass('closed')}`}>
                      {ticket.status === 'closed' ? <Check className="h-4 w-4" /> : '4'}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 block">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Information & Description Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Information Details */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Issue Description</h4>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-gray-700 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                    {ticket.description}
                  </div>
                </div>

                {/* Staff Response notes if resolved/replied */}
                {ticket.staffNotes ? (
                  <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5 mb-3">
                      <MessageSquare className="h-4 w-4" />
                      Agent Resolution Note
                    </h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                      {ticket.staffNotes}
                    </p>
                    <div className="text-[10px] text-gray-450 mt-4 italic">
                      Updated at {new Date(ticket.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 bg-gray-50/20 rounded-xl p-6 text-center text-gray-400">
                    <Clock className="h-5 w-5 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs font-medium">A support specialist is assigned. Updates will appear here.</p>
                  </div>
                )}

                {/* Success feedback toast */}
                {successMessage && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                  </div>
                )}

                {/* Append supplementary information to this ticket */}
                {ticket.status !== 'closed' && (
                  <form onSubmit={handleAppendUpdate} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
                        Provide Additional Details
                      </label>
                      <textarea
                        id="tracker-append-text"
                        rows={3}
                        required
                        value={newUpdateText}
                        onChange={(e) => setNewUpdateText(e.target.value)}
                        placeholder="Add supplementary context, error steps, files, or diagnostic checkups..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-sm transition-all resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        id="btn-tracker-append"
                        type="submit"
                        disabled={isUpdating || !newUpdateText.trim()}
                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        Send Update
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Side Parameters Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 h-fit space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-3">Ticket Specifications</h4>
                
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Impact Severity</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${
                      ticket.severity === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      ticket.severity === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      ticket.severity === 'medium' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {SEVERITY_LABELS[ticket.severity]}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Issue Category</span>
                    <span className="text-gray-900 text-sm font-semibold flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-indigo-500" />
                      {CATEGORY_LABELS[ticket.category]}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Contact Email</span>
                    <span className="text-gray-600 text-xs font-mono break-all select-all">
                      {ticket.customerEmail}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 space-y-1.5">
                    <div>Opened: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                    <div>Modified: {new Date(ticket.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : searchAttempted ? (
          <motion.div
            key="empty-results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-12 text-center"
          >
            <div className="bg-rose-50 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="font-display font-semibold text-lg text-gray-900">No Ticket Records Logged</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mt-2 leading-relaxed">
              Verify your Ticket Code (format TCK-YYYYMMDD-XXXX) and confirm your associated email reference digits.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
