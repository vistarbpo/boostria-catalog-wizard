import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
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
  const { currencyCode, setCurrency, isLoading } = useCurrency();

  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor="currency-select" className="mb-2">
          Currency
        </Label>
      )}
      <Select
        value={currencyCode}
        onValueChange={setCurrency}
        disabled={isLoading}
      >
        <SelectTrigger id="currency-select" className="w-full bg-background">
          <SelectValue placeholder="Select currency">
            {currencyCode && (
              <span className="flex items-center gap-2">
                <span className="font-mono text-sm">{currencyCode}</span>
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
    </div>
  );
};
