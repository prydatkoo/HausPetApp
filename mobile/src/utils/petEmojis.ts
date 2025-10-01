const dogBreedEmojis = {
  'Golden Retriever': '🐕',
  'Labrador Retriever': '🦮',
  'German Shepherd': '🐕‍🦺',
  'Poodle': '🐩',
  'Bulldog': '🐶',
  'Beagle': '🦴',
  'Rottweiler': '🐕',
  'Dachshund': '🌭',
  'Corgi': '🐾',
  'Siberian Husky': '🐺',
  'Other': '🐶',
};

const catBreedEmojis = {
  'Siamese': '🐱',
  'Persian': '🐈',
  'Maine Coon': '🐈‍⬛',
  'Ragdoll': '🐱',
  'Bengal': '🐆',
  'Sphynx': '😺',
  'British Shorthair': '😸',
  'Scottish Fold': '😻',
  'Other': '😼',
};

export const getEmojiForPet = (species: 'dog' | 'cat' | 'other', breed?: string): string => {
  if (species === 'dog' && breed && (breed in dogBreedEmojis)) {
    return dogBreedEmojis[breed as keyof typeof dogBreedEmojis];
  }
  if (species === 'cat' && breed && (breed in catBreedEmojis)) {
    return catBreedEmojis[breed as keyof typeof catBreedEmojis];
  }

  // Fallback emojis
  switch (species) {
    case 'dog':
      return '🐶';
    case 'cat':
      return '🐱';
    default:
      return '🐾';
  }
};
