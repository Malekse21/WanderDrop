import type { Drop } from '../types';

const tunisianTrips = [
  {
    destination_city: 'Sidi Bou Said & Tunis',
    destination_country: 'Tunisia',
    airport_code: 'TUN',
    ai_reasoning: 'A perfect blend of Mediterranean views, blue-and-white architecture, and the bustling energy of the ancient Medina.',
    hints: [
      { emoji: '🧿', text: 'Cobbled streets painted in sky and snow' },
      { emoji: '☕', text: 'Pine nuts floating in mint tea' },
      { emoji: '🏛️', text: 'Ruins of a great ancient empire' }
    ],
    vibe_line: 'The salty Mediterranean breeze weaving through narrow alleyways of brilliant blue and blinding white.',
    itinerary: [
      {
        day: 1,
        theme: 'Colors of the Coast',
        slots: [
          { time: 'morning' as const, title: 'Café des Nattes', description: 'Sip traditional mint tea with pine nuts while overlooking the Gulf of Tunis.', duration: '1 hour', cost: '10 TND', type: 'local_gem' as const },
          { time: 'afternoon' as const, title: 'Wander Sidi Bou Said', description: 'Get lost in the iconic blue and white streets and visit the Ennejma Ezzahra palace.', duration: '3 hours', cost: 'Free', type: 'tourist_highlight' as const },
          { time: 'evening' as const, title: 'Dar Zarrouk', description: 'Elegant seafood dinner with a panoramic sunset view over the marina.', duration: '2 hours', cost: '80 TND', type: 'tourist_highlight' as const }
        ]
      },
      {
        day: 2,
        theme: 'Ancient Echoes',
        slots: [
          { time: 'morning' as const, title: 'Carthage Ruins', description: 'Explore the ancient Antonine Baths and Byrsa Hill.', duration: '3 hours', cost: '12 TND', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'Tunis Medina', description: 'Navigate the labyrinthine souks, sampling authentic Tunisian street food like brik and makroudh.', duration: '4 hours', cost: '20 TND', type: 'local_gem' as const },
          { time: 'evening' as const, title: 'Fondouk El Attarine', description: 'Traditional dinner in a beautifully restored historic caravanserai.', duration: '2 hours', cost: '60 TND', type: 'local_gem' as const }
        ]
      },
      {
        day: 3,
        theme: 'Modern Meets Tradition',
        slots: [
          { time: 'morning' as const, title: 'Bardo National Museum', description: 'Marvel at one of the world\'s largest collections of Roman mosaics in a 15th-century palace.', duration: '3 hours', cost: '13 TND', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'La Marsa Corniche', description: 'Stroll along the lively beach promenade and grab a sequence of street snacks.', duration: '2.5 hours', cost: '15 TND', type: 'local_gem' as const },
          { time: 'evening' as const, title: 'Le Saf Saf', description: 'Enjoy local tunes and fresh mint tea under the legendary ancient trees.', duration: '2 hours', cost: '10 TND', type: 'local_gem' as const }
        ]
      }
    ]
  },
  {
    destination_city: 'Tozeur',
    destination_country: 'Tunisia',
    airport_code: 'TOE',
    ai_reasoning: 'An unforgettable desert oasis experience with unique brick architecture and sprawling palm groves.',
    hints: [
      { emoji: '🌴', text: 'A sea of green in an ocean of sand' },
      { emoji: '🧱', text: 'Intricate geometric brick facades' },
      { emoji: '🌅', text: 'Salt flats glowing at sunset' }
    ],
    vibe_line: 'The dry desert heat softened by the shade of a hundred thousand date palms.',
    itinerary: [
      {
        day: 1,
        theme: 'The Great Oasis',
        slots: [
          { time: 'morning' as const, title: 'Tozeur Palmeraie', description: 'Cycle or take a horse-drawn carriage through the massive date palm oasis.', duration: '3 hours', cost: '30 TND', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'Medina of Tozeur (Ouled El Hadef)', description: 'Admire the 14th-century architectural quarter with outstanding brickwork.', duration: '2 hours', cost: 'Free', type: 'local_gem' as const },
          { time: 'evening' as const, title: 'Dar Dedas', description: 'A quiet, authentic dinner featuring local camel meat specialties.', duration: '2 hours', cost: '40 TND', type: 'local_gem' as const }
        ]
      },
      {
        day: 2,
        theme: 'Desert Mirages',
        slots: [
          { time: 'morning' as const, title: 'Chott el Djerid', description: 'Walk across the vast, shimmering salt flats and look for mirages.', duration: '2 hours', cost: 'Free', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'Chebika Oasis', description: 'Hike into the mountains to find clear water pools and waterfalls hidden in the rock.', duration: '4 hours', cost: '50 TND', type: 'tourist_highlight' as const },
          { time: 'evening' as const, title: 'Stargazing at Ong Jemel', description: 'Find a quiet spot outside the city lights to watch the desert sky over the old Star Wars sets.', duration: '2 hours', cost: 'Free', type: 'local_gem' as const }
        ]
      },
      {
        day: 3,
        theme: 'Wonders of the South',
        slots: [
          { time: 'morning' as const, title: 'Eden Palm', description: 'Visit the date palm museum to learn about the ecosystem and taste premium Deglet Nour dates.', duration: '2 hours', cost: '15 TND', type: 'local_gem' as const },
          { time: 'afternoon' as const, title: 'Canyon of Mides', description: 'Walk through the dramatic twisting gorges near the Algerian border.', duration: '3 hours', cost: '25 TND', type: 'tourist_highlight' as const },
          { time: 'evening' as const, title: 'Sahara Lounge', description: 'Unwind with a mint tea and shisha in an atmospheric desert camp setting.', duration: '2 hours', cost: '20 TND', type: 'local_gem' as const }
        ]
      }
    ]
  },
  {
    destination_city: 'Djerba',
    destination_country: 'Tunisia',
    airport_code: 'DJE',
    ai_reasoning: 'The "Island of Dreams" offers pristine beaches, unique cultural heritage, and vibrant street art.',
    hints: [
      { emoji: '🏝️', text: 'The island of the lotus-eaters' },
      { emoji: '🎨', text: 'Traditional walls covered in modern murals' },
      { emoji: '🏺', text: 'Clay pots drying in the sun' }
    ],
    vibe_line: 'Warm sand underfoot and the smell of jasmine drifting through whitewashed courtyards.',
    itinerary: [
      {
        day: 1,
        theme: 'Art & Heritage',
        slots: [
          { time: 'morning' as const, title: 'Djerbahood (Erriadh)', description: 'Wander through an incredible open-air museum of street art in a traditional village.', duration: '3 hours', cost: 'Free', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'El Ghriba Synagogue', description: 'Visit Africa\'s oldest synagogue, beautifully adorned with blue tiles and stained glass.', duration: '1.5 hours', cost: 'Donation', type: 'tourist_highlight' as const },
          { time: 'evening' as const, title: 'Houmt Souk Fish Market', description: 'Buy fresh fish and have it grilled immediately at a tiny nearby restaurant.', duration: '2 hours', cost: '30 TND', type: 'local_gem' as const }
        ]
      },
      {
        day: 2,
        theme: 'Coastal Chill',
        slots: [
          { time: 'morning' as const, title: 'Guellala Pottery Village', description: 'Watch artisans throwing clay and explore the underground workshops.', duration: '2 hours', cost: '15 TND', type: 'local_gem' as const },
          { time: 'afternoon' as const, title: 'Sidi Yati Beach', description: 'Relax on one of the island\'s quietest and most beautiful white sand beaches.', duration: '4 hours', cost: 'Free', type: 'local_gem' as const },
          { time: 'evening' as const, title: 'Cafe Chichkhan', description: 'Enjoy tea, shisha, and lively local atmosphere in Houmt Souk.', duration: '2 hours', cost: '15 TND', type: 'tourist_highlight' as const }
        ]
      },
      {
        day: 3,
        theme: 'Island Rhythms',
        slots: [
          { time: 'morning' as const, title: 'Borj El Kebir', description: 'Explore the 15th-century fortress overlooking the sea.', duration: '1.5 hours', cost: '8 TND', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'Flamingo Island (Ras Rmel)', description: 'Take a pirate ship excursion to a pristine peninsula to swim and eat.', duration: '4.5 hours', cost: '40 TND', type: 'tourist_highlight' as const },
          { time: 'evening' as const, title: 'Dar Hassine', description: 'Have a quiet dinner in a restored Djerbian Houch (traditional house).', duration: '2 hours', cost: '50 TND', type: 'local_gem' as const }
        ]
      }
    ]
  },
  {
    destination_city: 'El Jem & Mahdia',
    destination_country: 'Tunisia',
    airport_code: 'MIR',
    ai_reasoning: 'Immerse yourself in Roman gladiator history before relaxing on some of the clearest coastlines in North Africa.',
    hints: [
      { emoji: '🏟️', text: 'An amphitheater rivaling Rome' },
      { emoji: '🌊', text: 'Crystal clear waters and ancient gates' },
      { emoji: '🐠', text: 'Fresh catch by the old port' }
    ],
    vibe_line: 'The echo of ancient crowds giving way to the gentle crash of the Mediterranean tide.',
    itinerary: [
      {
        day: 1,
        theme: 'Gladiators and Mosaics',
        slots: [
          { time: 'morning' as const, title: 'Amphitheatre of El Jem', description: 'Walk the incredible, towering ruins of one of the largest Roman amphitheaters in the world.', duration: '3 hours', cost: '12 TND', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'El Jem Archaeological Museum', description: 'Discover an immaculate collection of Roman mosaics preserved perfectly in time.', duration: '2 hours', cost: 'Included', type: 'local_gem' as const },
          { time: 'evening' as const, title: 'Drive to Mahdia & Seafood Dinner', description: 'Head to the coast and enjoy the freshest seafood right next to the fishing port.', duration: '3 hours', cost: '40 TND', type: 'local_gem' as const }
        ]
      },
      {
        day: 2,
        theme: 'The Fatimid Capital',
        slots: [
          { time: 'morning' as const, title: 'Skifa el Kahla', description: 'Pass through the massive, dark 10th-century fortified gate into the old Medina.', duration: '1 hour', cost: 'Free', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'Mahdia Corniche Beach', description: 'Swim in what are widely considered the clearest, most turquoise waters in Tunisia.', duration: '4 hours', cost: 'Free', type: 'tourist_highlight' as const },
          { time: 'evening' as const, title: 'Café Sidi Salem', description: 'Sip tea perched literally on the cliff edge while the waves crash below.', duration: '2 hours', cost: '10 TND', type: 'local_gem' as const }
        ]
      },
      {
        day: 3,
        theme: 'Coastal Secrets',
        slots: [
          { time: 'morning' as const, title: 'Borj El Kebir (Mahdia)', description: 'Explore the 16th-century Ottoman fortress located right on the cape tip.', duration: '1.5 hours', cost: '8 TND', type: 'tourist_highlight' as const },
          { time: 'afternoon' as const, title: 'Cap Africa Marine Cemetery', description: 'Walk among the striking white tombs overlooking the deep blue sea.', duration: '1.5 hours', cost: 'Free', type: 'local_gem' as const },
          { time: 'evening' as const, title: 'Medina Shopping & Dinner', description: 'Hunt for traditional silk weaving in the souk before a rooftop dinner.', duration: '3 hours', cost: '50 TND', type: 'tourist_highlight' as const }
        ]
      }
    ]
  }
];

export const getRandomTunisianTrip = (): Partial<Drop> => {
  const trip = tunisianTrips[Math.floor(Math.random() * tunisianTrips.length)];
  return {
    ...trip,
    id: `mock-${Date.now()}`,
    user_id: 'local-user',
    status: 'generating',
    welcome_challenge: `Head to the nearest café upon arrival in ${trip.destination_city} and order "un thé aux pignons" using only hand gestures.`,
    created_at: new Date().toISOString()
  };
};

export const mockDrop = tunisianTrips[0];
export const mockItinerary = tunisianTrips[0].itinerary;
