export const LOCALES = ["es", "en", "fr", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<
  Locale,
  { short: string; name: string }
> = {
  es: { short: "ES", name: "Español" },
  en: { short: "EN", name: "English" },
  fr: { short: "FR", name: "Français" },
  zh: { short: "中文", name: "中文" },
};

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_STORAGE_KEY = "mbx_locale";

export type Messages = {
  meta: {
    titleSuffix: string;
    description: string;
  };
  common: {
    loading: string;
    back: string;
    continue: string;
    dash: string;
  };
  login: {
    desk: string;
    tagline: string;
    serialLabel: string;
    serialPlaceholder: string;
    verifying: string;
    enter: string;
    footnote: string;
    loginFailed: string;
    connectionError: string;
  };
  dashboard: {
    title: string;
    session: string;
    footer: string;
    logout: string;
    version: string;
  };
  banks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    live: string;
    statusMarket: string;
    statusProcess: string;
    taglines: {
      dbs: string;
      cumberland: string;
      b2c2: string;
      galaxy: string;
      falconx: string;
      wintermute: string;
    };
  };
  ticker: {
    live: string;
    subtitle: string;
  };
  retained: {
    eyebrow: string;
    title: string;
    subtitle: string;
    contract: string;
    amountLabel: string;
    selectHint: string;
    selectedHint: string;
    removeCta: string;
  };
  release: {
    step: string;
    title: string;
    subtitle: string;
    quotaLabel: string;
    amountLabel: string;
    amountHint: string;
    belowQuota: string;
    continue: string;
    cancel: string;
    missingToken: string;
  };
  wizard: {
    eyebrow: string;
    title: string;
    releaseEyebrow: string;
    releaseTitle: string;
    steps: {
      token: string;
      release: string;
      payout: string;
      destination: string;
      confirm: string;
    };
  };
  token: {
    step: string;
    title: string;
    subtitle: string;
    suspended: string;
    native: string;
    min: string;
    noneAvailable: string;
    suspendedToken: string;
    amountLabel: string;
    contract: string;
    minAmount: string;
    unitPrice: string;
    marketValue: string;
    totalPayout: string;
    continue: string;
    priceError: string;
    priceLoadError: string;
  };
  payout: {
    step: string;
    title: string;
    totalLabel: string;
    priceOf: string;
    youReceive: string;
    priceError: string;
    priceLoadError: string;
  };
  destination: {
    step: string;
    title: string;
    subtitleBefore: string;
    subtitleAfter: string;
    label: string;
    placeholderBtc: string;
    placeholderTron: string;
    placeholderSol: string;
    placeholderEvm: string;
    invalid: string;
    valid: string;
    networkNoteBefore: string;
    networkNoteAfter: string;
    review: string;
  };
  confirm: {
    step: string;
    title: string;
    subtitle: string;
    token: string;
    totalPayout: string;
    payout: string;
    destWallet: string;
    txLabel: string;
    txPlaceholderSol: string;
    txPlaceholderEvm: string;
    txInvalid: string;
    notifyNote: string;
    sending: string;
    submit: string;
    submitError: string;
    sendError: string;
    doneTitle: string;
    doneBodyBefore: string;
    doneBodyAfter: string;
    orderId: string;
    newOp: string;
  };
  deposit: {
    qrAlt: string;
    qrUnavailable: string;
    addImage: string;
    scanHint: string;
    amountLabel: string;
    walletLabel: string;
  };
  authErrors: {
    invalidSerial: string;
    unauthorized: string;
  };
};
