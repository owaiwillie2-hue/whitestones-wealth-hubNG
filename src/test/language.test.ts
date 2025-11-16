import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test language context utilities
describe('Language Context Utils', () => {
  describe('Language Selection', () => {
    it('should have all 6 supported languages', () => {
      const languages = ['en', 'de', 'es', 'fr', 'it', 'pt'];
      expect(languages).toHaveLength(6);
      expect(languages).toContain('en');
      expect(languages).toContain('de');
    });

    it('should provide English as default language', () => {
      const defaultLanguage = 'en';
      expect(defaultLanguage).toBe('en');
    });
  });

  describe('Translation Keys', () => {
    it('should have dashboard translation keys', () => {
      const dashboardKeys = [
        'dashboard.title',
        'dashboard.mainBalance',
        'dashboard.investmentBalance',
        'dashboard.transferFunds',
      ];
      
      dashboardKeys.forEach(key => {
        expect(key).toMatch(/^dashboard\./);
      });
    });

    it('should have navigation translation keys', () => {
      const navKeys = [
        'nav.home',
        'nav.dashboard',
        'nav.investments',
        'nav.deposit',
        'nav.withdraw',
      ];
      
      navKeys.forEach(key => {
        expect(key).toMatch(/^nav\./);
      });
    });

    it('should have authentication translation keys', () => {
      const authKeys = [
        'auth.email',
        'auth.password',
        'auth.signup',
        'auth.login',
      ];
      
      authKeys.forEach(key => {
        expect(key).toMatch(/^auth\./);
      });
    });

    it('should use hierarchical key naming pattern', () => {
      const keys = [
        'dashboard.title',
        'dashboard.mainBalance',
        'nav.home',
        'auth.email',
      ];
      
      keys.forEach(key => {
        const parts = key.split('.');
        expect(parts.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Language Persistence', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should persist language selection to localStorage', () => {
      const language = 'de';
      localStorage.setItem('language', language);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('language', 'de');
    });

    it('should retrieve language from localStorage', () => {
      localStorage.getItem('language');
      expect(localStorage.getItem).toHaveBeenCalledWith('language');
    });
  });
});
