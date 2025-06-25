export interface QuickTip {
  id: string;
  title: string;
  markdownContent: string;
}

const MOCK_QUICK_TIPS: QuickTip[] = [
  {
    id: 'tip1',
    title: 'Aranjarea Inteligentă a Produselor',
    markdownContent: `### Maximizează Vizibilitatea\n\nO bună aranjare a produselor la raft poate crește vânzările cu până la **20%**. Asigură-te că:\n\n*   Produsele cele mai populare sunt la **nivelul ochilor**.\n*   Produsele noi sau promoționale sunt evidențiate.\n*   Etichetele de preț sunt clare și corecte.\n\n> _Un raft bine organizat vinde singur!_`
  },
  {
    id: 'tip2',
    title: 'Iluminatul Rafturilor Contează Enorm',
    markdownContent: `### Creează Atmosfera Potrivită\n\nUn raft bine iluminat atrage atenția clienților și pune în valoare produsele. Consideră următoarele:\n\n1.  Folosește **spoturi LED** pentru a evidenția produsele cheie sau ofertele speciale.\n2.  Asigură o iluminare generală bună a magazinului pentru a evita zonele întunecate.\n3.  Verifică periodic funcționalitatea becurilor.\n\n*Lumina potrivită transformă experiența de cumpărături.*`
  },
  {
    id: 'tip3',
    title: 'Curățenia Este Cartea de Vizită',
    markdownContent: `### Inspiră Încredere și Profesionalism\n\nUn magazin curat și îngrijit este fundamental. Nu uita:\n\n*   Șterge praful de pe produse și rafturi **zilnic**.\n*   Asigură-te că podeaua este curată.\n*   Verifică datele de expirare și îndepărtează produsele neconforme.\n\nUn mediu curat este un mediu primitor pentru clienți.`
  },
];

/**
 * Preia sfaturile rapide.
 * TODO: Într-o aplicație reală, acestea ar veni dintr-un CMS sau direct din Supabase (ex: o tabelă 'quick_tips').
 */
export const getQuickTips = async (): Promise<QuickTip[]> => {
  console.log('ContentService: Fetching quick tips.');
  // Simulare întârziere rețea
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_QUICK_TIPS;
};
