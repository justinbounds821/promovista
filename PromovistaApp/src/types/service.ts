export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  longDescription?: string; // Descriere mai detaliată pentru un ecran de detalii
  pointsCost: number;
  providerInfo?: string; // Numele furnizorului, date de contact etc.
  estimatedDeliveryTime?: string; // ex: "3-5 zile lucrătoare", "1 săptămână"
  imageUrl?: string; // O imagine reprezentativă pentru serviciu
  category?: string; // ex: 'Marketing', 'Software', 'Consultanță'
}

// Pentru a urmări solicitările de servicii
export interface ServiceRequest {
  id: string; // ID unic al solicitării
  userId: string;
  serviceId: string;
  serviceTitle: string; // Denormalizat pentru afișare ușoară
  pointsBlocked: number;
  status: 'pending_approval' | 'in_progress' | 'delivered' | 'cancelled' | 'rejected';
  requestedAt: string; // ISO date string
  deliveryDetails?: string; // Detalii despre livrare, link-uri etc.
  // Alte câmpuri relevante
}
