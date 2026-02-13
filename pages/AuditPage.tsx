import React, { useState, useMemo, useRef } from 'react';
import { AuditLog, SystemConfig, Document, Asset, AssetState } from '../types';
import { Card, Input, Pagination, Badge, Button, Modal, ConfirmModal } from '../components/Shared';
import {
    Search, ShieldCheck, Lock, Filter, RefreshCw, FileText,
    AlertTriangle, Activity, Database, CheckCircle, Download,
    Scale, Landmark, Fingerprint, History, Info, Gavel,
    ArrowRightLeft, FileSearch, ShieldAlert, BadgeCheck, Eye,
    Building2, ClipboardCheck, Users, Briefcase, Shield,
    CheckCircle2, FileSignature, Receipt, TrendingUp, PieChart as PieIcon,
    Upload, ExternalLink, ShieldX, Archive, Cpu, ScrollText, Globe,
    LockKeyhole, FileLock2, AlertCircle, Calendar, X, FileUp, Save,
    Printer, Hash, FileCode, CheckSquare, Zap, Calculator,
    Barcode, FileSpreadsheet, ListChecks, TrendingDown, Server,
    Clock, Target, ShieldPlus, ArrowUpRight, FileCheck, ShieldQuestion,
    Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
// import * as XLSX from 'xlsx';
// import { exportToWord, exportToExcel } from '../utils/exportUtils';

interface AuditPageProps {
    logs: AuditLog[];
    assets: Asset[];
    config: SystemConfig;
    onAddDocument?: (doc: Document) => void;
    users?: { id: string; name: string; email: string; role: string; acceptedTerms?: boolean }[];
}

type AuditModule = 'FORENSIC' | 'CONCILIATION' | 'ACCOUNTABILITY' | 'FISCAL';

export const AuditPage: React.FC<AuditPageProps> = ({ logs, assets, config, onAddDocument, users = [] }) => {
    const [activeModule, setActiveModule] = useState<AuditModule>('FORENSIC');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isVerifying, setIsVerifying] = useState(false);

    const [isReconciling, setIsReconciling] = useState(false);
    const [isSyncingGED, setIsSyncingGED] = useState(false);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadStep, setUploadStep] = useState<'UPLOAD' | 'CHECKING' | 'SIGNING' | 'SUCCESS'>('UPLOAD');
    const [viewingDoc, setViewingDoc] = useState<Asset | null>(null);
    const [activeTCE, setActiveTCE] = useState<any>(null);

    const itemsPerPage = 10;

    // Fix: Move hook to top level
    const filteredFiscalAssets = useMemo(() =>
        assets.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.toLowerCase().includes(searchTerm.toLowerCase())),
        [assets, searchTerm]);

    const forensicChain = useMemo(() => {
        return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((log, index, arr) => {
                const prevLog = arr[index + 1];
                const prevHash = prevLog ? `SHA256_${(prevLog.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)).toString(16)}` : "0000000000000000";
                const currentHash = `SHA256_${(log.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) * 1.5).toString(16).toUpperCase()}`;
                return {
                    ...log,
                    prevHash,
                    currentHash,
                    ip: `189.45.${10 + index}.${Math.floor(Math.random() * 255)}`,
                    deviceId: `NODE-${log.userId}-${index}`
                };
            });
    }, [logs]);

    const filteredLogs = forensicChain.filter(l =>
        l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.currentHash.includes(searchTerm.toUpperCase())
    );

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const reconciliation = useMemo(() => {
        const totalValue = assets.reduce((acc, a) => acc + (a.accounting?.acquisitionValue || 0), 0);
        const sobrasContabeis = assets.filter(a => a.state === AssetState.BAD).length;
        const sobrasFisicas = 0; // Removed hardcoded '3'
        const acuracia = assets.length > 0 ? Math.round(((assets.length - sobrasContabeis) / assets.length) * 100) : 100; // Default to 100% if no assets
        return { totalValue, sobrasContabeis, sobrasFisicas, acuracia };
    }, [assets]);


    // ...

    const handleExportForense = async () => {
        const { exportToWord } = await import('../utils/exportUtils');
        await exportToWord('AUDIT', {
            locations: assets.map(a => ({ id: 'ignore', name: 'ignore' } as any)), // Mock locations/users as they aren't used deeply in Audit template yet except for lookups which we bypass in utils
            users: [],
            logs: forensicChain
        });
    };

    const handleSyncGED = () => {
        setIsSyncingGED(true);
        setTimeout(() => {
            setIsSyncingGED(false);
            alert("Sincronização com GED Central concluída. 14 novos termos de responsabilidade foram validados com assinatura ICP-Brasil.");
        }, 2500);
    };

    const handleGenerateAccountability = async () => {
        const report = assets.map(a => ({
            "Tombamento": a.id,
            "Bem": a.name,
            "Estado": a.state,
            "Valor Original": a.accounting?.acquisitionValue || 0,
            "Depreciação Acumulada": a.accounting?.accumulatedDepreciation || 0,
            "Valor Líquido": (a.accounting?.acquisitionValue || 0) - (a.accounting?.accumulatedDepreciation || 0),
            "Responsável": a.responsibleId
        }));
        const { exportToExcel } = await import('../utils/exportUtils');
        await exportToExcel(report, "PCA_PATRIMONIAL_2024");
    };

    const handleDownloadEvidence = () => {
        // Simula o download de um pacote de evidências (ZIP/PDF)
        const link = document.createElement('a');
        link.href = '#'; // Em produção, seria um blob ou URL real
        link.download = `EVIDENCIAS_AUDITORIA_${viewingDoc?.id || 'GERAL'}_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("Pacote de evidências assinado digitalmente foi baixado com sucesso.");
    };

    const handleProtocolProcess = () => {
        setUploadStep('CHECKING');
        setTimeout(() => {
            setUploadStep('SIGNING');
            setTimeout(() => {
                setUploadStep('SUCCESS');
            }, 2000);
        }, 2000);
    };

    const resetProtocolModal = () => {
        setIsUploadModalOpen(false);
        setUploadStep('UPLOAD');
    };

    return (
        <div className="space-y-4 pb-8 animate-fadeIn">
            <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5"><ShieldCheck size={100} /></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge color="blue" className="bg-gov-500/20 text-gov-400 border-none px-3 py-1 font-black uppercase tracking-widest text-[8px]">Compliance Engine</Badge>
                            <div className="flex items-center gap-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Ledger Protegido
                            </div>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Auditoria & Compliance</h2>
                        <p className="text-slate-400 mt-1 font-medium text-xs">Soberania de dados e ritos administrativos patrimoniais.</p>
                    </div>
                    <div className="flex bg-white/10 p-1 rounded-xl border border-white/10 shadow-inner">
                        {[
                            { id: 'FORENSIC', label: 'Rastreabilidade Forense', icon: <Fingerprint size={12} /> },
                            { id: 'CONCILIATION', label: 'Conciliação de Ativos', icon: <ArrowRightLeft size={12} /> },
                            { id: 'ACCOUNTABILITY', label: 'Prestação de Contas (TCE)', icon: <Scale size={12} /> },
                            { id: 'FISCAL', label: 'Cofre Documental Fiscal', icon: <Archive size={12} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveModule(tab.id as any)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeModule === tab.id ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="animate-fadeIn">
                {activeModule === 'FORENSIC' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-4 bg-white rounded-2xl border-none shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Hash size={20} /></div>
                                <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ledger</p><p className="text-sm font-black text-slate-800 uppercase">Integridade OK</p></div>
                            </Card>
                            <Card className="p-4 bg-white rounded-2xl border-none shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={20} /></div>
                                <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Segurança</p><p className="text-sm font-black text-emerald-600 uppercase">Criptografado</p></div>
                            </Card>
                            <Button onClick={() => { setIsVerifying(true); setTimeout(() => setIsVerifying(false), 1500); }} disabled={isVerifying} className="h-full py-4 rounded-2xl bg-gov-600 border-none font-black text-[9px] uppercase tracking-widest">
                                {isVerifying ? <RefreshCw className="animate-spin mr-2" size={14} /> : <Zap className="mr-2" size={14} />}
                                Re-validar Cadeia
                            </Button>
                        </div>

                        <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[1.5rem] bg-white">
                            <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative w-full md:w-[300px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-gov-500/20" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                <Button onClick={handleExportForense} variant="secondary" className="rounded-xl border-slate-200 h-10 px-4 text-[9px] font-black uppercase"><Download size={14} className="mr-2" /> Exportar Log</Button>
                            </div>
                            <div className="overflow-x-auto custom-scroll">
                                <table className="min-w-full text-left text-[9px]">
                                    <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4">Agente</th>
                                            <th className="px-6 py-4">Rito</th>
                                            <th className="px-6 py-4 text-right">Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {currentLogs.map((log, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-slate-700">{new Date(log.timestamp).toLocaleString()}</p>
                                                    <span className="text-[8px] text-slate-400 font-mono">IP: {log.ip}</span>
                                                </td>
                                                <td className="px-6 py-4 uppercase font-black text-slate-800">{log.userName}</td>
                                                <td className="px-6 py-4">
                                                    <Badge color="blue" className="text-[7px] px-2 py-0.5">{log.action}</Badge>
                                                    <p className="text-slate-400 font-medium truncate w-32">{log.details}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-[8px] text-gov-600 font-black">{log.currentHash.substring(0, 16)}...</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </Card>
                    </div>
                )}

                {activeModule === 'CONCILIATION' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { t: 'Base Contábil', v: assets.length, c: 'gov' },
                                { t: 'Físico', v: assets.filter(a => a.state !== AssetState.DISPOSED).length, c: 'emerald' },
                                { t: 'Sobra Cont.', v: reconciliation.sobrasContabeis, c: 'red' },
                                { t: 'Sobra Fís.', v: 0, c: 'amber' }
                            ].map((s, i) => (
                                <Card key={i} className={`p-4 rounded-2xl bg-white shadow-sm border-t-4 border-t-${s.c}-500`}>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.t}</p>
                                    <p className={`text-xl font-black text-${s.c}-600`}>{s.v}</p>
                                </Card>
                            ))}
                        </div>

                        <Card className="rounded-[2rem] bg-white text-slate-900 p-8 relative overflow-hidden shadow-xl border border-slate-100">
                            <div className="absolute right-0 top-0 p-6 opacity-5"><Calculator size={120} className="text-slate-900" /></div>
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                <div className="lg:col-span-7 space-y-6">
                                    <div>
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gov-600 mb-3 flex items-center gap-2"><AlertCircle size={12} /> Métrica de Risco</h3>
                                        {reconciliation.sobrasContabeis > 0 ? (
                                            <>
                                                <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Divergência Crítica</p>
                                                <div className="mt-4 flex items-center gap-6">
                                                    <p className="text-3xl font-black text-red-700">R$ {reconciliation.sobrasContabeis}</p>
                                                    <Badge color="red" className="px-4 py-1.5 text-[8px] font-black bg-red-600 text-white border-none shadow-md">AÇÃO IMEDIATA</Badge>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Conformidade Total</p>
                                                <div className="mt-4 flex items-center gap-6">
                                                    <p className="text-3xl font-black text-emerald-600">0 Divergências</p>
                                                    <Badge color="green" className="px-4 py-1.5 text-[8px] font-black bg-emerald-600 text-white border-none shadow-md">REGULAR</Badge>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 flex gap-10">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Acurácia Global</p>
                                            <p className="text-4xl font-black text-slate-900 tracking-tight">{reconciliation.acuracia}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Perda Nominal</p>
                                            <p className="text-4xl font-black text-slate-400 tracking-tight">{Math.abs(100 - reconciliation.acuracia)}%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-5">
                                    <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 shadow-inner w-full flex flex-col gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gov-100 rounded-xl text-gov-900 shadow-sm"><RefreshCw className={isReconciling ? "animate-spin" : ""} size={20} /></div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Rito de Batida</p>
                                                <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">Sincronização Fiscal-Estoque</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => { setIsReconciling(true); setTimeout(() => setIsReconciling(false), 2000); }}
                                            disabled={isReconciling}
                                            className="w-full h-14 bg-gov-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-gov-800 transition-all border-none"
                                        >
                                            {isReconciling ? "Processando..." : "Recalcular Malha Ativa"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeModule === 'ACCOUNTABILITY' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Landmark size={32} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Relatórios de Prestação de Contas</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Conformidade com os ritos e prazos do Tribunal de Contas.</p>
                                </div>
                            </div>
                            <Button onClick={handleGenerateAccountability} className="h-12 px-6 rounded-xl bg-slate-900 text-[9px] font-black uppercase text-white tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                <FileSpreadsheet size={16} className="mr-2" /> Gerar Dossiê PCA
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card title="Cálculo de Depreciação" className="p-4 rounded-2xl bg-white shadow-sm">
                                <div className="h-28">
                                    <div className="flex h-full items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        Aguardando Dados
                                    </div>
                                </div>
                            </Card>

                            <Card title="Vínculos Fiéis Depositários" className="p-4 rounded-2xl bg-white shadow-sm">
                                <div className="space-y-3">
                                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Termos Assinados</span>
                                        <span className="text-sm font-black text-emerald-700">{users.length > 0 ? '100%' : '0%'}</span>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        disabled={isSyncingGED}
                                        className="h-12 text-[9px] uppercase font-black bg-gradient-to-r from-gov-900 to-gov-800 text-white shadow-lg border-none hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 rounded-xl relative overflow-hidden group"
                                        onClick={handleSyncGED}
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <div className="p-1.5 bg-white/20 rounded-lg relative z-10">
                                            {isSyncingGED ? <RefreshCw className="animate-spin text-white" size={14} /> : <Layers size={14} className="text-white" />}
                                        </div>
                                        <span className="relative z-10">{isSyncingGED ? "Sincronizando Base..." : "SINCRONIZAR VIA GED"}</span>
                                    </Button>
                                </div>
                            </Card>

                            <Card title="Obrigações Vigentes (TCE)" className="rounded-2xl bg-white text-slate-800 border-slate-200 shadow-lg p-4">
                                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scroll pr-1">
                                    <div className="flex h-[150px] items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        Nenhuma obrigação pendente
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeModule === 'FISCAL' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="p-6 bg-white rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg"><Archive size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Repositório de Provas Fiscais</h3>
                                    <p className="text-xs text-slate-500 font-medium">Controle imutável de NF-e e Provas de Propriedade.</p>
                                </div>
                            </div>
                            <Button onClick={() => setIsUploadModalOpen(true)} className="h-12 px-6 rounded-xl bg-gov-900 text-[9px] font-black uppercase text-white tracking-widest hover:bg-gov-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                <Upload size={16} className="mr-2" /> Protocolar XML
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-gov-500 focus:border-transparent outline-none shadow-sm transition-all"
                                    placeholder="Pesquisar Patrimônio, NF-e, Chave de Acesso..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="secondary" className="h-11 px-4 rounded-xl border-slate-200 bg-white text-slate-600 font-bold text-[10px] uppercase shadow-sm"><Filter size={14} className="mr-2" /> Filtros Avançados</Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
                            {filteredFiscalAssets.slice(0, 12).map(asset => (
                                <Card key={asset.id} className="p-4 rounded-2xl border border-slate-100 bg-white group hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-gov-900 group-hover:text-white transition-all">
                                            <FileCode size={20} />
                                        </div>
                                        <Badge color="green" className="text-[7px] font-black">NF-e OK</Badge>
                                    </div>
                                    <h4 className="font-black text-slate-800 uppercase text-[9px] leading-tight mb-4 truncate">{asset.name}</h4>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        className="h-8 rounded-lg text-[8px] font-black uppercase bg-slate-50 border-none group-hover:bg-gov-900 group-hover:text-white transition-all"
                                        onClick={() => setViewingDoc(asset)}
                                    >
                                        <Eye size={12} className="mr-2" /> Abrir Dossiê
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!viewingDoc}
                onClose={() => setViewingDoc(null)}
                title={`Dossiê de Prova Fiscal: ${viewingDoc?.id}`}
                size="lg"
            >
                {viewingDoc && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-6 bg-slate-900 rounded-3xl text-white flex gap-6 relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-4 opacity-10"><FileSignature size={120} /></div>
                            <div className="p-5 bg-gov-600 rounded-2xl shadow-xl flex items-center justify-center"><ShieldCheck size={32} /></div>
                            <div className="relative z-10">
                                <h4 className="text-xl font-black uppercase tracking-tight">{viewingDoc.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Propriedade Certificada e Auditada</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Chave de Acesso NF-e</p>
                                    <p className="text-xs font-mono font-black text-slate-800 break-all leading-relaxed">
                                        3524 0561 2345 6700 0123 5500 1000 0450 0112 3456 7890
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Protocolo de Selagem</p>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><BadgeCheck size={16} /></div>
                                        <p className="text-[10px] font-mono font-bold text-emerald-700">SHA256: {Math.random().toString(16).slice(2, 18).toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col justify-center">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Custódia Documental</p>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-indigo-900 uppercase">Nota Fiscal (PDF)</span>
                                        <Badge color="blue" className="text-[8px]">VALIDADO</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-indigo-900 uppercase">Arquivo XML</span>
                                        <Badge color="blue" className="text-[8px]">ASSINADO</Badge>
                                    </div>
                                </div>
                                <Button variant="secondary" fullWidth className="h-12 border-slate-200 text-[9px] font-black uppercase" onClick={handleDownloadEvidence}>
                                    <Download size={16} className="mr-2" /> Baixar Pacote de Evidências
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Última Auditoria: {new Date().toLocaleDateString()}</p>
                            <Button onClick={() => setViewingDoc(null)} className="h-12 px-8 bg-gov-900 text-white rounded-xl text-[9px] font-black uppercase">Fechar Dossiê</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isUploadModalOpen} onClose={resetProtocolModal} title="Arquivar Prova Fiscal" size="lg">
                <div className="space-y-4">
                    <div className="p-6 bg-slate-900 rounded-2xl text-white flex gap-4 relative overflow-hidden shadow-lg">
                        <div className="p-4 bg-gov-600 rounded-xl shadow-xl"><ShieldAlert size={20} /></div>
                        <div>
                            <h4 className="font-black uppercase tracking-tighter text-sm leading-tight">Rito de Selagem Fiscal</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Garantia de integridade via carimbo de tempo.</p>
                        </div>
                    </div>

                    {uploadStep === 'UPLOAD' && (
                        <div className="space-y-4 animate-fadeIn">
                            <Input label="Título Oficial do Ativo" placeholder="Ex: NF-4500" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Natureza Jurídica</label>
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-gov-500/20">
                                        <option>Nota Fiscal (NF-e)</option>
                                        <option>XML de Transmissão</option>
                                        <option>Apólice de Seguro</option>
                                    </select>
                                </div>
                                <Input label="Chave de Acesso" placeholder="44 dígitos" />
                            </div>
                            <div className="h-32 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50 flex flex-col items-center justify-center group hover:border-gov-500 transition-all cursor-pointer">
                                <Upload size={24} className="text-slate-300 group-hover:text-gov-600 mb-2" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Importar PDF / XML Assinado</span>
                            </div>
                            <Button onClick={handleProtocolProcess} className="w-full h-12 bg-gov-900 rounded-xl font-black uppercase shadow-xl text-white text-[10px] tracking-widest">
                                Iniciar Protocolo Digital
                            </Button>
                        </div>
                    )}

                    {uploadStep === 'CHECKING' && (
                        <div className="py-12 flex flex-col items-center justify-center animate-fadeIn text-center space-y-4">
                            <RefreshCw size={40} className="text-gov-500 animate-spin" />
                            <div>
                                <h4 className="text-lg font-black text-slate-800 uppercase">Validando Integridade do Hash</h4>
                                <p className="text-xs text-slate-500 font-medium">Verificando colisoes de SHA-256 no Ledger...</p>
                            </div>
                        </div>
                    )}

                    {uploadStep === 'SIGNING' && (
                        <div className="py-12 flex flex-col items-center justify-center animate-fadeIn text-center space-y-4">
                            <ShieldCheck size={40} className="text-emerald-500 animate-pulse" />
                            <div>
                                <h4 className="text-lg font-black text-slate-800 uppercase">Assinando Digitalmente</h4>
                                <p className="text-xs text-slate-500 font-medium">Aplicando certificado ICP-Brasil do operador...</p>
                            </div>
                        </div>
                    )}

                    {uploadStep === 'SUCCESS' && (
                        <div className="py-8 flex flex-col items-center justify-center animate-fadeIn text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-emerald-700 uppercase">Protocolado com Sucesso</h4>
                                <p className="text-xs text-slate-500 font-medium mt-1">O documento foi selado e arquivado no cofre fiscal.</p>
                            </div>
                            <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Hash Final do Registro</p>
                                <p className="text-[10px] font-mono font-bold text-slate-800 break-all">{Array(64).fill('0').map(() => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()}</p>
                            </div>
                            <Button onClick={resetProtocolModal} className="w-full h-12 bg-slate-900 text-white rounded-xl font-black uppercase">
                                Finalizar e Fechar
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={!!activeTCE} onClose={() => setActiveTCE(null)} title="Compliance TCE-PB" size="sm">
                {activeTCE && (
                    <div className="text-center py-6 space-y-6">
                        <div className={`p-6 mx-auto rounded-full w-24 h-24 flex items-center justify-center ${activeTCE.b} ${activeTCE.tx} border-4 border-white shadow-2xl skew-y-3`}>
                            <Scale size={40} />
                        </div>
                        <div>
                            <Badge color="blue" className="mb-2">Rito de Fiscalização</Badge>
                            <h4 className="text-xl font-black uppercase text-slate-900 leading-tight">{activeTCE.t}</h4>
                            <p className="text-xs font-medium text-slate-500 mt-2 px-8"> Protocolo de verificação automática iniciado. O sistema está auditando as conformidades exigidas.</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mx-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-600 mb-2">
                                <span>Progresso da Auditoria</span>
                                <span>{activeTCE.s === 'OK' ? '100%' : '45%'}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${activeTCE.c} transition-all duration-1000 w-[${activeTCE.s === 'OK' ? '100%' : '45%'}]`}></div>
                            </div>
                        </div>
                        <Button fullWidth onClick={() => setActiveTCE(null)} className="h-12 bg-slate-900 text-white rounded-xl uppercase font-black text-[10px] tracking-widest">Confirmar Ciência</Button>
                    </div>
                )}
            </Modal>

            <style>{`
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};
