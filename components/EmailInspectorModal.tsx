'use client';

import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle, RefreshCw, Eye, Code, ExternalLink } from 'lucide-react';
import { NotificationLog } from '@/lib/types';
import SoundService from '@/lib/soundService';

interface EmailInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationLog[];
  onTriggerTestEmail: (type: 'daily_schedule' | 'missed_dose' | 'refill' | 'sos') => Promise<void>;
}

export default function EmailInspectorModal({
  isOpen,
  onClose,
  notifications,
  onTriggerTestEmail,
}: EmailInspectorModalProps) {
  const [selectedNotif, setSelectedNotif] = useState<NotificationLog>(notifications[0]);
  const [viewTab, setViewTab] = useState<'preview' | 'html'>('preview');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendTest = async (type: 'daily_schedule' | 'missed_dose' | 'refill' | 'sos') => {
    setIsSending(true);
    SoundService.playTap();
    await onTriggerTestEmail(type);
    setIsSending(false);
  };

  const currentEmail = selectedNotif || notifications[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold tracking-tight">CareCircle Outbound Email & Alert Inspector</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SMTP / LIVE DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audits real-time notification dispatches sent to family caregivers, elders, and physicians.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundService.playTap();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Test Dispatch Toolbar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
          <span className="uppercase tracking-wider text-slate-500 text-[11px] mr-1">Dispatch Test Email:</span>
          <button
            onClick={() => handleSendTest('daily_schedule')}
            disabled={isSending}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-300 transition shadow-sm"
          >
            🌿 Morning Schedule
          </button>
          <button
            onClick={() => handleSendTest('missed_dose')}
            disabled={isSending}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 hover:text-amber-800 border border-slate-300 transition shadow-sm"
          >
            ⚠️ Missed Dose Alert
          </button>
          <button
            onClick={() => handleSendTest('refill')}
            disabled={isSending}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 hover:text-orange-800 border border-slate-300 transition shadow-sm"
          >
            💊 Low Refill Notice
          </button>
          <button
            onClick={() => handleSendTest('sos')}
            disabled={isSending}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-800 border border-slate-300 transition shadow-sm"
          >
            🚨 Emergency SOS
          </button>
        </div>

        {/* Two-pane layout: Email List (Left) + Email Preview (Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Email feed list */}
          <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/70 overflow-y-auto divide-y divide-slate-200">
            {notifications.map(item => {
              const isSelected = currentEmail?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    SoundService.playTap();
                    setSelectedNotif(item);
                  }}
                  className={`w-full text-left p-4 transition flex flex-col space-y-1 ${
                    isSelected ? 'bg-white border-l-4 border-l-emerald-600 shadow-sm' : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-800">{item.recipientName}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs truncate">{item.subject}</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{item.previewText}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">{item.recipientEmail}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Preview */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {currentEmail ? (
              <>
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-slate-400 font-bold uppercase mr-1">Subject:</span>
                      <strong className="text-slate-900 text-sm">{currentEmail.subject}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase mr-1">To:</span>
                      <span className="text-slate-700">{currentEmail.recipientName} &lt;{currentEmail.recipientEmail}&gt;</span>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => setViewTab('preview')}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        viewTab === 'preview' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rendered HTML</span>
                    </button>
                    <button
                      onClick={() => setViewTab('html')}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        viewTab === 'html' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Source Code</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-slate-100/50">
                  {viewTab === 'preview' ? (
                    <div
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 max-w-xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: currentEmail.htmlContent }}
                    />
                  ) : (
                    <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-2xl overflow-x-auto whitespace-pre-wrap">
                      {currentEmail.htmlContent}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Select an email notification to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
