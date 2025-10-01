import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AIService from '../../services/api/aiService';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// Placeholder UI-only video call screen. Integrate real SDK (e.g., Agora, Twilio) later.

const VideoCallScreen: React.FC = () => {
  const navigation = useNavigation();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [assistantReply, setAssistantReply] = useState<string>('');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const askAssistant = async () => {
    const reply = await AIService.chat('Join the call as a vet and guide me.');
    setAssistantReply(reply);
  };

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const photo: any = await (cameraRef.current as any).takePictureAsync({ quality: 0.8 });
        setCapturedUri(photo?.uri || null);
        const reply = await AIService.chat('Analyze the dog in this photo for visible issues and advice.');
        setAssistantReply(reply);
      }
    } catch (e) {
      setAssistantReply('Could not capture photo.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.remoteVideo}>
        {capturedUri ? (
          <Image source={{ uri: capturedUri }} style={{ width: '100%', height: '100%' }} />
        ) : permission?.granted ? (
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing={camOn ? 'back' : 'front'} />
        ) : (
          <Text style={styles.placeholderText}>Camera permission required</Text>
        )}
      </View>
      <View style={styles.selfVideo}>
        <Text style={styles.placeholderSelf}>You</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlBtn, !micOn && styles.off]} onPress={() => setMicOn(!micOn)}>
          <Ionicons name={micOn ? 'mic' : 'mic-off'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, !camOn && styles.off]} onPress={() => setCamOn(!camOn)}>
          <Ionicons name={camOn ? 'videocam' : 'videocam-off'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, styles.assistant]} onPress={askAssistant}>
          <Ionicons name="sparkles" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, styles.capture]} onPress={takePhoto}>
          <Ionicons name="camera" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.hangup]}
          onPress={() => {
            const nav: any = navigation;
            if (nav?.canGoBack?.()) {
              nav.goBack();
            } else {
              nav.navigate('Main');
            }
          }}
        >
          <Ionicons name="call" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {assistantReply ? (
        <View style={styles.assistantBubble}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#111" />
          <Text style={styles.assistantText}>{assistantReply}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#bbb' },
  selfVideo: {
    position: 'absolute',
    width: 120,
    height: 160,
    right: 16,
    top: 60,
    backgroundColor: '#222',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  placeholderSelf: { color: '#ddd' },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: {
    backgroundColor: '#6b7280',
  },
  assistant: {
    backgroundColor: '#8b5cf6',
  },
  capture: {
    backgroundColor: '#22c55e',
  },
  hangup: {
    backgroundColor: '#ef4444',
  },
  assistantBubble: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  assistantText: {
    color: '#111827',
  },
});

export default VideoCallScreen;


