import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
// Lazy-load expo-av only when voice features are used to avoid deprecation warnings on app launch
import { Message, Pet } from '../../types';
import { useAppSelector, useAppDispatch } from '../../store';
import AuthService from '../../services/api/authService';
import { addHealthAlert } from '../../store/slices/healthAlertSlice';
import CommunityService from '../../services/api/communityService';
import { APP_CONFIG } from '../../constants';
import { requestWidgetApproval, showSuccessToast } from '../../store/slices/uiSlice';
import { useTheme } from '@react-navigation/native';



const { width, height } = Dimensions.get('window');

const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const [sound, setSound] = useState<any>(null);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isRecordingFromHeader, setIsRecordingFromHeader] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<any>();

  const dispatch = useAppDispatch();
  const { pets } = useAppSelector((state) => state.pets);
  const theme = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    // Initial bot message
    setMessages([
      {
      id: '1',
        text: "🐾 Hello! I'm Dr. HausPet, your virtual veterinarian! Press and hold the microphone to talk to me.",
      isUser: false,
      },
    ]);
  }, []);

  const handleApiResponse = (data: any, petId: string | null) => {
    // Add user's transcribed message
    if (data.transcribed_text) {
      setMessages(prev => [
        { id: Date.now().toString(), text: data.transcribed_text, isUser: true },
        ...prev
      ]);
    }

    // Add bot's text response
    const botMessage = { id: (Date.now() + 1).toString(), text: data.response_text || data.response, isUser: false };
    setMessages(prev => [botMessage, ...prev]);

    // Play bot's audio response if available
    if (data.response_audio) {
      playSound(data.response_audio);
    }

    // Dispatch health alert if a condition is detected (or heuristic keywords for demo)
    const keywordDetected = /dermatitis|rash|itch|scratching|widget/i.test(data.response_text || data.response || '');
    if ((data.condition_detected || keywordDetected) && petId) {
      const pet = pets.find(p => p.id === petId as any);
      Alert.alert(
        'Health Condition Detected',
        `Dr. HausPet suspects your pet may have "${data.condition_detected || 'a condition'}". Add to health record and show a dashboard widget?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => {
              // Add alert to health records
              dispatch(addHealthAlert({ petId, condition: data.condition_detected }));
              // Request dashboard widget approval (auto-approved in demo)
              const widgetId = `${petId}-${Date.now()}`;
              dispatch(
                requestWidgetApproval({
                  id: widgetId,
                  petId: String(petId),
                  title: `Is ${pet?.name || 'your pet'} okay? Need further assistance?`,
                  metric: data.condition_detected || 'Dermatitis',
                  value: 'monitoring',
                })
              );
              dispatch(
                showSuccessToast({
                  title: 'Widget added',
                  message: 'A health widget has been added to your dashboard.'
                })
              );
            },
          },
        ]
      );
    }
  };


  const playSound = async (base64Audio: string) => {
    try {
      setIsBotSpeaking(true);
      const { Audio } = await import('expo-av');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: `data:audio/mp3;base64,${base64Audio}` });
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    } finally {
      setIsBotSpeaking(false);
    }
  };

  const startRecording = async () => {
    try {
      const { Audio } = await import('expo-av');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      setIsRecordingFromHeader(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Failed', 'Please make sure the app has microphone permissions.');
    }
  };

  const stopRecordingAndSend = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsRecordingFromHeader(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    if (uri) {
      setIsTyping(true);
      try {
        const formData = new FormData();
        // RN FormData expects a blob-like object; cast to any to satisfy TS
        (formData as any).append('audio', {
          uri,
          name: 'voice.m4a',
          type: 'audio/m4a',
        } as any);

        const token = await AuthService.getToken();
        if (!token) {
          Alert.alert('Authentication Error', 'You must be logged in to use voice chat.');
          setIsTyping(false);
          return;
        }

        const petId: string | null = pets.length > 0 ? (pets[0].id as string) : null;
        if (petId) {
          formData.append('pet_id', String(petId));
        }

        const response = await fetch(`${APP_CONFIG.apiBaseUrl}/api/v1/ai/voice-chat`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();

        if (response.ok) {
          handleApiResponse(data, petId);
        } else {
          throw new Error(data.error || 'Failed to get response');
        }

      } catch (error: any) {
        console.error('Voice chat error:', error);
        Alert.alert('Error', 'Could not process your voice message. Please try again.');
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prev => [userMessage, ...prev]);
    setInputText('');
    setIsTyping(true);

    try {
      const petId: string | null = pets.length > 0 ? (pets[0].id as string) : null;
      const response = await CommunityService.sendChatMessage(userMessage.text, petId);
      handleApiResponse(response, petId);
    } catch (error) {
      console.error('Text chat error:', error);
      Alert.alert('Error', 'Failed to send message.');
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isBotVoiceMessage = !item.isUser && isBotSpeaking;

    return (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
        <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
          {isBotVoiceMessage ? (
            <View style={styles.voiceMessageContainer}>
              <Ionicons name="pulse" size={24} color="#2E7D5A" />
              <Text style={styles.voiceMessageText}>Playing voice message...</Text>
            </View>
          ) : (
            <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
        {item.text}
      </Text>
          )}
    </View>
    </View>
  );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dr. HausPet</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('VideoCall')}
            style={styles.headerVideoButton}
            accessibilityLabel="Video chat"
          >
            <Ionicons name="videocam" size={18} color="#fff" />
          </TouchableOpacity>
          {/* Mic removed from header; footer mic restored */}
        </View>
      </View>
        <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
          keyExtractor={(item) => item.id}
        inverted
          style={styles.messagesList}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      
      {isTyping && <ActivityIndicator style={{ marginVertical: 10 }} />}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
          placeholder="Or type a message..."
          placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
        />
        <TouchableOpacity onPress={handleSendText} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={stopRecordingAndSend}
          style={[styles.footerMicButton, isRecording && styles.footerMicButtonRecording]}
          accessibilityLabel="Hold to speak"
        >
          <Ionicons name="mic" size={22} color={isRecording ? '#FF4444' : '#fff'} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerMicButton: {
    backgroundColor: '#4A90A4',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  headerVideoButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  headerMicButtonRecording: {
    backgroundColor: '#FFE6E6',
  },
  footerMicButton: {
    backgroundColor: '#4A90A4',
    borderRadius: 25,
    padding: 10,
    marginLeft: 10,
  },
  footerMicButtonRecording: {
    backgroundColor: '#FFE6E6',
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#2E7D5A',
  },
  botBubble: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: '#FFF',
  },
  botText: {
    color: theme.colors.text,
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceMessageText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2E7D5A',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  sendButton: {
    backgroundColor: '#2E7D5A',
    borderRadius: 25,
    padding: 10,
    marginLeft: 10,
  },
  // mic button moved to header
});

export default ChatbotScreen;
