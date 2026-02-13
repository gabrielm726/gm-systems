import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InventorySession, Location, Asset, AssetState, EntityType } from '../types';
import { Card, Button, Badge, Modal, Input } from '../components/Shared';
import {
    ClipboardList, Smartphone, Camera, QrCode, AlertTriangle,
    Check, CheckCircle, FileText, Plus, Download, Printer,
    Search, MapPin, ArrowRight, History,
    Filter, Database, Wifi, ShieldCheck,
    MoreHorizontal, CheckCircle2, XCircle, AlertCircle, RefreshCw,
    Cpu, Target, UserCheck, Calendar, Users, Gavel, Shield, Clock, BookOpen
} from 'lucide-react';

interface InventoryPageProps {
    sessions: InventorySession[];
    assets: Asset[];
    locations: Location[];
    entityType?: EntityType;
    onNavigate: (tab: string) => void;
    onAddSession?: (session: InventorySession) => Promise<void>;
    onAddCycle?: (cycle: any) => Promise<void>;
}

type InventoryTab = 'ACTIVE' | 'PLANNING' | 'RESULTS';

export const InventoryPage: React.FC<InventoryPageProps> = ({
    sessions: initialSessions,
    assets,
    locations,
    entityType = 'PUBLIC',
    onNavigate,
    onAddSession,
    onAddCycle
}) => {
    // ... code ...

    // ... (skipping to render part matching where edits are needed)

    // Note: I will use MultiReplaceFileContent because changes are in multiple places (Props + Render)
    // But replace_file_content was requested. 
    // I will use `replace_file_content` for the props/start first, and another for the render buttons.
    // Actually, tool rules say DO NOT make multiple parallel calls to replace_file_content.
    // I should use `multi_replace_file_content`.

    // Re-generating thought process for MultiReplaceFileContent.

    const [activeTab, setActiveTab] = useState<InventoryTab>('ACTIVE');
    const [viewMode, setViewMode] = useState<'DESKTOP' | 'MOBILE_SIMULATION'>('DESKTOP');
    const [sessions, setSessions] = useState(initialSessions);
    const [activeSession, setActiveSession] = useState<InventorySession | null>(null);

    // Mobile UI State
    const [mobileStep, setMobileStep] = useState<'MENU' | 'SCAN' | 'RESULT' | 'OFFLINE'>('MENU');
    const [lastScanned, setLastScanned] = useState<Asset | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Planning State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSession, setNewSession] = useState<{
        name: string;
        locationIds: string[];
        legalFramework?: string;
        fieldSupervisor?: string;
        startDate?: string;
        endDate?: string;
        riskLevel?: string;
    }>({ name: '', locationIds: [] });

    // Cycle Management State
    // Cycle Management State
    const [plannedCycles, setPlannedCycles] = useState<any[]>([]);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);

    // Planning specific state
    const [creationMode, setCreationMode] = useState<'SESSION' | 'CYCLE'>('SESSION');
    const [locationSearch, setLocationSearch] = useState('');
    const [scheduleMenuOpen, setScheduleMenuOpen] = useState<number | null>(null);

    // Camera state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const isPublic = entityType === 'PUBLIC';

    // --- CALCULOS DE DASHBOARD ---
    const dashboardStats = useMemo(() => {
        const totalExpected = sessions.reduce((acc, s) => acc + s.totalAssetsExpected, 0);
        const totalScanned = sessions.reduce((acc, s) => acc + s.totalAssetsScanned, 0);
        const totalDivergences = sessions.reduce((acc, s) => acc + s.divergencesCount, 0);
        const accuracy = totalScanned > 0 ? Math.round(((totalScanned - totalDivergences) / totalScanned) * 100) : 0;

        return { totalExpected, totalScanned, totalDivergences, accuracy };
    }, [sessions]);

    // --- CAMERA HANDLERS ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Erro ao acessar camera:", err);
            alert("Não foi possível acessar a câmera. Verifique as permissões.");
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    useEffect(() => {
        if (mobileStep === 'SCAN') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [mobileStep]);


    // --- HANDLERS ---
    const handleStartSession = (session: InventorySession) => {
        setActiveSession(session);
        setViewMode('MOBILE_SIMULATION');
        setMobileStep('MENU');
    };

    const handleSimulateScan = () => {
        setIsSyncing(true);
        setTimeout(() => {
            const randomAsset = assets[Math.floor(Math.random() * assets.length)];
            setLastScanned(randomAsset);
            setIsSyncing(false);
            setMobileStep('RESULT');
        }, 1200);
    };

    const handleCreateSession = async () => {
        if (!newSession.name) return;

        if (creationMode === 'CYCLE') {
            const newCycle = {
                id: Date.now(),
                title: `Ciclo: ${newSession.riskLevel || 'GERAL'} - ${new Date().getFullYear()}`,
                date: `${new Date(newSession.startDate || '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${new Date(newSession.endDate || '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`,
                locations: 'Novos Setores Definidos',
                risk: newSession.riskLevel || 'MÉDIO'
            };

            if (onAddCycle) {
                await onAddCycle(newCycle);
            }
            // Update local state as well for immediate feedback? Or rely on parent re-render?
            // Since we don't have cycles in App.tsx yet (App.tsx doesn't seem to manage cycle state globally), keep local state for now.
            setPlannedCycles([...plannedCycles, newCycle]);
            setIsCreateModalOpen(false);
            return;
        }

        const session: InventorySession = {
            id: `INV-${Date.now()}`,
            name: newSession.name,
            type: isPublic ? 'INSTITUCIONAL/OBRIGATÓRIO' : 'CORPORATIVO/ROTATIVO',
            status: 'ONGOING',
            startDate: new Date().toISOString().split('T')[0],
            locationIds: newSession.locationIds,
            totalAssetsExpected: 150, // Should be calculated
            totalAssetsScanned: 0,
            divergencesCount: 0,
            legalFramework: newSession.legalFramework,
            fieldSupervisor: newSession.fieldSupervisor,
        };

        if (onAddSession) {
            await onAddSession(session);
        } else {
            setSessions([session, ...sessions]);
        }
        setIsCreateModalOpen(false);
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            {/* CABEÇALHO ESTRATÉGICO */}
            <div className={`p-8 rounded-[2.5rem] shadow-xl border-t-8 flex flex-col md:flex-row items-center justify-between gap-6 ${isPublic ? 'bg-slate-900 border-gov-500 text-white' : 'bg-white border-emerald-500 text-slate-800'}`}>
                <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-3xl ${isPublic ? 'bg-gov-500/20 text-gov-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        <ClipboardList size={48} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Inventário Patrimonial</h2>
                        <div className="flex items-center gap-3 mt-3">
                            <Badge color={isPublic ? 'primary' : 'success'} className="px-4 py-1.5 font-black uppercase tracking-widest border-none">
                                Rito {isPublic ? 'Art. 94 Lei 4.320' : 'Auditável / IFRS'}
                            </Badge>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isPublic ? 'text-slate-400' : 'text-slate-500'}`}>
                                Acurácia Físico-Contábil: {dashboardStats.accuracy}%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 bg-black/10 p-1.5 rounded-2xl border border-white/10 no-print">
                    {(['ACTIVE', 'PLANNING', 'RESULTS'] as InventoryTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab === 'ACTIVE' ? 'Sessões Ativas' : tab === 'PLANNING' ? 'Planejamento' : 'Divergências'}
                        </button>
                    ))}
                </div>
            </div>

            {viewMode === 'DESKTOP' ? (
                <div className="animate-fadeIn space-y-6">

                    {/* DASHBOARD DE MONITORAMENTO */}
                    {activeTab !== 'PLANNING' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Acurácia Global', val: `${dashboardStats.accuracy}%`, color: 'success', icon: <ShieldCheck /> },
                                { label: 'Total Scaneado', val: dashboardStats.totalScanned, color: 'primary', icon: <Target /> },
                                { label: 'Divergências', val: dashboardStats.totalDivergences, color: 'danger', icon: <AlertCircle /> },
                                { label: 'Cobertura Valor', val: 'R$ 0', color: 'info', icon: <Database /> }
                            ].map((stat, i) => (
                                <Card key={i} className={`bg-white border-l-4 border-l-${stat.color}-500 shadow-sm p-6`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                            <p className={`text-2xl font-black text-${stat.color}-600`}>{stat.val}</p>
                                        </div>
                                        <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>{stat.icon}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === 'ACTIVE' && (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border shadow-sm">
                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] ml-4">Monitor de Campo em Tempo Real</h3>
                                <Button onClick={() => { setCreationMode('SESSION'); setIsCreateModalOpen(true); }} className="bg-gov-900 text-white rounded-2xl px-8 h-12 shadow-xl shadow-gov-900/20 uppercase font-black text-[10px] tracking-widest">
                                    <Plus size={18} className="mr-2" /> Abrir Nova Sessão
                                </Button>
                            </div>

                            {sessions.map(session => (
                                <Card key={session.id} className="p-8 border-none shadow-sm hover:shadow-md transition-all group bg-white rounded-[2.5rem]">
                                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge color={session.status === 'ONGOING' ? 'primary' : 'warning'} className="px-3 py-1 font-black text-[9px] tracking-widest uppercase">
                                                    {session.status}
                                                </Badge>
                                                <span className="text-[10px] text-slate-300 font-black font-mono">ID: {session.id}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{session.name}</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
                                                    <History size={14} /> Iniciado em: {new Date(session.startDate).toLocaleDateString()} • {session.type}
                                                </p>
                                            </div>
                                            <div className="pt-4 space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-500">Progresso da Contagem Física</span>
                                                    <span className="text-gov-600">{Math.round((session.totalAssetsScanned / (session.totalAssetsExpected || 1)) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                                    <div className="bg-gov-500 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${(session.totalAssetsScanned / (session.totalAssetsExpected || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                            <div className="text-center px-4">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lidos</p>
                                                <p className="text-2xl font-black text-slate-800">{session.totalAssetsScanned}</p>
                                            </div>
                                            <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                                            <div className="text-center px-4">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Divergências</p>
                                                <p className="text-2xl font-black text-red-600">{session.divergencesCount}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button onClick={() => handleStartSession(session)} className="h-12 bg-gov-900 rounded-xl px-6 text-[10px] font-black tracking-widest flex items-center gap-2">
                                                    <Smartphone size={16} /> MODO COLETA
                                                </Button>
                                                <Button variant="secondary" className="h-12 border-slate-200 rounded-xl px-6 text-[10px] font-black tracking-widest flex items-center gap-2">
                                                    <FileText size={16} /> AUDITAR
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === 'PLANNING' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Coluna 1: Gestão de Comissões e Portarias */}
                                <Card className="lg:col-span-1 rounded-[2.5rem] p-6">
                                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-4">Comissões de Inventário (Legal)</h3>
                                    <div className="space-y-6">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-slate-200 text-slate-500 rounded-lg"><Gavel size={18} /></div>
                                                <h4 className="text-xs font-black text-slate-600 uppercase">Portaria Ativa</h4>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-400">Nenhuma portaria de inventário vigente.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipe Técnica Designada</h5>
                                            <div className="text-center py-4 text-xs text-slate-400">Nenhuma equipe designada</div>
                                        </div>
                                        <Button onClick={() => onNavigate('responsible')} fullWidth variant="secondary" className="h-12 text-[10px] font-black uppercase border-slate-200"><UserCheck size={16} className="mr-2" /> Designar Comissão</Button>
                                    </div>
                                </Card>

                                {/* Coluna 2: Cronograma e Cronograma de Setores */}
                                <Card title="Cronograma de Missões Futuras" className="lg:col-span-2 rounded-[2.5rem]">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl text-white">
                                            <div className="flex items-center gap-4">
                                                <Calendar className="text-gov-400" size={32} />
                                                <div>
                                                    <h4 className="text-lg font-black uppercase tracking-tighter">Agenda Estratégica</h4>
                                                    <p className="text-xs text-slate-400 font-medium">Próximos ciclos de conferência física.</p>
                                                </div>
                                            </div>
                                            <Button onClick={() => { setCreationMode('CYCLE'); setIsCreateModalOpen(true); }} className="bg-gov-500 text-slate-900 border-none h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-lg">Planejar Novo Ciclo</Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {plannedCycles.length === 0 && (
                                            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                <Calendar className="mx-auto text-slate-300 mb-2" size={32} />
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum ciclo planejado</p>
                                            </div>
                                        )}
                                        {plannedCycles.map((plan, i) => (
                                            <div key={plan.id} className="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-gov-500 hover:shadow-xl transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="flex gap-6 items-center">
                                                    <div className={`p-4 rounded-2xl shadow-sm ${plan.risk === 'CRÍTICO' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        <Target size={24} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">{plan.title}</h5>
                                                        <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-slate-400 uppercase">
                                                            <span className="flex items-center gap-1"><Clock size={12} /> {plan.date}</span>
                                                            <span className="flex items-center gap-1"><MapPin size={12} /> {plan.locations}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Risco Auditável</p>
                                                        <Badge color={plan.risk === 'CRÍTICO' ? 'red' : plan.risk === 'ALTO' ? 'orange' : 'blue'} className="text-[8px]">{plan.risk}</Badge>
                                                    </div>
                                                    <div className="relative">
                                                        <button onClick={() => setScheduleMenuOpen(scheduleMenuOpen === plan.id ? null : plan.id)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-gov-900 hover:text-white transition-all"><MoreHorizontal size={18} /></button>
                                                        {scheduleMenuOpen === plan.id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-10">
                                                                <button onClick={() => {
                                                                    const updated = prompt("Novo título do ciclo:", plan.title);
                                                                    if (updated) {
                                                                        setPlannedCycles(plannedCycles.map(c => c.id === plan.id ? { ...c, title: updated } : c));
                                                                        setScheduleMenuOpen(null);
                                                                    }
                                                                }} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700">Editar Ciclo</button>
                                                                <button onClick={() => {
                                                                    if (confirm('Tem certeza que deseja cancelar este ciclo de inventário?')) {
                                                                        setPlannedCycles(plannedCycles.filter(c => c.id !== plan.id));
                                                                        setScheduleMenuOpen(null);
                                                                    }
                                                                }} className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-lg text-xs font-bold text-red-600">Cancelar Ciclo</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            {/* Seção de Regras e Instruções Normativas */}
                            <Card className="bg-slate-50 border-none rounded-[2.5rem]">
                                <div className="flex flex-col md:flex-row items-center gap-10 p-4">
                                    <div className="p-8 bg-white rounded-full shadow-2xl border-4 border-gov-100">
                                        <ShieldCheck size={64} className="text-gov-600" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Diretrizes de Auditoria de Campo</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Todo planejamento de inventário deve seguir a <strong>Instrução Normativa nº 03/2024</strong>.
                                            Certifique-se de que os coletores mobile estejam com a versão mais recente e os Beacons de localização das salas estejam ativos.
                                        </p>
                                        <div className="flex gap-4">
                                            <Button onClick={() => setIsManualModalOpen(true)} variant="secondary" className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase border-slate-200 hover:bg-gov-50 hover:text-gov-700 transition-colors shadow-sm"><Download size={16} className="mr-2" /> Manual do Coletor</Button>
                                            <Button onClick={() => setIsTrainingModalOpen(true)} variant="secondary" className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase border-slate-200 hover:bg-gov-50 hover:text-gov-700 transition-colors shadow-sm"><Users size={16} className="mr-2" /> Treinamento Equipe</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'RESULTS' && (
                        <div className="space-y-6">
                            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <AlertTriangle className="text-red-500" size={20} /> Tratamento de Divergências Ativas
                                    </h3>
                                    <Button onClick={() => window.print()} variant="secondary" className="rounded-xl h-10 border-slate-200 text-[9px] font-black uppercase tracking-widest"><Printer size={14} className="mr-2" /> Imprimir Laudos de Ajuste</Button>
                                </div>

                                <div className="overflow-x-auto custom-scroll">
                                    <table className="min-w-full text-xs text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Patrimônio</th>
                                                <th className="px-6 py-4">Unidade Esperada</th>
                                                <th className="px-6 py-4">Local Localizado</th>
                                                <th className="px-6 py-4">Natureza do Erro</th>
                                                <th className="px-6 py-4 text-right">Ação Corretiva (Rito)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sessions.flatMap(s => []).length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-black uppercase">Nenhuma divergência encontrada</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            ) : (
                /* --- SIMULADOR MOBILE ENTERPRISE --- */
                <div className="flex flex-col items-center justify-center py-10 animate-scaleUp">
                    <div className="relative w-full max-w-[400px] aspect-[9/18.5] bg-slate-900 rounded-[3.5rem] border-[10px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">

                        {/* IPHONE-LIKE NOTCH & STATUS BAR */}
                        <div className="absolute top-0 w-full h-10 z-50 flex items-center justify-between px-8 text-white">
                            <span className="text-[10px] font-black">9:41</span>
                            <div className="w-20 h-6 bg-slate-900 rounded-b-2xl absolute left-1/2 -translate-x-1/2 border-x border-b border-slate-800"></div>
                            <div className="flex items-center gap-1.5">
                                <Wifi size={10} />
                                <div className="w-4 h-2 rounded-sm border border-white/50 relative">
                                    <div className="absolute top-0 left-0 h-full bg-white w-3"></div>
                                </div>
                            </div>
                        </div>

                        {/* APP HEADER */}
                        <div className="pt-14 pb-6 px-6 bg-gradient-to-br from-gov-700 to-gov-900 text-white shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">S.G Mobile v2.4</h4>
                                    <h3 className="text-lg font-black uppercase tracking-tight truncate w-40">{activeSession?.name}</h3>
                                </div>
                                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                                    <Cpu size={20} className="text-gov-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold bg-black/20 p-2 rounded-lg border border-white/5">
                                <MapPin size={12} /> {isPublic ? 'GPS: Alta Precisão' : 'Beacon: Identificado'}
                            </div>
                        </div>

                        {/* MOBILE BODY */}
                        <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">

                            {mobileStep === 'MENU' && (
                                <div className="p-6 space-y-4 animate-fadeIn">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Lidos</p>
                                            <p className="text-xl font-black text-slate-800">{activeSession?.totalAssetsScanned}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">A Meta</p>
                                            <p className="text-xl font-black text-slate-800">{activeSession?.totalAssetsExpected}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setMobileStep('SCAN')}
                                        className="w-full h-48 bg-white border-2 border-dashed border-gov-300 rounded-3xl flex flex-col items-center justify-center gap-4 group active:scale-95 transition-all shadow-sm"
                                    >
                                        <div className="p-5 bg-gov-50 rounded-full text-gov-600 group-hover:bg-gov-600 group-hover:text-white transition-all">
                                            <QrCode size={48} />
                                        </div>
                                        <span className="text-[10px] font-black text-gov-800 uppercase tracking-widest">Iniciar Nova Leitura</span>
                                    </button>

                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Histórico Local</p>
                                        {[1, 2].map(i => (
                                            <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><CheckCircle size={16} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-800">PAT-00{i + 4}</p>
                                                        <p className="text-[8px] text-slate-400 font-bold uppercase">Sincronizado</p>
                                                    </div>
                                                </div>
                                                <Badge color="green" className="text-[8px] px-1.5 py-0.5 font-bold">OK</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mobileStep === 'SCAN' && (
                                <div className="absolute inset-0 bg-black animate-fadeIn flex flex-col items-center justify-center p-8">
                                    <div className="relative w-full aspect-square border-2 border-white/20 rounded-3xl overflow-hidden">
                                        {isSyncing ? (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white gap-4">
                                                <RefreshCw className="animate-spin text-gov-500" size={48} />
                                                <p className="text-xs font-black uppercase tracking-widest">Processando Imagem...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden rounded-2xl">
                                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                                    <div className="absolute inset-4 border-2 border-gov-500 rounded-2xl shadow-[0_0_0_1000px_rgba(0,0,0,0.5)] z-10 pointer-events-none">
                                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gov-500 shadow-[0_0_20px_#0ea5e9] animate-bounce"></div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-12 flex gap-4 w-full">
                                        <Button variant="danger" onClick={() => setMobileStep('MENU')} className="flex-1 h-14 rounded-2xl uppercase font-black text-[10px] tracking-widest bg-white/10 border-white/20 text-white">Sair</Button>
                                        <Button onClick={handleSimulateScan} className="flex-[2] h-14 rounded-2xl bg-gov-500 hover:bg-gov-400 text-slate-900 uppercase font-black text-[10px] tracking-widest border-none shadow-2xl">Simular Captura</Button>
                                    </div>
                                </div>
                            )}

                            {mobileStep === 'RESULT' && lastScanned && (
                                <div className="p-6 space-y-6 animate-slideUp">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                                            <CheckCircle2 size={48} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Leitura Efetuada</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sincronizado em tempo real</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Descrição do Ativo</p>
                                            <p className="text-sm font-black text-slate-800 uppercase leading-tight">{lastScanned.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Patrimônio</p>
                                                <p className="text-xs font-mono font-bold text-gov-600">{lastScanned.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                                                <Badge color="green" className="text-[8px] font-black">{lastScanned.state}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gov-50 rounded-2xl border border-gov-100">
                                        <p className="text-[10px] font-bold text-gov-700 italic">"Localização validada via Geofencing (Solidão/PB)"</p>
                                    </div>

                                    <Button onClick={() => setMobileStep('SCAN')} className="w-full h-16 bg-gov-900 rounded-2xl uppercase font-black text-[11px] tracking-[0.2em] shadow-xl text-white">Continuar Coleta</Button>
                                    <button onClick={() => setMobileStep('MENU')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Finalizar Turno</button>
                                </div>
                            )}

                        </div>

                        {/* HOME INDICATOR */}
                        <div className="h-10 w-full bg-white flex justify-center items-center">
                            <div className="w-32 h-1.5 bg-slate-200 rounded-full"></div>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('DESKTOP')} className="mt-8 bg-white border-slate-200 rounded-2xl h-12 px-8 uppercase font-black text-[10px] tracking-widest">Encerrar Coleta Mestra</Button>
                </div>
            )}

            {/* MODAL: MANUAL DO COLETOR */}
            <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Manual do Operador - Coleta Mobile" size="lg">
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex gap-6 items-start">
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-gov-600"><BookOpen size={32} /></div>
                        <div>
                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Base de Conhecimento</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                Documentação técnica atualizada conforme Instrução Normativa nº 03/2024.
                            </p>
                            <div className="flex gap-2 mt-3">
                                <Badge color="blue" className="text-[9px]">v2.4.1 (Stable)</Badge>
                                <Badge color="green" className="text-[9px]">Atualizado: Hoje</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group">
                            <h5 className="font-black text-slate-700 uppercase text-xs mb-2 group-hover:text-gov-600">1. Configuração Inicial</h5>
                            <p className="text-[10px] text-slate-400">Pairing de dispositivos e calibração de câmera.</p>
                        </div>
                        <div className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group">
                            <h5 className="font-black text-slate-700 uppercase text-xs mb-2 group-hover:text-gov-600">2. Leitura de Etiquetas</h5>
                            <p className="text-[10px] text-slate-400">Melhores práticas para QR Code e Código de Barras.</p>
                        </div>
                        <div className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group">
                            <h5 className="font-black text-slate-700 uppercase text-xs mb-2 group-hover:text-gov-600">3. Divergências</h5>
                            <p className="text-[10px] text-slate-400">Como classificar itens não encontrados ou sobrantes.</p>
                        </div>
                        <div className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group">
                            <h5 className="font-black text-slate-700 uppercase text-xs mb-2 group-hover:text-gov-600">4. Sincronização Off-line</h5>
                            <p className="text-[10px] text-slate-400">Upload de dados em áreas sem cobertura.</p>
                        </div>
                    </div>

                    <Button onClick={() => { alert("Download iniciado..."); setIsManualModalOpen(false); }} fullWidth className="h-14 bg-gov-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">
                        <Download size={16} className="mr-2" /> Baixar PDF Completo (15MB)
                    </Button>
                </div>
            </Modal>

            {/* MODAL: TREINAMENTO EQUIPE */}
            <Modal isOpen={isTrainingModalOpen} onClose={() => setIsTrainingModalOpen(false)} title="Capacitação Contínua - Equipe de Campo" size="lg">
                <div className="space-y-6">
                    <div className="aspect-video bg-slate-900 rounded-[2rem] flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"></div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-2 border-white/50 z-10 group-hover:scale-110 transition-transform">
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                        </div>
                        <p className="absolute bottom-6 left-6 text-white font-black uppercase tracking-widest text-xs z-10">Aula 01: Introdução ao S.G Mobile</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">Módulos Obrigatórios</h4>
                        {[
                            { title: 'Fundamentos da Auditoria Física', duration: '15 min', completed: true },
                            { title: 'Operação do Coletor de Dados', duration: '45 min', completed: false },
                            { title: 'Resolução de Conflitos Patrimoniais', duration: '30 min', completed: false }
                        ].map((mod, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${mod.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {mod.completed ? <CheckCircle size={14} /> : i + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 uppercase">{mod.title}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{mod.duration}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant={mod.completed ? 'ghost' : 'primary'} className="rounded-lg text-[9px] font-black uppercase h-8 px-4">
                                    {mod.completed ? 'Revisar' : 'Iniciar'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* MODAL: NOVA SESSÃO DE AUDITORIA */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={creationMode === 'SESSION' ? "Nova Auditoria de Campo" : "Planejamento Estratégico de Ciclo"} size="lg">
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-3xl text-white flex gap-4 shadow-xl">
                        <ShieldCheck className="text-gov-400 flex-shrink-0" size={32} />
                        <p className="text-[11px] font-bold uppercase leading-relaxed text-slate-300">
                            Atenção: A abertura de uma sessão de inventário gera uma trilha de auditoria irreversível. Defina os setores com precisão para evitar divergências falsas.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <Input label="Título da Missão / Sessão" placeholder="Ex: Inventário Geral - Exercício 2024" value={newSession.name} onChange={e => setNewSession({ ...newSession, name: e.target.value })} />

                        {creationMode === 'SESSION' ? (
                            <>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest px-1">Unidades Geográficas Selecionadas</label>
                                    <Input
                                        placeholder="Filtrar locais..."
                                        value={locationSearch}
                                        onChange={e => setLocationSearch(e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 custom-scroll">
                                        {locations
                                            .filter(l => l.name.toLowerCase().includes(locationSearch.toLowerCase()))
                                            .slice(0, 100)
                                            .map((loc: Location) => (
                                                <label key={loc.id} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${newSession.locationIds.includes(loc.id) ? 'bg-gov-500 border-gov-500 text-gov-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'}`}>
                                                    <input type="checkbox" className="sr-only" checked={newSession.locationIds.includes(loc.id)} onChange={() => {
                                                        const ids = newSession.locationIds.includes(loc.id) ? newSession.locationIds.filter(id => id !== loc.id) : [...newSession.locationIds, loc.id];
                                                        setNewSession({ ...newSession, locationIds: ids });
                                                    }} />
                                                    <MapPin size={18} className={newSession.locationIds.includes(loc.id) ? 'text-gov-600' : 'text-slate-300'} />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{loc.name}</span>
                                                </label>
                                            ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Enquadramento Legal</label>
                                        <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black uppercase shadow-sm outline-none focus:ring-4 focus:ring-gov-500/20">
                                            <option>Inventário Periódico (A.6.3)</option>
                                            <option>Inventário Rotativo (A.6.4)</option>
                                            <option>Inventário Extraordinário (A.6.5)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Supervisor de Campo</label>
                                        <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black uppercase shadow-sm outline-none focus:ring-4 focus:ring-gov-500/20">
                                            <option>Gabriel Marques</option>
                                            <option>Controladoria Interna</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // CYCLE PLANNING FORM
                            <div className="space-y-4 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Data Início" type="date" value={newSession.startDate} onChange={e => setNewSession({ ...newSession, startDate: e.target.value })} />
                                    <Input label="Data Fim" type="date" value={newSession.endDate} onChange={e => setNewSession({ ...newSession, endDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nível de Risco Auditável</label>
                                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black uppercase shadow-sm outline-none focus:ring-4 focus:ring-gov-500/20" value={newSession.riskLevel} onChange={e => setNewSession({ ...newSession, riskLevel: e.target.value })}>
                                        <option value="BAIXO">Baixo Risco</option>
                                        <option value="MEDIO">Médio Risco</option>
                                        <option value="ALTO">Alto Risco</option>
                                        <option value="CRITICO">Risco Crítico</option>
                                    </select>
                                </div>
                                <Input label="Observações de Planejamento" placeholder="Ex: Priorizar bens de alto valor..." />
                            </div>
                        )}
                    </div>

                    <Button onClick={handleCreateSession} className="w-full bg-gov-900 h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl text-white mt-4 hover:scale-[1.02] active:scale-95 transition-all">
                        {creationMode === 'SESSION' ? 'Carregar Missão para Mobile' : 'Confirmar Planejamento de Ciclo'}
                    </Button>
                </div>
            </Modal>

            <style>{`
                @keyframes scaleUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-scaleUp { animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div >
    );
};