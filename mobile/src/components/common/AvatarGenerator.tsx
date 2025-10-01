import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarGeneratorProps {
  visible: boolean;
  onClose: () => void;
  onAvatarGenerated: (avatar: string) => void;
  petName?: string;
}

interface AvatarStyle {
  id: string;
  name: string;
  emoji: string;
  colors: string[];
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({
  visible,
  onClose,
  onAvatarGenerated,
  petName = 'Your Pet',
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('cute');
  const [selectedColor, setSelectedColor] = useState<string>('#FF6B6B');

  const [customPrompt, setCustomPrompt] = useState<string>('');

  const avatarStyles: AvatarStyle[] = [
    { id: 'cute', name: 'Cute', emoji: '🐕', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'] },
    { id: 'cartoon', name: 'Cartoon', emoji: '🐶', colors: ['#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3'] },
    { id: 'realistic', name: 'Realistic', emoji: '🦮', colors: ['#8B4513', '#654321', '#A0522D', '#CD853F'] },
    { id: 'anime', name: 'Anime', emoji: '🐺', colors: ['#FF69B4', '#9370DB', '#20B2AA', '#FF6347'] },
    { id: 'minimalist', name: 'Minimalist', emoji: '🐾', colors: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6'] },
  ];

  const generateAvatar = () => {
    const style = avatarStyles.find(s => s.id === selectedStyle);
    if (!style) return;
    
    // Create a simple avatar based on style and color
    const avatar = `${style.emoji}`;
    
  // In a real app, this could call an image generation service
    // For now, we'll return the emoji with style info
    const avatarData = {
      emoji: avatar,
      style: selectedStyle,
      color: selectedColor,
      name: petName,
      prompt: customPrompt || `A ${selectedStyle} style pet avatar in ${selectedColor} color`,
    };

    onAvatarGenerated(JSON.stringify(avatarData));
    onClose();
  };

  const currentStyle = avatarStyles.find(s => s.id === selectedStyle);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
      <Text style={styles.title}>Avatar Generator</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>


            {/* Style Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Style</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.styleContainer}>
                  {avatarStyles.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleOption,
                        selectedStyle === style.id && styles.selectedStyle,
                      ]}
                      onPress={() => setSelectedStyle(style.id)}
                    >
                      <Text style={styles.styleEmoji}>{style.emoji}</Text>
                      <Text style={styles.styleName}>{style.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Color Selection */}
            {currentStyle && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Choose Color</Text>
                <View style={styles.colorContainer}>
                  {currentStyle.colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColor,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Custom Prompt */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custom Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your perfect pet avatar..."
                value={customPrompt}
                onChangeText={setCustomPrompt}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Preview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.previewContainer}>
                <View style={[styles.previewAvatar, { backgroundColor: selectedColor + '20' }]}>
                  <Text style={styles.previewEmoji}>{currentStyle?.emoji}</Text>
                </View>
                <Text style={styles.previewText}>
                  {petName || 'Your Pet'} - {currentStyle?.name} Style
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Generate Button */}
          <TouchableOpacity style={styles.generateButton} onPress={generateAvatar}>
            <Ionicons name="sparkles" size={20} color="white" />
            <Text style={styles.generateButtonText}>Generate Avatar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FAFBFC',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  styleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  styleOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFBFC',
    minWidth: 80,
  },
  selectedStyle: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },
  styleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  styleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  colorContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedColor: {
    borderColor: '#111827',
  },
  previewContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewEmoji: {
    fontSize: 40,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    padding: 16,
    margin: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default AvatarGenerator; 