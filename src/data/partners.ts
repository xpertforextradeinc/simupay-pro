export interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  buttonText: string;
  link: string;
  badge?: string;
  benefits?: string[];
}

export const partners: Partner[] = [
  {
    id: 'gate',
    name: 'Gate',
    category: 'Cryptocurrency Exchange',
    description: 'Gate is a top-tier global cryptocurrency exchange offering trading for hundreds of digital assets, spot and futures markets, high liquidity, and robust digital asset management services.',
    buttonText: 'Create Free Account',
    link: 'https://www.gate.com/share/slipmint',
    badge: 'Highly Recommended',
    benefits: [
      'Comprehensive spot, margin, and futures trading options',
      'Over 1,400+ cryptocurrency markets available',
      'Advanced wallet security with multi-sig technology',
      'Leading digital asset management features'
    ]
  },
  {
    id: 'bybit',
    name: 'Bybit',
    category: 'Derivatives Exchange',
    description: 'Bybit offers lightning-fast trade execution, low fees, and reliable liquidity for derivatives and spot trading.',
    buttonText: 'Start Trading on Bybit',
    link: 'https://www.bybit.com/register?affiliate_id=slipmint',
    benefits: [
      'Zero downtime matching engine',
      'Unified trading accounts',
      'Advanced algorithmic trading bots',
      'High-yield earn products'
    ]
  },
  {
    id: 'tradingview',
    name: 'TradingView',
    category: 'Charting & Analysis',
    description: 'The world\'s most popular charting platform and social network for traders and investors.',
    buttonText: 'Get TradingView Pro',
    link: 'https://www.tradingview.com/?aff_id=slipmint',
    badge: 'Essential Tool',
    benefits: [
      'Advanced charting and indicators',
      'Global community of traders',
      'Custom Pine Script strategies',
      'Real-time global market data'
    ]
  }
];

export const DISCLOSURE_TEXT = 'Partner link: If you choose to register through this link, SlipMint may earn a commission at no additional cost to you.';
