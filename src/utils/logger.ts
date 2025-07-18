// Logger utility for proper debug logging in different environments

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },

  // For critical errors that should always be logged
  critical: (message: string, ...args: any[]) => {
    console.error(`[CRITICAL] ${message}`, ...args);
  },
};
