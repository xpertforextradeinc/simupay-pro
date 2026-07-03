export interface TokenPrice {
  usd: number;
  change24h?: number;
}

export interface MarketPrices {
  bitcoin: TokenPrice;
  ethereum: TokenPrice;
  tether: TokenPrice;
}

export interface SPPTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
  status: 'Not Listed Yet' | 'Awaiting DEX Listing';
  totalSupply: string;
}

// Persist contract address in localStorage to remain fully configurable after deployment
const CONTRACT_ADDRESS_KEY = 'spp_contract_address';
const DEFAULT_CONTRACT_ADDRESS = '0x1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p7Q8r9S0t';

export const MarketDataService = {
  getSPPContractAddress: (): string => {
    try {
      const saved = localStorage.getItem(CONTRACT_ADDRESS_KEY);
      return saved || DEFAULT_CONTRACT_ADDRESS;
    } catch {
      return DEFAULT_CONTRACT_ADDRESS;
    }
  },

  updateSPPContractAddress: (address: string): void => {
    try {
      localStorage.setItem(CONTRACT_ADDRESS_KEY, address);
    } catch (e) {
      console.error('Failed to update contract address in localStorage', e);
    }
  },

  getSPPTokenInfo: (): SPPTokenInfo => {
    return {
      name: 'SimuPay Token',
      symbol: 'SPP',
      decimals: 18,
      contractAddress: MarketDataService.getSPPContractAddress(),
      status: 'Awaiting DEX Listing', // "Not Listed Yet" or "Awaiting DEX Listing"
      totalSupply: '1,000,000,000'
    };
  },

  // Modular CoinGecko API integration with seamless offline fallback
  getPrices: async (): Promise<MarketPrices> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true',
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`CoinGecko API returned status ${response.status}`);
      }

      const data = await response.json();
      
      return {
        bitcoin: {
          usd: data.bitcoin?.usd || 65000,
          change24h: data.bitcoin?.usd_24h_change || 1.2
        },
        ethereum: {
          usd: data.ethereum?.usd || 3450,
          change24h: data.ethereum?.usd_24h_change || -0.8
        },
        tether: {
          usd: data.tether?.usd || 1.00,
          change24h: data.tether?.usd_24h_change || 0.01
        }
      };
    } catch (error) {
      console.warn('[MarketDataService] CoinGecko API failed or timed out, falling back to static mock rates:', error);
      // High-quality offline fallback rates
      return {
        bitcoin: { usd: 67420.50, change24h: 2.34 },
        ethereum: { usd: 3512.80, change24h: -1.15 },
        tether: { usd: 1.00, change24h: 0.02 }
      };
    }
  }
};
