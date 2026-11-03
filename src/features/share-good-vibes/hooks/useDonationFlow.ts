import { useState } from 'react';
import { donationService } from '../services/donationService';
import { triggerHaptic } from '@/shared/services/device/haptics';

export const useDonationFlow = (updatePoints: (pts: number) => Promise<void>) => {
  const [donateAmount, setDonateAmount] = useState('0.1');
  const [donateCurrency, setDonateCurrency] = useState<'SOL' | 'USDC'>('SOL');
  const [state, setState] = useState<'form' | 'transacting' | 'completed'>('form');

  const predefinedAmounts = {
    SOL: ['0.05', '0.1', '0.5', '1.0'],
    USDC: ['5', '10', '25', '100']
  };

  const handleExecuteDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(donateAmount) <= 0 || isNaN(parseFloat(donateAmount))) {
      alert("Please specify a valid amount.");
      return;
    }

    triggerHaptic('heavy');
    setState('transacting');

    try {
      await donationService.executeDonation(parseFloat(donateAmount), donateCurrency);

      setTimeout(async () => {
        await updatePoints(50);
        setState('completed');
        triggerHaptic('heavy');
      }, 1400);
    } catch (e) {
      alert("Could not process coin backing.");
      setState('form');
    }
  };

  const resetDonation = () => {
    setDonateAmount('0.1');
    setDonateCurrency('SOL');
    setState('form');
  };

  return {
    donateAmount,
    setDonateAmount,
    donateCurrency,
    setDonateCurrency,
    state,
    setState,
    predefinedAmounts,
    handleExecuteDonation,
    resetDonation
  };
};
