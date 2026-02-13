import React, { useState, useMemo } from 'react';
import { Asset, AssetState, Location } from '../types';
import { Card, Badge, Button, Modal } from '../components/Shared';
import {
    CheckCircle, AlertTriangle, AlertCircle, Archive,
    Search, Activity, ShieldAlert, Barcode,
    Building2, History, FileText, Camera,
    ChevronRight, MapPin, ClipboardCheck, Info,
    ArrowUpRight, Target
} from 'lucide-react';

interface AssetStatusPageProps {
    assets: Asset[];
    locations: Location[];
}

export const AssetStatusPage: React.FC<AssetStatusPageProps> = ({ assets, locations }) => {
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtragem centralizada
    const filteredAssets = useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return assets.filter(a =>
            a.name.toLowerCase().includes(lower) ||
            a.id.toLowerCase().includes(lower)
        );
    }, [assets, searchTerm]);

    // Distribuição rigorosa por estados
    const categorized = useMemo(() => ({
        good: filteredAssets.filter(a => a.state === AssetState.GOOD),
        regular: filteredAssets.filter(a => a.state === AssetState.REGULAR),
        bad: filteredAssets.filter(a => a.state === AssetState.BAD),
        writtenOff: filteredAssets.filter(a => a.state === AssetState.DISPOSED)
    }), [filteredAssets]);

    const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || "Setor sob Auditoria";

    return (
        <div className="space-y-8 pb-12 animate-fadeIn">
            {/* KPI STRIPS - RESUMO EXECUTIVO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Em Bom Estado', count: categorized.good.length, color: 'emerald', icon: <CheckCircle size={20} />, trend: 'Operacional' },
                    { label: 'Estado Regular', count: categorized.regular.length, color: 'amber', icon: <AlertTriangle size={20} />, trend: 'Atenção' },
                    { label: 'Estado Ruim', count: categorized.bad.length, color: 'red', icon: <AlertCircle size={20} />, trend: 'Crítico' },
                    { label: 'Bens Baixados', count: categorized.writtenOff.length, color: 'slate', icon: <Archive size={20} />, trend: 'Fora de Carga' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>{stat.icon}</div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black text-${stat.color}-700 tracking-tighter`}>{stat.count}</p>
                            </div>
                        </div>
                        <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-md bg-${stat.color}-50 text-${stat.color}-600`}>{stat.trend}</div>
                    </div>
                ))}
            </div>

            {/* BARRA DE COMANDO CENTRAL */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-gov-900 text-white rounded-3xl shadow-lg shadow-gov-900/20">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Matriz de Integridade</h2>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Gestão de estados físicos e ciclo de vida da carga ativa.</p>
                    </div>
                </div>
                <div className="relative w-full md:w-[500px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
                    <input
                        className="pl-16 pr-8 py-5 w-full bg-slate-50 border-none rounded-[2.2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-gov-500/10 transition-all shadow-inner"
                        placeholder="Pesquisar por tombamento, placa ou descrição..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* QUADRO KANBAN DE ESTADOS PATRIMONIAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[650px]">

                {/* COLUNA: BOM ESTADO */}
                <StatusColumn
                    title="BOM ESTADO"
                    count={categorized.good.length}
                    color="emerald"
                    icon={<CheckCircle size={18} />}
                    description="Itens 100% Operacionais"
                >
                    {categorized.good.map(asset => (
                        <AssetStatusCard key={asset.id} asset={asset} location={getLocationName(asset.locationId)} color="emerald" onOpen={() => setSelectedAsset(asset)} />
                    ))}
                </StatusColumn>

                {/* COLUNA: REGULAR */}
                <StatusColumn
                    title="REGULAR"
                    count={categorized.regular.length}
                    color="amber"
                    icon={<AlertTriangle size={18} />}
                    description="Requer Manutenção Preventiva"
                >
                    {categorized.regular.map(asset => (
                        <AssetStatusCard key={asset.id} asset={asset} location={getLocationName(asset.locationId)} color="amber" onOpen={() => setSelectedAsset(asset)} />
                    ))}
                </StatusColumn>

                {/* COLUNA: RUIM */}
                <StatusColumn
                    title="RUIM"
                    count={categorized.bad.length}
                    color="red"
                    icon={<AlertCircle size={18} />}
                    description="Inservível / Danificado"
                >
                    {categorized.bad.map(asset => (
                        <AssetStatusCard key={asset.id} asset={asset} location={getLocationName(asset.locationId)} color="red" onOpen={() => setSelectedAsset(asset)} />
                    ))}
                </StatusColumn>

                {/* COLUNA: BAIXADOS */}
                <StatusColumn
                    title="BAIXADOS"
                    count={categorized.writtenOff.length}
                    color="slate"
                    icon={<Archive size={18} />}
                    description="Removidos da Carga Ativa"
                >
                    {categorized.writtenOff.map(asset => (
                        <AssetStatusCard key={asset.id} asset={asset} location={getLocationName(asset.locationId)} color="slate" onOpen={() => setSelectedAsset(asset)} />
                    ))}
                </StatusColumn>

            </div>

            {/* MODAL: DOSSIÊ TÉCNICO PROFISSIONAL */}
            <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title="Dossiê de Integridade Técnica" size="lg">
                {selectedAsset && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Hero Section do Ativo */}
                        <div className="flex flex-col md:flex-row gap-10 items-center bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 shadow-inner">
                            <div className="w-56 h-56 bg-white rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white flex-shrink-0 relative group">
                                <img src={selectedAsset.imageUrl || 'https://picsum.photos/400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-6 left-0 right-0 text-center text-white text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Inspeção Visual</div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex justify-center md:justify-start gap-2 mb-6">
                                    <Badge color="blue" className="px-5 py-2 font-black uppercase text-[9px] tracking-widest border-none shadow-sm">{selectedAsset.category}</Badge>
                                    <Badge
                                        className={`px-5 py-2 font-black uppercase text-[9px] tracking-widest border-none shadow-sm ${selectedAsset.state === AssetState.GOOD ? 'bg-emerald-100 text-emerald-800' :
                                            selectedAsset.state === AssetState.REGULAR ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        ESTADO: {selectedAsset.state}
                                    </Badge>
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">{selectedAsset.name}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-3 bg-gov-900 text-white px-5 py-2 rounded-2xl w-fit">
                                    <Barcode size={18} className="text-gov-400" />
                                    <p className="font-mono font-black text-sm tracking-[0.2em] uppercase">{selectedAsset.id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                                <div className="p-5 bg-gov-50 text-gov-600 rounded-2xl shadow-sm"><Building2 size={28} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização Auditada</p>
                                    <span className="text-lg font-black text-slate-800 uppercase leading-none">{getLocationName(selectedAsset.locationId)}</span>
                                </div>
                            </Card>
                            <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                                <div className="p-5 bg-amber-50 text-amber-600 rounded-2xl shadow-sm"><History size={28} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ciclo de Vistoria</p>
                                    <span className="text-lg font-black text-slate-800 uppercase leading-none">{new Date().toLocaleDateString()}</span>
                                </div>
                            </Card>
                        </div>

                        {/* Laudo de Auditoria Interna */}
                        <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-10 opacity-5"><ClipboardCheck size={160} /></div>
                            <h4 className="text-[11px] font-black text-gov-400 uppercase tracking-[0.5em] mb-10 flex items-center gap-3 border-b border-white/10 pb-6 relative z-10">
                                <FileText size={22} className="text-gov-500" /> Registro de Auditoria Patrimonial
                            </h4>
                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-3 h-3 rounded-full ${selectedAsset.state === AssetState.GOOD ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-amber-500 shadow-[0_0_15px_#f59e0b]'}`}></div>
                                        <span className="text-xs font-black uppercase text-white tracking-tight">Status Verificado em Campo</span>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-800 font-black uppercase text-[10px] border-none px-6 py-2 shadow-lg">CONFORMIDADE: OK</Badge>
                                </div>
                                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 italic">
                                    <p className="text-[10px] font-black uppercase text-gov-400 tracking-widest mb-4">Nota do Agente:</p>
                                    <p className="text-base text-white font-medium leading-relaxed">
                                        "O ativo foi inspecionado fisicamente em seu local de alocação. O estado de conservação reportado ({selectedAsset.state}) reflete fielmente as condições mecânicas e estruturais do bem conforme os ritos administrativos da NBC TSP 07."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button fullWidth onClick={() => setSelectedAsset(null)} className="h-24 rounded-[3rem] bg-gov-900 text-white font-black uppercase text-[13px] tracking-[0.5em] shadow-2xl hover:scale-[1.02] hover:bg-slate-800 transition-all border-none group">
                            <CheckCircle size={20} className="mr-4 text-gov-500 group-hover:scale-110 transition-transform" /> Finalizar Revisão do Bem
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// COMPONENTE INTERNO: COLUNA DO QUADRO PATRIMONIAL
const StatusColumn: React.FC<{ title: string; count: number; color: string; icon: React.ReactNode; description: string; children: React.ReactNode }> = ({ title, count, color, icon, description, children }) => (
    <div className="flex flex-col gap-6">
        <div className={`p-6 bg-white rounded-[2.5rem] border-b-4 border-b-${color}-500 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-3 text-${color}-700 font-black text-[10px] uppercase tracking-[0.25em]`}>
                    <div className={`p-2 bg-${color}-50 rounded-lg`}>{icon}</div> {title}
                </div>
                <span className={`bg-${color}-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg`}>{count}</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{description}</p>
        </div>
        <div className="space-y-4 overflow-y-auto max-h-[70vh] custom-scroll pr-3 pb-10">
            {children}
            {count === 0 && (
                <div className="py-20 px-8 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 opacity-50">
                    <Target size={32} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nenhum registro</p>
                </div>
            )}
        </div>
    </div>
);

// COMPONENTE INTERNO: CARD KANBAN DE ALTA DENSIDADE
const AssetStatusCard: React.FC<{ asset: Asset; location: string; color: string; onOpen: () => void }> = ({ asset, location, color, onOpen }) => (
    <div
        onClick={onOpen}
        className={`p-6 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:border-${color}-400 hover:shadow-2xl transition-all cursor-pointer group animate-fadeIn active:scale-[0.98]`}
    >
        <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
                <h4 className="font-black text-slate-800 uppercase text-[11px] leading-tight line-clamp-2 group-hover:text-gov-900 transition-colors mb-2">{asset.name}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black text-gov-600 bg-gov-50 px-2 py-0.5 rounded-md group-hover:bg-gov-900 group-hover:text-white transition-all">{asset.id}</span>
                </div>
            </div>
            <div className={`p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-${color}-500 group-hover:text-white transition-all shadow-inner`}>
                <ChevronRight size={18} strokeWidth={4} />
            </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-50 pt-5">
            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                <MapPin size={14} className={`text-${color}-500`} />
                <span className="truncate max-w-[180px]">{location}</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`}></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase">Integridade Validada</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-200 group-hover:text-gov-500 transition-colors" />
            </div>
        </div>
    </div>
);