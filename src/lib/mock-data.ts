import { Locataire, Agence, Plan, StatutSysteme, ActiviteFeed, ScenarioRelance, Paiement, Relance } from './types';

export const MOCK_PLANS: Plan[] = [
  {
    id: 'starter',
    nom: 'Plan Starter',
    prixMensuel: 15000,
    quotaLocataires: 10,
    quotaSms: 100,
    fonctionnalites: ['Jusqu\'à 10 locataires', '100 SMS de relance / mois', 'Support email', 'Paiements par Wave & Orange Money'],
    nbAgencesActives: 2
  },
  {
    id: 'pro',
    nom: 'Plan Pro',
    prixMensuel: 35000,
    quotaLocataires: 50,
    quotaSms: 1000,
    fonctionnalites: ['Jusqu\'à 50 locataires', '1000 SMS de relance / mois', 'Notifications WhatsApp incluses', 'Rapports avancés PDF/Excel', 'Support prioritaire 7j/7'],
    nbAgencesActives: 2
  },
  {
    id: 'agence',
    nom: 'Plan Agence',
    prixMensuel: 75000,
    quotaLocataires: 200,
    quotaSms: null, // illimité
    fonctionnalites: ['Jusqu\'à 200 locataires', 'Relances SMS & WhatsApp illimitées', 'Multi-utilisateurs (3 accès)', 'Gestion automatique des cautions', 'Export comptable personnalisé', 'Gestionnaire de compte dédié'],
    nbAgencesActives: 1
  }
];

export const MOCK_AGENCES: Agence[] = [
  {
    id: 'agence-horizon',
    nom: 'Agence Immobilière Horizon',
    email: 'contact@horizon-immo.sn',
    telephone: '+221 33 824 50 50',
    adresse: 'Avenue Bourguiba, Point E, Dakar',
    plan: 'pro',
    statut: 'actif',
    dateInscription: '2025-01-15T08:00:00.000Z',
    dateRenouvellement: '2026-07-15T08:00:00.000Z',
    nbLocataires: 10, // our 10 tenants will be bound here
    quotaLocataires: 50,
    nbSmsEnvoyesMois: 420,
    quotaSms: 1000,
    mrrContribution: 35000
  },
  {
    id: 'cabinet-seck',
    nom: 'Cabinet Seck & Associés',
    email: 'contact@cabinetseck.sn',
    telephone: '+221 77 568 20 20',
    adresse: 'Villa 12, Rue 10, Médina, Dakar',
    plan: 'starter',
    statut: 'essai',
    dateInscription: '2026-05-25T10:00:00.000Z',
    dateRenouvellement: '2026-06-25T10:00:00.000Z', // Close to expiration (today is June 19, 2026)
    nbLocataires: 10, // Reached quota of 10
    quotaLocataires: 10,
    nbSmsEnvoyesMois: 95,
    quotaSms: 100,
    mrrContribution: 15000
  },
  {
    id: 'sn-patrimoine',
    nom: 'SN Patrimoine',
    email: 'contact@snpatrimoine.sn',
    telephone: '+221 33 899 12 12',
    adresse: 'Immeuble City Center, Plateau, Dakar',
    plan: 'agence',
    statut: 'actif',
    dateInscription: '2024-11-01T09:00:00.000Z',
    dateRenouvellement: '2026-11-01T09:00:00.000Z',
    nbLocataires: 85,
    quotaLocataires: 200,
    nbSmsEnvoyesMois: 1250,
    quotaSms: null,
    mrrContribution: 75000
  },
  {
    id: 'dakar-immo',
    nom: 'Dakar Immo Services',
    email: 'info@dakar-immo.sn',
    telephone: '+221 77 645 33 11',
    adresse: 'Route de Ouakam, Dakar',
    plan: 'pro',
    statut: 'actif',
    dateInscription: '2025-08-10T14:30:00.000Z',
    dateRenouvellement: '2026-08-10T14:30:00.000Z',
    nbLocataires: 15,
    quotaLocataires: 50,
    nbSmsEnvoyesMois: 310,
    quotaSms: 1000,
    mrrContribution: 35000
  },
  {
    id: 'agence-excellence',
    nom: 'Agence Excellence',
    email: 'contact@excellence-immo.sn',
    telephone: '+221 33 860 99 99',
    adresse: 'Rond-point Ngor, Almadies, Dakar',
    plan: 'starter',
    statut: 'suspendu',
    dateInscription: '2025-03-20T11:00:00.000Z',
    dateRenouvellement: '2026-03-20T11:00:00.000Z',
    nbLocataires: 4,
    quotaLocataires: 10,
    nbSmsEnvoyesMois: 0,
    quotaSms: 100,
    mrrContribution: 0
  }
];

export const MOCK_LOCATAIRES: Locataire[] = [
  {
    id: 'moussa-diallo',
    prenom: 'Moussa',
    nom: 'Diallo',
    telephone: '+221776543210',
    operateurPrefere: 'wave',
    langue: 'francais',
    bienDesignation: 'Appartement 3B — Mermoz',
    quartier: 'Mermoz',
    loyerMensuel: 150000,
    jourEcheance: 5,
    dateDebutBail: '2024-05-01T00:00:00.000Z',
    paiementPartielAutorise: true,
    montantCaution: 300000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'paye',
    montantPayeMoisCourant: 150000,
    arrieresCumules: 0,
    dateCreation: '2024-05-01T10:00:00.000Z'
  },
  {
    id: 'aminata-ndiaye',
    prenom: 'Aminata',
    nom: 'Ndiaye',
    telephone: '+221771234567',
    operateurPrefere: 'orange_money',
    langue: 'francais',
    bienDesignation: 'Studio F2 — Plateau',
    quartier: 'Plateau',
    loyerMensuel: 120000,
    jourEcheance: 5,
    dateDebutBail: '2025-02-10T00:00:00.000Z',
    paiementPartielAutorise: false,
    montantCaution: 120000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'paye',
    montantPayeMoisCourant: 120000,
    arrieresCumules: 0,
    dateCreation: '2025-02-10T08:00:00.000Z'
  },
  {
    id: 'ibrahima-sow',
    prenom: 'Ibrahima',
    nom: 'Sow',
    telephone: '+221789876543',
    operateurPrefere: 'wave',
    langue: 'wolof',
    bienDesignation: 'Appartement F3 — Ouakam',
    quartier: 'Ouakam',
    loyerMensuel: 90000,
    jourEcheance: 5,
    dateDebutBail: '2025-09-01T00:00:00.000Z',
    paiementPartielAutorise: true,
    montantCaution: 90000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'paye',
    montantPayeMoisCourant: 90000,
    arrieresCumules: 0,
    dateCreation: '2025-09-01T09:00:00.000Z'
  },
  {
    id: 'fatou-diop',
    prenom: 'Fatou',
    nom: 'Diop',
    telephone: '+221765432109',
    operateurPrefere: 'orange_money',
    langue: 'francais',
    bienDesignation: 'Duplex — Almadies',
    quartier: 'Almadies',
    loyerMensuel: 250000,
    jourEcheance: 5,
    dateDebutBail: '2024-01-15T00:00:00.000Z',
    paiementPartielAutorise: false,
    montantCaution: 500000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'paye',
    montantPayeMoisCourant: 250000,
    arrieresCumules: 0,
    dateCreation: '2024-01-15T14:00:00.000Z'
  },
  {
    id: 'cheikh-fall',
    prenom: 'Cheikh',
    nom: 'Fall',
    telephone: '+221773456789',
    operateurPrefere: 'wave',
    langue: 'wolof',
    bienDesignation: 'Appartement F4 — Parcelles Assainies',
    quartier: 'Parcelles Assainies',
    loyerMensuel: 180000,
    jourEcheance: 10,
    dateDebutBail: '2025-06-01T00:00:00.000Z',
    paiementPartielAutorise: true,
    montantCaution: 360000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'paye',
    montantPayeMoisCourant: 180000,
    arrieresCumules: 0,
    dateCreation: '2025-06-01T11:00:00.000Z'
  },
  {
    id: 'mariama-sarr',
    prenom: 'Mariama',
    nom: 'Sarr',
    telephone: '+221782345678',
    operateurPrefere: 'orange_money',
    langue: 'francais',
    bienDesignation: 'Appartement F4 — Ngor',
    quartier: 'Ngor',
    loyerMensuel: 300000,
    jourEcheance: 5,
    dateDebutBail: '2025-04-01T00:00:00.000Z',
    paiementPartielAutorise: false,
    montantCaution: 600000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'paye',
    montantPayeMoisCourant: 300000,
    arrieresCumules: 0,
    dateCreation: '2025-04-01T12:00:00.000Z'
  },
  {
    id: 'rokhaya-diouf',
    prenom: 'Rokhaya',
    nom: 'Diouf',
    telephone: '+221764567890',
    operateurPrefere: 'wave',
    langue: 'francais',
    bienDesignation: 'Appartement F3 — Sicap Liberté',
    quartier: 'Sicap Liberté',
    loyerMensuel: 140000,
    jourEcheance: 5,
    dateDebutBail: '2025-10-01T00:00:00.000Z',
    paiementPartielAutorise: true,
    montantCaution: 280000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'paye',
    montantPayeMoisCourant: 140000,
    arrieresCumules: 0,
    dateCreation: '2025-10-01T15:30:00.000Z'
  },
  {
    id: 'abdoulaye-mbaye',
    prenom: 'Abdoulaye',
    nom: 'Mbaye',
    telephone: '+221775678901',
    operateurPrefere: 'orange_money',
    langue: 'francais',
    bienDesignation: 'Appartement F3 — Médina',
    quartier: 'Médina',
    loyerMensuel: 220000,
    jourEcheance: 5,
    dateDebutBail: '2024-08-01T00:00:00.000Z',
    paiementPartielAutorise: true,
    montantCaution: 440000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'partiel',
    montantPayeMoisCourant: 100000, // Partial payment (100 000 paid, 120 000 remaining)
    arrieresCumules: 0,
    dateCreation: '2024-08-01T09:30:00.000Z'
  },
  {
    id: 'ousmane-thiaw',
    prenom: 'Ousmane',
    nom: 'Thiaw',
    telephone: '+221786789012',
    operateurPrefere: 'wave',
    langue: 'wolof',
    bienDesignation: 'Studio — Fann',
    quartier: 'Fann',
    loyerMensuel: 80000,
    jourEcheance: 15,
    dateDebutBail: '2025-11-15T00:00:00.000Z',
    paiementPartielAutorise: true,
    montantCaution: 160000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'en_attente',
    montantPayeMoisCourant: 0,
    arrieresCumules: 0,
    dateCreation: '2025-11-15T11:00:00.000Z'
  },
  {
    id: 'aissatou-niang',
    prenom: 'Aïssatou',
    nom: 'Niang',
    telephone: '+221767890123',
    operateurPrefere: 'orange_money',
    langue: 'francais',
    bienDesignation: 'Appartement F4 — Point E',
    quartier: 'Point E',
    loyerMensuel: 350000,
    jourEcheance: 5,
    dateDebutBail: '2024-03-01T00:00:00.000Z',
    paiementPartielAutorise: false,
    montantCaution: 700000,
    agenceId: 'agence-horizon',
    statutMoisCourant: 'en_retard',
    montantPayeMoisCourant: 0,
    arrieresCumules: 700000, // 2 months overdue (700 000 FCFA due)
    dateCreation: '2024-03-01T10:00:00.000Z'
  }
];

export const MOCK_PAIEMENTS: Paiement[] = [
  // Payments for June 2026 (current month)
  {
    id: 'pay-moussa-june',
    locataireId: 'moussa-diallo',
    mois: '2026-06',
    montantAttendu: 150000,
    montantPaye: 150000,
    datePaiement: '2026-06-04T10:30:00.000Z',
    operateur: 'wave',
    referenceTransaction: 'WV-6789-9812',
    statut: 'paye'
  },
  {
    id: 'pay-aminata-june',
    locataireId: 'aminata-ndiaye',
    mois: '2026-06',
    montantAttendu: 120000,
    montantPaye: 120000,
    datePaiement: '2026-06-05T14:15:00.000Z',
    operateur: 'orange_money',
    referenceTransaction: 'OM-3498-1123',
    statut: 'paye'
  },
  {
    id: 'pay-ibrahima-june',
    locataireId: 'ibrahima-sow',
    mois: '2026-06',
    montantAttendu: 90000,
    montantPaye: 90000,
    datePaiement: '2026-06-03T09:00:00.000Z',
    operateur: 'wave',
    referenceTransaction: 'WV-1122-3344',
    statut: 'paye'
  },
  {
    id: 'pay-fatou-june',
    locataireId: 'fatou-diop',
    mois: '2026-06',
    montantAttendu: 250000,
    montantPaye: 250000,
    datePaiement: '2026-06-04T18:22:00.000Z',
    operateur: 'orange_money',
    referenceTransaction: 'OM-9022-7711',
    statut: 'paye'
  },
  {
    id: 'pay-cheikh-june',
    locataireId: 'cheikh-fall',
    mois: '2026-06',
    montantAttendu: 180000,
    montantPaye: 180000,
    datePaiement: '2026-06-09T11:45:00.000Z',
    operateur: 'wave',
    referenceTransaction: 'WV-5566-7788',
    statut: 'paye'
  },
  {
    id: 'pay-mariama-june',
    locataireId: 'mariama-sarr',
    mois: '2026-06',
    montantAttendu: 300000,
    montantPaye: 300000,
    datePaiement: '2026-06-05T08:12:00.000Z',
    operateur: 'orange_money',
    referenceTransaction: 'OM-4455-6677',
    statut: 'paye'
  },
  {
    id: 'pay-rokhaya-june',
    locataireId: 'rokhaya-diouf',
    mois: '2026-06',
    montantAttendu: 140000,
    montantPaye: 140000,
    datePaiement: '2026-06-04T16:50:00.000Z',
    operateur: 'wave',
    referenceTransaction: 'WV-9900-1122',
    statut: 'paye'
  },
  {
    id: 'pay-abdoulaye-june',
    locataireId: 'abdoulaye-mbaye',
    mois: '2026-06',
    montantAttendu: 220000,
    montantPaye: 100000,
    datePaiement: '2026-06-05T12:00:00.000Z',
    operateur: 'orange_money',
    referenceTransaction: 'OM-8833-2211',
    statut: 'partiel'
  },
  // Previous months payments
  {
    id: 'pay-moussa-may',
    locataireId: 'moussa-diallo',
    mois: '2026-05',
    montantAttendu: 150000,
    montantPaye: 150000,
    datePaiement: '2026-05-05T10:15:00.000Z',
    operateur: 'wave',
    referenceTransaction: 'WV-5511-9988',
    statut: 'paye'
  },
  {
    id: 'pay-aissatou-may',
    locataireId: 'aissatou-niang',
    mois: '2026-05',
    montantAttendu: 350000,
    montantPaye: 0,
    operateur: 'orange_money',
    statut: 'en_retard'
  },
  {
    id: 'pay-aissatou-april',
    locataireId: 'aissatou-niang',
    mois: '2026-04',
    montantAttendu: 350000,
    montantPaye: 0,
    operateur: 'orange_money',
    statut: 'en_retard'
  }
];

export const MOCK_SCENARIOS: ScenarioRelance[] = [
  {
    id: 'j-3',
    type: 'j-3',
    actif: true,
    canal: 'sms',
    heureEnvoi: '08:00',
    templateMessage: 'Bonjour {prenom} {nom}, votre loyer de {montant} FCFA est attendu le {date_echeance}. Payez maintenant : {lien_paiement}',
    dernierEnvoi: '2026-06-16T08:02:11.000Z'
  },
  {
    id: 'j-1',
    type: 'j-1',
    actif: true,
    canal: 'whatsapp',
    heureEnvoi: '09:00',
    templateMessage: 'Bonjour {prenom} 👋. Petit rappel amical, le loyer de {montant} FCFA concernant le bien {bien} arrive à échéance demain. Lien de paiement sécurisé : {lien_paiement}',
    dernierEnvoi: '2026-06-18T09:01:45.000Z'
  },
  {
    id: 'j+1',
    type: 'j+1',
    actif: true,
    canal: 'sms',
    heureEnvoi: '08:30',
    templateMessage: 'URGENT : {prenom} {nom}, votre loyer de {montant} FCFA est en retard de {jours_retard} jour(s). Merci de régler immédiatement via ce lien : {lien_paiement}',
    dernierEnvoi: '2026-06-06T08:31:05.000Z'
  },
  {
    id: 'j+5',
    type: 'j+5',
    actif: false,
    canal: 'whatsapp',
    heureEnvoi: '10:00',
    templateMessage: 'AVERTISSEMENT : M./Mme {nom}, sans règlement du loyer de {montant} FCFA attendu le {date_echeance} ({jours_retard} jours de retard), nous serons contraints d\'engager une procédure. Lien : {lien_paiement}',
    dernierEnvoi: '2026-05-10T10:00:12.000Z'
  }
];

export const MOCK_RELANCES: Relance[] = [
  {
    id: 'rel-1',
    locataireId: 'aissatou-niang',
    type: 'j+1',
    canal: 'sms',
    message: 'URGENT : Aïssatou Niang, votre loyer de 350000 FCFA est en retard de 14 jour(s). Merci de régler immédiatement via ce lien : http://localhost:3000/payer/aissatou-niang-token',
    dateEnvoi: '2026-06-06T08:31:05.000Z',
    statutEnvoi: 'envoye'
  },
  {
    id: 'rel-2',
    locataireId: 'aissatou-niang',
    type: 'j+5',
    canal: 'whatsapp',
    message: 'AVERTISSEMENT : M./Mme Niang, sans règlement du loyer de 350000 FCFA attendu le 5 du mois, nous serons contraints d\'engager une procédure. Lien : http://localhost:3000/payer/aissatou-niang-token',
    dateEnvoi: '2026-06-10T10:00:00.000Z',
    statutEnvoi: 'echec' // WhatsApp connection failed
  },
  {
    id: 'rel-3',
    locataireId: 'ousmane-thiaw',
    type: 'j-3',
    canal: 'sms',
    message: 'Bonjour Ousmane Thiaw, votre loyer de 80000 FCFA est attendu le 15. Payez maintenant : http://localhost:3000/payer/ousmane-thiaw-token',
    dateEnvoi: '2026-06-12T08:02:11.000Z',
    statutEnvoi: 'envoye'
  },
  {
    id: 'rel-4',
    locataireId: 'aissatou-niang',
    type: 'j+1',
    canal: 'sms',
    message: 'URGENT : Aïssatou Niang, votre loyer de 350000 FCFA est en retard. Merci de régler immédiatement via ce lien : http://localhost:3000/payer/aissatou-niang-token',
    dateEnvoi: '2026-06-06T08:35:00.000Z',
    statutEnvoi: 'echec' // Invalid number or operator failure
  }
];

export const MOCK_SYSTEM_STATUS: StatutSysteme[] = [
  { service: 'API principale', statut: 'operationnel', uptimeJours30: 99.98, latenceMoyenneMs: 42 },
  { service: 'Service SMS (Orange/Expresso)', statut: 'operationnel', uptimeJours30: 99.95, latenceMoyenneMs: 120 },
  { service: 'Service WhatsApp Business', statut: 'operationnel', uptimeJours30: 98.92, latenceMoyenneMs: 310 },
  { service: 'Passerelle de Paiement Wave API', statut: 'operationnel', uptimeJours30: 99.99, latenceMoyenneMs: 85 },
  { service: 'Passerelle Orange Money API', statut: 'operationnel', uptimeJours30: 99.85, latenceMoyenneMs: 105 }
];

export const MOCK_FEED: ActiviteFeed[] = [
  {
    id: 'feed-1',
    type: 'paiement',
    description: 'M. Moussa Diallo a payé 150 000 FCFA via Wave',
    timestamp: '2026-06-19T12:50:00.000Z',
    locataireId: 'moussa-diallo'
  },
  {
    id: 'feed-2',
    type: 'relance',
    description: 'Relance WhatsApp envoyée à M. Cheikh Fall',
    timestamp: '2026-06-19T10:15:00.000Z',
    locataireId: 'cheikh-fall'
  },
  {
    id: 'feed-3',
    type: 'nouveau_locataire',
    description: 'Nouveau locataire ajouté : Mme Aminata Ndiaye',
    timestamp: '2026-06-18T16:30:00.000Z',
    locataireId: 'aminata-ndiaye'
  },
  {
    id: 'feed-4',
    type: 'echec_sms',
    description: 'Échec d\'envoi SMS à Mme Aïssatou Niang (opérateur injoignable)',
    timestamp: '2026-06-18T08:35:00.000Z',
    locataireId: 'aissatou-niang'
  },
  {
    id: 'feed-5',
    type: 'paiement',
    description: 'Mme Fatou Diop a payé 250 000 FCFA via Orange Money',
    timestamp: '2026-06-17T15:20:00.000Z',
    locataireId: 'fatou-diop'
  }
];

export const DAKAR_QUARTIERS = [
  'Plateau',
  'Médina',
  'Mermoz',
  'Almadies',
  'Ouakam',
  'Parcelles Assainies',
  'Sicap Liberté',
  'Point E',
  'Fann',
  'Ngor',
  'Autre'
];
