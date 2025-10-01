import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { getEmojiForPet } from '../../utils/petEmojis';

interface AvatarProps {
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  imageUrl?: string | null;
  size?: number;
}

const getEmojiForSpecies = (species: 'dog' | 'cat' | 'other') => {
  switch (species) {
    case 'dog':
      return '🐶';
    case 'cat':
      return '🐱';
    default:
      return '🐾';
  }
};

const Avatar: React.FC<AvatarProps> = React.memo(({ species, breed, imageUrl, size = 80 }) => {
  let avatarContent;

  if (imageUrl) {
    try {
      // Handle generated emoji from AvatarGenerator
      const avatarData = JSON.parse(imageUrl);
      avatarContent = (
        <Text style={[styles.emoji, { fontSize: size / 2 }]}>
          {avatarData.emoji}
        </Text>
      );
    } catch (error) {
      // Handle regular image URL
      avatarContent = <Image source={{ uri: imageUrl }} style={styles.image} />;
    }
  } else {
    // Display emoji based on species and breed
    avatarContent = (
      <Text style={[styles.emoji, { fontSize: size / 2 }]}>
        {getEmojiForPet(species, breed)}
      </Text>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 4 }]}>
      {avatarContent}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    color: '#000',
  },
});

export default Avatar;
