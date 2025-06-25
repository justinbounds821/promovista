import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../../types/navigation';
import { Campaign, AcceptedCampaign } from '../../../types/campaign';
import { getCampaignById, acceptCampaign, getMyActiveCampaigns } from '../../../services/campaignService';
import { useAuth } from '../../../contexts/AuthContext';
import VideoPlayerModal from '../../../components/VideoPlayerModal';
import { MERCHANDISING_VIDEO_URL } from '../../../config/gamification'; // Importăm constanta

let hasWatchedMerchandisingVideo = false;

type CampaignDetailsScreenRouteProp = RouteProp<MainStackParamList, 'CampaignDetails'>;
type CampaignDetailsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CampaignDetails' | 'TaskCamera'>;

// const MERCHANDISING_VIDEO_URL = 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'; // Mutat în config

const CampaignDetailsScreen: React.FC = () => {
  const route = useRoute<CampaignDetailsScreenRouteProp>();
  const navigation = useNavigation<CampaignDetailsScreenNavigationProp>();
  const { user } = useAuth();

  const { campaignId } = route.params;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [acceptedCampaignInfo, setAcceptedCampaignInfo] = useState<AcceptedCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const fetchCampaignData = useCallback(async (showLoader = true) => {
    if(showLoader) setIsLoading(true);
    try {
      const fetchedCampaign = await getCampaignById(campaignId);
      setCampaign(fetchedCampaign);

      if (user && fetchedCampaign) {
        const myCampaigns = await getMyActiveCampaigns(user.id);
        const existing = myCampaigns.find(ac => ac.campaignId === campaignId);
        if (existing) {
          setAcceptedCampaignInfo(existing);
          navigation.setOptions({ title: fetchedCampaign.title + ` (${existing.status.replace(/_/g, ' ')})` });
        } else {
          setAcceptedCampaignInfo(null);
          navigation.setOptions({ title: fetchedCampaign?.title || 'Detalii Campanie' });
        }
      } else if (fetchedCampaign) {
        navigation.setOptions({ title: fetchedCampaign.title || 'Detalii Campanie' });
      }

    } catch (error: any) {
      Alert.alert('Eroare', `Nu s-au putut încărca detaliile campaniei: ${error.message}`);
    } finally {
      if(showLoader) setIsLoading(false);
    }
  }, [campaignId, user, navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchCampaignData();
    }, [fetchCampaignData])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCampaignData(false);
    setIsRefreshing(false);
  }, [fetchCampaignData]);


  const handleAcceptCampaign = async () => {
    if (!user || !campaign) return;

    setIsAccepting(true);
    try {
      const acceptedInfo = await acceptCampaign(campaign.id, user);

      const myCampaigns = await getMyActiveCampaigns(user.id);
      const isFirstEverAccepted = myCampaigns.filter(c => c.userId === user.id).length === 1;

      Alert.alert(
        'Campanie Acceptată!',
        `Felicitări! Ai acceptat campania "${campaign.title}". Agentul alocat: ${acceptedInfo.agentId}. Status: ${acceptedInfo.status.replace(/_/g, ' ')}.`,
        [{ text: "OK", onPress: async () => {
            fetchCampaignData(false);
            if (isFirstEverAccepted && !hasWatchedMerchandisingVideo) {
              setShowVideoModal(true);
            }
        }}]
      );
    } catch (error: any) {
      Alert.alert('Eroare la acceptare', error.message);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleVideoEnd = () => {
    hasWatchedMerchandisingVideo = true;
    setShowVideoModal(false);
    Alert.alert("Informație Utilă!", "Sperăm că sfaturile de merchandising te vor ajuta!");
  };

  const handleGoToCamera = () => {
    if (campaign && acceptedCampaignInfo) {
      navigation.navigate('TaskCamera', {
        acceptedCampaignId: acceptedCampaignInfo.id,
        campaignTitle: campaign.title
      });
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Se încarcă detaliile campaniei...</Text>
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={styles.centered}>
        <Text>Campania nu a fost găsită.</Text>
        <Button title="Înapoi" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const canSubmitPhoto = acceptedCampaignInfo &&
                        (acceptedCampaignInfo.status === 'asteptare_poza' ||
                         acceptedCampaignInfo.status === 'respinsa_ai' ||
                         acceptedCampaignInfo.status === 'respinsa_audit');

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#007AFF"]}/>}
      >
        {campaign.imageUrl && (
          <Image source={{ uri: campaign.imageUrl }} style={styles.image} />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{campaign.title}</Text>
          <Text style={styles.brand}>Brand: {campaign.brandName}</Text>
          <Text style={styles.points}>Puncte oferite: {campaign.points}</Text>

          {acceptedCampaignInfo && (
            <View style={styles.statusInfoBox}>
                <Text style={styles.statusTitle}>Statusul Campaniei Tale:</Text>
                <Text style={styles.statusValue}>{acceptedCampaignInfo.status.replace(/_/g, ' ')}</Text>
                {acceptedCampaignInfo.agentId && <Text style={styles.agentInfo}>Agent alocat: {acceptedCampaignInfo.agentId}</Text>}
                {acceptedCampaignInfo.rejectionReason && <Text style={styles.notesInfo}>Motiv respingere: {acceptedCampaignInfo.rejectionReason}</Text>}
                {acceptedCampaignInfo.auditNotes && <Text style={styles.notesInfo}>Notițe audit: {acceptedCampaignInfo.auditNotes}</Text>}
                 {acceptedCampaignInfo.lastStatusUpdate && <Text style={styles.notesInfo}>Ultimul update: {new Date(acceptedCampaignInfo.lastStatusUpdate).toLocaleString()}</Text>}
            </View>
          )}

          <Text style={styles.sectionTitle}>Descrierea Produsului/Campaniei</Text>
          <Text style={styles.description}>{campaign.productDescription}</Text>

          <Text style={styles.sectionTitle}>Regulament</Text>
          <Text style={styles.rules}>{campaign.rules}</Text>

          {campaign.targetCounty && <Text style={styles.detailItem}>Județ țintă: {campaign.targetCounty}</Text>}
          {campaign.targetStoreProfile && <Text style={styles.detailItem}>Profil magazin: {campaign.targetStoreProfile}</Text>}
          {campaign.requiredShelfSpace && <Text style={styles.detailItem}>Spațiu la raft necesar: {campaign.requiredShelfSpace}</Text>}
          {campaign.startDate && <Text style={styles.detailItem}>Data început: {new Date(campaign.startDate).toLocaleDateString()}</Text>}
          {campaign.endDate && <Text style={styles.detailItem}>Data sfârșit: {new Date(campaign.endDate).toLocaleDateString()}</Text>}

          <View style={styles.buttonContainer}>
            {!acceptedCampaignInfo ? (
              <Button
                title={isAccepting ? 'Se acceptă...' : 'Acceptă Campania'}
                onPress={handleAcceptCampaign}
                disabled={isAccepting}
                color="#28a745"
              />
            ) : (
              canSubmitPhoto && (
                <View style={styles.actionButton}>
                  <Button
                    title="Trimite/Reîncearcă Poză Doadă"
                    onPress={handleGoToCamera}
                    color="#FF8C00"
                  />
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>
      <VideoPlayerModal
        isVisible={showVideoModal}
        videoUrl={MERCHANDISING_VIDEO_URL} // Folosim constanta importată
        title="Sfat Rapid Merchandising"
        onClose={() => {
            hasWatchedMerchandisingVideo = true;
            setShowVideoModal(false);
        }}
        onVideoEnd={handleVideoEnd}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  brand: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 16,
  },
  statusInfoBox: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 15,
    color: '#007bff',
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 3,
  },
  agentInfo: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle:'italic',
  },
   notesInfo: {
    fontSize: 13,
    color: '#495057',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#444',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 12,
  },
  rules: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  detailItem: {
    fontSize: 15,
    color: '#777',
    marginBottom: 6,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  actionButton: {
    marginTop: 15,
  },
});

export default CampaignDetailsScreen;
