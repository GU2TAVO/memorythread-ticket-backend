/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Search, 
  ShieldAlert, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Lock
} from 'lucide-react';
import TicketForm from './components/TicketForm';
import TicketTracker from './components/TicketTracker';
import AgentDashboard from './components/AgentDashboard';
import { isConfigured } from './firebase';

type TabId = 'log' | 'track' | 'agent';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('log');
  
  // Track state for ticket created so we can auto-display it on the tracker tab
  const [createdTicketId, setCreatedTicketId] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastLoggedEmail, setLastLoggedEmail] = useState('');

  const handleTicketCreateSuccess = (ticketId: string, email: string) => {
    setCreatedTicketId(ticketId);
    setLastLoggedEmail(email);
    setShowSuccessModal(true);
  };

  const handleViewCreatedTicket = () => {
    setShowSuccessModal(false);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] flex flex-col font-sans">
      
      {/* Dynamic Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            
            {/* Branding Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              </div>
              <div>
                <span className="font-display font-bold text-lg tracking-tight block leading-none">
                  ResolveDesk
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1 block">
                  Customer Issue Portal
                </span>
              </div>
            </div>

            {/* Segment Controls */}
            <nav className="flex items-center gap-1 bg-gray-50 border border-gray-200/60 p-1 rounded-xl">
              <button
                id="tab-log-ticket"
                onClick={() => {
                  setActiveTab('log');
                  setCreatedTicketId('');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === 'log'
                    ? 'bg-white text-gray-950 border border-gray-250/20 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Log Issue
              </button>

              <button
                id="tab-track-ticket"
                onClick={() => setActiveTab('track')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === 'track'
                    ? 'bg-white text-gray-950 border border-gray-250/20 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                Track Ticket
              </button>

              <button
                id="tab-agent-portal"
                onClick={() => setActiveTab('agent')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === 'agent'
                    ? 'bg-white text-indigo-600 border border-gray-250/20 shadow-sm'
                    : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Specialist Desk
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'log' && (
              <div className="max-w-2xl mx-auto">
                <TicketForm onSuccess={handleTicketCreateSuccess} />
              </div>
            )}

            {activeTab === 'track' && (
              <TicketTracker initialTicketId={createdTicketId} />
            )}

            {activeTab === 'agent' && (
              <AgentDashboard />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Database Mode Status Bar (Footer Accent) */}
      <footer className="bg-white border-t border-gray-100 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div>
            &copy; {new Date().getFullYear()} ResolveDesk Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 rounded-full w-1.5 bg-indigo-600 animate-pulse" />
            <span className="font-mono text-[10.5px] uppercase tracking-wider flex items-center gap-1">
              <Database className="h-3 w-3 text-gray-400" />
              Database Status: {isConfigured ? 'Enterprise Cloud (Firestore)' : 'Zero-Config Local Persisted'}
            </span>
          </div>
        </div>
      </footer>

      {/* Success Modal / Confirmation dialog */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl shadow-gray-200/40 border border-gray-100 text-center space-y-6"
            >
              <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-semibold text-xl text-gray-900 leading-tight">
                  Support Ticket Logged!
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  We have registered your issue securely. Our support team has been notified and we will respond as soon as possible.
                </p>
              </div>

              {/* Secure Ticket Identifier Container */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/65 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Your Tracking Ticket Reference</span>
                <div className="font-mono font-bold text-lg text-indigo-700 select-all tracking-wide">
                  {createdTicketId}
                </div>
                <p className="text-[10px] text-gray-400">
                  Keep this code handy! You can look up real-time statuses and replies anytime.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  id="btn-dialog-track"
                  onClick={handleViewCreatedTicket}
                  className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-sm"
                >
                  View Details & Progress
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="cursor-pointer border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3.5 rounded-xl text-xs transition-all"
                >
                  Dismiss / Back to Forms
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
