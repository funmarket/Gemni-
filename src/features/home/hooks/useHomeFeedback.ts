import { useState } from 'react';
import { triggerHaptic as triggerSharedHaptic } from '../../../shared/services/device/haptics';

export const useHomeFeedback = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2800);
  };

  const [customAlert, setCustomAlert] = useState<{ title: string; message: string; type?: 'success' | 'warning' | 'info' | 'error' } | null>(null);
  const triggerAlert = (title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setCustomAlert({ title, message, type });
    if (type === 'success') triggerSharedHaptic('medium');
    else triggerSharedHaptic('light');
  };

  return {
    toastMessage,
    showToast,
    customAlert,
    setCustomAlert,
    triggerAlert,
    triggerHaptic: triggerSharedHaptic
  };
};
