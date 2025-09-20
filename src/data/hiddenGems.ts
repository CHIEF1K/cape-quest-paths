// Cape Town Hidden Gems Data
import tableMountainImg from '@/assets/table-mountain.jpg';
import lionsHeadImg from '@/assets/lions-head.jpg';
import boKaapImg from '@/assets/bo-kaap.jpg';
import kirstenboschImg from '@/assets/kirstenbosch.jpg';
import capePointImg from '@/assets/cape-point.jpg';
import chapmansPeakImg from '@/assets/chapmans-peak.jpg';
import cliftonBeachesImg from '@/assets/clifton-beaches.jpg';
import muizenbergBeachImg from '@/assets/muizenberg-beach.jpg';
import robbenIslandImg from '@/assets/robben-island.jpg';
import grootConstantiaImg from '@/assets/groot-constantia.jpg';
import testKitchenImg from '@/assets/test-kitchen.jpg';
import longStreetImg from '@/assets/long-street.jpg';

export interface HiddenGem {
  id: string;
  name: string;
  category: 'food' | 'hiking' | 'culture' | 'nature' | 'nightlife' | 'history';
  description: string;
  latitude: number;
  longitude: number;
  image?: string;
}

export const hiddenGems: HiddenGem[] = [
  {
    id: '1',
    name: 'Table Mountain',
    category: 'hiking',
    description: 'Iconic flat-topped mountain with hiking trails and a cable car offering panoramic views of Cape Town.',
    latitude: -33.9628,
    longitude: 18.4098,
    image: tableMountainImg,
  },
  {
    id: '2',
    name: "Lion's Head Hike",
    category: 'hiking',
    description: 'Popular sunrise and sunset hike with 360-degree views of the city and ocean.',
    latitude: -33.9361,
    longitude: 18.3899,
    image: lionsHeadImg,
  },
  {
    id: '3',
    name: 'Signal Hill',
    category: 'hiking',
    description: 'Easy walk or drive with spectacular city views, also a paragliding hotspot.',
    latitude: -33.918,
    longitude: 18.397,
  },
  {
    id: '4',
    name: 'Kirstenbosch National Botanical Garden',
    category: 'nature',
    description: 'World-renowned botanical gardens at the foot of Table Mountain.',
    latitude: -33.9881,
    longitude: 18.4325,
    image: kirstenboschImg,
  },
  {
    id: '5',
    name: 'Cape Point (Cape of Good Hope)',
    category: 'nature',
    description: 'Dramatic cliffs, rich biodiversity, and iconic ocean views.',
    latitude: -34.3568,
    longitude: 18.4974,
    image: capePointImg,
  },
  {
    id: '6',
    name: "Chapman's Peak Drive",
    category: 'nature',
    description: 'Scenic coastal drive with breathtaking ocean and mountain views.',
    latitude: -34.0514,
    longitude: 18.3523,
    image: chapmansPeakImg,
  },
  {
    id: '7',
    name: 'Clifton Beaches',
    category: 'nature',
    description: 'A series of four beautiful white sand beaches popular with locals and tourists.',
    latitude: -33.9335,
    longitude: 18.3775,
    image: cliftonBeachesImg,
  },
  {
    id: '8',
    name: 'Muizenberg Beach',
    category: 'nature',
    description: 'Surfing hotspot with colorful Victorian beach huts.',
    latitude: -34.1106,
    longitude: 18.4689,
    image: muizenbergBeachImg,
  },
  {
    id: '9',
    name: 'Sandy Bay Beach',
    category: 'nature',
    description: 'Secluded beach, quieter than Cape Town\'s main beaches.',
    latitude: -34.0306,
    longitude: 18.3369,
  },
  {
    id: '10',
    name: 'Silvermine Nature Reserve',
    category: 'hiking',
    description: 'Part of Table Mountain National Park with hiking, biking, and picnic areas.',
    latitude: -34.0867,
    longitude: 18.4306,
  },
  {
    id: '11',
    name: 'Bo-Kaap',
    category: 'culture',
    description: 'Historic neighborhood with brightly painted houses and Cape Malay culture.',
    latitude: -33.9183,
    longitude: 18.4165,
    image: boKaapImg,
  },
  {
    id: '12',
    name: 'Robben Island',
    category: 'history',
    description: 'Historic prison island where Nelson Mandela was imprisoned for 18 years.',
    latitude: -33.8066,
    longitude: 18.3662,
    image: robbenIslandImg,
  },
  {
    id: '13',
    name: 'Castle of Good Hope',
    category: 'history',
    description: '17th-century star fort, the oldest existing building in South Africa.',
    latitude: -33.9258,
    longitude: 18.4274,
  },
  {
    id: '14',
    name: 'District Six Museum',
    category: 'history',
    description: 'Museum documenting the apartheid-era forced removals in District Six.',
    latitude: -33.9286,
    longitude: 18.4233,
  },
  {
    id: '15',
    name: 'Iziko South African Museum & Planetarium',
    category: 'culture',
    description: 'Natural history, cultural exhibits, and a digital planetarium.',
    latitude: -33.9276,
    longitude: 18.4143,
  },
  {
    id: '16',
    name: 'Groot Constantia',
    category: 'food',
    description: 'South Africa\'s oldest wine estate offering tastings, tours, and history.',
    latitude: -34.0082,
    longitude: 18.4182,
    image: grootConstantiaImg,
  },
  {
    id: '17',
    name: 'Klein Constantia',
    category: 'food',
    description: 'Famous for its historic dessert wine, Vin de Constance.',
    latitude: -34.0215,
    longitude: 18.4192,
  },
  {
    id: '18',
    name: 'Steenberg Vineyards',
    category: 'food',
    description: 'Boutique vineyard with luxury dining and premium wines.',
    latitude: -34.075,
    longitude: 18.4297,
  },
  {
    id: '19',
    name: 'Durbanville Hills',
    category: 'food',
    description: 'Wine estate offering tastings with panoramic views of Table Mountain.',
    latitude: -33.8339,
    longitude: 18.5632,
  },
  {
    id: '20',
    name: 'Spier Wine Farm',
    category: 'food',
    description: 'Large wine farm in Stellenbosch with art, restaurants, and family activities.',
    latitude: -33.9631,
    longitude: 18.7696,
  },
  {
    id: '21',
    name: 'The Test Kitchen',
    category: 'food',
    description: 'Award-winning fine dining restaurant in Woodstock offering experimental tasting menus.',
    latitude: -33.9285,
    longitude: 18.4483,
    image: testKitchenImg,
  },
  {
    id: '22',
    name: 'La Colombe',
    category: 'food',
    description: 'World-class French-Asian fusion restaurant in Constantia.',
    latitude: -34.0228,
    longitude: 18.4015,
  },
  {
    id: '23',
    name: 'FYN Restaurant',
    category: 'food',
    description: 'Contemporary fine dining with Japanese and African influences.',
    latitude: -33.924,
    longitude: 18.4209,
  },
  {
    id: '24',
    name: 'Pot Luck Club',
    category: 'food',
    description: 'Trendy rooftop restaurant in Woodstock with tapas-style dishes.',
    latitude: -33.9283,
    longitude: 18.4482,
  },
  {
    id: '25',
    name: 'Gold Restaurant',
    category: 'food',
    description: 'African dining experience with storytelling, drumming, and a 14-dish tasting menu.',
    latitude: -33.9113,
    longitude: 18.4193,
  },
  {
    id: '26',
    name: 'Kloof Street House',
    category: 'food',
    description: 'Eclectic restaurant in a Victorian house with a great cocktail bar.',
    latitude: -33.9306,
    longitude: 18.4096,
  },
  {
    id: '27',
    name: 'Black Sheep Restaurant',
    category: 'food',
    description: 'Seasonal menu with fresh, locally sourced ingredients.',
    latitude: -33.933,
    longitude: 18.4097,
  },
  {
    id: '28',
    name: 'Harbour House (Kalk Bay)',
    category: 'food',
    description: 'Seafood restaurant with stunning views over False Bay.',
    latitude: -34.1292,
    longitude: 18.4492,
  },
  {
    id: '29',
    name: 'Foxcroft',
    category: 'food',
    description: 'Modern fine dining restaurant in Constantia with creative small plates.',
    latitude: -34.0214,
    longitude: 18.4038,
  },
  {
    id: '30',
    name: 'Chefs Warehouse at Beau Constantia',
    category: 'food',
    description: 'Tapas-style fine dining with panoramic vineyard views.',
    latitude: -34.0222,
    longitude: 18.4113,
  },
  {
    id: '31',
    name: 'The Crypt Jazz Club',
    category: 'nightlife',
    description: 'Live jazz venue in a historic church basement in Cape Town city centre.',
    latitude: -33.9252,
    longitude: 18.4203,
  },
  {
    id: '32',
    name: 'Long Street',
    category: 'nightlife',
    description: 'Cape Town\'s nightlife hub with bars, clubs, and restaurants.',
    latitude: -33.9255,
    longitude: 18.4147,
    image: longStreetImg,
  }
];

export const categoryColors = {
  food: '#FF6B6B',     // Coral
  hiking: '#4ECDC4',   // Teal
  culture: '#45B7D1',  // Ocean Blue
  nature: '#96CEB4',   // Sage Green
  nightlife: '#FECA57', // Golden Yellow
  history: '#A55EEA'   // Purple
};

export const categoryIcons = {
  food: '🍽️',
  hiking: '🥾',
  culture: '🎨',
  nature: '🌿',
  nightlife: '🌙',
  history: '🏛️'
};