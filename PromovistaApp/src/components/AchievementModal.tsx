import React from 'react';
import { Modal, View, Text, StyleSheet, Button } from 'react-native';
import LottieView from 'lottie-react-native';

interface AchievementModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  lottieSource: string | object; // Poate fi un URL string sau un obiect JSON încărcat local
  onClose: () => void;
  loopAnimation?: boolean;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  isVisible,
  title,
  message,
  lottieSource,
  onClose,
  loopAnimation = false,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <LottieView
            source={typeof lottieSource === 'string' ? { uri: lottieSource } : lottieSource}
            autoPlay
            loop={loopAnimation}
            style={styles.lottieAnimation}
          />
          <Text style={styles.modalMessage}>{message}</Text>
          <Button title="Super!" onPress={onClose} color="#007AFF" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundal semi-transparent
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
});

export default AchievementModal;
