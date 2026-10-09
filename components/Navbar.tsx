'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Camera, Search, Scale, User, Edit3, Globe, Bell } from 'lucide-react';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t.nav.scan, icon: Camera },
    { href: '/manual', label: t.nav.manual, icon: Edit3 },
    { href: '/ingredients', label: t.nav.search, icon: Search },
    { href: '/compare', label: t.nav.compare, icon: Scale },
    { href: '/preferences', label: t.nav.preferences, icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/85 border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md shadow-emerald-500/15 group-hover:shadow-emerald-500/30 transition-shadow bg-emerald-50 p-0.5">
              <img
                src="/logo.png"
                alt="FoodLens Logo"
                className="w-full h-full object-contain rounded-xl"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  FoodLens
                </span>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {language === 'bn' ? 'বাংলা' : 'EN'}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-normal tracking-wide hidden sm:block">
                {t.app.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center bg-slate-50/90 border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-300 shadow-[0_6px_16px_-8px_rgba(16,185,129,0.7)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              aria-label="Notifications"
              type="button"
              className="hidden sm:flex w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>

            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-medium shadow-inner">
              <Globe className="w-3.5 h-3.5 ml-1.5 mr-1 text-slate-400" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  language === 'en'
                    ? 'bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  language === 'bn'
                    ? 'bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 text-xs overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg whitespace-nowrap transition ${
                  isActive
                    ? 'text-emerald-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
