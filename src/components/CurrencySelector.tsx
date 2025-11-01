import React from 'react';
import { Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CURRENCIES } from '@/utils/currencies';
import { Label } from '@/components/ui/label';

interface CurrencySelectorProps {
  showLabel?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  showLabel = true,
  className = '' 
}) => {
  const { currencyCode, setCurrency, displayType, setDisplayType, isLoading } = useCurrency();

  return (
    <div className={className}>
      {showLabel && (
        <Label className="mb-2">Currency Settings</Label>
      )}
      <div className="flex gap-3">
        {/* Currency Selection Dropdown */}
        <Select
          value={currencyCode}
          onValueChange={setCurrency}
          disabled={isLoading}
        >
          <SelectTrigger className="flex-1 bg-background">
            <SelectValue placeholder="Select Currency">
              {currencyCode && (
                <span className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{currencyCode}</span>
                  <span className="text-muted-foreground">
                    {CURRENCIES.find(c => c.code === currencyCode)?.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {CURRENCIES.find(c => c.code === currencyCode)?.name}
                  </span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[400px] bg-popover z-[100]">
            {CURRENCIES.map((currency) => (
              <SelectItem
                key={currency.code}
                value={currency.code}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {currency.code}
                    </span>
                    <span className="text-muted-foreground">
                      {currency.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {currency.name}
                    </span>
                  </div>
                  {currencyCode === currency.code && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Display Type Selection Dropdown */}
        <Select
          value={displayType}
          onValueChange={(value: 'code' | 'symbol') => setDisplayType(value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue>
              {displayType === 'code' ? 'Currency Code' : 'Currency Symbol'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover z-[100]">
            <SelectItem value="code" className="cursor-pointer">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Currency Code</span>
                  <span className="text-xs text-muted-foreground">SAR, USD, AED</span>
                </div>
                {displayType === 'code' && <Check className="h-4 w-4" />}
              </div>
            </SelectItem>
            <SelectItem value="symbol" className="cursor-pointer">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Currency Symbol</span>
                  <span className="text-xs text-muted-foreground">﷼, $, د.إ</span>
                </div>
                {displayType === 'symbol' && <Check className="h-4 w-4" />}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
