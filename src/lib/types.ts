export type StatutPaiement = 'paye' | 'en_attente' | 'en_retard' | 'partiel';
export type Operateur = 'wave' | 'orange_money' | 'especes' | 'virement';
export type LangueCommunication = 'francais' | 'wolof';
export type CanalRelance = 'sms' | 'whatsapp';
export type TypeRelance = 'j-3' | 'j-1' | 'jour-j' | 'j+1' | 'j+5';
export type PlanAbonnement = 'starter' | 'pro' | 'agence';
export type StatutAgence = 'actif' | 'suspendu' | 'essai';
export type StatutService = 'operationnel' | 'degrade' | 'hors_service';

export interface Locataire {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;           // format +221XXXXXXXXX
  operateurPrefere: Operateur;
  langue: LangueCommunication;
  bienDesignation: string;     // ex: "Appartement F3 - Plateau"
  quartier: string;
  loyerMensuel: number;        // FCFA, entier
  jourEcheance: number;        // 1-28
  dateDebutBail: string;       // ISO date
  paiementPartielAutorise: boolean;
  montantCaution?: number;
  agenceId: string;
  statutMoisCourant: StatutPaiement;
  montantPayeMoisCourant: number;
  arrieresCumules: number;
  dateCreation: string;
}

export interface Paiement {
  id: string;
  locataireId: string;
  mois: string;                // "2025-07"
  montantAttendu: number;
  montantPaye: number;
  datePaiement?: string;
  operateur: Operateur;
  referenceTransaction?: string;
  statut: StatutPaiement;
  recuPdfUrl?: string;
  note?: string;
}

export interface Relance {
  id: string;
  locataireId: string;
  type: TypeRelance;
  canal: CanalRelance;
  message: string;
  dateEnvoi: string;
  statutEnvoi: 'envoye' | 'echec' | 'programme';
}

export interface ScenarioRelance {
  id: string;
  type: TypeRelance;
  actif: boolean;
  canal: CanalRelance;
  heureEnvoi: string;          // "08:00"
  templateMessage: string;
  dernierEnvoi?: string;
}

export interface Agence {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  logoUrl?: string;
  plan: PlanAbonnement;
  statut: StatutAgence;
  dateInscription: string;
  dateRenouvellement: string;
  nbLocataires: number;
  quotaLocataires: number;
  nbSmsEnvoyesMois: number;
  quotaSms: number | null;     // null = illimité
  mrrContribution: number;
}

export interface Plan {
  id: PlanAbonnement;
  nom: string;
  prixMensuel: number;
  quotaLocataires: number;
  quotaSms: number | null;
  fonctionnalites: string[];
  nbAgencesActives: number;
}

export interface StatutSysteme {
  service: string;
  statut: StatutService;
  uptimeJours30: number;       // pourcentage
  latenceMoyenneMs: number;
}

export interface ActiviteFeed {
  id: string;
  type: 'paiement' | 'relance' | 'nouveau_locataire' | 'echec_sms';
  description: string;
  timestamp: string;
  locataireId?: string;
}

export interface KPIDashboard {
  totalAttenduMois: number;
  totalEncaisseMois: number;
  tauxRecouvrement: number;    // pourcentage
  nbImpayes: number;
  montantImpayes: number;
  nbLocatairesEnRetard: number;
}
