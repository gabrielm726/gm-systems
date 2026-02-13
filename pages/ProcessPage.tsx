import React, { useState, useMemo } from 'react';
import { OfficialProcess, EntityType, Document } from '../types';
import { Card, Button, Badge, Modal } from '../components/Shared';
import {
    Activity, ChevronRight, ChevronDown, CheckCircle2,
    XCircle, Clock, FileText, Info, AlertTriangle,
    Layers, Search, ExternalLink, ShieldCheck, Landmark, Building2,
    Database, BrainCircuit, FileCheck, Gavel, Users, Briefcase, FileCode, Plus
} from 'lucide-react';
import { OFFICIAL_PROCESSES, MOCK_GED } from '../constants';

interface ProcessPageProps {
    entityType?: EntityType;
    gedDocuments?: Document[];
    processes?: any[]; // Allow processes prop as used in App.tsx
}

export const ProcessPage: React.FC<ProcessPageProps> = ({
    entityType = 'PUBLIC',
    gedDocuments = MOCK_GED
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedMacros, setExpandedMacros] = useState<Set<string>>(new Set(['Macroprocessos Comuns']));
    const [selectedProcess, setSelectedProcess] = useState<OfficialProcess | null>(null);

    const [processes, setProcesses] = useState<OfficialProcess[]>(OFFICIAL_PROCESSES);
    const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
    const [newProcess, setNewProcess] = useState<Partial<OfficialProcess>>({
        title: '', macro: 'Macroprocessos Comuns', description: '', status: 'OPEN', requiredDocTypes: [], whenToUse: '',
        priority: 'MEDIUM', responsible: '', deadline: ''
    });

    // Lógica de Separação Pública x Privada
    const visibleProcesses = useMemo(() => {
        return processes.filter(p => {
            const isCommon = p.scope === 'COMMON';
            const isSpecific = p.scope === entityType;
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.macro.toLowerCase().includes(searchTerm.toLowerCase());
            return (isCommon || isSpecific) && matchesSearch;
        });
    }, [entityType, searchTerm, processes]);

    // ... existing grouped logic ...
    const macroGrouped = useMemo(() => {
        const groups: Record<string, OfficialProcess[]> = {};
        visibleProcesses.forEach(p => {
            if (!groups[p.macro]) groups[p.macro] = [];
            groups[p.macro].push(p);
        });
        return groups;
    }, [visibleProcesses]);

    const toggleMacro = (macro: string) => {
        const newSet = new Set(expandedMacros);
        if (newSet.has(macro)) newSet.delete(macro);
        else newSet.add(macro);
        setExpandedMacros(newSet);
    };

    // Auditoria em tempo real via GED
    const getProcessStatus = (proc: OfficialProcess) => {
        const docsInGed = (gedDocuments || []).filter(d => d.linkedProcessId === proc.id);
        const presentTypes = new Set(docsInGed.map(d => d.type));

        if (docsInGed.length === 0) return { label: 'Sem documentos', color: 'red', icon: <XCircle size={14} /> };

        const allPresent = (proc.requiredDocTypes || []).every(type => presentTypes.has(type));
        if (allPresent) return { label: 'Conformidade Total', color: 'green', icon: <ShieldCheck size={14} /> };

        return { label: 'Doc. Incompleta', color: 'yellow', icon: <Clock size={14} /> };
    };

    const handleSaveProcess = () => {
        if (!newProcess.title || !newProcess.description) return alert("Título e Descrição são obrigatórios");

        const process: OfficialProcess = {
            id: `PROC-${Date.now()}`,
            processNumber: `${new Date().getFullYear()}.${Math.floor(Math.random() * 1000)}`,
            title: newProcess.title!,
            description: newProcess.description!,
            macro: newProcess.macro || 'Macroprocessos Comuns',
            status: 'OPEN',
            scope: newProcess.scope || 'COMMON',
            requiredDocTypes: newProcess.requiredDocTypes || [],
            steps: ['Abertura', 'Análise', 'Conclusão'],
            relatedAssets: [],
            whenToUse: newProcess.whenToUse || 'Sempre que necessário.',
            priority: newProcess.priority as any || 'MEDIUM',
            responsible: newProcess.responsible || 'Admin',
            deadline: newProcess.deadline || '',
        };

        setProcesses([...processes, process]);
        setIsNewProcessModalOpen(false);
        setNewProcess({ title: '', macro: 'Macroprocessos Comuns', description: '', status: 'OPEN', requiredDocTypes: [], whenToUse: '' });
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            {/* Banner de Contexto Operacional */}
            <div className={`p-8 rounded-[2rem] shadow-xl border-t-8 flex flex-col md:flex-row items-center justify-between gap-6 ${entityType === 'PUBLIC' ? 'bg-slate-900 border-gov-500 text-white' : 'bg-white border-emerald-500 text-slate-800'}`}>
                <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-3xl ${entityType === 'PUBLIC' ? 'bg-gov-500/20 text-gov-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        {entityType === 'PUBLIC' ? <Landmark size={48} /> : <Building2 size={48} />}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Ritos e Processos Oficiais</h2>
                        <div className="flex items-center gap-3 mt-3">
                            <Badge color={entityType === 'PUBLIC' ? 'blue' : 'green'} className="px-4 py-1.5 font-black uppercase tracking-widest border-none">
                                Regime: {entityType === 'PUBLIC' ? 'Público (NBC TSP / MCASP)' : 'Privado (IFRS / CPC)'}
                            </Badge>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${entityType === 'PUBLIC' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Auditoria Ativa de Conformidade
                            </span>
                        </div>
                    </div>
                </div>
                <div className="relative w-full md:w-96 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input
                            className={`w-full rounded-2xl pl-12 pr-4 py-3.5 text-sm border-none focus:ring-4 focus:ring-gov-500/50 outline-none transition-all shadow-inner ${entityType === 'PUBLIC' ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 text-slate-800'}`}
                            placeholder="Buscar rito, documento ou macroprocesso..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="primary"
                        className={`rounded-2xl h-12 w-12 flex items-center justify-center shadow-lg ${entityType === 'PUBLIC' ? 'bg-gov-600 text-white' : 'bg-emerald-600 text-white'}`}
                        title="Novo Processo Administrativo"
                        onClick={() => setIsNewProcessModalOpen(true)}
                    >
                        <Plus size={24} />
                    </Button>
                </div>
            </div>

            {/* Navegação por Árvore de Macroprocessos */}
            <div className="grid grid-cols-1 gap-4">
                {(Object.entries(macroGrouped) as [string, OfficialProcess[]][]).map(([macro, procs]) => {
                    const isExpanded = expandedMacros.has(macro);
                    return (
                        <Card key={macro} className="p-0 overflow-hidden border-none shadow-sm rounded-3xl bg-white">
                            <button
                                onClick={() => toggleMacro(macro)}
                                className={`w-full px-8 py-5 flex items-center justify-between transition-all ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl border-2 ${isExpanded ? 'bg-gov-900 border-gov-900 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                        <Layers size={20} />
                                    </div>
                                    <span className="font-black text-slate-800 uppercase text-xs tracking-[0.3em]">{macro}</span>
                                    <Badge color="gray" className="font-black text-[10px] px-2.5">{procs.length}</Badge>
                                </div>
                                {isExpanded ? <ChevronDown size={24} className="text-gov-600" /> : <ChevronRight size={24} className="text-slate-300" />}
                            </button>

                            {isExpanded && (
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
                                    {procs.map(proc => {
                                        const status = getProcessStatus(proc);
                                        return (
                                            <div
                                                key={proc.id}
                                                onClick={() => setSelectedProcess(proc)}
                                                className="group bg-slate-50 hover:bg-white p-5 rounded-[1.5rem] cursor-pointer transition-all border-2 border-transparent hover:border-gov-500 hover:shadow-xl hover:-translate-y-1"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[9px] font-black font-mono bg-white px-2 py-1 rounded border text-slate-400 group-hover:text-gov-600 group-hover:border-gov-200">{proc.id}</span>
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter bg-${status.color}-100 text-${status.color}-700`}>
                                                        {status.icon} {status.label}
                                                    </div>
                                                </div>
                                                <h4 className="font-black text-slate-800 uppercase text-[11px] leading-tight mb-2 group-hover:text-gov-900">{proc.title}</h4>
                                                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic">"{proc.description}"</p>

                                                <div className="mt-5 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-200/50 pt-4">
                                                    <span>Vincular via GED</span>
                                                    <ExternalLink size={12} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Dossiê de Detalhes do Rito */}
            <Modal isOpen={!!selectedProcess} onClose={() => setSelectedProcess(null)} title="Dossiê do Rito Administrativo" size="xl">
                {selectedProcess && (
                    <div className="space-y-8 p-2">
                        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-8 gap-6">
                            <div className="flex-1">
                                <div className="flex gap-2 mb-3">
                                    <Badge color="blue" className="text-[9px] font-black uppercase">{selectedProcess.macro}</Badge>
                                    <Badge color="gray" className="text-[9px] font-black uppercase font-mono">ID: {selectedProcess.id}</Badge>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">{selectedProcess.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{selectedProcess.description}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center min-w-[200px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Status Documental</p>
                                <div className="p-4 bg-white rounded-2xl shadow-sm mb-2">
                                    {getProcessStatus(selectedProcess).icon}
                                </div>
                                <span className="text-xs font-black uppercase text-gov-600">{getProcessStatus(selectedProcess).label}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Coluna de Orientação */}
                            <div className="space-y-8">
                                <section>
                                    <h4 className="text-[11px] font-black text-gov-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Info size={16} /> Quando este rito é obrigatório?
                                    </h4>
                                    <div className="p-5 bg-gov-50 rounded-2xl border-l-4 border-l-gov-500 shadow-sm">
                                        <p className="text-sm font-bold text-gov-900 leading-relaxed italic">
                                            "{selectedProcess.whenToUse}"
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Activity size={16} /> Fluxograma de Etapas
                                    </h4>
                                    <div className="space-y-3">
                                        {/* Fixed unknown property access by ensuring explicit type and providing fallback array */}
                                        {((selectedProcess as OfficialProcess).steps || []).map((step, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-gov-400 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-gov-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-gov-900/20">{i + 1}</div>
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Coluna GED (Exclusividade de Documentos) */}
                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={120} /></div>
                                <h4 className="text-[11px] font-black text-gov-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 relative z-10">
                                    <FileText size={18} /> Checklist de Evidências (GED)
                                </h4>
                                <div className="space-y-4 relative z-10">
                                    {/* Fixed unknown property access by ensuring explicit type and providing fallback array */}
                                    {((selectedProcess as OfficialProcess).requiredDocTypes || []).map(type => {
                                        const docPresent = (gedDocuments || []).find(d => d.linkedProcessId === (selectedProcess as OfficialProcess).id && d.type === type);
                                        return (
                                            <div key={type} className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${docPresent ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-black uppercase tracking-tight ${docPresent ? 'text-emerald-400' : 'text-slate-400'}`}>{type}</span>
                                                    {docPresent && <span className="text-[10px] font-bold text-emerald-200 mt-1 truncate max-w-[180px]">{docPresent.title}</span>}
                                                </div>
                                                {docPresent ? (
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><ExternalLink size={16} /></Button>
                                                        <CheckCircle2 size={24} className="text-emerald-400" />
                                                    </div>
                                                ) : <AlertTriangle size={24} className="text-red-500 animate-pulse" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                                    <p className="text-[10px] text-gov-400 mb-6 font-black uppercase tracking-[0.2em]">Fluxo de Arquivamento Único</p>
                                    <p className="text-xs text-slate-400 mb-6 px-4 leading-relaxed font-medium">Os documentos deste rito devem ser anexados na aba <strong className="text-white">Documentos GED</strong> vinculando o código <code className="bg-white/10 px-2 py-1 rounded text-gov-400 font-mono">{(selectedProcess as OfficialProcess).id}</code>.</p>
                                    <Button className="w-full bg-gov-500 text-slate-900 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gov-400 shadow-xl shadow-gov-500/10">
                                        <Layers size={18} className="mr-3" /> IR PARA CENTRAL GED
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL NOVO PROCESSO */}
            <Modal isOpen={isNewProcessModalOpen} onClose={() => setIsNewProcessModalOpen(false)} title="Iniciar Rito Administrativo" size="lg">
                <div className="space-y-6 pt-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título do Processo</label>
                            <input className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20"
                                value={newProcess.title} onChange={e => setNewProcess({ ...newProcess, title: e.target.value })} placeholder="Ex: Inventário Anual 2024" />
                        </div>
                        <div className="w-full md:w-1/3 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridade</label>
                            <select className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20"
                                value={newProcess.priority} onChange={e => setNewProcess({ ...newProcess, priority: e.target.value as any })}>
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Macroprocesso</label>
                            <select className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20"
                                value={newProcess.macro} onChange={e => setNewProcess({ ...newProcess, macro: e.target.value })}>
                                <option value="Macroprocessos Comuns">Comum</option>
                                <option value="Contabilidade Pública">Contabilidade</option>
                                <option value="Gestão de Ativos">Gestão de Ativos</option>
                            </select>
                        </div>
                        <div className="w-full md:w-1/2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável Técnico</label>
                            <input className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20"
                                value={newProcess.responsible} onChange={e => setNewProcess({ ...newProcess, responsible: e.target.value })} placeholder="Nome do Responsável" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição / Objetivo</label>
                        <textarea rows={4} className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20 resize-none"
                            value={newProcess.description} onChange={e => setNewProcess({ ...newProcess, description: e.target.value })} placeholder="Descreva o objetivo deste novo processo..." />
                    </div>
                    <div className="pt-4">
                        <Button onClick={handleSaveProcess} fullWidth className="h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Criar Rito</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
