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
    link: 'https://www.gate.com/share/simupaypro',
    badge: 'Highly Recommended',
    benefits: [
      'Comprehensive spot, margin, and futures trading options',
      'Over 1,400+ cryptocurrency markets available',
      'Advanced wallet security with multi-sig technology',
      'Leading digital asset management features'
    ]
  }
];

export const DISCLOSURE_TEXT = 'Partner link: If you choose to register through this link, SIMUPAY PRO may earn a commission at no additional cost to you.';
