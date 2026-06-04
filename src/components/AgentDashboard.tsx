import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TicketService } from '../ticketService';
import { Ticket, TicketFilters, STATUS_LABELS, SEVERITY_LABELS, CATEGORY_LABELS } from '../types';
import { 
  Inbox, 
  Search, 
  Filter, 
  MessageSquare, 
  Check, 
  Clock, 
  Trash2, 
  RefreshCw, 
  AlertOctagon, 
  Tag, 
  User, 
  Mail, 
  CheckCircle,
  X,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function AgentDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Filter state
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'all',
    category: 'all',
    severity: 'all',
    search: ''
  });

  // Action state
  const [staffNote, setStaffNote] = useState('');
  const [isActionPending, setIsActionPending] = useState(false);
  const [isDeleteConfirmId, setIsDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await TicketService.listTickets(filters);
      setTickets(data);
      
      // Update selected ticket details if it is still being viewed
      if (selectedTicket) {
        const freshSelected = data.find(t => t.id === selectedTicket.id);
        if (freshSelected) {
          setSelectedTicket(freshSelected);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: Ticket['status']) => {
    setIsActionPending(true);
    try {
      await TicketService.updateTicket(ticketId, { status });
      await fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleSaveStaffNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsActionPending(true);
    try {
      await TicketService.updateTicket(selectedTicket.id, { 
        staffNotes: staffNote.trim()
      });
      setStaffNote('');
      await fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    setIsActionPending(true);
    try {
      await TicketService.deleteTicket(ticketId);
      setSelectedTicket(null);
      setIsDeleteConfirmId(null);
      await fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionPending(false);
    }
  };

  // Statistic Counters based on fetched matching tickets
  const totalOpen = tickets.filter(t => t.status === 'open').length;
  const totalInProgress = tickets.filter(t => t.status === 'in_progress').length;
  const totalResolved = tickets.filter(t => t.status === 'resolved').length;
  const totalCritical = tickets.filter(t => t.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Overview Statistics Widget */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xl shadow-gray-200/20">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">New / Open</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display font-semibold text-2xl text-sky-600">{totalOpen}</span>
            <span className="text-xs text-gray-400">awaiting review</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xl shadow-gray-200/20">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">In Investigation</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display font-semibold text-2xl text-blue-600">{totalInProgress}</span>
            <span className="text-xs text-gray-400">active ticket notes</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xl shadow-gray-200/20">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Resolved</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display font-semibold text-2xl text-emerald-600">{totalResolved}</span>
            <span className="text-xs text-gray-400">cases closed</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xl shadow-gray-200/20">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Critical Impact</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`font-display font-semibold text-2xl ${totalCritical > 0 ? 'text-rose-600 animate-pulse' : 'text-gray-700'}`}>{totalCritical}</span>
            <span className="text-xs text-gray-400">high-urgency tickets</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Support Ticket Database List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
          {/* Header Controls */}
          <div className="p-6 border-b border-gray-100 space-y-4 bg-gray-55/30">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-gray-900 flex items-center gap-2">
                Specialist Management Portal
              </h3>
              <button
                id="btn-refresh-dashboard"
                onClick={fetchTickets}
                className="p-1 px-2.5 hover:bg-gray-150/40 rounded-lg text-xs text-gray-500 font-medium flex items-center gap-1 cursor-pointer transition-all border border-gray-200/40"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Status</label>
                <select
                  id="dashboard-filter-status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-gray-650 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Severity</label>
                <select
                  id="dashboard-filter-severity"
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-gray-655 cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Search Identifier</label>
                <div className="relative">
                  <input
                    id="dashboard-search-input"
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search name, text, code..."
                    className="w-full px-3 py-2 pl-8 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-gray-700"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Table / List Body */}
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400">
                <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
                <span className="text-xs">Database sync in progress...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-white">
                <Inbox className="h-8 w-8 mx-auto text-gray-205 mb-2" />
                <span className="text-xs block font-medium text-gray-500">No support tickets found matching specifications.</span>
                <span className="text-[10px] text-gray-400 mt-1 block">Try adjusting your filters or search query.</span>
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setStaffNote(t.staffNotes || '');
                  }}
                  className={`p-5 hover:bg-gray-50/50 transition-all cursor-pointer flex items-start justify-between gap-4 border-b border-gray-100/70 last:border-0 ${
                    selectedTicket?.id === t.id ? 'bg-indigo-50/15 border-l-4 border-indigo-600 pl-4' : ''
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60">
                        {t.id}
                      </span>
                      <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        t.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        t.severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        t.severity === 'medium' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        'bg-gray-50 text-gray-600 border-gray-150'
                      }`}>
                        {SEVERITY_LABELS[t.severity]}
                      </span>
                      <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        t.status === 'open' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                        t.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        t.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-gray-50 text-gray-600 border-gray-150'
                      }`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{t.subject}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{t.description}</p>
                    
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {t.customerName}
                      </span>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Ticket Detail Panel & Response Console */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6 md:p-8 space-y-6"
              >
                <div className="flex items-start justify-between border-b border-gray-100 pb-5">
                  <div>
                    <span className="font-mono text-xs font-semibold text-gray-400">{selectedTicket.id}</span>
                    <h3 className="font-display font-semibold text-lg text-gray-900 mt-1 leading-snug">{selectedTicket.subject}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-1 px-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Customer Information Panel */}
                <div className="bg-gray-50/70 rounded-xl p-4 space-y-2 border border-gray-150">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Requester / Contact</div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <User className="h-3.5 w-3.5 text-gray-450" />
                      <span className="font-semibold">{selectedTicket.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-755 break-all select-all">
                      <Mail className="h-3.5 w-3.5 text-gray-455" />
                      <span className="font-mono">{selectedTicket.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-450">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      <span>Category: {CATEGORY_LABELS[selectedTicket.category]}</span>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Customer Message</div>
                  <div className="bg-gray-50/50 text-xs text-gray-750 border border-gray-100 rounded-xl p-4 max-h-[180px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Quick actions to change ticket status */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Set Ticket Status</div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      id="action-set-inprogress"
                      disabled={isActionPending}
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                      className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        selectedTicket.status === 'in_progress' 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white hover:bg-gray-50 text-gray-650 border-gray-200 shadow-xs'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Investigate
                    </button>

                    <button
                      id="action-set-resolved"
                      disabled={isActionPending}
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                      className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        selectedTicket.status === 'resolved' 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white hover:bg-gray-50 text-gray-650 border-gray-200 shadow-xs'
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Resolve Cases
                    </button>

                    <button
                      id="action-set-closed"
                      disabled={isActionPending}
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                      className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        selectedTicket.status === 'closed' 
                          ? 'bg-gray-800 text-white border-gray-800' 
                          : 'bg-white hover:bg-gray-50 text-gray-650 border-gray-200 shadow-xs'
                      }`}
                    >
                      <X className="h-3.5 w-3.5" />
                      Shut Down / Close
                    </button>
                  </div>
                </div>

                {/* Add special resolution note (updates 'staffNotes') */}
                <form onSubmit={handleSaveStaffNotes} className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-2 leading-none">
                      Resolution Note (Sent to Client)
                    </label>
                    <textarea
                      id="dashboard-staff-note"
                      rows={3}
                      required
                      value={staffNote}
                      onChange={(e) => setStaffNote(e.target.value)}
                      placeholder="Write resolution steps, troubleshooting replies, or status updates to deliver to client..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 text-xs transition-all resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      id="btn-save-staff-notes"
                      type="submit"
                      disabled={isActionPending || staffNote.trim() === (selectedTicket.staffNotes || '')}
                      className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all disabled:opacity-50"
                    >
                      Save Specialist Note
                    </button>
                  </div>
                </form>

                {/* Permanent ticket deletion option (confirm trigger) */}
                <div className="pt-4 border-t border-gray-100">
                  {isDeleteConfirmId === selectedTicket.id ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-3">
                      <p className="text-[10.5px] text-rose-700 font-semibold leading-normal">
                        Are you sure you want to permanently erase this ticket registration? This action is irreversible.
                      </p>
                      <div className="flex gap-2">
                        <button
                          id="action-delete-confirm"
                          onClick={() => handleDeleteTicket(selectedTicket.id)}
                          className="cursor-pointer bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]"
                        >
                          Confirm Purge
                        </button>
                        <button
                          onClick={() => setIsDeleteConfirmId(null)}
                          className="cursor-pointer bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      id="action-delete-trigger"
                      onClick={() => setIsDeleteConfirmId(selectedTicket.id)}
                      className="cursor-pointer text-[10.5px] text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Erase Ticket Log Permanently
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 py-12 text-center text-gray-400 h-[380px] flex flex-col items-center justify-center shadow-xl shadow-gray-200/20"
              >
                <FileText className="h-10 w-10 text-gray-300 mb-3" />
                <h4 className="font-display font-semibold text-gray-800">No Selected Issue</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                  Choose a support ticket record on the left to inspect, allocate updates, or modify state variables.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
