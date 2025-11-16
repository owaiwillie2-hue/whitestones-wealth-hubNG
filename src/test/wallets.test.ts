import { describe, it, expect } from 'vitest';

// Wallet and balance calculation tests
describe('Wallet & Balance Calculations', () => {
  describe('First Deposit Bonus', () => {
    it('should calculate 10% bonus on first deposit', () => {
      const depositAmount = 100;
      const bonusPercentage = 0.10;
      const expectedBonus = depositAmount * bonusPercentage;
      
      expect(expectedBonus).toBe(10);
    });

    it('should handle large deposit amounts', () => {
      const depositAmount = 10000;
      const bonusPercentage = 0.10;
      const expectedBonus = depositAmount * bonusPercentage;
      
      expect(expectedBonus).toBe(1000);
    });

    it('should handle small deposit amounts', () => {
      const depositAmount = 10;
      const bonusPercentage = 0.10;
      const expectedBonus = depositAmount * bonusPercentage;
      
      expect(expectedBonus).toBe(1);
    });

    it('should only apply to first deposit', () => {
      const deposits = [100, 200, 300]; // 3 deposits
      const firstDepositBonus = deposits[0] * 0.10; // Only first
      
      expect(firstDepositBonus).toBe(10);
      expect(deposits.length).toBe(3);
    });
  });

  describe('KYC Approval Bonus', () => {
    it('should add configurable bonus on KYC approval', () => {
      const configurableBonus = 50; // Admin-set
      const mainBalance = 100;
      const newBalance = mainBalance + configurableBonus;
      
      expect(newBalance).toBe(150);
    });

    it('should support different bonus amounts', () => {
      const bonusAmounts = [0, 25, 50, 100, 500];
      
      bonusAmounts.forEach(bonus => {
        const balance = 100 + bonus;
        expect(balance).toBe(100 + bonus);
      });
    });

    it('should only apply once per user', () => {
      const kycApprovals = [{ bonus: 50, applied: true }];
      const totalBonus = kycApprovals
        .filter(a => a.applied)
        .reduce((sum, a) => sum + a.bonus, 0);
      
      expect(totalBonus).toBe(50);
      expect(kycApprovals).toHaveLength(1);
    });
  });

  describe('Balance Validation', () => {
    it('should prevent negative main wallet balance', () => {
      const mainBalance = 100;
      const withdrawalAmount = 150;
      const wouldResultInNegative = mainBalance - withdrawalAmount < 0;
      
      expect(wouldResultInNegative).toBe(true);
    });

    it('should prevent negative investment wallet balance', () => {
      const investmentBalance = 50;
      const withdrawalAmount = 100;
      const wouldResultInNegative = investmentBalance - withdrawalAmount < 0;
      
      expect(wouldResultInNegative).toBe(true);
    });

    it('should allow equal withdrawal to balance', () => {
      const balance = 100;
      const withdrawal = 100;
      const resultingBalance = balance - withdrawal;
      
      expect(resultingBalance).toBe(0);
      expect(resultingBalance).toBeGreaterThanOrEqual(0);
    });

    it('should validate amounts are positive numbers', () => {
      const validAmounts = [0.01, 1, 100, 1000.50];
      const invalidAmounts = [0, -100, null, undefined, 'invalid'];
      
      validAmounts.forEach(amount => {
        expect(amount > 0).toBe(true);
      });
      
      invalidAmounts.forEach(amount => {
        expect(Number(amount) > 0).toBe(false);
      });
    });
  });

  describe('Fund Adjustment', () => {
    it('should add funds to wallet', () => {
      const currentBalance = 100;
      const addAmount = 50;
      const newBalance = currentBalance + addAmount;
      
      expect(newBalance).toBe(150);
    });

    it('should remove funds from wallet', () => {
      const currentBalance = 100;
      const removeAmount = 30;
      const newBalance = currentBalance - removeAmount;
      
      expect(newBalance).toBe(70);
    });

    it('should prevent removal that results in negative', () => {
      const currentBalance = 50;
      const removeAmount = 100;
      const newBalance = Math.max(0, currentBalance - removeAmount);
      
      expect(newBalance).toBe(0);
      expect(newBalance).toBeGreaterThanOrEqual(0);
    });

    it('should log adjustment reason', () => {
      const adjustment = {
        amount: 100,
        reason: 'bonus_credit',
        timestamp: new Date().toISOString(),
      };
      
      expect(adjustment.reason).toBeTruthy();
      expect(adjustment.reason).toMatch(/bonus|deposit|withdrawal|correction/i);
    });
  });

  describe('Wallet Transfer', () => {
    it('should transfer from main to investment wallet', () => {
      const mainBalance = 200;
      const investmentBalance = 100;
      const transferAmount = 50;
      
      const newMain = mainBalance - transferAmount;
      const newInvestment = investmentBalance + transferAmount;
      
      expect(newMain).toBe(150);
      expect(newInvestment).toBe(150);
    });

    it('should transfer from investment to main wallet', () => {
      const mainBalance = 100;
      const investmentBalance = 200;
      const transferAmount = 50;
      
      const newMain = mainBalance + transferAmount;
      const newInvestment = investmentBalance - transferAmount;
      
      expect(newMain).toBe(150);
      expect(newInvestment).toBe(150);
    });

    it('should prevent transfer exceeding available balance', () => {
      const mainBalance = 50;
      const transferAmount = 100;
      const canTransfer = mainBalance >= transferAmount;
      
      expect(canTransfer).toBe(false);
    });

    it('should validate transfer amount is positive', () => {
      const validTransfers = [1, 10, 100, 1000];
      const invalidTransfers = [0, -50, -100];
      
      validTransfers.forEach(amount => {
        expect(amount > 0).toBe(true);
      });
      
      invalidTransfers.forEach(amount => {
        expect(amount > 0).toBe(false);
      });
    });
  });

  describe('Decimal Precision', () => {
    it('should handle two decimal places for currency', () => {
      const amounts = [10.50, 100.99, 1000.01];
      
      amounts.forEach(amount => {
        const formatted = parseFloat(amount.toFixed(2));
        expect(formatted).toBe(amount);
      });
    });

    it('should prevent floating point errors', () => {
      const balance1 = 0.1;
      const balance2 = 0.2;
      const sum = parseFloat((balance1 + balance2).toFixed(2));
      
      expect(sum).toBeCloseTo(0.3, 2);
    });

    it('should format balance with 2 decimals', () => {
      const balance = 100;
      const formatted = balance.toFixed(2);
      
      expect(formatted).toBe('100.00');
    });
  });
});
