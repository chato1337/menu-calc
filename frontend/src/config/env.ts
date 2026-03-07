const ENV_DEFAULTS = {
  VITE_APP_NAME: "Semillas de Vida - Menu Calc",
  VITE_API_BASE_URL: "http://localhost:8000/api",
  VITE_FOOTER_TEXT: "© 2026 Semmillas de Vida -  Ikwesx Software Solutions",
} as const;

function getEnvValue(key: keyof typeof ENV_DEFAULTS): string {
  const runtimeValue = import.meta.env[key];
  if (typeof runtimeValue === "string" && runtimeValue.trim().length > 0) {
    return runtimeValue;
  }

  return ENV_DEFAULTS[key];
}

export const env = {
  appName: getEnvValue("VITE_APP_NAME"),
  apiBaseUrl: getEnvValue("VITE_API_BASE_URL"),
  footerText: getEnvValue("VITE_FOOTER_TEXT"),
} as const;
