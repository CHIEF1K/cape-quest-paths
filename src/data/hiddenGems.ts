// Cape Town Hidden Gems Data

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
    name: "Lion's Head Hike",
    category: 'hiking',
    description: 'Popular sunrise/sunset hike with breathtaking 360° views of Cape Town, Table Mountain, and the Atlantic Ocean.',
    latitude: -33.9249,
    longitude: 18.4241,
  },
  {
    id: '2',
    name: 'Bo-Kaap Neighborhood',
    category: 'culture',
    description: 'Historic colorful neighborhood with cobblestone streets, Cape Malay culture, and stunning architecture.',
    latitude: -33.9186,
    longitude: 18.4119,
  },
  {
    id: '3',
    name: 'Kalk Bay Fishing Village',
    category: 'food',
    description: 'Charming seaside village with the best fresh seafood, antique shops, and harbor seals.',
    latitude: -34.1286,
    longitude: 18.4456,
  },
  {
    id: '4',
    name: 'Sandy Bay Secret Beach',
    category: 'nature',
    description: 'Hidden beach away from crowds, perfect for sunset walks and peaceful moments by the ocean.',
    latitude: -33.9597,
    longitude: 18.3756,
  },
  {
    id: '5',
    name: 'The Crypt Jazz Restaurant',
    category: 'nightlife',
    description: 'Underground jazz venue in a historic church crypt with live music and atmospheric dining.',
    latitude: -33.9249,
    longitude: 18.4241,
  },
  {
    id: '6',
    name: 'Chapman\'s Peak Drive',
    category: 'nature',
    description: 'One of the world\'s most spectacular coastal drives with dramatic cliff-side views.',
    latitude: -34.0582,
    longitude: 18.3491,
  },
  {
    id: '7',
    name: 'Castle of Good Hope',
    category: 'history',
    description: 'Star-shaped fortress built in 1666, the oldest surviving colonial building in South Africa.',
    latitude: -33.9249,
    longitude: 18.4291,
  },
  {
    id: '8',
    name: 'Camps Bay Beach',
    category: 'nature',
    description: 'Pristine white sand beach backed by the Twelve Apostles mountain range.',
    latitude: -33.9508,
    longitude: 18.3773,
  },
  {
    id: '9',
    name: 'V&A Waterfront Markets',
    category: 'food',
    description: 'Vibrant markets with local crafts, street food, and live entertainment by the harbor.',
    latitude: -33.9022,
    longitude: 18.4186,
  },
  {
    id: '10',
    name: 'Table Mountain Cable Car',
    category: 'hiking',
    description: 'Iconic flat-topped mountain offering panoramic views and unique fynbos vegetation.',
    latitude: -33.9628,
    longitude: 18.4099,
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