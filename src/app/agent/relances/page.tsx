'use client';

import React, { useState, useEffect } from 'react';
import { useKeurGuiStore } from '@/lib/store';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  MessageSquare,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Clock,
  Code,
  Eye,
  Trash,
  HelpCircle,
  Inbox,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RelancesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { scenarios, toggleScenario, updateScenarioTemplate, reminders, cancelQueuedReminder } = useKeurGuiStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('j-3');
  const [editorText, setEditorText] = useState<string>('');

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  // Sync editor text with selected scenario
  useEffect(() => {
    if (activeScenario) {
      setEditorText(activeScenario.templateMessage);
    }
  }, [selectedScenarioId, activeScenario]);

  const handleToggle = (id: string, label: string) => {
    toggleScenario(id);
    const scen = scenarios.find(s => s.id === id);
    if (scen) {
      toast.success(`Scénario ${label} ${!scen.actif ? 'activé' : 'désactivé'}`);
    }
  };

  const handleSaveTemplate = () => {
    updateScenarioTemplate(selectedScenarioId, editorText);
    toast.success('Modèle de relance mis à jour !');
  };

  const insertVariable = (variable: string) => {
    setEditorText(prev => prev + ` {${variable}}`);
  };

  // Compile preview text
  const getCompiledPreview = (template: string) => {
    return template
      .replace(/{prenom}/g, 'Moussa')
      .replace(/{nom}/g, 'Diallo')
      .replace(/{montant}/g, '150 000')
      .replace(/{bien}/g, 'Appartement 3B — Mermoz')
      .replace(/{date_echeance}/g, '5 Juillet 2026')
      .replace(/{lien_paiement}/g, 'https://pay.keurguipay.sn/payer/moussa-diallo-token')
      .replace(/{jours_retard}/g, '3');
  };

  // Mock scheduled reminders queue (programmé)
  const scheduledReminders = [
    {
      id: 'sched-1',
      locataire: 'Rokhaya Diouf',
      telephone: '+221 76 456 78 90',
      type: 'j-3',
      canal: 'sms',
      message: 'Bonjour Rokhaya Diouf, votre loyer de 140 000 FCFA est attendu le 5 Juin. Payez ici : https://pay.keurguipay.sn/payer/rokhaya-diouf-token',
      heurePrevue: 'Demain, 08:00'
    },
    {
      id: 'sched-2',
      locataire: 'Ousmane Thiaw',
      telephone: '+221 78 678 90 12',
      type: 'j-1',
      canal: 'whatsapp',
      message: 'Bonjour Ousmane 👋. Petit rappel amical, le loyer de 80 000 FCFA pour le Studio Fann arrive à échéance demain. Lien : https://pay.keurguipay.sn/payer/ousmane-thiaw-token',
      heurePrevue: 'Demain, 09:00'
    }
  ];

  const handleCancelScheduled = (id: string, name: string) => {
    toast.success(`Relance programmée pour ${name} annulée avec succès.`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <CardSkeleton />
        <div className="h-60 bg-slate-200 rounded-xl"></div>
        <TableSkeleton rows={3} cols={5} />
      </div>
    );
  }

  const charCount = editorText.length;
  const isSmsOverlimit = activeScenario?.canal === 'sms' && charCount > 160;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des relances</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configurez vos scénarios automatiques et modifiez les messages envoyés à vos locataires.
        </p>
      </div>

      {/* Section 1: Active Scenarios Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
          Scénarios actifs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scen) => {
            const labels = {
              'j-3': 'J-3 Rappel doux',
              'j-1': 'J-1 Confirmation',
              'j+1': 'J+1 Urgence',
              'j+5': 'J+5 Escalade'
            };
            return (
              <div 
                key={scen.id} 
                onClick={() => setSelectedScenarioId(scen.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between h-36 ${
                  selectedScenarioId === scen.id 
                    ? 'border-blue-600 bg-white ring-2 ring-blue-500/10' 
                    : 'border-slate-200 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{labels[scen.type as 'j-3'] || scen.type}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 inline-flex items-center gap-1">
                      {scen.canal === 'sms' ? <Smartphone className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                      {scen.canal}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(scen.id, labels[scen.type as 'j-3']);
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {scen.actif ? (
                      <ToggleRight className="h-7 w-7 text-blue-600" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-2">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="h-3 w-3" />
                    {scen.heureEnvoi}
                  </span>
                  <span>Dernier: {scen.dernierEnvoi ? new Date(scen.dernierEnvoi).toLocaleDateString('fr-FR') : 'Jamais'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editor */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">
                Modifier le modèle : <span className="text-blue-600">{activeScenario ? activeScenario.type.toUpperCase() : ''}</span>
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-sm border font-semibold capitalize ${
                activeScenario?.canal === 'sms' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-green-50 text-green-700 border-green-100'
              }`}>
                Canal : {activeScenario?.canal}
              </span>
            </div>

            {/* Clickable tokens */}
            <div className="mt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Variables cliquables</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: 'prenom', label: 'Prénom' },
                  { tag: 'nom', label: 'Nom' },
                  { tag: 'montant', label: 'Montant loyer' },
                  { tag: 'bien', label: 'Bien' },
                  { tag: 'date_echeance', label: 'Date échéance' },
                  { tag: 'lien_paiement', label: 'Lien de paiement' },
                  { tag: 'jours_retard', label: 'Jours de retard' }
                ].map(item => (
                  <button
                    key={item.tag}
                    onClick={() => insertVariable(item.tag)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100 hover:border-slate-300 font-mono text-[10px] rounded-lg cursor-pointer transition-colors"
                  >
                    {`{${item.tag}}`} ({item.label})
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="mt-4">
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                rows={4}
                className="block w-full border border-slate-200 rounded-lg p-3 text-xs leading-normal font-mono text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex justify-between items-center mt-2 text-[10px]">
                {activeScenario?.canal === 'sms' ? (
                  <span className={isSmsOverlimit ? 'text-red-600 font-bold' : 'text-slate-400'}>
                    Caractères : {charCount} / 160 (limite 1 SMS)
                  </span>
                ) : (
                  <span className="text-slate-400">Longueur illimitée</span>
                )}
                {isSmsOverlimit && (
                  <span className="text-red-500 font-bold">Avertissement : Le message dépassera 1 SMS standard.</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveTemplate}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Enregistrer les modifications
          </button>
        </div>

        {/* Live Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Eye className="h-4.5 w-4.5" />
              Aperçu en temps réel
            </h3>
            
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3 font-sans min-h-[140px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] text-slate-400 font-bold">À : Moussa Diallo</span>
                <span className="text-[9px] text-slate-400">Canal : {activeScenario?.canal.toUpperCase()}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed break-words whitespace-pre-wrap font-mono">
                {getCompiledPreview(editorText)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4 flex gap-2 text-[10px] text-slate-400 leading-normal">
            <HelpCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-slate-400" />
            <p>Les variables entre accolades (ex: {`{prenom}`}) seront injectées à la volée avec les données réelles du locataire.</p>
          </div>
        </div>

      </div>

      {/* Section 3: Queue File */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">
              File d'attente (24 prochaines heures)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Relances automatiques programmées pour envoi.</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {scheduledReminders.length} planifiés
          </span>
        </div>

        {scheduledReminders.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Inbox className="h-8 w-8 mb-2 mx-auto" />
            <p className="text-sm">Aucune relance programmée pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-6 py-3">Locataire</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Message</th>
                  <th className="px-6 py-3">Heure prévue</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {scheduledReminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-850">{rem.locataire}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{rem.telephone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-sm border uppercase">
                        {rem.type} • {rem.canal}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500 max-w-[280px] truncate" title={rem.message}>
                      {rem.message}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {rem.heurePrevue}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCancelScheduled(rem.id, rem.locataire)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        title="Annuler l'envoi"
                      >
                        <Trash className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
