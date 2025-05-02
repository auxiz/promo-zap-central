
import { useState, useCallback, useMemo } from 'react';
import { type ShopeeCredentials } from '@/hooks/useShopeeCredentials';

export function useShopeeForm(
  shopeeSettings: ShopeeCredentials,
  setShopeeSettings: React.Dispatch<React.SetStateAction<ShopeeCredentials>>
) {
  const handleAppIdChange = useCallback((value: string) => {
    setShopeeSettings(prev => ({ ...prev, appId: value }));
  }, [setShopeeSettings]);
  
  const handleSecretKeyChange = useCallback((value: string) => {
    setShopeeSettings(prev => ({ ...prev, secretKey: value }));
  }, [setShopeeSettings]);
  
  const isFormValid = useMemo(() => {
    return !!shopeeSettings.appId && !!shopeeSettings.secretKey;
  }, [shopeeSettings.appId, shopeeSettings.secretKey]);
  
  return {
    handleAppIdChange,
    handleSecretKeyChange,
    isFormValid
  };
}
