"use client";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';

const getLS = (k: string, d: string) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const setLS = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

export default function PreferencesCard() {
  const { t, setLang: setGlobalLang, lang: globalLang } = useI18n();
  const [theme, setTheme] = useState('system');
  const [lang, setLang] = useState('system');
  const [font, setFont] = useState('default');
  const [contrast, setContrast] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(getLS('frenzy_pref_theme', 'system'));
  setLang(getLS('frenzy_pref_lang_full', 'system'));
    setFont(getLS('frenzy_pref_font', 'default'));
    setContrast(getLS('frenzy_pref_contrast', '0') === '1');
  setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setLS('frenzy_pref_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.remove('dark');
    else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', !!prefersDark);
    }
  }, [theme, ready]);

  useEffect(() => { 
    if (!ready) return;
    setLS('frenzy_pref_lang_full', lang);
    setGlobalLang(lang as any);
  }, [lang, setGlobalLang, ready]);
  useEffect(() => { 
    if (!ready) return;
    setLS('frenzy_pref_font', font);
    document.documentElement.style.fontSize = font === 'default' ? '' : (font === 'large' ? '17px' : '19px');
  }, [font, ready]);
  useEffect(() => { 
    if (!ready) return;
    setLS('frenzy_pref_contrast', contrast ? '1' : '0');
    document.documentElement.classList.toggle('high-contrast', contrast);
  }, [contrast, ready]);

  async function syncSettings(partial: Record<string, any>) {
    try { 
      const wallet = localStorage.getItem('last_connected_wallet'); 
      if (!wallet) return;
      const res = await fetch('/api/settings', { method:'PATCH', headers:{'Content-Type':'application/json','x-wallet':wallet}, body: JSON.stringify(partial) });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Saved');
    } catch { toast.error('Failed to save'); }
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" aria-labelledby="prefsHeading">
      <h2 id="prefsHeading" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preferences & Accessibility</h2>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Theme</span>
          <select value={theme} onChange={e=>{ setTheme(e.target.value); if (ready) syncSettings({ theme: e.target.value }); }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded px-2 py-1">
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">{t('prefs.language')}</span>
          <div className="flex items-center gap-2">
            <select value={lang} onChange={e=>{ setLang(e.target.value); if (ready) syncSettings({ language: e.target.value }); }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded px-2 py-1">
              <option value="system">System</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="zh">中文</option>
              <option value="hi">हिन्दी</option>
            </select>
            <button type="button" onClick={()=>{ setLang('system'); if (ready) syncSettings({ language: 'system' }); }} className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{t('prefs.resetSystem')}</button>
          </div>
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">Font size</span>
          <select value={font} onChange={e=>{ setFont(e.target.value); if (ready) syncSettings({ font_size: e.target.value }); }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded px-2 py-1">
            <option value="default">Default</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra large</option>
          </select>
        </label>
        <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3">
          <span className="text-gray-700 dark:text-gray-300">High contrast</span>
          <input type="checkbox" checked={contrast} onChange={e=>{ setContrast(e.target.checked); if (ready) syncSettings({ high_contrast: e.target.checked }); }} className="h-4 w-4 accent-frenzy dark:accent-gray-600" />
        </label>
      </div>
    </section>
  );
}
