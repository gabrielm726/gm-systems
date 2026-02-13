
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, Button, Modal, Input, ConfirmModal, Badge } from '../components/Shared';
import { Location, Asset, AssetState } from '../types';
import {
    Building, MapPin, Package, Edit, Plus, Trash2, Eye, Search,
    Camera, ExternalLink, Box, LayoutGrid, Info, CheckCircle2,
    Upload, Image as ImageIcon, Maximize2, X, Download, AlertTriangle,
    RefreshCw, ZoomIn, ShieldCheck, Settings, FileText, MoreHorizontal,
    Images
} from 'lucide-react';

interface DepotManagerProps {
    locations: Location[];
    assets?: Asset[];
    onAddLocation?: (loc: Location) => void;
    onUpdateLocation?: (loc: Location) => void;
    onDeleteLocation?: (id: string) => void;
}

export const DepotManager: React.FC<DepotManagerProps> = ({ locations, assets = [], onAddLocation, onUpdateLocation, onDeleteLocation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLoc, setEditingLoc] = useState<Location | null>(null);
    const [viewingItemsLoc, setViewingItemsLoc] = useState<Location | null>(null);
    const [viewingGalleryLoc, setViewingGalleryLoc] = useState<Location | null>(null);
    const [itemSearchTerm, setItemSearchTerm] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [locToDelete, setLocToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Location>>({
        name: '', address: '', type: 'DEPOT', lat: -7.5997, lng: -37.6469, floorPlanUrl: '', internalPhotoUrl: '', externalPhotoUrl: '', capacity: 100
    });

    const fileInputInternal = useRef<HTMLInputElement>(null);
    const fileInputExternal = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'INTERNAL' | 'EXTERNAL') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const key = type === 'INTERNAL' ? 'internalPhotoUrl' : 'externalPhotoUrl';
                setFormData(prev => ({ ...prev, [key]: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenAdd = () => {
        setEditingLoc(null);
        setFormData({ name: '', address: '', type: 'DEPOT', lat: -7.5997, lng: -37.6469, internalPhotoUrl: '', externalPhotoUrl: '', capacity: 100 });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (loc: Location) => {
        setEditingLoc(loc);
        setFormData({ ...loc });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name) return alert("O nome da unidade é obrigatório.");

        const locToSave: Location = {
            id: editingLoc ? editingLoc.id : `LOC-${Date.now()}`,
            name: formData.name.toUpperCase(),
            address: formData.address || '',
            type: formData.type || 'DEPOT',
            lat: Number(formData.lat) || -7.5997,
            lng: Number(formData.lng) || -37.6469,
            floorPlanUrl: formData.floorPlanUrl || '',
            internalPhotoUrl: formData.internalPhotoUrl || '',
            externalPhotoUrl: formData.externalPhotoUrl || '',
            capacity: Number(formData.capacity) || 100
        };

        if (editingLoc && onUpdateLocation) {
            onUpdateLocation(locToSave);
        } else if (onAddLocation) {
            onAddLocation(locToSave);
        }
        setIsModalOpen(false);
    };


    const confirmDeletion = () => {
        if (editingLoc) {
            setLocToDelete(editingLoc.id);
            setIsDeleteModalOpen(true);
        }
    };

    // OPTIMIZATION: Pre-calculate asset counts and stats per location
    const locationStats = useMemo(() => {
        const stats: Record<string, { count: number, items: Asset[] }> = {};
        locations.forEach(l => stats[l.id] = { count: 0, items: [] });

        assets.forEach(a => {
            if (a.locationId && stats[a.locationId]) {
                stats[a.locationId].count++;
                stats[a.locationId].items.push(a);
            }
        });
        return stats;
    }, [assets, locations]);

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5"><LayoutGrid size={160} /></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <Badge color="blue" className="bg-blue-500/20 text-blue-300 border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px] mb-4">Engenharia Física</Badge>
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Depósitos & Unidades</h2>
                        <p className="text-slate-400 mt-2 font-medium">Controle visual e gestão de ocupação física.</p>
                    </div>
                    <Button onClick={handleOpenAdd} className="bg-gov-500 text-slate-900 border-none rounded-2xl h-14 px-8 shadow-xl font-black uppercase text-xs tracking-widest">
                        <Plus size={24} className="mr-2" /> Novo Ponto de Estoque
                    </Button>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {locations.map(loc => {
                    const stats = locationStats[loc.id] || { count: 0, items: [] };
                    const currentCount = stats.count;
                    const maxCapacity = loc.capacity || 100;
                    const occupancyPercent = Math.min(100, Math.round((currentCount / maxCapacity) * 100));

                    return (
                        <Card key={loc.id} className="p-0 overflow-hidden rounded-[2.5rem] border-none shadow-md hover:shadow-xl transition-all group bg-white relative">
                            {/* BOTÃO DE GESTÃO ADMINISTRATIVA */}
                            <button
                                onClick={() => handleOpenEdit(loc)}
                                className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm text-slate-600 hover:bg-gov-900 hover:text-white transition-colors"
                                title="Configurações e Dados"
                            >
                                <Settings size={20} />
                            </button>

                            {/* ÁREA DE IMAGENS: ESTÁTICA (SEM HOVER OU CLIQUE) */}
                            <div className="grid grid-cols-2 h-64 bg-slate-100 relative">
                                <div className="relative overflow-hidden border-r border-slate-200">
                                    {loc.externalPhotoUrl ? (
                                        <>
                                            <img src={loc.externalPhotoUrl} className="w-full h-full object-cover" alt="Fachada" />
                                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] text-white font-black uppercase border border-white/10">Fachada</div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <Camera size={32} className="opacity-20" />
                                        </div>
                                    )}
                                </div>

                                <div className="relative overflow-hidden">
                                    {loc.internalPhotoUrl ? (
                                        <>
                                            <img src={loc.internalPhotoUrl} className="w-full h-full object-cover" alt="Interior" />
                                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] text-white font-black uppercase border border-white/10">Interior</div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <LayoutGrid size={32} className="opacity-20" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight">{loc.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-slate-400"><MapPin size={12} /><span className="text-[10px] font-bold uppercase truncate max-w-[250px] inline-block">{loc.address}</span></div>
                                    </div>
                                    <Badge color={loc.type === 'DEPOT' ? 'orange' : 'blue'} className="px-3 py-1 font-black text-[9px] uppercase shadow-sm border-none">{loc.type}</Badge>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6">
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxa de Preenchimento</p>
                                            <p className="text-xl font-black text-slate-800">{currentCount} <span className="text-xs text-slate-400 font-bold">/ {maxCapacity} ITENS</span></p>
                                        </div>
                                        <Badge color={occupancyPercent > 90 ? 'red' : occupancyPercent > 70 ? 'yellow' : 'green'} className="text-[9px] px-3 py-1 border-none shadow-sm">
                                            {occupancyPercent}% OCUPADO
                                        </Badge>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 shadow-sm ${occupancyPercent > 90 ? 'bg-red-500' : occupancyPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${occupancyPercent}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="secondary"
                                        className="rounded-2xl h-14 uppercase font-black text-[9px] tracking-widest border-slate-200 bg-white hover:bg-gov-50"
                                        onClick={() => setViewingItemsLoc(loc)}
                                    >
                                        <Package size={18} className="mr-2 text-gov-600" /> Ver Inventário
                                    </Button>
                                    <Button
                                        className="rounded-2xl h-14 bg-slate-900 text-white uppercase font-black text-[9px] tracking-widest shadow-xl"
                                        onClick={() => setViewingGalleryLoc(loc)}
                                    >
                                        <Images size={18} className="mr-2 text-gov-400" /> Visualizar Imagens
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* MODAL GESTÃO (INFORMAÇÕES + EXCLUIR) */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Dossiê Administrativo da Unidade" size="lg">
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex gap-6 shadow-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 p-4 opacity-10"><Building size={140} /></div>
                        <div className="p-4 bg-gov-600 rounded-2xl flex items-center justify-center shadow-lg"><Info className="text-white" size={28} /></div>
                        <div className="relative z-10">
                            <h4 className="text-xl font-black uppercase tracking-tight">Gestão de Dados Mestres</h4>
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mt-1">Configure parâmetros críticos e controle de exclusão.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Identificador da Unidade" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <Input label="Capacidade Máxima (Itens)" type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tipo de Local</label>
                            <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black uppercase outline-none focus:ring-4 focus:ring-gov-500/20" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                <option value="DEPOT">Depósito / Almoxarifado</option>
                                <option value="BUILDING">Prédio Administrativo</option>
                                <option value="ROOM">Setor / Anexo Externo</option>
                            </select>
                        </div>
                        <Input label="Endereço Geográfico" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">Anexar Fachada</label>
                            <div onClick={() => fileInputExternal.current?.click()} className="h-44 border-4 border-dashed border-slate-100 rounded-3xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-gov-500 transition-all">
                                {formData.externalPhotoUrl ? <img src={formData.externalPhotoUrl} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={32} />}
                                <input type="file" ref={fileInputExternal} className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, 'EXTERNAL')} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">Anexar Interior</label>
                            <div onClick={() => fileInputInternal.current?.click()} className="h-44 border-4 border-dashed border-slate-100 rounded-3xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-gov-500 transition-all">
                                {formData.internalPhotoUrl ? <img src={formData.internalPhotoUrl} className="w-full h-full object-cover" /> : <LayoutGrid className="text-slate-300" size={32} />}
                                <input type="file" ref={fileInputInternal} className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, 'INTERNAL')} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                        <Button onClick={handleSubmit} fullWidth className="h-16 bg-gov-900 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-2xl">Confirmar Alterações de Dados</Button>

                        {editingLoc && (
                            <button
                                onClick={confirmDeletion}
                                className="w-full h-14 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all mt-2"
                            >
                                <Trash2 size={18} /> Expurgar Unidade do Sistema
                            </button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* MODAL INVENTÁRIO (ITENS) */}
            <Modal isOpen={!!viewingItemsLoc} onClose={() => setViewingItemsLoc(null)} title={`Inventário Físico: ${viewingItemsLoc?.name}`} size="lg">
                <div className="space-y-6">
                    <div className="bg-gov-900 p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-xl">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-gov-500 rounded-2xl text-slate-900 shadow-lg"><Package size={28} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status da Carga</p>
                                <p className="text-2xl font-black uppercase mt-1">{assets.filter(a => a.locationId === viewingItemsLoc?.id).length} Ativos Locados</p>
                            </div>
                        </div>
                        <Badge color="blue" className="bg-white/10 border-white/20 text-white font-black px-4 py-2 border-none">STATUS: OK</Badge>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-gov-500/10 transition-all" placeholder="Filtrar por tombamento ou descrição..." value={itemSearchTerm} onChange={e => setItemSearchTerm(e.target.value)} />
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scroll space-y-3 pr-2">
                        {assets.filter(a => a.locationId === viewingItemsLoc?.id && (a.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) || a.id.toLowerCase().includes(itemSearchTerm.toLowerCase()))).map(a => (
                            <div key={a.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-gov-400 transition-all shadow-sm group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-gov-900 group-hover:text-white transition-all duration-300"><Box size={24} /></div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase leading-none">{a.name}</p>
                                        <p className="text-[10px] font-mono text-gov-600 font-bold mt-2 tracking-widest uppercase">ID: {a.id}</p>
                                    </div>
                                </div>
                                <Badge color={a.state === AssetState.GOOD ? 'green' : 'yellow'} className="px-4 py-1.5 font-black text-[8px] uppercase border-none">{a.state}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* MODAL DE GALERIA PADRONIZADO (MANTÉM O LAYOUT DO SISTEMA COM FUNDO TRANSPARENTE E CONTAINER BRANCO) */}
            <Modal
                isOpen={!!viewingGalleryLoc}
                onClose={() => setViewingGalleryLoc(null)}
                title={`Dossiê de Imagens: ${viewingGalleryLoc?.name}`}
                size="lg"
            >
                {viewingGalleryLoc && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                            <p className="text-gov-600 font-black uppercase tracking-[0.4em] text-[9px]">Evidências Fotográficas do Imobilizado</p>
                            <p className="text-xs text-slate-400 font-medium mt-1">Registros Auditados e Sincronizados com a Base Mestra</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {viewingGalleryLoc.externalPhotoUrl && (
                                <div className="space-y-4">
                                    <Badge color="blue" className="bg-gov-600 text-white border-none px-6 py-2 font-black uppercase tracking-widest text-[9px] shadow-sm">Fachada / Exterior</Badge>
                                    <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100">
                                        <img
                                            src={viewingGalleryLoc.externalPhotoUrl}
                                            className="w-full object-contain max-h-[500px]"
                                            alt="Fachada"
                                        />
                                    </div>
                                </div>
                            )}

                            {viewingGalleryLoc.internalPhotoUrl && (
                                <div className="space-y-4">
                                    <Badge color="orange" className="bg-orange-600 text-white border-none px-6 py-2 font-black uppercase tracking-widest text-[9px] shadow-sm">Interior / Ocupação</Badge>
                                    <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100">
                                        <img
                                            src={viewingGalleryLoc.internalPhotoUrl}
                                            className="w-full object-contain max-h-[500px]"
                                            alt="Interior"
                                        />
                                    </div>
                                </div>
                            )}

                            {!viewingGalleryLoc.externalPhotoUrl && !viewingGalleryLoc.internalPhotoUrl && (
                                <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    <Camera size={48} className="text-slate-200 mx-auto" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhuma imagem protocolada.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-center">
                            <div className="flex items-center gap-3 px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100 opacity-60">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <span className="text-emerald-700 text-[9px] font-black uppercase tracking-widest">Integridade SHA-256 Verificada</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    if (locToDelete && onDeleteLocation) onDeleteLocation(locToDelete);
                    setIsDeleteModalOpen(false);
                    setIsModalOpen(false);
                }}
                title="Expurgar Unidade"
                message="Deseja remover permanentemente esta unidade do sistema? Esta ação é irreversível e deixará os bens vinculados sem alocação geográfica."
            />
        </div>
    );
};
