import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

export interface StoreProfile {
  id: string; // Ar trebui să fie același cu user.id
  company_name?: string | null;
  vat_number?: string | null; // CUI/CIF
  registration_number?: string | null; // Nr. Reg. Com.
  address?: string | null;
  iban?: string | null;
  updated_at?: string;
  // Alte câmpuri specifice magazinului pot fi adăugate aici
}

/**
 * Preia profilul magazinului pentru utilizatorul dat.
 * @param user Obiectul User de la Supabase.
 */
export const getStoreProfile = async (user: User | null): Promise<StoreProfile | null> => {
  if (!user) throw new Error('Utilizatorul nu este autentificat.');

  try {
    const { data, error, status } = await supabase
      .from('store_profiles') // Numele tabelului din Supabase
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && status !== 406) { // 406 înseamnă "Not Acceptable", adică nu există rândul, ceea ce e ok
      console.error('Eroare la preluarea profilului:', error);
      throw error;
    }

    if (data) {
      return data as StoreProfile;
    }
    return null; // Nu există profil încă
  } catch (error) {
    console.error('Catch la preluarea profilului:', error);
    // Aruncă eroarea mai departe sau gestioneaz-o specific
    if (error instanceof Error) throw error;
    throw new Error('A apărut o eroare la preluarea profilului.');
  }
};

/**
 * Actualizează sau creează profilul magazinului pentru utilizatorul dat.
 * @param user Obiectul User de la Supabase.
 * @param profileData Datele profilului de actualizat.
 */
export const updateStoreProfile = async (
  user: User | null,
  profileData: Partial<StoreProfile>
): Promise<StoreProfile | null> => {
  if (!user) throw new Error('Utilizatorul nu este autentificat.');

  try {
    const updates = {
      ...profileData,
      id: user.id, // Asigură-te că ID-ul este setat pentru upsert
      updated_at: new Date().toISOString(),
    };

    // Upsert va insera dacă nu există (bazat pe cheia primară 'id') sau va actualiza dacă există.
    // Asigură-te că politica RLS permite operațiunea de INSERT și UPDATE.
    const { data, error } = await supabase
      .from('store_profiles')
      .upsert(updates, { onConflict: 'id' }) // Specifică coloana de conflict dacă e necesar (implicit e cheia primară)
      .select() // Pentru a returna rândul actualizat/inserat
      .single();

    if (error) {
      console.error('Eroare la actualizarea profilului:', error);
      throw error;
    }

    return data as StoreProfile;
  } catch (error) {
    console.error('Catch la actualizarea profilului:', error);
    if (error instanceof Error) throw error;
    throw new Error('A apărut o eroare la actualizarea profilului.');
  }
};
