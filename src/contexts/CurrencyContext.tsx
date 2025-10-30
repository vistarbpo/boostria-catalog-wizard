import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppConfig } from '@/hooks/useAppConfig';
import { getCurrencyByCode } from '@/utils/currencies';

interface CurrencyContextType {
  currencyCode: string;
  currencySymbol: string;
  setCurrency: (code: string) => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { config, loading, updateConfig } = useAppConfig();
  const [currencyCode, setCurrencyCode] = useState<string>('USD');

  // Initialize from app config
  useEffect(() => {
    if (config?.default_currency) {
      setCurrencyCode(config.default_currency);
    }
  }, [config]);

  const setCurrency = async (code: string) => {
    setCurrencyCode(code);
    // Update the app config
    await updateConfig({ default_currency: code });
  };

  const currency = getCurrencyByCode(currencyCode);
  const currencySymbol = currency?.symbolType === 'svg' && currency?.svgPath 
    ? currency.code 
    : currency?.symbol || '$';

  return (
    <CurrencyContext.Provider 
      value={{ 
        currencyCode, 
        currencySymbol,
        setCurrency,
        isLoading: loading
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
