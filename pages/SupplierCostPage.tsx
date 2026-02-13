import React, { useState, useMemo } from 'react';
import { Supplier, CostRecord, EntityType, SupplierDocument } from '../types';
import { Card, Button, Input, Modal, Badge, ConfirmModal } from '../components/Shared';
import {
    Building2, Receipt, Plus, Search, Trash2, Eye,
    Calculator, ShieldCheck, TrendingUp, Upload,
    Download,
    Paperclip, Activity, DollarSign, Star, Briefcase,
    ShieldAlert, Sparkles, FileSpreadsheet, Send, Award,
    X, ListPlus, ShieldCheck as ShieldIcon, FileCheck, Landmark, Globe, Filter, ExternalLink,
    Calendar, ClipboardCheck, ArrowDownRight, Tag, BookOpen, FileSearch, CheckCircle, Mail,
    Zap, Gavel, FileCheck2, PieChart as PieIcon, LineChart, FileText, ChevronRight, BarChart3,
    AlertCircle, ShieldX, ListChecks, ArrowUpRight, Scale, RefreshCw, Layers, ShieldPlus,
    FileSignature, Landmark as GovIcon, CheckSquare, AlertTriangle, FileUp, TrendingDown,
    UserCheck, Barcode, History
} from 'lucide-react';
import {
    ResponsiveContainer, Radar, RadarChart, PolarGrid,
    PolarAngleAxis, Radar as RadarLine, Tooltip, Cell, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

interface SupplierCostPageProps {
    entityType?: EntityType;
    suppliers: Supplier[];
    costs: CostRecord[];
    onAddSupplier: (s: Supplier) => void;
    onAddCost: (c: CostRecord) => void;
    onDeleteSupplier: (id: string) => void;
    onAddDocument?: (d: any) => void;
    gedDocuments?: any;
}

export const SupplierCostPage: React.FC<SupplierCostPageProps> = ({
    suppliers, costs, onAddSupplier, onAddCost, onDeleteSupplier
}) => {
    const [activeTab, setActiveTab] = useState<'PARCEIROS' | 'PERFORMANCE' | 'FINANCEIRO' | 'COMPLIANCE'>('PARCEIROS');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isCostModalOpen, setIsCostModalOpen] = useState(false);
    const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);
    const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
    const [isLedgerConciliationModalOpen, setIsLedgerConciliationModalOpen] = useState(false);
    const [isDocumentAuditModalOpen, setIsDocumentAuditModalOpen] = useState(false);

    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [viewingDossier, setViewingDossier] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    // Form States
    const [newSupplier, setNewSupplier] = useState({
        name: '', taxId: '', email: '', category: 'EQUIPAMENTOS',
        phone: '', address: '', supplierType: 'AMBOS'
    });
    const [tempDocs, setTempDocs] = useState<Partial<SupplierDocument>[]>([]);
    const [newCost, setNewCost] = useState({
        description: '', value: 0, supplierId: '', status: 'A_PAGAR',
        costCenter: 'GERAL', dueDate: new Date().toISOString().split('T')[0],
        invoiceNumber: ''
    });

    const [rfqForm, setRfqForm] = useState({
        title: '',
        deadline: '',
        items: [{ desc: '', qty: 1 }],
        invitedSuppliers: [] as string[]
    });

    const handleAddTempDoc = () => {
        setTempDocs([...tempDocs, { id: Date.now().toString(), name: '', type: 'Certidão', uploadDate: new Date().toISOString() }]);
    };

    const handleConfirmSupplier = () => {
        if (!newSupplier.name || !newSupplier.taxId) return;
        onAddSupplier({
            id: `SUP-${Date.now()}`,
            name: newSupplier.name,
            contact: newSupplier.name, // Using name as contact for now
            cnpj: newSupplier.taxId,
            taxId: newSupplier.taxId,
            email: newSupplier.email,
            phone: newSupplier.phone,
            address: newSupplier.address,
            category: newSupplier.category,
            type: 'PJ',
            supplierType: newSupplier.supplierType as 'PRODUTO' | 'SERVICO' | 'AMBOS',
            authorizedSector: 'BOTH',
            status: 'ATIVO',
            complianceStatus: tempDocs.length > 0 ? 'REGULAR' : 'PENDENTE',
            additionalDocs: tempDocs as SupplierDocument[],
            metrics: { quality: 80, delivery: 90, price: 70, esg: 60, support: 85 }
        });
        setIsSupplierModalOpen(false);
        setNewSupplier({ name: '', taxId: '', email: '', category: 'EQUIPAMENTOS', phone: '', address: '', supplierType: 'AMBOS' });
        setTempDocs([]);
    };

    const handleConfirmCost = () => {
        if (!newCost.description || !newCost.value) {
            alert("Descrição e Valor são obrigatórios.");
            return;
        }
        onAddCost({
            id: `FIN-${Date.now()}`,
            description: newCost.description,
            value: Number(newCost.value),
            supplierId: newCost.supplierId,
            date: new Date().toISOString().split('T')[0],
            status: newCost.status === 'A_PAGAR' ? 'PENDENTE' : 'PAGO',
            type: 'DESPESA',
            costCenter: newCost.costCenter,
            dueDate: newCost.dueDate,
            invoiceNumber: newCost.invoiceNumber
        });
        setIsCostModalOpen(false);
        setNewCost({ description: '', value: 0, supplierId: '', status: 'A_PAGAR', costCenter: 'GERAL', dueDate: new Date().toISOString().split('T')[0], invoiceNumber: '' });
    };

    const performanceBenchmarkData = useMemo(() => {
        return suppliers.map(s => ({
            id: s.id,
            name: s.name,
            shortName: s.name.split(' ')[0],
            score: ((s.metrics?.quality || 0) + (s.metrics?.delivery || 0) + (s.metrics?.price || 0)) / 3,
            metrics: s.metrics
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }, [suppliers]);

    const totalLedger = costs.reduce((acc, c) => acc + c.value, 0);

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">

            {/* SUB-NAVEGAÇÃO MASTER PROFISSIONAL */}
            <div className="flex bg-white p-2.5 rounded-[3rem] shadow-lg border border-slate-100 overflow-x-auto custom-scroll no-print">
                {[
                    { id: 'PARCEIROS', label: 'Ecossistema de Parceiros', icon: <Globe size={16} /> },
                    { id: 'PERFORMANCE', label: 'Auditoria de Performance', icon: <Activity size={16} /> },
                    { id: 'FINANCEIRO', label: 'ERP Financeiro / Ledger', icon: <FileSpreadsheet size={16} /> },
                    { id: 'COMPLIANCE', label: 'Conformidade e Vetting', icon: <Gavel size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gov-900 text-white shadow-2xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* BARRA DE COMANDO TÉCNICA DINÂMICA */}
            <div className="bg-white p-6 rounded-[3rem] shadow-sm border flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        className="pl-16 pr-6 py-5 w-full bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-gov-500/10 outline-none transition-all"
                        placeholder="Filtrar base de fornecedores e títulos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    {activeTab === 'PARCEIROS' && (
                        <Button onClick={() => setIsSupplierModalOpen(true)} className="h-16 px-10 rounded-[1.8rem] bg-gov-900 text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            <Plus size={20} className="mr-2" /> Homologar Parceiro
                        </Button>
                    )}

                    {activeTab === 'PERFORMANCE' && (
                        <>
                            <Button onClick={() => setIsRankingModalOpen(true)} className="h-16 px-10 rounded-[1.8rem] bg-indigo-600 text-white text-[11px] shadow-2xl hover:scale-105 transition-all">
                                <Activity size={20} className="mr-2" /> Gerar Ranking SLA
                            </Button>
                            <Button variant="secondary" className="h-16 px-10 rounded-[1.8rem] bg-white text-[11px] border-slate-200">
                                <RefreshCw size={20} className="mr-2" /> Atualizar Índices
                            </Button>
                        </>
                    )}

                    {activeTab === 'FINANCEIRO' && (
                        <>
                            <Button onClick={() => setIsCostModalOpen(true)} className="h-16 px-10 rounded-[1.8rem] bg-amber-500 text-slate-900 border-none text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                <Receipt size={20} className="mr-2" /> Lançar Título / NF
                            </Button>
                            <Button onClick={() => setIsLedgerConciliationModalOpen(true)} variant="secondary" className="h-16 px-10 rounded-[1.8rem] bg-white text-[11px] border-slate-200 shadow-sm">
                                <RefreshCw size={20} className="mr-2" /> Conciliação Ledger
                            </Button>
                        </>
                    )}

                    {activeTab === 'COMPLIANCE' && (
                        <>
                            <Button onClick={() => setIsRFQModalOpen(true)} className="h-16 px-10 rounded-[1.8rem] bg-gov-900 text-white text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                <Send size={20} className="mr-2" /> Abrir Novo RFQ
                            </Button>
                            <Button onClick={() => setIsDocumentAuditModalOpen(true)} variant="secondary" className="h-16 px-10 rounded-[1.8rem] bg-white text-[11px] border-slate-200 shadow-sm">
                                <ShieldCheck size={20} className="mr-2" /> Auditoria Documental
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* CONTEÚDO DINÂMICO DE ABAS */}
            <div className="animate-fadeIn">
                {activeTab === 'PARCEIROS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                            <Card key={s.id} className="p-10 rounded-[3.5rem] border border-slate-100 hover:border-gov-400 hover:shadow-2xl transition-all relative overflow-hidden bg-white group">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] text-gov-600 group-hover:bg-gov-900 group-hover:text-white transition-all duration-500">
                                        <Building2 size={32} />
                                    </div>
                                    <Badge color={s.complianceStatus === 'REGULAR' ? 'green' : 'orange'} className="text-[8px] font-black tracking-[0.2em] px-4 py-1.5">
                                        {s.complianceStatus}
                                    </Badge>
                                </div>
                                <h4 className="font-black text-slate-800 uppercase text-xs leading-tight mb-2 truncate">{s.name}</h4>
                                <p className="text-[10px] font-mono text-slate-400 font-bold mb-10 tracking-tighter">ID: {s.id}</p>
                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500"><Mail size={14} /> <span className="truncate font-bold">{s.email}</span></div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500"><FileCheck2 size={14} /> <span className="font-bold">{s.additionalDocs?.length || 0} Certidões</span></div>
                                </div>
                                <div className="flex gap-3 pt-10 border-t border-slate-50">
                                    <Button variant="secondary" className="flex-1 h-14 text-[9px] font-black uppercase bg-slate-50 border-none hover:bg-gov-900 hover:text-white shadow-sm transition-colors" onClick={() => setViewingDossier(s)}>
                                        <FileSearch size={18} className="mr-2" /> Dossiê
                                    </Button>
                                    <Button variant="ghost" className="w-14 h-14 p-0 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" onClick={() => setSupplierToDelete(s)}>
                                        <Trash2 size={20} />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'PERFORMANCE' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 rounded-[3rem] p-10 border-none shadow-sm bg-white">
                                <div className="flex justify-between items-center mb-12">
                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase text-sm tracking-[0.2em] flex items-center gap-3">
                                            <BarChart3 className="text-gov-600" size={24} /> Benchmark de Eficiência
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Base de cálculo: SLA Médio (Entrega x Qualidade)</p>
                                    </div>
                                    <Badge color="gray" className="px-5 py-2">Média Global: --</Badge>
                                </div>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={performanceBenchmarkData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="shortName" fontSize={9} fontWeight="black" axisLine={false} tickLine={false} />
                                            <YAxis fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={50}>
                                                {performanceBenchmarkData.map((_, i) => <Cell key={i} fill={['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'][i % 4]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <div className="space-y-8">
                                {performanceBenchmarkData.map((item, index) => (
                                    <Card key={item.id} className="rounded-[3rem] bg-white text-slate-900 p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
                                        <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Award size={140} className="text-slate-900" /></div>
                                        <div className="flex justify-between items-start mb-6">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Ranking Oficial</p>
                                            <span className="text-4xl font-black text-slate-900 tracking-tighter">#{String(index + 1).padStart(2, '0')}</span>
                                        </div>
                                        <h4 className="text-3xl font-black uppercase tracking-tighter leading-tight text-slate-900 mb-6 truncate">{item.name}</h4>
                                        <div className="mt-4 flex items-center gap-6">
                                            <div className="h-16 w-16 rounded-full border-4 border-emerald-500/30 flex items-center justify-center text-emerald-600 font-black text-xl">{item.score.toFixed(1)}</div>
                                            <div>
                                                <p className="text-xs text-indigo-600 font-medium italic">Performance Geral</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge color="blue" className="text-[8px] py-0.5">Q: {item.metrics?.quality}</Badge>
                                                    <Badge color="green" className="text-[8px] py-0.5">E: {item.metrics?.delivery}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'FINANCEIRO' && (
                    <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[4rem] bg-white animate-fadeIn">
                        <div className="p-12 bg-slate-900 text-white flex flex-col lg:flex-row justify-between items-center gap-10">
                            <div className="flex items-center gap-8">
                                <div className="p-8 bg-amber-500 text-slate-900 rounded-[3rem] shadow-2xl"><Calculator size={48} /></div>
                                <div>
                                    <h3 className="font-black uppercase text-3xl tracking-tighter leading-none">Razão Contábil / Ledger</h3>
                                    <p className="text-slate-400 text-xs font-bold mt-3 uppercase tracking-widest flex items-center gap-3">
                                        <ShieldCheck size={16} className="text-emerald-500" /> Sincronização em Tempo Real (ERP)
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Bruto Provisionado</p>
                                <p className="text-4xl font-black text-white mt-2">R$ {totalLedger.toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto custom-scroll">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[11px] tracking-[0.2em] border-b border-slate-100">
                                    <tr>
                                        <th className="px-14 py-8">Protocolo / Data</th>
                                        <th className="px-14 py-8">Vencimento</th>
                                        <th className="px-14 py-8">Credor / Finalidade</th>
                                        <th className="px-14 py-8 text-right">Valor Líquido</th>
                                        <th className="px-14 py-8 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {costs.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-14 py-8">
                                                <p className="text-[11px] font-black text-slate-900">{c.id}</p>
                                                <p className="text-slate-400 font-bold uppercase text-[9px] mt-1">{new Date(c.date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-14 py-8">
                                                <p className={`text-xs font-black uppercase ${c.status === 'VENCIDO' ? 'text-red-500' : 'text-slate-600'}`}>
                                                    {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '--/--/----'}
                                                </p>
                                            </td>
                                            <td className="px-14 py-8">
                                                <p className="font-black text-slate-800 uppercase text-xs truncate w-56">{c.description}</p>
                                                <p className="text-[10px] text-gov-600 font-bold uppercase mt-1.5">{suppliers.find(s => s.id === c.supplierId)?.name || 'Credor Externo'}</p>
                                            </td>
                                            <td className="px-14 py-8 text-right font-black text-slate-900 text-xl">R$ {c.value.toLocaleString('pt-BR')}</td>
                                            <td className="px-14 py-8 text-center">
                                                <Badge color={c.status === 'PAGO' ? 'green' : c.status === 'VENCIDO' ? 'red' : 'orange'} className="px-6 py-2 font-black text-[10px] uppercase tracking-widest border-none shadow-sm">
                                                    {c.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* MODAL: HOMOLOGAR PARCEIRO */}
            <Modal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} title="Homologar Novo Parceiro Estratégico" size="lg">
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex gap-6 relative overflow-hidden">
                        <Building2 className="absolute -right-6 -bottom-6 opacity-10" size={140} />
                        <div className="p-5 bg-gov-600 rounded-[1.8rem] shadow-xl"><Building2 size={24} /></div>
                        <div>
                            <h4 className="font-black uppercase tracking-tighter text-lg leading-tight">Credenciamento de Fornecedor</h4>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Novos cadastros entram em modo de Vetting Documental imediato.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input label="Nome da Empresa / Razão Social" placeholder="EX: SERVIÇOS TÉCNICOS LTDA" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="CNPJ / CPF" placeholder="00.000.000/0000-00" value={newSupplier.taxId} onChange={e => setNewSupplier({ ...newSupplier, taxId: e.target.value })} />
                            <Input label="E-mail de Contato" type="email" placeholder="contato@empresa.com" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Categoria</label>
                                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:ring-4 focus:ring-gov-500/20" value={newSupplier.category} onChange={e => setNewSupplier({ ...newSupplier, category: e.target.value })}>
                                    <option value="EQUIPAMENTOS">EQUIPAMENTOS</option>
                                    <option value="SERVIÇOS">SERVIÇOS</option>
                                    <option value="INSUMOS">INSUMOS</option>
                                    <option value="FROTA">FROTA</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tipo de Fornecimento</label>
                                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:ring-4 focus:ring-gov-500/20" value={newSupplier.supplierType} onChange={e => setNewSupplier({ ...newSupplier, supplierType: e.target.value })}>
                                    <option value="PRODUTO">APENAS PRODUTOS</option>
                                    <option value="SERVICO">APENAS SERVIÇOS</option>
                                    <option value="AMBOS">AMBOS (FULL-SERVICE)</option>
                                </select>
                            </div>
                        </div>
                        <Input label="Endereço Sede" placeholder="LOGRADOURO, Nº, CIDADE - UF" value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} />
                    </div>

                    <Button onClick={handleConfirmSupplier} className="w-full h-16 bg-gov-900 rounded-2xl font-black uppercase shadow-2xl text-white mt-4 hover:scale-[1.02] active:scale-95 transition-all">
                        Efetivar Homologação no Ecosystem
                    </Button>
                </div>
            </Modal>

            {/* MODAL: LANÇAR TÍTULO / NF (RESTAURADO E FUNCIONANDO) */}
            <Modal isOpen={isCostModalOpen} onClose={() => setIsCostModalOpen(false)} title="Lançamento de Título / Nota Fiscal" size="lg">
                <div className="space-y-6">
                    <div className="bg-amber-500 p-8 rounded-[2.5rem] text-slate-900 flex gap-6 relative overflow-hidden">
                        <Receipt className="absolute -right-6 -bottom-6 opacity-10" size={140} />
                        <div className="p-5 bg-white rounded-[1.8rem] shadow-xl"><Receipt size={24} /></div>
                        <div>
                            <h4 className="font-black uppercase tracking-tighter text-lg leading-tight">Gestão de Contas a Pagar</h4>
                            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-widest mt-2">Provisione o pagamento de faturas e vincule ao credor oficial.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input label="Descrição do Lançamento / NF" placeholder="EX: AQUISIÇÃO DE PEÇAS PARA FROTA" value={newCost.description} onChange={e => setNewCost({ ...newCost, description: e.target.value })} />

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Valor do Título (R$)" type="number" placeholder="0.00" value={newCost.value} onChange={e => setNewCost({ ...newCost, value: Number(e.target.value) })} />
                            <Input label="Número da NF / Protocolo" placeholder="000.000.000" value={newCost.invoiceNumber} onChange={e => setNewCost({ ...newCost, invoiceNumber: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Fornecedor / Credor</label>
                                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:ring-4 focus:ring-gov-500/20" value={newCost.supplierId} onChange={e => setNewCost({ ...newCost, supplierId: e.target.value })}>
                                    <option value="">Selecione o Credor...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <Input label="Data de Vencimento" type="date" value={newCost.dueDate} onChange={e => setNewCost({ ...newCost, dueDate: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Centro de Custo</label>
                                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase" value={newCost.costCenter} onChange={e => setNewCost({ ...newCost, costCenter: e.target.value })}>
                                    <option value="GERAL">ADMINISTRAÇÃO GERAL</option>
                                    <option value="OPERACIONAL">OPERACIONAL / FROTA</option>
                                    <option value="TI">TECNOLOGIA DA INFORMAÇÃO</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Status Inicial</label>
                                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase" value={newCost.status} onChange={e => setNewCost({ ...newCost, status: e.target.value as any })}>
                                    <option value="A_PAGAR">PENDENTE (A PAGAR)</option>
                                    <option value="PAGO">EFETIVADO (PAGO)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleConfirmCost} className="w-full h-16 bg-slate-900 rounded-2xl font-black uppercase shadow-2xl text-white mt-4 hover:scale-[1.02] transition-all">
                        Efetivar Lançamento Contábil
                    </Button>
                </div>
            </Modal>

            {/* MODAL: RANKING SLA AVANÇADO (FUNCIONANDO) */}
            <Modal isOpen={isRankingModalOpen} onClose={() => setIsRankingModalOpen(false)} title="Auditória de Performance SLA (Multi-Métrica)" size="xl">
                <div className="space-y-10">
                    <div className="p-10 bg-indigo-900 rounded-[3.5rem] text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
                        <Award className="absolute -left-10 -bottom-10 opacity-10" size={240} />
                        <div className="relative z-10 flex items-center gap-8">
                            <div className="p-6 bg-white/10 rounded-[2.5rem] backdrop-blur-md border border-white/5 shadow-inner"><Activity size={48} /></div>
                            <div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">Top Performance 2024</h4>
                                <p className="text-sm text-indigo-300 font-bold uppercase mt-2 tracking-[0.2em]">Cálculo Dinâmico por Auditoria de Campo e Contábil</p>
                            </div>
                        </div>
                        <div className="relative z-10 flex gap-4">
                            <Button variant="white" onClick={() => {
                                const csvContent = "data:text/csv;charset=utf-8," + "Fornecedor,Qualidade,Entrega,Preco\n" + suppliers.map(s => `${s.name},${s.metrics?.quality},${s.metrics?.delivery},${s.metrics?.price}`).join("\n");
                                const encodedUri = encodeURI(csvContent);
                                const link = document.createElement("a");
                                link.setAttribute("href", encodedUri);
                                link.setAttribute("download", "laudo_performance_sla.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }} className="h-12 px-6 rounded-xl text-[9px] font-black border-none bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white">
                                <Download size={14} className="mr-2" /> EXPORTAR LAUDO
                            </Button>
                        </div>
                    </div>

                    {/* QUADRO DE HONRA - TOP 3 RESUMO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {suppliers.sort((a, b) => (b.metrics?.quality || 0) - (a.metrics?.quality || 0)).slice(0, 3).map((s, idx) => (
                            <Card key={s.id} className={`p-8 rounded-[3rem] border-none shadow-xl relative overflow-hidden bg-white`}>
                                <div className={`absolute top-0 right-0 p-6 font-black text-7xl opacity-100 text-slate-100`}>0{idx + 1}</div>
                                <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {idx === 0 ? <Award size={24} /> : idx === 1 ? <TrendingUp size={24} /> : <ShieldCheck size={24} />}
                                </div>
                                <h5 className={`text-xs font-black uppercase truncate mb-1 text-slate-900 relative z-10`}>{s.name}</h5>
                                <p className={`text-[10px] font-bold uppercase mb-6 text-slate-900 relative z-10`}>SLA Médio: {(((s.metrics?.quality || 0) + (s.metrics?.delivery || 0) + (s.metrics?.price || 0)) / 3).toFixed(1)}</p>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden bg-slate-100`}>
                                    <div className={`h-full rounded-full ${idx === 0 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${(s.metrics?.quality || 0)}%` }}></div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* TENDÊNCIA DE PERFORMANCE GLOBAL */}
                    <Card className="p-10 rounded-[3rem] bg-white border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h5 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                                    <TrendingUp size={16} className="text-emerald-500" /> Tendência Global de Entrega
                                </h5>
                            </div>
                            <Badge color="gray" className="text-[10px] px-4 py-1.5">Aguardando Dados</Badge>
                        </div>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[]}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                                    <Tooltip />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="flex h-full items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest -mt-[180px]">
                                Histórico Insuficiente
                            </div>
                        </div>
                    </Card>

                    {/* LISTA DETALHADA DE AUDITORIA */}
                    <div className="grid grid-cols-1 gap-6">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4">Ranking Detalhado de Parceiros</h5>
                        {suppliers.sort((a, b) => (b.metrics?.quality || 0) - (a.metrics?.quality || 0)).map((s, i) => (
                            <Card key={s.id} className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all group">
                                <div className="flex flex-col lg:flex-row items-center gap-10">
                                    <div className="flex items-center gap-6 min-w-[320px]">
                                        <div className="w-16 h-16 rounded-[1.8rem] bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-white shadow-xl group-hover:bg-indigo-600 transition-colors">#{i + 1}</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 uppercase leading-none truncate max-w-[150px]">{s.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">{s.category} • {s.taxId}</p>
                                            <div className="mt-3 flex gap-2">
                                                <Badge color={i === 0 ? 'green' : 'blue'} className="text-[8px] border-none px-3 py-1 font-black uppercase">{i === 0 ? 'EXCELLENCE' : 'COMPLIANCE OK'}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full border-l border-slate-50 pl-10">
                                        {[
                                            { label: 'Qualidade', val: s.metrics?.quality || 0, color: 'blue' },
                                            { label: 'Entrega', val: s.metrics?.delivery || 0, color: 'emerald' },
                                            { label: 'Preço', val: s.metrics?.price || 0, color: 'amber' },
                                            { label: 'ESG', val: s.metrics?.esg || 0, color: 'indigo' },
                                            { label: 'Suporte', val: s.metrics?.support || 0, color: 'rose' }
                                        ].map((m, idx) => (
                                            <div key={idx} className="mb-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                                                    <span className="text-[9px] font-black text-slate-900">{m.val}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                    <div className={`h-full bg-${m.color}-500 rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${m.val}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-right min-w-[140px] bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Veredito</p>
                                        <p className="text-3xl font-black text-indigo-600 tracking-tighter">
                                            {(((s.metrics?.quality || 0) + (s.metrics?.delivery || 0) + (s.metrics?.price || 0)) / 3).toFixed(1)}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* MODAL: CONCILIAÇÃO LEDGER */}
            <Modal isOpen={isLedgerConciliationModalOpen} onClose={() => setIsLedgerConciliationModalOpen(false)} title="Batida de Saldos / Conciliação Ledger" size="lg">
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Saldo Ledger (Sistema)</p>
                            <p className="text-3xl font-black">R$ {totalLedger.toLocaleString()}</p>
                        </div>
                        <div className="bg-white border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] flex flex-col justify-center items-center group hover:border-amber-500 transition-all cursor-pointer">
                            <FileUp className="text-slate-300 group-hover:text-amber-500 mb-3" size={32} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center group-hover:text-amber-600">Importar Extrato Bancário</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsLedgerConciliationModalOpen(false)} className="w-full h-16 bg-gov-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                        Efetivar Conciliação Global
                    </Button>
                </div>
            </Modal>

            {/* MODAL: AUDITORIA DOCUMENTAL */}
            <Modal isOpen={isDocumentAuditModalOpen} onClose={() => setIsDocumentAuditModalOpen(false)} title="Auditoria de Conformidade Documental" size="lg">
                <div className="space-y-8">
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center gap-8">
                        <div className="p-6 bg-emerald-600 text-white rounded-[2rem] shadow-xl"><ShieldIcon size={32} /></div>
                        <div>
                            <h4 className="text-xl font-black text-emerald-900 uppercase">Check-up de Regularidade</h4>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {suppliers.map(s => (
                            <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:border-gov-500 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-2xl ${s.complianceStatus === 'REGULAR' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} transition-all`}>
                                        {s.complianceStatus === 'REGULAR' ? <CheckCircle size={24} /> : <ShieldX size={24} />}
                                    </div>
                                    <p className="text-xs font-black text-slate-800 uppercase">{s.name}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-gov-900 hover:text-white transition-all"><ExternalLink size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* MODAL: NOVO RFQ */}
            <Modal isOpen={isRFQModalOpen} onClose={() => setIsRFQModalOpen(false)} title="Nova Requisição de Cotação (RFQ)" size="lg">
                <div className="space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex gap-6 border border-white/5 shadow-2xl relative overflow-hidden">
                        <Send className="absolute -right-6 -bottom-6 opacity-10" size={140} />
                        <div className="p-5 bg-gov-600 rounded-[1.8rem] shadow-xl"><Send size={24} /></div>
                        <div>
                            <h4 className="font-black uppercase tracking-tighter text-lg leading-tight">Painel de RFQ Digital</h4>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Convide múltiplos fornecedores para comparar preços e condições.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Input label="Título da Requisição" placeholder="EX: AQUISIÇÃO DE 20 NOTEBOOKS PARA OBRAS" value={rfqForm.title} onChange={e => setRfqForm({ ...rfqForm, title: e.target.value })} />

                        <div className="grid grid-cols-2 gap-6">
                            <Input label="Data Limite para Lances" type="date" value={rfqForm.deadline} onChange={e => setRfqForm({ ...rfqForm, deadline: e.target.value })} />
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase mb-3 ml-2">Moeda / Regime</label>
                                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] p-5 text-xs font-black uppercase">
                                    <option>BRL - REAL BRASILEIRO</option>
                                    <option>USD - DÓLAR COMERCIAL</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2">Fornecedores Convidados</label>
                            <div className="flex flex-wrap gap-2">
                                {suppliers.map(s => (
                                    <label key={s.id} className={`px-5 py-3 rounded-full border-2 transition-all cursor-pointer flex items-center gap-3 ${rfqForm.invitedSuppliers.includes(s.id) ? 'bg-gov-900 border-gov-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                                        <input type="checkbox" className="sr-only" checked={rfqForm.invitedSuppliers.includes(s.id)} onChange={() => {
                                            const next = rfqForm.invitedSuppliers.includes(s.id) ? rfqForm.invitedSuppliers.filter(id => id !== s.id) : [...rfqForm.invitedSuppliers, s.id];
                                            setRfqForm({ ...rfqForm, invitedSuppliers: next });
                                        }} />
                                        <CheckSquare size={14} className={rfqForm.invitedSuppliers.includes(s.id) ? 'opacity-100' : 'opacity-20'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{s.name.split(' ')[0]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => { alert('RFQ Publicado no Ecosystem!'); setIsRFQModalOpen(false); }} className="w-full h-20 bg-gov-900 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl hover:scale-[1.02] mt-4">
                        Disparar Cotação para o Mercado
                    </Button>
                </div>
            </Modal>


            {/* MODAL: DOSSIÊ DO FORNECEDOR */}
            <Modal isOpen={!!viewingDossier} onClose={() => setViewingDossier(null)} title="Dossiê Completo do Parceiro" size="lg">
                <div className="space-y-6">
                    {viewingDossier && (
                        <>
                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex gap-6 relative overflow-hidden">
                                <FileText className="absolute -right-6 -bottom-6 opacity-10" size={140} />
                                <div className="p-5 bg-gov-600 rounded-[1.8rem] shadow-xl"><Building2 size={24} /></div>
                                <div>
                                    <h4 className="font-black uppercase tracking-tighter text-lg leading-tight">{viewingDossier.name}</h4>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">ID: {viewingDossier.id} • {viewingDossier.taxId}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">E-mail</p>
                                    <p className="text-xs font-bold text-slate-800 break-all">{viewingDossier.email}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Telefone</p>
                                    <p className="text-xs font-bold text-slate-800">{viewingDossier.phone}</p>
                                </div>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Conformidade e Certificações</h5>
                                <div className="space-y-2">
                                    {viewingDossier.additionalDocs?.length ? viewingDossier.additionalDocs.map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileCheck size={14} /></div>
                                                <span className="text-[10px] font-bold text-slate-700 uppercase">{doc.name || 'Documento Anexo'}</span>
                                            </div>
                                            <Badge color="green">VIGENTE</Badge>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-400 italic">Nenhum documento anexado.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <ConfirmModal isOpen={!!supplierToDelete} onClose={() => setSupplierToDelete(null)} onConfirm={() => { if (supplierToDelete) onDeleteSupplier(supplierToDelete.id); setSupplierToDelete(null); }} title="Expurgar Registro de Parceiro" message={`A remoção de "${supplierToDelete?.name}" é um rito irreversível. Todos os vínculos com ativos e históricos contábeis de NF serão dissociados. Deseja prosseguir?`} />
        </div >
    );
};