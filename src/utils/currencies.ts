import uaeDirhamIcon from '@/assets/currency/uae-dirham.svg';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  symbolType: 'unicode' | 'svg';
  svgPath?: string;
  countries: string[];
}

export const CURRENCIES: Currency[] = [
  // Major currencies
  { code: 'USD', symbol: '$', name: 'US Dollar', symbolType: 'unicode', countries: ['US', 'EC', 'SV', 'PA', 'TL'] },
  { code: 'EUR', symbol: '€', name: 'Euro', symbolType: 'unicode', countries: ['DE', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'AT', 'IE', 'FI', 'GR', 'SK', 'SI', 'EE', 'LV', 'LT', 'CY', 'MT', 'LU'] },
  { code: 'GBP', symbol: '£', name: 'British Pound', symbolType: 'unicode', countries: ['GB', 'IM', 'JE', 'GG'] },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', symbolType: 'unicode', countries: ['JP'] },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', symbolType: 'unicode', countries: ['CN'] },
  
  // Middle East
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', symbolType: 'unicode', countries: ['SA'] },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', symbolType: 'svg', svgPath: uaeDirhamIcon, countries: ['AE'] },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', symbolType: 'unicode', countries: ['QA'] },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', symbolType: 'unicode', countries: ['KW'] },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', symbolType: 'unicode', countries: ['BH'] },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', symbolType: 'unicode', countries: ['OM'] },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', symbolType: 'unicode', countries: ['JO'] },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', symbolType: 'unicode', countries: ['LB'] },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', symbolType: 'unicode', countries: ['IL'] },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', symbolType: 'unicode', countries: ['TR'] },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound', symbolType: 'unicode', countries: ['EG'] },
  
  // Asia Pacific
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', symbolType: 'unicode', countries: ['IN'] },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', symbolType: 'unicode', countries: ['PK'] },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', symbolType: 'unicode', countries: ['BD'] },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar', symbolType: 'unicode', countries: ['SG'] },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', symbolType: 'unicode', countries: ['MY'] },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', symbolType: 'unicode', countries: ['TH'] },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', symbolType: 'unicode', countries: ['ID'] },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', symbolType: 'unicode', countries: ['PH'] },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', symbolType: 'unicode', countries: ['VN'] },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', symbolType: 'unicode', countries: ['KR'] },
  { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar', symbolType: 'unicode', countries: ['HK'] },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', symbolType: 'unicode', countries: ['TW'] },
  
  // Americas
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', symbolType: 'unicode', countries: ['CA'] },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', symbolType: 'unicode', countries: ['MX'] },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', symbolType: 'unicode', countries: ['BR'] },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', symbolType: 'unicode', countries: ['AR'] },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', symbolType: 'unicode', countries: ['CL'] },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', symbolType: 'unicode', countries: ['CO'] },
  
  // Oceania
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', symbolType: 'unicode', countries: ['AU', 'KI', 'NR', 'TV'] },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar', symbolType: 'unicode', countries: ['NZ', 'CK', 'NU', 'PN', 'TK'] },
  
  // Europe (Non-Euro)
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', symbolType: 'unicode', countries: ['CH', 'LI'] },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', symbolType: 'unicode', countries: ['SE'] },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', symbolType: 'unicode', countries: ['NO', 'SJ', 'BV'] },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', symbolType: 'unicode', countries: ['DK', 'FO', 'GL'] },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', symbolType: 'unicode', countries: ['PL'] },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', symbolType: 'unicode', countries: ['CZ'] },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', symbolType: 'unicode', countries: ['HU'] },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', symbolType: 'unicode', countries: ['RO'] },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', symbolType: 'unicode', countries: ['BG'] },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', symbolType: 'unicode', countries: ['RU'] },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', symbolType: 'unicode', countries: ['UA'] },
  
  // Africa
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', symbolType: 'unicode', countries: ['ZA', 'LS', 'NA'] },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', symbolType: 'unicode', countries: ['NG'] },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', symbolType: 'unicode', countries: ['KE'] },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', symbolType: 'unicode', countries: ['GH'] },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', symbolType: 'unicode', countries: ['MA', 'EH'] },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar', symbolType: 'unicode', countries: ['TN'] },
  
  // Cryptocurrencies (if needed)
  { code: 'BTC', symbol: '₿', name: 'Bitcoin', symbolType: 'unicode', countries: [] },
  { code: 'ETH', symbol: 'Ξ', name: 'Ethereum', symbolType: 'unicode', countries: [] },
];

// Country to currency mapping
export const getDefaultCurrencyByCountry = (countryCode: string): string => {
  const currency = CURRENCIES.find(c => c.countries.includes(countryCode.toUpperCase()));
  return currency?.code || 'USD';
};

// Detect user's country based on browser/system settings
export const detectUserCountry = async (): Promise<string> => {
  try {
    // Try to get from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryFromTz = getCountryFromTimezone(timezone);
    if (countryFromTz) return countryFromTz;
    
    // Fallback: try to get from language
    const language = navigator.language || (navigator as any).userLanguage;
    if (language && language.includes('-')) {
      const countryCode = language.split('-')[1];
      return countryCode.toUpperCase();
    }
    
    // Default fallback
    return 'US';
  } catch (error) {
    console.error('Error detecting country:', error);
    return 'US';
  }
};

// Basic timezone to country mapping (simplified)
const getCountryFromTimezone = (timezone: string): string | null => {
  const tzMap: Record<string, string> = {
    'Asia/Riyadh': 'SA',
    'Asia/Dubai': 'AE',
    'Asia/Qatar': 'QA',
    'Asia/Kuwait': 'KW',
    'Asia/Bahrain': 'BH',
    'Asia/Muscat': 'OM',
    'Asia/Amman': 'JO',
    'Asia/Beirut': 'LB',
    'Asia/Jerusalem': 'IL',
    'Asia/Istanbul': 'TR',
    'Africa/Cairo': 'EG',
    'Asia/Kolkata': 'IN',
    'Asia/Tokyo': 'JP',
    'Asia/Shanghai': 'CN',
    'Asia/Singapore': 'SG',
    'Asia/Hong_Kong': 'HK',
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'Europe/London': 'GB',
    'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Australia/Sydney': 'AU',
  };
  
  return tzMap[timezone] || null;
};

// Get currency by code
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find(c => c.code === code);
};

// Format price with currency
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount} ${currencyCode}`;
  
  // For SVG symbols, just show the code
  if (currency.symbolType === 'svg') {
    return `${currency.code} ${amount.toFixed(2)}`;
  }
  
  // Use native formatting when possible
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
};
