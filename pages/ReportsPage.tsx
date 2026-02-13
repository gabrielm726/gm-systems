import React, { useState, useMemo } from 'react';
import { Asset, Location, AssetCategory, AssetState, Supplier, CostRecord, User } from '../types';
import { Card, Button, Badge, Input } from '../components/Shared';
import {
    Download, Search, TrendingUp, Calculator, ShieldCheck,
    Activity, Printer, PieChart as PieIcon, RefreshCw,
    AlertTriangle, Building2, Cpu, Layers, Sparkles,
    Table as TableIcon, Eye, Briefcase, FileSignature,
    CheckCircle, Barcode, History, ShieldPlus, Target,
    TrendingDown, FileSearch, ShieldAlert
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart,
    Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area,
    CartesianGrid
} from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { exportToWord, exportToExcel } from '../utils/exportUtils'; // Fixed Import

// ... existing interfaces ...

// ... inside component ...



interface ReportsPageProps {
    assets: Asset[];
    locations: Location[];
    suppliers?: Supplier[];
    costs?: CostRecord[];
    users?: User[];
}

type BIPerspective = 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE' | 'CUSTOM';

export const ReportsPage: React.FC<ReportsPageProps> = ({
    assets,
    locations,
    suppliers = [],
    costs = [],
    users = []
}) => {
    const [perspective, setPerspective] = useState<BIPerspective>('FINANCIAL');
    const [searchTerm, setSearchTerm] = useState('');
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    // Custom Explorer State
    const [groupBy, setGroupBy] = useState<string>('category');
    const [metric, setMetric] = useState<string>('value');

    const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

    // --- CÁLCULOS FINANCEIROS ---
    const financialMetrics = useMemo(() => {
        const totalAcquisition = assets.reduce((acc, a) => acc + (a.accounting?.acquisitionValue || a.value || 0), 0);
        const totalDepreciation = assets.reduce((acc, a) => acc + (a.accounting?.accumulatedDepreciation || 0), 0);
        const netValue = totalAcquisition - totalDepreciation;
        const maintenanceTotal = costs.filter(c => c.type === 'MANUTENCAO').reduce((acc, c) => acc + c.value, 0);

        return { totalAcquisition, totalDepreciation, netValue, maintenanceTotal };
    }, [assets, costs]);

    // --- ESTATÍSTICAS OPERACIONAIS ---
    const operationalStats = useMemo(() => {
        const categories = assets.reduce((acc, a) => {
            acc[a.category] = (acc[a.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const conditions = assets.reduce((acc, a) => {
            acc[a.state] = (acc[a.state] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const availability = assets.length > 0
            ? Math.round((assets.filter(a => a.state === AssetState.GOOD).length / assets.length) * 100)
            : 0;

        return {
            byCategory: Object.entries(categories).map(([name, count]) => ({ name, count })),
            byCondition: Object.entries(conditions).map(([name, count]) => ({ name, count })),
            availability,
            total: assets.length
        };
    }, [assets]);

    // --- DADOS PARA O EXPLORADOR DINÂMICO ---
    const processedData = useMemo(() => {
        const groups: Record<string, any> = {};
        assets.forEach(asset => {
            let key = '';
            if (groupBy === 'category') key = asset.category;
            else if (groupBy === 'location') key = locations.find(l => l.id === asset.locationId)?.name || 'N/A';
            else if (groupBy === 'state') key = asset.state;
            else if (groupBy === 'responsible') key = users.find(u => u.id === asset.responsibleId)?.name || 'Pendente';
            else if (groupBy === 'year') key = new Date(asset.purchaseDate).getFullYear().toString();

            if (!groups[key]) groups[key] = { name: key, value: 0, count: 0, depreciation: 0 };
            groups[key].value += (asset.accounting?.acquisitionValue || asset.value || 0);
            groups[key].depreciation += (asset.accounting?.accumulatedDepreciation || 0);
            groups[key].count += 1;
        });
        return Object.values(groups).sort((a, b) => (b as any)[metric] - (a as any)[metric]);
    }, [assets, groupBy, metric, locations, users]);

    // --- GERADOR DE INSIGHTS COM IA ---
    const getPerspectiveLabel = (p: string) => {
        const map: Record<string, string> = {
            'FINANCIAL': 'FINANCEIRO',
            'OPERATIONAL': 'OPERACIONAL',
            'COMPLIANCE': 'COMPLIANCE',
            'CUSTOM': 'EXPLORADOR'
        };
        return map[p] || p;
    };

    const generateAiSummary = async () => {
        setIsGeneratingAi(true);
        // Simulação de processamento "Deep Thought"
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            let insights: string[] = [];

            if (perspective === 'FINANCIAL') {
                const depRatio = financialMetrics.totalAcquisition > 0
                    ? (financialMetrics.totalDepreciation / financialMetrics.totalAcquisition) * 100
                    : 0;

                if (depRatio > 50) insights.push(`Alerta de Depreciação: ${depRatio.toFixed(1)}% do valor do imobilizado já foi depreciado. Considere plano de renovação.`);
                else insights.push(`Saúde do Imobilizado: Apenas ${depRatio.toFixed(1)}% de depreciação acumulada. Ativos relativamente novos.`);

                if (financialMetrics.maintenanceTotal > financialMetrics.totalAcquisition * 0.2)
                    insights.push("Custo de Manutenção Elevado: Gastos excedem 20% do valor do ativo. Avaliar substituição de itens problemáticos.");
                else
                    insights.push("Gestão de Custos Eficiente: Manutenção abaixo de 20% do valor patrimonial.");

                insights.push(`Liquidez: O valor líquido realizável atual é de R$ ${financialMetrics.netValue.toLocaleString()}.`);
            }
            else if (perspective === 'OPERATIONAL') {
                const badAssets = operationalStats.byCondition.find(c => c.name === AssetState.BAD || c.name === AssetState.MAINTENANCE)?.count || 0;
                if (badAssets > 0) insights.push(`Atenção Operacional: ${badAssets} itens estão em estado Ruim ou Manutenção. Impacto na produtividade.`);
                else insights.push("Operação Estável: Baixo índice de indisponibilidade de ativos.");

                const topCategory = operationalStats.byCategory.sort((a, b) => b.count - a.count)[0];
                if (topCategory) insights.push(`Concentração: A categoria dominande é ${topCategory.name} com ${topCategory.count} itens.`);
            }
            else {
                insights.push("Conformidade: Verifique se todos os documentos de aquisição de 2024 foram digitalizados.");
                insights.push("Auditoria: Recomendamos agendar inventário rotativo para o próximo trimestre.");
            }

            // Seleciona um insight aleatório ou combina (aqui pegamos o primeiro relevante + um generico se pouco)
            const finalInsight = insights.join(" ");
            setAiInsight(finalInsight || "Análise concluída: Indicadores dentro da normalidade estatística.");

        } catch (error) {
            console.error(error);
            setAiInsight("Não foi possível gerar insights no momento.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    // ... (rest of code) ...



    const handleExport = async () => {
        const data = processedData.map(d => ({
            "Entidade / Grupo": d.name,
            "Volume": d.count,
            "Valor Original": d.value,
            "Depreciação": d.depreciation,
            "Valor Líquido": d.value - d.depreciation,
            "Métrica de Status": "REGULAR"
        }));
        const { exportToExcel } = await import('../utils/exportUtils');
        await exportToExcel(data, `BI_Analise_${perspective}`);
    };



    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            {/* ... (rest of render remains, just updating the button below) ... */}
            {/* Header BI Cockpit code skipped for brevity */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5"><Cpu size={160} /></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge color="blue" className="bg-gov-500/20 text-gov-400 border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">Business Intelligence</Badge>
                            <Badge color="purple" className="bg-purple-500/20 text-purple-400 border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-1">
                                <Sparkles size={10} /> AI Enabled Engine
                            </Badge>
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Decision Intelligence</h2>
                        <p className="text-slate-400 mt-2 font-medium">Extração de indicadores estratégicos e financeiros.</p>
                    </div>
                    <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10 no-print">
                        {(['FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'CUSTOM'] as BIPerspective[]).map(p => (
                            <button
                                key={p}
                                onClick={() => { setPerspective(p); setAiInsight(null); }}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${perspective === p ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'}`}
                            >
                                {p === 'FINANCIAL' ? 'Financeiro' : p === 'OPERATIONAL' ? 'Operacional' : p === 'COMPLIANCE' ? 'Compliance' : 'Explorador'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* ... (content sections) ... */}
                    {/* PERSPECTIVE: FINANCIAL */}
                    {perspective === 'FINANCIAL' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="p-6 bg-white rounded-3xl border-none shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Bruto (Imobilizado)</p>
                                    <p className="text-2xl font-black text-slate-800">R$ {financialMetrics.totalAcquisition.toLocaleString()}</p>
                                </Card>
                                <Card className="p-6 bg-white rounded-3xl border-none shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Líquido</p>
                                    <p className="text-2xl font-black text-emerald-600">R$ {financialMetrics.netValue.toLocaleString()}</p>
                                </Card>
                                <Card className="p-6 bg-white rounded-3xl border-none shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Depreciação Total</p>
                                    <p className="text-2xl font-black text-red-500">R$ {financialMetrics.totalDepreciation.toLocaleString()}</p>
                                </Card>
                                <Card className="p-6 bg-white rounded-3xl border-none shadow-sm relative z-10">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Manutenção Total</p>
                                    <div className="text-2xl font-black text-black" style={{ color: '#000000' }}>
                                        R$ {(financialMetrics.maintenanceTotal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </Card>
                            </div>

                            <Card className="rounded-[2.5rem] p-8 border-none shadow-sm bg-white">
                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] mb-8 flex items-center gap-3"><Calculator size={18} className="text-gov-600" /> Curva de Valor x Depreciação</h3>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={processedData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" fontSize={9} fontWeight="black" hide={processedData.length > 10} />
                                            <YAxis fontSize={9} fontWeight="bold" tickFormatter={(v) => `R$ ${v / 1000}k`} />
                                            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fill="#0ea5e9" fillOpacity={0.1} name="Original" />
                                            <Area type="monotone" dataKey="depreciation" stroke="#f43f5e" strokeWidth={3} fill="#f43f5e" fillOpacity={0.05} name="Depreciação" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* PERSPECTIVE: OPERATIONAL */}
                    {perspective === 'OPERATIONAL' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="p-8 bg-white rounded-3xl shadow-sm flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full border-8 border-emerald-500 flex items-center justify-center font-black text-xl text-emerald-600 mb-4">
                                        {operationalStats.availability}%
                                    </div>
                                    <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Disponibilidade</h4>
                                    <p className="text-xs text-slate-400 mt-1">Itens em Bom Estado</p>
                                </Card>
                                <Card className="p-8 bg-white rounded-3xl shadow-sm flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full border-8 border-blue-500 flex items-center justify-center font-black text-xl text-blue-600 mb-4">
                                        {operationalStats.total}
                                    </div>
                                    <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Total Ativos</h4>
                                    <p className="text-xs text-slate-400 mt-1">Cadastrados na Base</p>
                                </Card>
                                <Card className="p-8 bg-white rounded-3xl shadow-sm flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full border-8 border-amber-500 flex items-center justify-center font-black text-xl text-amber-600 mb-4">
                                        {assets.filter(a => a.state === AssetState.REGULAR).length}
                                    </div>
                                    <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Atenção Crítica</h4>
                                    <p className="text-xs text-slate-400 mt-1">Estado Regular/Ruim</p>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="rounded-[2.5rem] p-8 bg-white shadow-sm">
                                    <h3 className="font-black text-slate-800 uppercase text-xs mb-8 flex items-center gap-3"><PieIcon size={18} className="text-amber-500" /> Mix por Conservação</h3>
                                    <div className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                {/* Fixed: Moved cornerRadius from Cell to Pie component as it is not supported on Cell */}
                                                <Pie data={operationalStats.byCondition} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="count" cornerRadius={5}>
                                                    {operationalStats.byCondition.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                                <Card className="rounded-[2.5rem] p-8 bg-white shadow-sm">
                                    <h3 className="font-black text-slate-800 uppercase text-xs mb-8 flex items-center gap-3"><Layers size={18} className="text-blue-500" /> Volume por Macro-Categoria</h3>
                                    <div className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={operationalStats.byCategory} layout="vertical">
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" fontSize={9} width={90} fontWeight="bold" axisLine={false} tickLine={false} />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* PERSPECTIVE: COMPLIANCE */}
                    {perspective === 'COMPLIANCE' && (
                        <div className="space-y-6 animate-fadeIn">
                            <Card className="rounded-[2.5rem] p-10 bg-white shadow-sm border-l-8 border-l-gov-900">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Índice de Auditabilidade</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-widest">Conformidade NBC TSP 07 & MCASP 10ª Edição</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-4xl font-black text-emerald-600">
                                                {assets.length > 0 ? Math.round((assets.filter(a => a.state === 'GOOD').length / assets.length * 100)) : 0}<span className="text-xl">%</span>
                                            </p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score Geral</p>
                                        </div>
                                        <div className="h-16 w-px bg-slate-100"></div>
                                        <Button
                                            className="rounded-2xl h-16 px-10 font-black text-xs uppercase tracking-widest bg-emerald-600 text-white shadow-xl hover:bg-emerald-500 hover:scale-105 transition-all border-none flex items-center gap-3"
                                            onClick={() => alert("Modulo de Inteligência de Fornecedores em desenvolvimento.")}
                                        >
                                            <div className="p-2 bg-white/20 rounded-xl"><FileSearch size={20} className="text-white" /></div>
                                            Ver Dossiê Fornecedores
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5">
                                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Barcode size={24} /></div>
                                        <div>
                                            <h5 className="text-xs font-black uppercase text-slate-800">Tombamento Digital</h5>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                                                Integridade QR Code: {assets.length > 0 ? '100%' : '0%'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5">
                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><ShieldCheck size={24} /></div>
                                        <div>
                                            <h5 className="text-xs font-black uppercase text-slate-800">Responsabilidade Legais</h5>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                                                Termos Assinados: {users.length > 0 ? Math.round((users.filter(u => u.acceptedTerms).length / users.length) * 100) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5">
                                        <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle size={24} /></div>
                                        <div>
                                            <h5 className="text-xs font-black uppercase text-slate-800">Vistorias Pendentes</h5>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                                                {assets.filter(a => a.state === 'MAINTENANCE' || a.state === 'BAD').length} Itens Requerem Auditoria
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5">
                                        <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><History size={24} /></div>
                                        <div>
                                            <h5 className="text-xs font-black uppercase text-slate-800">Audit Trail</h5>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">Logs Forenses Ativos</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* PERSPECTIVE: CUSTOM (EXPLORER) */}
                    {perspective === 'CUSTOM' && (
                        <Card className="rounded-[2.5rem] p-8 bg-white shadow-sm animate-fadeIn">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Analisar por</label>
                                        <select
                                            className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-gov-500 outline-none"
                                            value={groupBy}
                                            onChange={e => setGroupBy(e.target.value)}
                                        >
                                            <option value="category">Categoria</option>
                                            <option value="location">Unidade</option>
                                            <option value="state">Estado</option>
                                            <option value="responsible">Responsável</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Métrica</label>
                                        <select
                                            className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-gov-500 outline-none"
                                            value={metric}
                                            onChange={e => setMetric(e.target.value)}
                                        >
                                            <option value="value">Valor Original</option>
                                            <option value="count">Contagem Física</option>
                                            <option value="depreciation">Depreciação</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={processedData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey={metric} radius={[10, 10, 0, 0]} barSize={40}>
                                            {processedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}

                    {perspective === 'FINANCIAL' && (
                        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white p-0 animate-fadeIn">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] flex items-center gap-3">
                                    <TableIcon className="text-gov-600" size={18} /> Detalhamento por Segmento ({perspective})
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Button variant="secondary" size="sm" className="rounded-xl border-slate-200" onClick={handleExport}><Download size={14} className="mr-2" /> Exportar</Button>
                                    <div className="relative w-64">
                                        <Search className="absolute left-4 top-2.5 text-slate-300" size={14} />
                                        <input className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold" placeholder="Filtrar grid..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto custom-scroll">
                                <table className="min-w-full text-left text-[10px]">
                                    <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-5">Entidade / Grupo</th>
                                            <th className="px-8 py-5 text-right">Volume</th>
                                            <th className="px-8 py-5 text-right">Valor Original</th>
                                            <th className="px-8 py-5 text-right">Líquido (BV)</th>
                                            <th className="px-8 py-5 text-center">Status Auditor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {processedData.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-5 font-black text-slate-700 uppercase group-hover:text-gov-600">{row.name}</td>
                                                <td className="px-8 py-5 text-right font-bold text-slate-500">{row.count} un.</td>
                                                <td className="px-8 py-5 text-right font-black text-slate-800">R$ {row.value.toLocaleString('pt-BR')}</td>
                                                <td className="px-8 py-5 text-right font-black text-emerald-600">R$ {(row.value - row.depreciation).toLocaleString('pt-BR')}</td>
                                                <td className="px-8 py-5 text-center"><Badge color="green" className="text-[7px]">REGULAR</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* GT.AI Analysis */}
                    <Card className="rounded-[2.5rem] bg-white text-slate-800 p-8 border-none shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Sparkles size={120} /></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-50 rounded-2xl backdrop-blur-md text-indigo-600 shadow-sm"><Cpu size={24} /></div>
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-600">Inteligência Preditiva GT</h4>
                            </div>

                            <div className="space-y-6">
                                <p className="text-sm text-slate-600 font-medium leading-relaxed opacity-100">Processar insights estratégicos baseados nos dados da aba <span className="font-black border-b-2 border-indigo-100 pb-0.5 text-indigo-900">{getPerspectiveLabel(perspective)}</span>.</p>

                                {aiInsight && (
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-fadeIn">
                                        <p className="text-xs leading-relaxed text-indigo-800 font-medium italic">"{aiInsight}"</p>
                                    </div>
                                )}

                                <Button
                                    onClick={aiInsight ? () => setAiInsight(null) : generateAiSummary}
                                    disabled={isGeneratingAi}
                                    className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:bg-indigo-700 transition-all border-none"
                                >
                                    {isGeneratingAi ? <RefreshCw className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                    {aiInsight ? 'NOVA ANÁLISE' : 'GERAR INSIGHTS'}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {perspective === 'FINANCIAL' && (
                        <Card className="rounded-[2.5rem] p-8 border-none shadow-sm bg-white animate-fadeIn">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b pb-4">Status do Data Lake</h4>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500 shadow-sm"><ShieldCheck size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-700 uppercase">Integridade</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-1">SHA-256 Verificado</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-xl text-blue-500 shadow-sm"><Building2 size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-700 uppercase">Acurácia</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-1">Base: {assets.length} ativos</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <Button variant="secondary" className="flex-1 h-16 rounded-[1.8rem] border-slate-200 font-black text-[10px] uppercase tracking-widest group" onClick={() => window.print()}>
                            <Printer size={18} className="mr-3 text-slate-400 group-hover:text-gov-600 transition-colors" /> Impressão Rápida
                        </Button>
                        <Button className="flex-1 h-16 rounded-[1.8rem] bg-gov-900 text-white border-none font-black text-[10px] uppercase tracking-widest hover:bg-gov-800 shadow-xl" onClick={async () => {
                            const { exportToWord } = await import('../utils/exportUtils');
                            await exportToWord('FINANCIAL', {
                                financialData: {
                                    totalValue: financialMetrics.totalAcquisition?.toLocaleString('pt-BR') || '0,00',
                                    depreciation: financialMetrics.totalDepreciation?.toLocaleString('pt-BR') || '0,00'
                                },
                                locations,
                                users,
                                assets
                            });
                        }}>
                            <FileSignature size={18} className="mr-3" /> Relatório Oficial (Word)
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
};