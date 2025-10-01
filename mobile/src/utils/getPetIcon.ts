import { Pet } from '../types';

const getPetIcon = (pet: Pet): string => {
  const { species, breed } = pet;
  
  const toSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  if (species === 'dog') {
    if (breed) {
      const breedSlug = toSlug(breed);
      return `breeds/dog/${breedSlug}.png`;
    }
    return 'breeds/dog/default.png';
  } else if (species === 'cat') {
    if (breed) {
      const breedSlug = toSlug(breed);
      return `breeds/cat/${breedSlug}.png`;
    }
    return 'breeds/cat/default.png';
  }

  return 'breeds/paw.png';
};

export default getPetIcon;
