import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppConfig } from '@/hooks/useAppConfig';
import { getCurrencyByCode } from '@/utils/currencies';

interface CurrencyContextType {
  currencyCode: string;
  currencySymbol: string;
  currencySvgPath?: string;
  isSvgSymbol: boolean;
  displayType: 'code' | 'symbol';
  setCurrency: (code: string) => void;
  setDisplayType: (type: 'code' | 'symbol') => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { config, loading, updateConfig } = useAppConfig();
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [displayType, setDisplayTypeState] = useState<'code' | 'symbol'>('symbol');

  // Initialize from app config
  useEffect(() => {
    if (config?.default_currency) {
      setCurrencyCode(config.default_currency);
    }
    if (config?.currency_display_type) {
      setDisplayTypeState(config.currency_display_type);
    }
  }, [config]);

  const setCurrency = async (code: string) => {
    setCurrencyCode(code);
    // Update the app config
    await updateConfig({ default_currency: code });
  };

  const setDisplayType = async (type: 'code' | 'symbol') => {
    setDisplayTypeState(type);
    // Update the app config
    await updateConfig({ currency_display_type: type });
  };

  const currency = getCurrencyByCode(currencyCode);
  const isSvgSymbol = currency?.symbolType === 'svg';
  const currencySymbol = currency?.symbol || '$';
  const currencySvgPath = currency?.svgPath;

  return (
    <CurrencyContext.Provider 
      value={{ 
        currencyCode, 
        currencySymbol,
        currencySvgPath,
        isSvgSymbol,
        displayType,
        setCurrency,
        setDisplayType,
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
