import React, { useMemo, useState } from 'react';
import { Card, Button, Badge, Modal } from '../components/Shared';
import { Asset, AssetState, User, MaintenanceStatus, Location } from '../types';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
    ComposedChart, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import {
    Package, CheckCircle, Wrench, DollarSign, Users,
    Zap, ShieldCheck, BarChart3, ShieldAlert, Activity,
    ArrowRight, Info, TrendingUp, Map, Scale, LineChart as LineIcon,
    ChartBar, ChartArea, ChartPie, Sparkles, LayoutGrid, Palette, Target,
    ClipboardList, Clock, TrendingDown, ArrowUpRight, FileText, Truck,
    ScanBarcode, Settings, Gavel, Fingerprint, Shield, Cpu, HardDrive,
    Lock, Landmark, ArrowLeftRight, Archive, ShieldX, Database,
    Calculator, AlertCircle, FileCheck, Hammer, Timer
} from 'lucide-react';

interface DashboardProps {
    assets: Asset[];
    users?: User[];
    locations?: Location[];
    onNavigate: (tab: string) => void;
}

type KPIView = 'TOTAL' | 'OPERATIONAL' | 'MAINTENANCE' | 'FINANCIAL_GROSS' | 'FINANCIAL_NET' | 'OPERATORS' | 'SLA' | 'RISK' | null;
type ChartType = 'BAR' | 'AREA' | 'LINE' | 'PIE' | 'COMPOSED' | 'RADAR';
type ChartTheme = 'OCEAN' | 'VOLCANO' | 'FOREST' | 'CHARCOAL' | 'VIBRANT';

const CHART_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ assets, users = [], onNavigate }) => {
    const [activeKpi, setActiveKpi] = useState<KPIView>(null);
    const [explorerType, setExplorerType] = useState<ChartType>('BAR');
    const [chartTheme, setChartTheme] = useState<ChartTheme>('OCEAN');
    const [explorerSubject, setExplorerSubject] = useState<string>('category');

    const THEMES = {
        OCEAN: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'],
        VOLCANO: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
        FOREST: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
        CHARCOAL: ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
        VIBRANT: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9']
    };

    const currentColors = THEMES[chartTheme];

    // ... existing code ...
    const stats = useMemo(() => {
        const totalAcquisition = assets.reduce((acc, a) => acc + (a.accounting?.acquisitionValue || a.value || 0), 0);
        const totalDepreciated = assets.reduce((acc, a) => acc + (a.accounting?.accumulatedDepreciation || 0), 0);
        return {
            total: assets.length,
            active: assets.filter(a => a.state !== AssetState.DISPOSED).length,
            maintenance: assets.filter(a => a.maintenanceHistory?.some(m => m.status !== MaintenanceStatus.FINISHED)).length,
            totalValue: totalAcquisition,
            netValue: totalAcquisition - totalDepreciated
        };
    }, [assets]);
    // ... existing code ...

    const explorerData = useMemo(() => {
        const groups: Record<string, any> = {};
        assets.forEach(a => {
            let key = '';
            if (explorerSubject === 'category') key = a.category;
            else if (explorerSubject === 'state') key = a.state;
            else if (explorerSubject === 'locationId') key = a.locationId || 'NÃO DEF.';
            else if (explorerSubject === 'responsibleId') key = users.find(u => u.id === a.responsibleId)?.name || 'PENDENTE';
            else if (explorerSubject === 'year') key = new Date(a.purchaseDate).getFullYear().toString();

            if (!groups[key]) groups[key] = { name: key, count: 0, value: 0 };
            groups[key].count += 1;
            groups[key].value += (a.accounting?.acquisitionValue || a.value || 0);
        });
        return Object.values(groups).sort((a, b) => b.count - a.count);
    }, [assets, explorerSubject, users]);

    const kpis = [
        { id: 'TOTAL', label: 'Ativos Totais', val: stats.total, sub: 'Registrados', color: 'blue', icon: <Package size={12} />, meta: 'Audit: --', progress: stats.total > 0 ? 100 : 0, link: 'assets' },
        { id: 'OPERATIONAL', label: 'Operacionais', val: stats.active, sub: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%', color: 'emerald', icon: <CheckCircle size={12} />, meta: 'Status: OK', progress: stats.total > 0 ? (stats.active / stats.total) * 100 : 0, link: 'status_overview' },
        { id: 'MAINTENANCE', label: 'Manutenção', val: stats.maintenance, sub: '0 Crítico', color: 'red', icon: <Wrench size={12} />, meta: 'Fila: Vazia', progress: stats.total > 0 ? (stats.maintenance / stats.total) * 100 : 0, link: 'maintenance_orders' },
        { id: 'FINANCIAL_GROSS', label: 'Vlr. Bruto', val: stats.totalValue >= 1000 ? `R$ ${(stats.totalValue / 1000).toFixed(0)}k` : `R$ ${stats.totalValue}`, sub: 'Contábil', color: 'indigo', icon: <DollarSign size={12} />, meta: 'Consolidado', progress: stats.totalValue > 0 ? 100 : 0, link: 'reports' },
        { id: 'FINANCIAL_NET', label: 'Vlr. Líquido', val: stats.netValue >= 1000 ? `R$ ${(stats.netValue / 1000).toFixed(0)}k` : `R$ ${stats.netValue}`, sub: 'Líquido', color: 'purple', icon: <ShieldCheck size={12} />, meta: 'Depr: 0%', progress: stats.totalValue > 0 ? (stats.netValue / stats.totalValue) * 100 : 0, link: 'reports' },
        { id: 'OPERATORS', label: 'Operadores', val: users.length, sub: 'Cadastrados', color: 'slate', icon: <Users size={12} />, meta: 'Sessão: --', progress: 100, link: 'responsible_list' },
        { id: 'SLA', label: 'SLA Atendimento', val: '--', sub: 'Sem dados', color: 'emerald', icon: <Target size={12} />, meta: 'Meta: 95%', progress: 0, link: 'reports' },
        { id: 'RISK', label: 'Score de Risco', val: '0%', sub: 'Baixo', color: 'rose', icon: <ShieldAlert size={12} />, meta: 'Seguro', progress: 0, link: 'audit' }
    ];

    const renderKpiDetails = () => {
        switch (activeKpi) {
            case 'TOTAL':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-center gap-6 relative overflow-hidden">
                            <Package className="absolute -right-4 -bottom-4 text-blue-100" size={140} />
                            <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl z-10"><Database size={32} /></div>
                            <div className="z-10">
                                <h4 className="font-black text-blue-900 uppercase text-lg tracking-tight">Inventário Consolidado</h4>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">Conformidade NBC TSP 07 & MCASP</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Crescimento 30d</p>
                                <p className="text-2xl font-black text-slate-300">--</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Audit</p>
                                <Badge color="gray">AGUARDANDO</Badge>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                            <p className="text-[10px] text-gov-400 font-black uppercase tracking-[0.3em] mb-6">Composição por Categoria</p>
                            <div className="space-y-4">
                                {explorerData.slice(0, 4).map((d, i) => (
                                    <div key={d.name} className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span className="text-xs font-bold uppercase">{d.name}</span>
                                        <span className="text-xs font-black text-gov-400">{d.count} un.</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'OPERATIONAL':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center py-12 bg-emerald-50 rounded-[3rem] border border-emerald-100 relative overflow-hidden">
                            <Activity className="absolute -top-6 -left-6 text-emerald-100" size={160} />
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.6em] relative z-10 mb-2">Disponibilidade de Ativos</p>
                            <p className="text-8xl font-black text-emerald-700 relative z-10 tracking-tighter">
                                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}<span className="text-4xl">%</span>
                            </p>
                        </div>
                        <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
                            <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase">Em plena operação</span><Badge color="green">{stats.active} Itens</Badge></div>
                            <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase">Inservíveis / Baixados</span><Badge color="gray">{stats.total - stats.active} Itens</Badge></div>
                        </div>
                    </div>
                );
            case 'MAINTENANCE':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-8 bg-red-50 rounded-[3rem] border border-red-100 flex items-center gap-6 relative">
                            <div className="p-6 bg-red-600 text-white rounded-[2rem] shadow-xl"><Hammer size={32} /></div>
                            <div>
                                <h4 className="text-xl font-black text-red-900 uppercase tracking-tighter leading-none">Fila de Reparo</h4>
                                <p className="text-xs text-red-600 font-bold uppercase tracking-widest mt-2">Manutenção Preventiva Ativa</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-4xl font-black text-red-600">{stats.maintenance}</p>
                                <p className="text-[9px] font-black text-red-400 uppercase">Ordens</p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center py-12">
                            <Clock className="mx-auto mb-3 text-slate-300" size={40} />
                            <p className="text-xs font-bold text-slate-400 uppercase">Nenhum Ativo com Criticidade de Nível 1 detectado.</p>
                        </div>
                    </div>
                );
            case 'FINANCIAL_GROSS':
            case 'FINANCIAL_NET':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-10"><Calculator size={180} /></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Balanço Patrimonial</p>
                                <h3 className="text-5xl font-black tracking-tighter leading-none">R$ {activeKpi === 'FINANCIAL_GROSS' ? stats.totalValue.toLocaleString() : stats.netValue.toLocaleString()}</h3>
                                <div className="mt-10 grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Depreciação Acum.</p>
                                        <p className="text-xs font-bold text-red-400">R$ {(stats.totalValue - stats.netValue).toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Status MCASP</p>
                                        <p className="text-xs font-bold text-slate-400">Em Análise</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'OPERATORS':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="p-6 bg-slate-900 text-white rounded-[2.5rem] shadow-xl"><Users size={32} /></div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Acessos Ativos</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Monitoramento de Segurança</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {users.map(u => (
                                <div key={u.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gov-50 flex items-center justify-center font-black text-gov-600">{u.name[0]}</div>
                                        <div><p className="text-xs font-black text-slate-800 uppercase">{u.name}</p><p className="text-[9px] text-slate-400 font-bold uppercase">{u.department}</p></div>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'SLA':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-10 bg-emerald-900 rounded-[3.5rem] text-white text-center relative overflow-hidden">
                            <Target className="absolute -top-10 -right-10 opacity-10" size={200} />
                            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.6em] mb-4">Índice de Performance SLA</p>
                            <p className="text-8xl font-black tracking-tighter">0<span className="text-3xl">%</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">T.M Resposta</p>
                                <p className="text-xl font-black text-slate-800">--</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Resolução</p>
                                <p className="text-xl font-black text-slate-800">0%</p>
                            </div>
                        </div>
                    </div>
                );
            case 'RISK':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-8 bg-rose-50 rounded-[3rem] border border-rose-100 flex items-center gap-8 shadow-sm">
                            <div className="p-6 bg-rose-500 text-white rounded-[2.5rem] shadow-xl"><ShieldAlert size={32} /></div>
                            <div>
                                <h4 className="text-2xl font-black text-rose-900 uppercase tracking-tighter leading-none">Matriz de Risco</h4>
                                <p className="text-xs text-rose-600 font-bold uppercase tracking-widest mt-2">Nível de Exposição: <span className="font-black">CALCULANDO</span></p>
                            </div>
                            <div className="ml-auto"><p className="text-4xl font-black text-rose-600">0.0%</p></div>
                        </div>
                        <div className="space-y-2">
                            {['Risco de Furto/Extravio', 'Dano por Obsolescência', 'Inconsistência Contábil'].map(r => (
                                <div key={r} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center"><span className="text-xs font-bold text-slate-700 uppercase">{r}</span><Badge color="green">BAIXO</Badge></div>
                            ))}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-4 pb-12 animate-fadeIn">

            {/* GRID DE KPIs INTERATIVOS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {kpis.map((kpi) => (
                    <button
                        key={kpi.id}
                        onClick={() => setActiveKpi(kpi.id as KPIView)}
                        className="group p-4 bg-white border border-slate-100 rounded-[2.2rem] hover:border-gov-500 hover:shadow-2xl transition-all text-left relative overflow-hidden active:scale-95 cursor-pointer"
                    >
                        <div className={`flex items-center justify-between mb-2 text-${kpi.color}-600`}>
                            <div className={`p-2 bg-${kpi.color}-50 rounded-xl`}>{kpi.icon}</div>
                            <span className="text-[9px] font-black text-emerald-500 flex items-center gap-0.5">{kpi.sub} <ArrowUpRight size={8} /></span>
                        </div>
                        <div className="text-base font-black text-slate-900 leading-tight truncate">{kpi.val}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1 truncate">{kpi.label}</div>
                        <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-${kpi.color}-500 transition-all duration-1000`} style={{ width: `${(kpi as any).progress}%` }}></div>
                        </div>
                        <div className="text-[7px] font-black text-slate-300 uppercase mt-2 text-right tracking-widest">{kpi.meta}</div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                {/* LABORATÓRIO ANALÍTICO */}
                <div className="xl:col-span-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-6 relative h-full">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg"><BarChart3 size={20} /></div>
                                <div className="flex gap-2 border-l border-slate-100 pl-4">
                                    {(['OCEAN', 'VOLCANO', 'FOREST', 'CHARCOAL'] as ChartTheme[]).map(t => (
                                        <button key={t} onClick={() => setChartTheme(t)} className={`w-4 h-4 rounded-full border border-white shadow-sm transition-transform hover:scale-125 ${chartTheme === t ? 'ring-4 ring-gov-500/20' : ''}`} style={{ backgroundColor: THEMES[t][0] }}></button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <div className="flex gap-1 border-r border-slate-200 pr-2">
                                    <button onClick={() => setExplorerType('BAR')} className={`p-2.5 rounded-xl ${explorerType === 'BAR' ? 'bg-white text-gov-900 shadow-sm' : 'text-slate-400'}`}><ChartBar size={14} /></button>
                                    <button onClick={() => setExplorerType('LINE')} className={`p-2.5 rounded-xl ${explorerType === 'LINE' ? 'bg-white text-gov-900 shadow-sm' : 'text-slate-400'}`}><LineIcon size={14} /></button>
                                    <button onClick={() => setExplorerType('PIE')} className={`p-2.5 rounded-xl ${explorerType === 'PIE' ? 'bg-white text-gov-900 shadow-sm' : 'text-slate-400'}`}><ChartPie size={14} /></button>
                                </div>
                                <select className="bg-transparent border-none text-[9px] font-black uppercase text-slate-600 outline-none cursor-pointer px-4" value={explorerSubject} onChange={e => setExplorerSubject(e.target.value)}>
                                    <option value="category">Categorias</option>
                                    <option value="state">Estados</option>
                                    <option value="locationId">Setores</option>
                                    <option value="responsibleId">Responsáveis</option>
                                </select>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {explorerType === 'BAR' ? (
                                    <BarChart data={explorerData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={8} fontWeight="bold" axisLine={false} tickLine={false} />
                                        <YAxis fontSize={8} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                            {explorerData.map((_, i) => <Cell key={i} fill={currentColors[i % currentColors.length]} />)}
                                        </Bar>
                                    </BarChart>
                                ) : explorerType === 'LINE' ? (
                                    <LineChart data={explorerData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={8} fontWeight="bold" />
                                        <YAxis fontSize={8} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="count" stroke={currentColors[0]} strokeWidth={4} dot={{ r: 6, fill: currentColors[0], stroke: '#fff', strokeWidth: 3 }} />
                                    </LineChart>
                                ) : (
                                    <PieChart>
                                        <Pie data={explorerData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count">
                                            {explorerData.map((_, i) => <Cell key={i} fill={currentColors[i % currentColors.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', paddingBottom: '20px' }} />
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* COMANDO CORE */}
                <div className="xl:col-span-4">
                    <div className="bg-slate-900 rounded-[3rem] p-6 text-white shadow-2xl h-full flex flex-col border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Cpu size={140} /></div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gov-500">Comando Core</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>Live</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 flex-1 relative z-10 overflow-y-auto custom-scroll pr-1">
                            {[
                                { id: 'assets', label: 'Cadastro', icon: <Package size={16} /> },
                                { id: 'inventory', label: 'Inventário', icon: <ClipboardList size={16} /> },
                                { id: 'suppliers_costs', label: 'Custos', icon: <DollarSign size={16} /> },
                                { id: 'asset_maintenance', label: 'Manutenção', icon: <Wrench size={16} /> },
                                { id: 'vehicles', label: 'Frota/GPS', icon: <Truck size={16} /> },
                                { id: 'documents', label: 'GED/Ofícios', icon: <FileText size={16} /> },
                                { id: 'audit', label: 'Auditoria', icon: <Shield size={16} /> },
                                { id: 'settings', label: 'Segurança', icon: <Fingerprint size={16} /> }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className="group/btn flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-gov-600/30 rounded-[1.8rem] border border-white/5 hover:border-gov-500/50 transition-all duration-300 active:scale-95"
                                >
                                    <div className="p-3 bg-white/5 rounded-2xl mb-2.5 group-hover/btn:scale-110 group-hover/btn:bg-gov-500 transition-all shadow-inner">
                                        {item.icon}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/btn:text-white">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DIAGNÓSTICO FULL-SCREEN */}
            <Modal isOpen={activeKpi !== null} onClose={() => setActiveKpi(null)} title="Diagnóstico de Indicador" size="md">
                {renderKpiDetails()}
                <div className="mt-10 pt-6 border-t border-slate-100">
                    <Button onClick={() => {
                        const link = kpis.find(k => k.id === activeKpi)?.link;
                        if (link) onNavigate(link);
                        setActiveKpi(null);
                    }} fullWidth className="h-16 bg-gov-900 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl">
                        Acessar Fonte de Dados <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </Modal>
        </div>
    );
};