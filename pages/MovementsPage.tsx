import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Modal, Input } from '../components/Shared';
import { Movement, Asset, Location, User, MovementStatus } from '../types';
import { ArrowLeftRight, CheckCircle, XCircle, Clock, MapPin, User as UserIcon, Search, Filter, Plus, Box, ArrowRight } from 'lucide-react';

interface MovementsPageProps {
    assets: Asset[];
    locations: Location[];
    users: User[];
    movements?: Movement[];
    onAddMovement?: (movement: Movement) => void;
    onApprove?: (movement: Movement, approved: boolean) => void;
    onReject?: (id: string, reason?: string) => void;
}

export const MovementsPage: React.FC<MovementsPageProps> = ({ movements = [], assets, locations, users, onApprove, onAddMovement }) => {
    const [localMovements, setLocalMovements] = useState<Movement[]>(movements);
    const [filterStatus, setFilterStatus] = useState<'ALL' | MovementStatus>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOrigin, setFilterOrigin] = useState('');
    const [filterDestination, setFilterDestination] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Batch Selection State
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [assetSearch, setAssetSearch] = useState('');
    const [targetLocationId, setTargetLocationId] = useState('');
    const [targetResponsibleId, setTargetResponsibleId] = useState('');
    const [justification, setJustification] = useState('');

    const filteredMovements = useMemo(() => {
        return localMovements.filter(m => {
            const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus;
            const matchesSearch =
                assets.find(a => a.id === m.assetId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.id.toLowerCase().includes(searchQuery.toLowerCase());

            const originName = locations.find(l => l.id === m.fromLocationId)?.name || '';
            const destName = locations.find(l => l.id === m.toLocationId)?.name || '';

            const matchesOrigin = !filterOrigin || originName.toLowerCase().includes(filterOrigin.toLowerCase());
            const matchesDest = !filterDestination || destName.toLowerCase().includes(filterDestination.toLowerCase());

            return matchesStatus && matchesSearch && matchesOrigin && matchesDest;
        });
    }, [localMovements, filterStatus, searchQuery, filterOrigin, filterDestination, assets, locations]);

    // Helpers
    const getAssetName = (id: string) => assets.find(a => a.id === id)?.name || id;
    const getAssetImage = (id: string) => assets.find(a => a.id === id)?.imageUrl || 'https://picsum.photos/200';
    const getLocationName = (id?: string) => locations.find(l => l.id === id)?.name || '-';
    const getUserName = (id?: string) => users.find(u => u.id === id)?.name || '-';

    const handleBatchSave = () => {
        if (selectedAssetIds.length === 0 || !targetLocationId || !targetResponsibleId) {
            alert("Selecione pelo menos um ativo, o destino e o responsável.");
            return;
        }

        selectedAssetIds.forEach(assetId => {
            const asset = assets.find(a => a.id === assetId);
            const movement: Movement = {
                id: `MOV-${Math.floor(Math.random() * 100000)}`,
                assetId: assetId,
                fromLocationId: asset?.locationId || 'UNKNOWN',
                fromResponsibleId: asset?.responsibleId || 'UNKNOWN',
                toLocationId: targetLocationId,
                toResponsibleId: targetResponsibleId,
                requestDate: new Date().toISOString(),
                status: MovementStatus.PENDING,
                justification: justification
            };
            setLocalMovements(prev => [movement, ...prev]);
            if (onAddMovement) onAddMovement(movement);
        });

        alert(`${selectedAssetIds.length} movimentações geradas com sucesso!`);
        setIsAddModalOpen(false);
        setSelectedAssetIds([]);
        setTargetLocationId('');
        setTargetResponsibleId('');
        setJustification('');
    };

    const filteredAssetsForSelection = assets.filter(a =>
        a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
        a.id.toLowerCase().includes(assetSearch.toLowerCase())
    );

    const toggleAssetSelection = (id: string) => {
        if (selectedAssetIds.includes(id)) {
            setSelectedAssetIds(selectedAssetIds.filter(sid => sid !== id));
        } else {
            setSelectedAssetIds([...selectedAssetIds, id]);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            {/* HEADER & FILTERS */}
            <div className="flex flex-col gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <ArrowLeftRight className="text-gov-600" size={28} />
                        <span className="uppercase tracking-tighter">Central de Movimentações</span>
                    </h2>
                    <Button onClick={() => setIsAddModalOpen(true)} className="h-12 px-8 rounded-2xl md:w-auto w-full shadow-lg bg-gov-900 text-white font-black uppercase tracking-widest text-xs hover:bg-gov-800 transition-all">
                        <Plus className="mr-2" size={18} /> Nova Transferência
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-200 transition-all placeholder:text-slate-400 text-sm"
                            placeholder="Buscar por Ativo, ID ou Protocolo..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-200 transition-all placeholder:text-slate-400 text-xs uppercase"
                            placeholder="Filtrar Origem..."
                            value={filterOrigin}
                            onChange={e => setFilterOrigin(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-200 transition-all placeholder:text-slate-400 text-xs uppercase"
                            placeholder="Filtrar Destino..."
                            value={filterDestination}
                            onChange={e => setFilterDestination(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABS */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
                    {[
                        { id: 'ALL', label: 'Todos os Registros' },
                        { id: MovementStatus.PENDING, label: 'Pendentes' },
                        { id: MovementStatus.APPROVED, label: 'Aprovados' },
                        { id: MovementStatus.REJECTED, label: 'Rejeitados' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id as any)}
                            className={`flex-1 min-w-[120px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === tab.id ? 'bg-white text-gov-900 shadow-md transform scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIST VIEW */}
            <div className="space-y-4">
                {filteredMovements.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <Box size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum registro encontrado</p>
                    </div>
                ) : (
                    filteredMovements.map(mov => (
                        <div key={mov.id} className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-gov-200 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 cursor-pointer">
                            <div className="relative w-full md:w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-lg">
                                <img src={getAssetImage(mov.assetId)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>

                            <div className="flex-1 w-full md:w-auto space-y-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight">{getAssetName(mov.assetId)}</h4>
                                    <Badge color={mov.status === MovementStatus.APPROVED ? 'green' : mov.status === MovementStatus.REJECTED ? 'red' : 'yellow'} className="text-[9px] font-black">{mov.status}</Badge>
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-red-400" /> <span className="line-through opacity-60">{getLocationName(mov.fromLocationId)}</span> <ArrowRight size={10} className="text-gov-400" /> <span className="font-bold text-gov-700">{getLocationName(mov.toLocationId)}</span></span>
                                    <span className="flex items-center gap-1.5"><UserIcon size={12} className="text-slate-400" /> {getUserName(mov.toResponsibleId)}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {new Date(mov.requestDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                {mov.status === MovementStatus.PENDING && (
                                    <>
                                        <button
                                            onClick={() => {
                                                const updated = localMovements.map(m => m.id === mov.id ? { ...m, status: MovementStatus.APPROVED } : m);
                                                setLocalMovements(updated);
                                                if (onApprove) onApprove(mov, true);
                                            }}
                                            className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                            title="Aprovar"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const updated = localMovements.map(m => m.id === mov.id ? { ...m, status: MovementStatus.REJECTED } : m);
                                                setLocalMovements(updated);
                                                if (onApprove) onApprove(mov, false);
                                            }}
                                            className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            title="Rejeitar"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )))}
            </div>
            {/* ADD MOVEMENT MODAL */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Nova Transferência em Lote"
                size="lg"
            >
                <div className="space-y-6">
                    {/* ASSET SELECTION */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">1. Selecione os Ativos ({selectedAssetIds.length} selecionados)</label>
                        <Input
                            placeholder="Buscar ativos para adicionar..."
                            value={assetSearch}
                            onChange={e => setAssetSearch(e.target.value)}
                            className="mb-2"
                        />
                        <div className="h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 custom-scroll bg-slate-50">
                            {filteredAssetsForSelection.map(asset => (
                                <div
                                    key={asset.id}
                                    onClick={() => toggleAssetSelection(asset.id)}
                                    className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${selectedAssetIds.includes(asset.id) ? 'bg-gov-100 border-gov-500 ring-1 ring-gov-500' : 'bg-white hover:bg-slate-100'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedAssetIds.includes(asset.id) ? 'bg-gov-600 border-gov-600' : 'border-slate-300'}`}>
                                            {selectedAssetIds.includes(asset.id) && <CheckCircle size={10} className="text-white" />}
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-bold text-slate-800">{asset.name}</p>
                                            <p className="text-slate-400">{asset.id} • {getLocationName(asset.locationId)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Destino Solicitado</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-gov-500 outline-none transition-all"
                                value={targetLocationId}
                                onChange={e => setTargetLocationId(e.target.value)}
                            >
                                <option value="">Selecione o Destino...</option>
                                {locations.map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Responsável no Destino</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-gov-500 outline-none transition-all"
                                value={targetResponsibleId}
                                onChange={e => setTargetResponsibleId(e.target.value)}
                            >
                                <option value="">Selecione o Responsável...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Justificativa da Transferência</label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-gov-500 outline-none transition-all"
                            rows={4}
                            placeholder="Descreva detalhadamente o motivo desta movimentação..."
                            value={justification}
                            onChange={e => setJustification(e.target.value)}
                        />
                    </div>

                    <div className="pt-6 flex gap-4 border-t border-gray-100">
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                        <Button fullWidth onClick={handleBatchSave} className="bg-gov-900 text-white shadow-xl h-14 text-sm tracking-wide font-bold uppercase rounded-xl hover:scale-[1.02] transition-transform">
                            <CheckCircle className="w-5 h-5 mr-2" /> Confirmar Solicitação
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
};
