// Currency conversion utility
const CurrencyConverter = {
    // Exchange rates (base currency: USD)
    exchangeRates: {
        // Major African currencies (prioritized)
        ZAR: 18.5,   // South African Rand
        KES: 130,    // Kenyan Shilling
        TZS: 2300,   // Tanzanian Shilling
        BWP: 13.5,   // Botswana Pula
        NAD: 18.5,   // Namibian Dollar (pegged to ZAR)
        ZWL: 322,    // Zimbabwean Dollar
        ZMW: 25,     // Zambian Kwacha
        UGX: 3700,   // Ugandan Shilling
        RWF: 1300,   // Rwandan Franc
        ETB: 55,     // Ethiopian Birr
        EGP: 31,     // Egyptian Pound
        MAD: 10,     // Moroccan Dirham
        NGN: 1500,   // Nigerian Naira
        GHS: 12,     // Ghanaian Cedi
        XOF: 600,    // West African CFA Franc
        XAF: 600,    // Central African CFA Franc
        AOA: 830,    // Angolan Kwanza
        MZN: 64,     // Mozambican Metical
        MWK: 1700,   // Malawian Kwacha
        // International currencies (for reference)
        USD: 1.0,    // US Dollar
        EUR: 0.92    // Euro
    },

    // Currency symbols
    currencySymbols: {
        // Major African currencies
        ZAR: 'R',
        KES: 'KSh',
        TZS: 'TSh',
        BWP: 'P',
        NAD: 'N$',
        ZWL: 'Z$',
        ZMW: 'ZK',
        UGX: 'USh',
        RWF: 'RF',
        ETB: 'Br',
        EGP: 'E£',
        MAD: 'MAD',
        NGN: '₦',
        GHS: 'GH₵',
        XOF: 'CFA',
        XAF: 'FCFA',
        AOA: 'Kz',
        MZN: 'MT',
        MWK: 'MK',
        // International currencies
        USD: '$',
        EUR: '€'
    },

    // Get current currency from localStorage (default to ZAR - South African Rand)
    getCurrentCurrency() {
        return localStorage.getItem('selectedCurrency') || 'ZAR';
    },

    // Set current currency
    setCurrentCurrency(currency) {
        localStorage.setItem('selectedCurrency', currency);
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency } }));
    },

    // Convert price from USD to target currency
    convert(priceUSD, targetCurrency = null) {
        const currency = targetCurrency || this.getCurrentCurrency();
        const rate = this.exchangeRates[currency] || 1;
        return priceUSD * rate;
    },

    // Format price with currency symbol
    format(priceUSD, targetCurrency = null) {
        const currency = targetCurrency || this.getCurrentCurrency();
        const convertedPrice = this.convert(priceUSD, currency);
        const symbol = this.currencySymbols[currency] || '$';
        
        // Format number with appropriate decimal places
        const formattedPrice = convertedPrice.toFixed(2);
        
        // For currencies with symbols before, add space if needed
        if (['USD', 'EUR', 'ZAR', 'BWP', 'EGP', 'MAD', 'NAD', 'ZWL', 'GHS', 'AOA', 'MZN'].includes(currency)) {
            return `${symbol}${formattedPrice}`;
        } else {
            return `${formattedPrice} ${symbol}`;
        }
    },

    // Format price for display (simplified version without decimals for whole numbers)
    formatDisplay(priceUSD, targetCurrency = null) {
        const currency = targetCurrency || this.getCurrentCurrency();
        const convertedPrice = this.convert(priceUSD, currency);
        const symbol = this.currencySymbols[currency] || '$';
        
        // Round to nearest whole number for display
        const roundedPrice = Math.round(convertedPrice);
        
        if (['USD', 'EUR', 'ZAR', 'BWP', 'EGP', 'MAD', 'NAD', 'ZWL', 'GHS', 'AOA', 'MZN'].includes(currency)) {
            return `${symbol}${roundedPrice}`;
        } else {
            return `${roundedPrice} ${symbol}`;
        }
    },

    // Get all available currencies
    getAvailableCurrencies() {
        return Object.keys(this.exchangeRates);
    }
};

// Export to window for global access
window.CurrencyConverter = CurrencyConverter;

