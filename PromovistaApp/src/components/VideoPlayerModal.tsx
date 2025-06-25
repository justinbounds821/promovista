import React, { useRef, useState } from 'react';
import { Modal, View, StyleSheet, Button, Text, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

interface VideoPlayerModalProps {
  isVisible: boolean;
  videoUrl: string;
  title?: string;
  onClose: () => void;
  onVideoEnd?: () => void; // Callback când video-ul se termină
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isVisible,
  videoUrl,
  title = "Clip Informativ",
  onClose,
  onVideoEnd,
}) => {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    if (playbackStatus.isLoaded) {
        setIsLoading(false);
        if (playbackStatus.didJustFinish) {
            if (onVideoEnd) {
                onVideoEnd();
            }
            // Oprim și închidem automat la final, sau lăsăm utilizatorul să închidă
            // video.current?.stopAsync();
            // onClose();
        }
    } else {
        setIsLoading(true);
        if (playbackStatus.error) {
            console.error("Video playback error:", playbackStatus.error);
            Alert.alert("Eroare Video", "Nu s-a putut încărca clipul video.");
            onClose();
        }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false} // De obicei false pentru video fullscreen
      visible={isVisible}
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']} // Permite landscape pentru video
    >
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {isLoading && <ActivityIndicator size="large" color="#FFF" style={styles.loader} />}
        <Video
          ref={video}
          style={styles.video}
          source={{ uri: videoUrl }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={(error) => console.error("Video component error:", error)}
          shouldPlay={true} // Pornește automat la deschidere
        />
        <View style={styles.controls}>
            {status?.isLoaded && !status.isPlaying && status.positionMillis > 0 && status.positionMillis < (status.durationMillis || Infinity) && (
                 <Button title="Continuă Redarea" onPress={() => video.current?.playAsync()} />
            )}
            <Button title="Închide Clipul" onPress={onClose} color="#FF6347" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',
    top: 50, // Sau folosește SafeAreaView
    zIndex: 1,
  },
  loader: {
    position: 'absolute', // Afișează peste video în timpul încărcării
    zIndex: 2,
  },
  video: {
    width: '100%',
    height: '70%', // Ajustează după preferințe
  },
  controls: {
    position: 'absolute',
    bottom: 40, // Sau folosește SafeAreaView
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default VideoPlayerModal;
