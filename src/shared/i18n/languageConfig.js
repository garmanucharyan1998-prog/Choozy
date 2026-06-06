export const LANGUAGE_STORAGE_KEY = "choozy-language";
export const SUPPORTED_LANGUAGE_CODES = ["am", "en", "ru"];
export const DEFAULT_LANGUAGE_CODE = "am";

export const isSupportedLanguage = (code) => SUPPORTED_LANGUAGE_CODES.includes(code);

export const readStoredLanguage = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE_CODE;
  }
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE_CODE;
  } catch {
    return DEFAULT_LANGUAGE_CODE;
  }
};

export const writeStoredLanguage = (code) => {
  if (typeof window === "undefined" || !isSupportedLanguage(code)) {
    return;
  }
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
};
