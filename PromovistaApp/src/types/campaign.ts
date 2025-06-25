export interface Campaign {
  id: string;
  title: string;
  brandName: string;
  productDescription: string;
  points: number;
  imageUrl?: string;
  rules: string;
  targetCounty?: string;
  targetStoreProfile?: string;
  requiredShelfSpace?: 'mic' | 'mediu' | 'mare';
  startDate?: string;
  endDate?: string;
  status?: 'disponibila' | 'activa' | 'incheiata' | 'retrasa';
}

export interface CampaignFilters {
  county?: string;
  storeProfileType?: string;
  minShelfSpace?: 'mic' | 'mediu' | 'mare';
}

export type AcceptedCampaignStatus =
  | 'asteptare_livrare_marfa' // Agentul trebuie să confirme livrarea
  | 'asteptare_poza'          // Magazinul trebuie să facă poza
  | 'poza_trimisa_ai_pending' // Poza e la AI
  | 'asteptare_audit_manual'  // Poza necesită audit uman
  | 'respinsa_ai'             // Poza respinsă de AI, magazinul reîncearcă
  | 'respinsa_audit'          // Poza respinsă de auditor, magazinul reîncearcă (sau task eșuat)
  | 'validata_partial_audit'  // Auditor a validat, dar poate cu comentarii/ajustări
  | 'validata'                // Poza aprobată (de AI sau auditor), puncte în așteptare antifraudă
  | 'puncte_acordate'         // Puncte disponibile în portofel
  | 'finalizata'              // Campania s-a încheiat pentru acest magazin (ex: durată expirată post-validare)
  | 'esuata';                 // Taskul nu a putut fi completat

export interface AcceptedCampaign {
  id: string;
  campaignId: string;
  userId: string;
  acceptedAt: string;
  status: AcceptedCampaignStatus;
  agentId?: string | null;
  proofImageUrl?: string | null;
  rejectionReason?: string | null;
  auditNotes?: string | null; // Notițe de la auditor
  pointsAwarded?: number | null; // Punctele efectiv acordate (pot diferi de cele din campanie?)
  lastStatusUpdate?: string; // ISO string
}
