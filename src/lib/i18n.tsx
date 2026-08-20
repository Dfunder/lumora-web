'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  availableLocales: Locale[];
  getLocaleLabel: (locale: Locale) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.campaigns': 'Campaigns',
    'nav.create': 'Create Campaign',
    'nav.connect': 'Connect Wallet',
    'nav.disconnect': 'Disconnect',
    'hero.title': 'Decentralized Fundraising',
    'hero.subtitle': 'Democratizing fundraising through blockchain technology',
    'hero.cta': 'Explore Campaigns',
    'campaign.progress': 'Progress',
    'campaign.backers': 'Backers',
    'campaign.daysLeft': 'Days Left',
    'campaign.back': 'Back this Campaign',
    'campaign.create.title': 'Create a Campaign',
    'campaign.create.name': 'Campaign Name',
    'campaign.create.description': 'Description',
    'campaign.create.goal': 'Funding Goal (USD)',
    'campaign.create.duration': 'Duration (days)',
    'campaign.create.submit': 'Create Campaign',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.campaigns': 'Campañas',
    'nav.create': 'Crear Campaña',
    'nav.connect': 'Conectar Billetera',
    'nav.disconnect': 'Desconectar',
    'hero.title': 'Recaudación Descentralizada',
    'hero.subtitle': 'Democratizando la recaudación a través de la tecnología blockchain',
    'hero.cta': 'Explorar Campañas',
    'campaign.progress': 'Progreso',
    'campaign.backers': 'Patrocinadores',
    'campaign.daysLeft': 'Días Restantes',
    'campaign.back': 'Apoyar esta Campaña',
    'campaign.create.title': 'Crear una Campaña',
    'campaign.create.name': 'Nombre de la Campaña',
    'campaign.create.description': 'Descripción',
    'campaign.create.goal': 'Meta de Financiamiento (USD)',
    'campaign.create.duration': 'Duración (días)',
    'campaign.create.submit': 'Crear Campaña',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.success': '¡Éxito!',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Oscuro',
    'settings.theme.system': 'Sistema',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.campaigns': 'Campagnes',
    'nav.create': 'Créer une Campagne',
    'nav.connect': 'Connecter le Portefeuille',
    'nav.disconnect': 'Déconnecter',
    'hero.title': 'Financement Décentralisé',
    'hero.subtitle': 'Démocratiser le financement grâce à la technologie blockchain',
    'hero.cta': 'Explorer les Campagnes',
    'campaign.progress': 'Progrès',
    'campaign.backers': 'Contributeurs',
    'campaign.daysLeft': 'Jours Restants',
    'campaign.back': 'Soutenir cette Campagne',
    'campaign.create.title': 'Créer une Campagne',
    'campaign.create.name': 'Nom de la Campagne',
    'campaign.create.description': 'Description',
    'campaign.create.goal': 'Objectif de Financement (USD)',
    'campaign.create.duration': 'Durée (jours)',
    'campaign.create.submit': 'Créer la Campagne',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.success': 'Succès !',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'settings.theme': 'Thème',
    'settings.language': 'Langue',
    'settings.theme.light': 'Clair',
    'settings.theme.dark': 'Sombre',
    'settings.theme.system': 'Système',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.campaigns': 'Kampagnen',
    'nav.create': 'Kampagne Erstellen',
    'nav.connect': 'Wallet Verbinden',
    'nav.disconnect': 'Trennen',
    'hero.title': 'Dezentrales Fundraising',
    'hero.subtitle': 'Demokratisierung des Fundraisings durch Blockchain-Technologie',
    'hero.cta': 'Kampagnen Erkunden',
    'campaign.progress': 'Fortschritt',
    'campaign.backers': 'Unterstützer',
    'campaign.daysLeft': 'Verbleibende Tage',
    'campaign.back': 'Diese Kampagne Unterstützen',
    'campaign.create.title': 'Kampagne Erstellen',
    'campaign.create.name': 'Kampagnenname',
    'campaign.create.description': 'Beschreibung',
    'campaign.create.goal': 'Finanzierungsziel (USD)',
    'campaign.create.duration': 'Dauer (Tage)',
    'campaign.create.submit': 'Kampagne Erstellen',
    'common.loading': 'Laden...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.success': 'Erfolg!',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'settings.theme': 'Design',
    'settings.language': 'Sprache',
    'settings.theme.light': 'Hell',
    'settings.theme.dark': 'Dunkel',
    'settings.theme.system': 'System',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.campaigns': 'キャンペーン',
    'nav.create': 'キャンペーン作成',
    'nav.connect': 'ウォレット接続',
    'nav.disconnect': '切断',
    'hero.title': '分散型ファンドレイジング',
    'hero.subtitle': 'ブロックチェーン技術によるファンドレイジングの民主化',
    'hero.cta': 'キャンペーンを探索',
    'campaign.progress': '進捗',
    'campaign.backers': '支援者',
    'campaign.daysLeft': '残り日数',
    'campaign.back': 'このキャンペーンを支援',
    'campaign.create.title': 'キャンペーンを作成',
    'campaign.create.name': 'キャンペーン名',
    'campaign.create.description': '説明',
    'campaign.create.goal': '資金調達目標（USD）',
    'campaign.create.duration': '期間（日）',
    'campaign.create.submit': 'キャンペーン作成',
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.success': '成功！',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'settings.theme': 'テーマ',
    'settings.language': '言語',
    'settings.theme.light': 'ライト',
    'settings.theme.dark': 'ダーク',
    'settings.theme.system': 'システム',
  },
  zh: {
    'nav.home': '首页',
    'nav.campaigns': '活动',
    'nav.create': '创建活动',
    'nav.connect': '连接钱包',
    'nav.disconnect': '断开连接',
    'hero.title': '去中心化众筹',
    'hero.subtitle': '通过区块链技术实现众筹民主化',
    'hero.cta': '探索活动',
    'campaign.progress': '进度',
    'campaign.backers': '支持者',
    'campaign.daysLeft': '剩余天数',
    'campaign.back': '支持此活动',
    'campaign.create.title': '创建活动',
    'campaign.create.name': '活动名称',
    'campaign.create.description': '描述',
    'campaign.create.goal': '资金目标（美元）',
    'campaign.create.duration': '持续时间（天）',
    'campaign.create.submit': '创建活动',
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.success': '成功！',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'settings.theme': '主题',
    'settings.language': '语言',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.system': '系统',
  },
};

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('lumora-locale') as Locale) || 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('lumora-locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
    },
    [locale],
  );

  const availableLocales = Object.keys(TRANSLATIONS) as Locale[];

  const getLocaleLabel = useCallback((l: Locale) => LOCALE_LABELS[l], []);

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, t, availableLocales, getLocaleLabel }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export { LOCALE_LABELS };
