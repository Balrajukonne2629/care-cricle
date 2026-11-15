'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Delete, Shield, Check, User, AlertOctagon } from 'lucide-react';
import { ROLE_PINS } from '@/lib/db';
import { UserRolePin } from '@/lib/types';
import SoundService from '@/lib/soundService';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected: (role: UserRolePin) => void;
  currentRole: UserRolePin;
}

export default function PasscodeModal({
  isOpen,
  onClose,
  onRoleSelected,
  currentRole,
}: PasscodeModalProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Rate limiting countdown
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setInterval(() => {
        setLockoutTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTimer]);

  const validatePin = useCallback(
    (code: string) => {
      if (lockoutTimer > 0) return;

      const matched = ROLE_PINS.find(r => r.pin === code);
      if (matched) {
        SoundService.playPillTaken();
        onRoleSelected(matched);
        setPin('');
        setErrorMsg('');
        setFailedAttempts(0);
        onClose();
      } else {
        SoundService.playTap();
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);

        if (nextFailed >= 5) {
          setLockoutTimer(30);
          setErrorMsg('Too many failed attempts. Security lockout for 30 seconds.');
        } else {
          setErrorMsg(`Incorrect PIN (${5 - nextFailed} attempts remaining). Try 1234, 5678, 9999, or 4321.`);
        }

        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 700);
      }
    },
    [failedAttempts, lockoutTimer, onClose, onRoleSelected]
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (lockoutTimer > 0) return;
      SoundService.playTap();
      if (pin.length >= 4) return;
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg('');

      if (newPin.length === 4) {
        validatePin(newPin);
      }
    },
    [lockoutTimer, pin, validatePin]
  );

  const handleBackspace = useCallback(() => {
    if (lockoutTimer > 0) return;
    SoundService.playTap();
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  }, [lockoutTimer]);

  const handleClear = useCallback(() => {
    SoundService.playTap();
    setPin('');
    setErrorMsg('');
  }, []);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleBackspace, onClose]);

  if (!isOpen) return null;

  const quickSwitch = (r: UserRolePin) => {
    SoundService.playPillTaken();
    onRoleSelected(r);
    setPin('');
    setFailedAttempts(0);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="passcode-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className={`bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={() => {
              SoundService.playTap();
              onClose();
            }}
            aria-label="Close authentication modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/15">
              <Shield className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 id="passcode-title" className="text-xl font-bold tracking-tight">Care Profile Authentication</h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">Enter 4-digit security PIN to unlock role</p>
            </div>
          </div>
        </div>

        {/* PIN display indicator */}
        <div className="p-6 text-center">
          <div className="flex justify-center space-x-4 my-3" aria-label={`Current PIN length: ${pin.length} digits`}>
            {[0, 1, 2, 3].map(idx => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  pin.length > idx
                    ? 'bg-emerald-600 scale-125 shadow-sm shadow-emerald-600/40'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {lockoutTimer > 0 ? (
            <div className="flex items-center justify-center space-x-1.5 text-sm font-bold text-rose-600 mt-2 bg-rose-50 p-2 rounded-xl border border-rose-200">
              <AlertOctagon className="w-4 h-4" />
              <span>Lockout active: {lockoutTimer}s remaining</span>
            </div>
          ) : errorMsg ? (
            <p className="text-sm font-semibold text-rose-600 mt-2" role="alert">{errorMsg}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-2">
              Active profile: <strong className="text-slate-700">{currentRole.label}</strong> • Use on-screen numpad or physical keyboard
            </p>
          )}

          {/* Tactile Keypad */}
          <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mt-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                disabled={lockoutTimer > 0}
                aria-label={`Digit ${num}`}
                className="h-14 rounded-2xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40 text-slate-800 hover:text-emerald-900 font-bold text-2xl border border-slate-200/80 shadow-sm transition active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={lockoutTimer > 0}
              aria-label="Clear PIN entry"
              className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs border border-slate-200 transition active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Clear
            </button>
            <button
              onClick={() => handleDigit('0')}
              disabled={lockoutTimer > 0}
              aria-label="Digit 0"
              className="h-14 rounded-2xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40 text-slate-800 hover:text-emerald-900 font-bold text-2xl border border-slate-200/80 shadow-sm transition active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              disabled={lockoutTimer > 0}
              aria-label="Backspace"
              className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Instant Profile Switcher:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_PINS.map(r => (
                <button
                  key={r.pin}
                  onClick={() => quickSwitch(r)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    currentRole.role === r.role
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${r.avatarColor}`} />
                  <div className="truncate flex-1">
                    <span className="block font-bold truncate">{r.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">PIN: {r.pin}</span>
                  </div>
                  {currentRole.role === r.role && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
