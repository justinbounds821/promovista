import { Campaign, CampaignFilters, AcceptedCampaign, AcceptedCampaignStatus } from '../types/campaign';
import { supabase } from './supabaseClient'; // Vom folosi Supabase mai târziu
import { addCampaignReward } from './walletService'; // Pentru a acorda puncte
import { User } from '@supabase/supabase-js';


// Mock data pentru campanii
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign1',
    title: 'Expune Suc Natural de Mere',
    brandName: 'Fructis Delicios',
    productDescription: 'Sticlă de 1L de suc natural de mere, produs local.',
    points: 50,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Suc+Mere',
    rules: 'Produsul trebuie expus la nivelul ochilor, pe un raft curat. Minim 5 sticle vizibile. Campania durează 2 săptămâni.',
    targetCounty: 'CJ',
    targetStoreProfile: 'mic',
    requiredShelfSpace: 'mic',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'disponibila',
  },
  {
    id: 'campaign2',
    title: 'Display Special Napolitane Crocante',
    brandName: 'CrocoMax',
    productDescription: 'Napolitane cu cremă de ciocolată și alune, pachet 150g.',
    points: 120,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Napolitane',
    rules: 'Necesită amplasarea unui display de carton (furnizat de noi) la capăt de raft. Display-ul trebuie să fie mereu plin. Durata: 1 lună.',
    targetCounty: 'B',
    targetStoreProfile: 'mediu',
    requiredShelfSpace: 'mediu',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'disponibila',
  },
  {
    id: 'campaign3',
    title: 'Cafea Boabe Premium la Raft',
    brandName: 'Aroma Gold',
    productDescription: 'Pungă de 500g cafea boabe, prăjire medie.',
    points: 80,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Cafea+Boabe',
    rules: 'Expunere în zona de cafea, minim 3 pungi vizibile. Se oferă materiale promoționale.',
    requiredShelfSpace: 'mic',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'disponibila',
  }
];

// Mock data pentru campanii acceptate
const MOCK_ACCEPTED_CAMPAIGNS: AcceptedCampaign[] = [];

export const getAvailableCampaigns = async (
  filters?: CampaignFilters
): Promise<Campaign[]> => {
  console.log('Fetching available campaigns with filters:', filters);
  await new Promise(resolve => setTimeout(resolve, 500));
  let filteredCampaigns = MOCK_CAMPAIGNS.filter(c => c.status === 'disponibila');
  // ... simulare filtrare ...
  return filteredCampaigns;
};

export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
    console.log(`Fetching campaign by ID: ${campaignId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId);
    return campaign || null;
};

export const acceptCampaign = async (
  campaignId: string,
  user: User | null // Modificat pentru a primi obiectul User
): Promise<AcceptedCampaign> => {
  if (!user) throw new Error("Utilizator neautentificat pentru a accepta campania.");
  console.log(`User ${user.id} accepting campaign ${campaignId}`);
  await new Promise(resolve => setTimeout(resolve, 700));

  const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId);
  if (!campaign) {
    throw new Error('Campania nu a fost găsită.');
  }

  const existingAccepted = MOCK_ACCEPTED_CAMPAIGNS.find(ac => ac.campaignId === campaignId && ac.userId === user.id);
  if (existingAccepted) {
    console.warn(`User ${user.id} already accepted campaign ${campaignId}. Returning existing.`);
    return existingAccepted;
  }

  const newAcceptedCampaign: AcceptedCampaign = {
    id: `accepted_${campaignId}_${user.id}_${Date.now()}`,
    campaignId,
    userId: user.id,
    acceptedAt: new Date().toISOString(),
    // Status inițial: așteaptă confirmarea livrării de către agent
    status: 'asteptare_livrare_marfa',
    agentId: `agent_${Math.floor(Math.random() * 100)}`,
    lastStatusUpdate: new Date().toISOString(),
  };

  MOCK_ACCEPTED_CAMPAIGNS.push(newAcceptedCampaign);
  console.log('Campaign accepted, agent allocated (simulated):', newAcceptedCampaign.agentId, 'Status:', newAcceptedCampaign.status);

  // Simulare: Agentul confirmă livrarea după un timp
  setTimeout(() => {
    updateAcceptedCampaignStatusBySystem(newAcceptedCampaign.id, 'asteptare_poza', user, "Marfa a fost livrată de agent.");
  }, 7000); // Agentul confirmă după 7 secunde

  return newAcceptedCampaign;
};

export const getMyActiveCampaigns = async (userId: string): Promise<AcceptedCampaign[]> => {
  console.log(`Fetching active/all accepted campaigns for user ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 400));
  // Returnează toate campaniile acceptate pentru simularea insignei și a progresului, nu doar cele "active"
  return MOCK_ACCEPTED_CAMPAIGNS.filter(ac => ac.userId === userId)
                                .sort((a,b) => new Date(b.lastStatusUpdate || b.acceptedAt).getTime() - new Date(a.lastStatusUpdate || a.acceptedAt).getTime());
};

/**
 * Simulează actualizarea statusului unei campanii acceptate de către un sistem extern (Agent, Auditor, AI).
 */
export const updateAcceptedCampaignStatusBySystem = async (
    acceptedCampaignId: string,
    newStatus: AcceptedCampaignStatus,
    user: User | null, // User object necesar pentru addCampaignReward
    notes?: string
): Promise<AcceptedCampaign | null> => {
    console.log(`SYSTEM UPDATE: Updating status for ${acceptedCampaignId} to ${newStatus}. Notes: ${notes || 'N/A'}`);
    const campaignTask = MOCK_ACCEPTED_CAMPAIGNS.find(ac => ac.id === acceptedCampaignId);
    if (campaignTask) {
        campaignTask.status = newStatus;
        campaignTask.lastStatusUpdate = new Date().toISOString();
        if (notes) {
            if (newStatus === 'respinsa_ai' || newStatus === 'respinsa_audit') campaignTask.rejectionReason = notes;
            else campaignTask.auditNotes = notes;
        }

        // Dacă statusul devine 'validata', acordă punctele (intră în pending/antifraudă)
        if (newStatus === 'validata' && user) {
            const originalCampaign = MOCK_CAMPAIGNS.find(c => c.id === campaignTask.campaignId);
            if (originalCampaign) {
                await addCampaignReward(user, campaignTask.campaignId, originalCampaign.points, originalCampaign.title);
                campaignTask.pointsAwarded = originalCampaign.points; // Marchează punctele acordate
                // Ulterior, un alt proces ar muta statusul în 'puncte_acordate' după antifraudă.
                // Pentru simulare, putem face asta după un alt timeout.
                setTimeout(() => {
                    updateAcceptedCampaignStatusBySystem(acceptedCampaignId, 'puncte_acordate', user, "Puncte eliberate după perioada de antifraudă.");
                }, 10000); // 10 secunde pentru antifraudă (în loc de 48h)
            }
        }

        // Simulare: Dacă poza e trimisă la AI, AI-ul răspunde după un timp
        if (newStatus === 'poza_trimisa_ai_pending') {
            setTimeout(async () => {
                const aiScore = Math.random();
                if (aiScore > 0.7) {
                    updateAcceptedCampaignStatusBySystem(acceptedCampaignId, 'validata', user, "AI: Produs detectat corect!");
                } else if (aiScore > 0.3) {
                    updateAcceptedCampaignStatusBySystem(acceptedCampaignId, 'respinsa_ai', user, "AI: Produsul nu este la nivelul ochilor.");
                } else {
                    updateAcceptedCampaignStatusBySystem(acceptedCampaignId, 'asteptare_audit_manual', user, "AI: Scorul este prea mic, necesită audit.");
                    // Simulare: Auditorul intervine după un alt timp
                    setTimeout(() => {
                        const auditDecision = Math.random() > 0.5;
                        if (auditDecision) {
                             updateAcceptedCampaignStatusBySystem(acceptedCampaignId, 'validata', user, "Auditor: Imagine conformă.");
                        } else {
                             updateAcceptedCampaignStatusBySystem(acceptedCampaignId, 'respinsa_audit', user, "Auditor: Raft neconform.");
                        }
                    }, 8000); // Auditorul răspunde după 8 secunde
                }
            }, 5000); // AI-ul răspunde după 5 secunde
        }


        console.log(`SYSTEM UPDATE: Status for ${acceptedCampaignId} is now ${campaignTask.status}`);
        return { ...campaignTask }; // Returnează o copie pentru a forța re-randarea dacă e cazul
    }
    return null;
}
