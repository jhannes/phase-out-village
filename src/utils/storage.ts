// Safe localStorage wrapper with error handling and fallbacks

export class SafeStorage {
  private static isAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static setItem(key: string, value: string): boolean {
    if (!this.isAvailable()) {
      console.warn("localStorage not available");
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  }

  static getItem(key: string): string | null {
    if (!this.isAvailable()) {
      console.warn("localStorage not available");
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      return null;
    }
  }

  static removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      console.warn("localStorage not available");
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isAvailable()) {
      console.warn("localStorage not available");
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
      return false;
    }
  }

  static getSize(): number {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          size += localStorage.getItem(key)?.length || 0;
        }
      }
      return size;
    } catch {
      return 0;
    }
  }

  static isQuotaExceeded(): boolean {
    try {
      const test = "x".repeat(1024 * 1024); // 1MB test
      localStorage.setItem("quota_test", test);
      localStorage.removeItem("quota_test");
      return false;
    } catch (error) {
      return error instanceof Error && error.name === "QuotaExceededError";
    }
  }
}
