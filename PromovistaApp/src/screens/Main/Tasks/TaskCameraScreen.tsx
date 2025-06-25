import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, Button } from 'react-native';
import { Camera, CameraType, FlashMode, CameraCapturedPicture } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../../types/navigation';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { updateAcceptedCampaignStatusBySystem } from '../../../services/campaignService'; // Importăm funcția de update
import { useAuth } from '../../../contexts/AuthContext'; // Pentru a pasa user object

// Simulare serviciu AI (rămâne la fel, dar va fi apelat de updateAcceptedCampaignStatusBySystem)
// const aiImageAnalysisService = { ... }; // Nu mai este necesar aici direct


type TaskCameraScreenRouteProp = RouteProp<MainStackParamList, 'TaskCamera'>;
type TaskCameraScreenNavigationProp = StackNavigationProp<MainStackParamList, 'TaskCamera'>;

const TaskCameraScreen: React.FC = () => {
  const route = useRoute<TaskCameraScreenRouteProp>();
  const navigation = useNavigation<TaskCameraScreenNavigationProp>();
  const { user } = useAuth(); // Obținem user-ul autentificat
  const { acceptedCampaignId, campaignTitle } = route.params;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(FlashMode.off);
  const cameraRef = useRef<Camera>(null);
  const [capturedImage, setCapturedImage] = useState<CameraCapturedPicture | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Vom folosi statusul din `AcceptedCampaign` pentru feedback, nu un `aiFeedback` local separat.
  // const [aiFeedback, setAiFeedback] = useState<{ score: number; hint?: string; status: 'approved' | 'rejected' | 'needs_audit' } | null>(null);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string | null>(null);
  const [currentTaskNotes, setCurrentTaskNotes] = useState<string | null>(null);


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    navigation.setOptions({ title: `Poză: ${campaignTitle}` });
  }, [campaignTitle, navigation]);

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      setCurrentTaskStatus('Procesare imagine...');
      setCurrentTaskNotes(null);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setCapturedImage(photo);

        // Notifică sistemul că o poză a fost trimisă și așteaptă analiza AI
        // Aceasta va declanșa simularea AI în `updateAcceptedCampaignStatusBySystem`
        const updatedTask = await updateAcceptedCampaignStatusBySystem(acceptedCampaignId, 'poza_trimisa_ai_pending', user, photo.uri);

        if (updatedTask) {
            // Așteptăm ca simularea AI din `updateAcceptedCampaignStatusBySystem` să se finalizeze
            // și să actualizeze statusul. Pentru UI, vom re-verifica statusul după un scurt delay
            // sau, ideal, am avea un sistem de listening la schimbările de status.
            // Aici, vom afișa un mesaj generic și vom lăsa utilizatorul să verifice statusul în CampaignDetails.
            setCurrentTaskStatus('Imagine trimisă pentru analiză.');
            setCurrentTaskNotes('Veți fi notificat sau puteți verifica statusul în detaliile campaniei.');
             Alert.alert("Imagine Trimisă", "Imaginea a fost trimisă pentru analiză. Puteți verifica statusul actualizat în detaliile campaniei.", [{ text: "OK" }]);
        } else {
            throw new Error("Nu s-a putut actualiza statusul task-ului.");
        }

      } catch (error) {
        console.error("Eroare la captura foto sau trimitere:", error);
        Alert.alert("Eroare", "Nu s-a putut procesa imaginea.");
        setCapturedImage(null);
        setCurrentTaskStatus(null);
      } finally {
        setIsProcessing(false);
        // Nu mai setăm isProcessing false aici, deoarece vrem să vedem mesajul de "Imagine trimisă"
        // Utilizatorul va apăsa "Trimite Altă Poză" sau "Înapoi"
      }
    }
  };

  if (hasPermission === null) {
    return <View style={styles.centered}><Text>Se solicită permisiunea pentru cameră...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.centered}><Text>Nu aveți acces la cameră. Vă rugăm activați permisiunea din setări.</Text></View>;
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <Camera style={styles.camera} type={type} flashMode={flash} ref={cameraRef} autoFocus={Camera.Constants.AutoFocus.on}>
          <View style={styles.overlay}>
            <View style={styles.guideFrame} />
            <Text style={styles.guideText}>Încadrați raftul aici</Text>
          </View>
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={() => setFlash(flash === FlashMode.off ? FlashMode.on : FlashMode.off)}>
              <MaterialIcons name={flash === FlashMode.off ? "flash-off" : "flash-on"} size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={isProcessing}
            >
              {isProcessing ? <ActivityIndicator color="#fff" /> : <MaterialIcons name="camera" size={50} color="white" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => setType(type === CameraType.back ? CameraType.front : CameraType.back)}>
              <MaterialIcons name="flip-camera-ios" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
          {isProcessing && <ActivityIndicator size="large" color="#007AFF" style={styles.processingIndicator} />}

          {/* Afișăm statusul curent al task-ului în loc de feedback-ul AI direct */}
          {currentTaskStatus && (
            <View style={[styles.feedbackBox, styles.auditBox ]}> {/* Folosim un stil generic */}
              <Text style={styles.feedbackTextTitle}>{currentTaskStatus}</Text>
              {currentTaskNotes && <Text style={styles.feedbackText}>{currentTaskNotes}</Text>}
            </View>
          )}

          <View style={styles.previewControls}>
            <Button title="Trimite Altă Poză" onPress={() => { setCapturedImage(null); setCurrentTaskStatus(null); setCurrentTaskNotes(null); setIsProcessing(false); }} disabled={isProcessing && currentTaskStatus !== null } />
             <Button title="Înapoi la Detalii" onPress={() => navigation.goBack()} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideFrame: {
    width: '90%',
    height: '60%',
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 0, 0.7)',
    borderRadius: 10,
  },
  guideText: {
    color: 'rgba(0, 255, 0, 0.7)',
    fontSize: 16,
    position: 'absolute',
    top: '18%',
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 20,
  },
  controlButton: {
    padding: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(150,150,150,0.7)',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  previewImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
    resizeMode: 'contain',
  },
  processingIndicator: {
    position: 'absolute',
  },
  feedbackBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    width: '90%',
  },
  approvedBox: { backgroundColor: 'rgba(40, 167, 69, 0.8)' }, // Păstrăm pentru referință, dar nu mai folosim direct
  rejectedBox: { backgroundColor: 'rgba(220, 53, 69, 0.8)' }, // Păstrăm
  auditBox: { backgroundColor: 'rgba(0, 122, 255, 0.8)' }, // Un albastru pentru status general
  feedbackTextTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
  }
});

export default TaskCameraScreen;
