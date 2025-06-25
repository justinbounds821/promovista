import { ServiceItem, ServiceRequest } from '../types/service';
import { Wallet, WalletTransaction, TransactionType, TransactionStatus, MOCK_WALLETS, MOCK_TRANSACTIONS, ensureWalletExists } from './walletService'; // Importăm din walletService
import { User } from '@supabase/supabase-js';

// Mock data pentru servicii
const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 'service1',
    title: 'Creare Website de Prezentare',
    description: 'Un site modern pentru afacerea ta, optimizat mobil.',
    longDescription: 'Pachetul include design personalizat (până la 5 pagini), formular de contact, integrare Google Maps și optimizare SEO de bază. Găzduire și domeniu nu sunt incluse.',
    pointsCost: 2500,
    providerInfo: 'Web Solutions SRL',
    estimatedDeliveryTime: '2-3 săptămâni',
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Website',
    category: 'Software',
  },
  {
    id: 'service2',
    title: 'Campanie Publicitate Online (Basic)',
    description: 'Promovează-ți magazinul pe Google Ads sau Facebook Ads.',
    longDescription: 'Buget de 150 RON inclus pentru reclame. Include setarea campaniei, definirea audienței țintă și monitorizare timp de o săptămână. Raport de performanță la final.',
    pointsCost: 500,
    providerInfo: 'Boost Advertising',
    estimatedDeliveryTime: '1 săptămână',
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Online+Ads',
    category: 'Marketing',
  },
  {
    id: 'service3',
    title: 'Modul ERP Simplificat (Stocuri)',
    description: 'O soluție cloud pentru gestionarea stocurilor magazinului.',
    longDescription: 'Acces la platforma ERP pentru un utilizator timp de 1 an. Include funcții de intrare/ieșire marfă, inventar, alerte stoc minim. Suport tehnic inclus.',
    pointsCost: 3000,
    providerInfo: 'ERP Innovate',
    estimatedDeliveryTime: 'Activare în 24h',
    imageUrl: 'https://via.placeholder.com/300x200.png?text=ERP+Stocuri',
    category: 'Software',
  },
  {
    id: 'service4',
    title: 'Consultanță Antreprenorială (1h)',
    description: 'Sesiune de consultanță 1-la-1 cu un expert.',
    longDescription: 'Discută provocările afacerii tale, strategii de creștere, optimizare costuri sau orice alt subiect relevant. Sesiunea se desfășoară online.',
    pointsCost: 350,
    providerInfo: 'Mentor Biz',
    estimatedDeliveryTime: 'Programare în max. 3 zile',
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Consultanta',
    category: 'Consultanță',
  }
];

// Mock data pentru solicitări de servicii
const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [];


/**
 * Preia lista de servicii disponibile.
 * TODO: Înlocuiește cu apel real către Supabase.
 */
export const getAvailableServices = async (): Promise<ServiceItem[]> => {
  console.log('SpendService: Fetching available services.');
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulare rețea
  return MOCK_SERVICES;
};

/**
 * Preia un serviciu specific după ID (simulat).
 * TODO: Înlocuiește cu apel real către Supabase.
 */
export const getServiceById = async (serviceId: string): Promise<ServiceItem | null> => {
    console.log(`SpendService: Fetching service by ID: ${serviceId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    const service = MOCK_SERVICES.find(s => s.id === serviceId);
    return service || null;
};


/**
 * Simulează solicitarea unui serviciu de către un utilizator.
 * Aceasta ar trebui să interacționeze cu WalletService pentru a bloca punctele.
 * @param userId ID-ul utilizatorului.
 * @param serviceId ID-ul serviciului solicitat.
 */
export const requestService = async (
  user: User | null,
  serviceId: string,
): Promise<{ success: boolean; message: string; serviceRequest?: ServiceRequest }> => {
  if (!user) return { success: false, message: 'Utilizator neautentificat.' };

  ensureWalletExists(user.id); // Asigură că portofelul mock există
  const wallet = MOCK_WALLETS[user.id];
  const service = MOCK_SERVICES.find(s => s.id === serviceId);

  if (!service) {
    return { success: false, message: 'Serviciul selectat nu a fost găsit.' };
  }

  if (wallet.available_balance < service.pointsCost) {
    return { success: false, message: `Fonduri insuficiente. Aveți nevoie de ${service.pointsCost} puncte, dar aveți doar ${wallet.available_balance} disponibile.` };
  }

  console.log(`SpendService: User ${user.id} requesting service ${serviceId} for ${service.pointsCost} points.`);
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulare procesare

  // 1. Blochează punctele în portofel
  wallet.available_balance -= service.pointsCost;
  wallet.blocked_balance += service.pointsCost;
  wallet.updated_at = new Date().toISOString();

  // 2. Creează o tranzacție de blocare în istoricul portofelului
  const transaction: WalletTransaction = {
    id: `txn_spend_${Date.now()}`,
    wallet_id: user.id,
    type: 'spend_on_service',
    amount: -service.pointsCost, // Debit din perspectiva soldului disponibil
    status: 'blocked', // Puncte blocate
    description: `Blocare puncte pentru serviciul: ${service.title}`,
    related_entity_id: service.id,
    created_at: new Date().toISOString(),
  };
  MOCK_TRANSACTIONS.push(transaction);

  // 3. Înregistrează solicitarea serviciului
  const newServiceRequest: ServiceRequest = {
    id: `sr_${Date.now()}`,
    userId: user.id,
    serviceId: service.id,
    serviceTitle: service.title,
    pointsBlocked: service.pointsCost,
    status: 'pending_approval', // Sau 'in_progress' dacă nu e necesară aprobare
    requestedAt: new Date().toISOString(),
  };
  MOCK_SERVICE_REQUESTS.push(newServiceRequest);

  console.log('SpendService: Service requested, points blocked. Request ID:', newServiceRequest.id);
  return {
    success: true,
    message: `Serviciul "${service.title}" a fost solicitat. ${service.pointsCost} puncte au fost blocate. Veți fi contactat de furnizor.`,
    serviceRequest: newServiceRequest
  };
};

/**
 * Preia solicitările de servicii pentru un utilizator.
 * TODO: Implementează cu Supabase.
 */
export const getMyServiceRequests = async (userId: string): Promise<ServiceRequest[]> => {
  console.log(`SpendService: Fetching service requests for user ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_SERVICE_REQUESTS.filter(sr => sr.userId === userId)
    .sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}


// TODO: Funcții pentru administrator pentru a actualiza statusul ServiceRequest
// și pentru a debloca/confirma cheltuirea punctelor din WalletService
// ex: confirmServiceDelivery(serviceRequestId: string)
// Aceasta ar muta punctele din blocked_balance în "cheltuite" (adică dispar)
// și ar marca tranzacția din wallet ca 'completed'.
