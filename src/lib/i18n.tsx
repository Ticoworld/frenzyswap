"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'system' | 'en' | 'es' | 'fr' | 'zh' | 'hi';

type Dict = Record<string, string>;
type Bundle = Record<Exclude<Lang, 'system'>, Dict>;

const dicts: Bundle = {
  en: {
    'nav.back': 'Back',
    'nav.settings': 'Settings',
    'nav.quickStart': 'Quick Start',
    'nav.faq': 'FAQ',
    'nav.support': 'Support',
    'nav.profile': 'Profile',
    'nav.referrals': 'Referrals',
    'settings.title': 'Settings',
    'wallets.title': 'Wallets',
    'wallets.link': 'Add wallet',
    'wallets.unlink': 'Unlink',
    'wallets.setPrimary': 'Set Primary',
    'wallets.primary': 'Primary',
    'wallets.confirmUnlinkTitle': 'Unlink wallet',
    'wallets.confirmUnlinkBody': 'Are you sure you want to unlink this wallet? You can re-link later by signing again.',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'activity.title': 'Activity Log',
    'activity.exportJson': 'Export JSON',
    'activity.exportCsv': 'Export CSV',
    'activity.filter': 'Filter',
    'activity.start': 'Start',
    'activity.end': 'End',
    'activity.presets': 'Presets',
    'preset.last7': 'Last 7 days',
    'preset.last30': 'Last 30 days',
    'preset.last90': 'Last 90 days',
    'preset.custom': 'Custom Range',
    'prefs.language': 'Language',
    'prefs.resetSystem': 'Reset to system language',
    'prefs.detected': 'Detected language',
    'prefs.useDetected': 'Use detected',
    'toasts.linked': 'Wallet linked',
    'toasts.unlinked': 'Wallet unlinked',
    'toasts.primaryUpdated': 'Primary wallet updated',
    'toasts.failed': 'Action failed',
  },
  es: {
    'nav.back': 'Atrás',
    'nav.settings': 'Ajustes',
    'nav.quickStart': 'Inicio rápido',
    'nav.faq': 'FAQ',
    'nav.support': 'Soporte',
    'nav.profile': 'Perfil',
    'nav.referrals': 'Referidos',
    'settings.title': 'Ajustes',
    'wallets.title': 'Carteras',
    'wallets.link': 'Añadir cartera',
    'wallets.unlink': 'Desvincular',
    'wallets.setPrimary': 'Establecer principal',
    'wallets.primary': 'Principal',
    'wallets.confirmUnlinkTitle': 'Desvincular cartera',
    'wallets.confirmUnlinkBody': '¿Seguro que deseas desvincular esta cartera? Puedes volver a vincularla más tarde firmando de nuevo.',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'activity.title': 'Registro de actividad',
    'activity.exportJson': 'Exportar JSON',
    'activity.exportCsv': 'Exportar CSV',
    'activity.filter': 'Filtro',
    'activity.start': 'Inicio',
    'activity.end': 'Fin',
    'activity.presets': 'Preajustes',
    'preset.last7': 'Últimos 7 días',
    'preset.last30': 'Últimos 30 días',
    'preset.last90': 'Últimos 90 días',
    'preset.custom': 'Rango personalizado',
    'prefs.language': 'Idioma',
    'prefs.resetSystem': 'Restablecer a idioma del sistema',
    'prefs.detected': 'Idioma detectado',
    'prefs.useDetected': 'Usar detectado',
    'toasts.linked': 'Cartera vinculada',
    'toasts.unlinked': 'Cartera desvinculada',
    'toasts.primaryUpdated': 'Cartera principal actualizada',
    'toasts.failed': 'Acción fallida',
  },
  fr: {
    'nav.back': 'Retour',
    'nav.settings': 'Paramètres',
    'nav.quickStart': 'Démarrage rapide',
    'nav.faq': 'FAQ',
    'nav.support': 'Support',
    'nav.profile': 'Profil',
    'nav.referrals': 'Parrainages',
    'settings.title': 'Paramètres',
    'wallets.title': 'Portefeuilles',
    'wallets.link': 'Ajouter un portefeuille',
    'wallets.unlink': 'Dissocier',
    'wallets.setPrimary': 'Définir comme principal',
    'wallets.primary': 'Principal',
    'wallets.confirmUnlinkTitle': 'Dissocier le portefeuille',
    'wallets.confirmUnlinkBody': 'Êtes-vous sûr de vouloir dissocier ce portefeuille ? Vous pourrez le lier à nouveau plus tard en signant.',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'activity.title': 'Journal d’activité',
    'activity.exportJson': 'Exporter JSON',
    'activity.exportCsv': 'Exporter CSV',
    'activity.filter': 'Filtre',
    'activity.start': 'Début',
    'activity.end': 'Fin',
    'activity.presets': 'Préréglages',
    'preset.last7': '7 derniers jours',
    'preset.last30': '30 derniers jours',
    'preset.last90': '90 derniers jours',
    'preset.custom': 'Plage personnalisée',
    'prefs.language': 'Langue',
    'prefs.resetSystem': 'Réinitialiser à la langue du système',
    'prefs.detected': 'Langue détectée',
    'prefs.useDetected': 'Utiliser détectée',
    'toasts.linked': 'Portefeuille lié',
    'toasts.unlinked': 'Portefeuille dissocié',
    'toasts.primaryUpdated': 'Portefeuille principal mis à jour',
    'toasts.failed': 'Échec de l’action',
  },
  zh: {
    'nav.back': '返回',
    'nav.settings': '设置',
    'nav.quickStart': '快速开始',
    'nav.faq': '常见问题',
    'nav.support': '支持',
    'nav.profile': '个人资料',
    'nav.referrals': '邀请',
    'settings.title': '设置',
    'wallets.title': '钱包',
    'wallets.link': '添加钱包',
    'wallets.unlink': '解绑',
    'wallets.setPrimary': '设为主钱包',
    'wallets.primary': '主',
    'wallets.confirmUnlinkTitle': '解绑钱包',
    'wallets.confirmUnlinkBody': '确定要解绑该钱包吗？您可以稍后再次签名以重新绑定。',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'activity.title': '活动日志',
    'activity.exportJson': '导出 JSON',
    'activity.exportCsv': '导出 CSV',
    'activity.filter': '筛选',
    'activity.start': '开始',
    'activity.end': '结束',
    'activity.presets': '预设',
    'preset.last7': '最近 7 天',
    'preset.last30': '最近 30 天',
    'preset.last90': '最近 90 天',
    'preset.custom': '自定义范围',
    'prefs.language': '语言',
    'prefs.resetSystem': '重置为系统语言',
    'prefs.detected': '检测到的语言',
    'prefs.useDetected': '使用检测语言',
    'toasts.linked': '钱包已绑定',
    'toasts.unlinked': '钱包已解绑',
    'toasts.primaryUpdated': '主钱包已更新',
    'toasts.failed': '操作失败',
  },
  hi: {
    'nav.back': 'वापस',
    'nav.settings': 'सेटिंग्स',
    'nav.quickStart': 'त्वरित आरंभ',
    'nav.faq': 'सामान्य प्रश्न',
    'nav.support': 'सहायता',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.referrals': 'रेफरल',
    'settings.title': 'सेटिंग्स',
    'wallets.title': 'वॉलेट',
    'wallets.link': 'वॉलेट जोड़ें',
    'wallets.unlink': 'अनलिंक',
    'wallets.setPrimary': 'प्राथमिक बनाएँ',
    'wallets.primary': 'प्राथमिक',
    'wallets.confirmUnlinkTitle': 'वॉलेट अनलिंक करें',
    'wallets.confirmUnlinkBody': 'क्या आप वाकई इस वॉलेट को अनलिंक करना चाहते हैं? आप बाद में फिर से साइन करके लिंक कर सकते हैं।',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'activity.title': 'गतिविधि लॉग',
    'activity.exportJson': 'JSON निर्यात',
    'activity.exportCsv': 'CSV निर्यात',
    'activity.filter': 'फ़िल्टर',
    'activity.start': 'आरंभ',
    'activity.end': 'समाप्ति',
    'activity.presets': 'प्रीसेट',
    'preset.last7': 'पिछले 7 दिन',
    'preset.last30': 'पिछले 30 दिन',
    'preset.last90': 'पिछले 90 दिन',
    'preset.custom': 'कस्टम रेंज',
    'prefs.language': 'भाषा',
    'prefs.resetSystem': 'सिस्टम भाषा पर रीसेट',
    'prefs.detected': 'पता चली भाषा',
    'prefs.useDetected': 'पता चली भाषा उपयोग करें',
    'toasts.linked': 'वॉलेट लिंक किया गया',
    'toasts.unlinked': 'वॉलेट अनलिंक किया गया',
    'toasts.primaryUpdated': 'प्राथमिक वॉलेट अपडेट',
    'toasts.failed': 'क्रिया विफल',
  }
};

function getSystemLang(): Exclude<Lang, 'system'> {
  const nav = typeof navigator !== 'undefined' ? navigator.language || 'en' : 'en';
  const base = nav.split('-')[0] as Exclude<Lang, 'system'>;
  return (['en','es','fr','zh','hi'] as const).includes(base as any) ? base : 'en';
}

type Ctx = {
  lang: Lang;
  resolvedLang: Exclude<Lang, 'system'>;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('system');
  const resolvedLang = useMemo(() => (lang === 'system' ? getSystemLang() : lang), [lang]);
  const t = useMemo(() => (key: string) => dicts[resolvedLang][key] || dicts.en[key] || key, [resolvedLang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('frenzy_pref_lang_full') as Lang | null;
      if (saved) setLang(saved);
    } catch {}
  }, []);

  // On startup, if a wallet is known, load language from server once
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const wallet = localStorage.getItem('last_connected_wallet');
        if (!wallet) return;
        const res = await fetch('/api/settings', { headers: { 'x-wallet': wallet } });
        if (!res.ok) return;
        const json = await res.json();
        const serverLang = json?.data?.language as Lang | undefined;
        if (serverLang && !stop) setLang(serverLang);
      } catch {}
    })();
    return () => { stop = true; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('frenzy_pref_lang_full', lang); } catch {}
    if (typeof document !== 'undefined') document.documentElement.lang = resolvedLang;
  }, [lang, resolvedLang]);

  const value = useMemo<Ctx>(() => ({ lang, resolvedLang, setLang, t }), [lang, resolvedLang, t]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('I18nProvider missing');
  return ctx;
}
