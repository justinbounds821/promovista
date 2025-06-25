import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Campaign } from '../types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: (campaignId: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(campaign.id)}>
      {campaign.imageUrl && (
        <Image source={{ uri: campaign.imageUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{campaign.title}</Text>
        <Text style={styles.brand}>Brand: {campaign.brandName}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {campaign.productDescription}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.points}>{campaign.points} Puncte</Text>
          {/* Se pot adăuga și alte hint-uri aici dacă e relevant pentru card */}
          {campaign.targetCounty && <Text style={styles.hint}>Jud. {campaign.targetCounty}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Asigură că imaginea nu depășește colțurile rotunjite
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  brand: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745', // Verde pentru puncte
  },
  hint: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  }
});

export default CampaignCard;
