import React, { useState, useMemo, useRef } from 'react';
import { Asset, User, Location, AssetCategory, AssetState, CostRecord } from '../types';
import { UserRole, UserStatus, MaintenanceStatus } from '../types';
import {
    Truck, Users, Plus, CheckCircle, Gauge, AlertCircle,
    Calendar, Fuel, ShieldCheck, MapPin, Search, ChevronRight,
    Activity, MoreVertical, Camera, Tag, Save, UserPlus, Info,
    User as UserIcon, DollarSign, Trash2, Edit2, History, X,
    ArrowRightLeft, Settings, Phone, Mail, BadgeCheck, UserCog,
    Zap, RefreshCcw, ShieldPlus, Building2
} from 'lucide-react';
import { Button, Modal, Input, Badge, Card, ConfirmModal, SearchableSelect } from '../components/Shared';

interface VehiclePageProps {
    assets: Asset[];
    users: User[];
    locations: Location[];
    costs?: CostRecord[];
    onAddAsset: (asset: Asset) => void;
    onUpdateAsset: (asset: Asset) => void;
    onDeleteAsset: (id: string) => void;
    onImportAssets: (assets: Asset[]) => void;
    onUpdateUser: (user: User) => void;
    onAddUser?: (user: User) => void;
}

type VehicleTab = 'DASHBOARD' | 'FLEET' | 'DRIVERS';

export const VehiclePage: React.FC<VehiclePageProps> = ({
    assets, users, locations, costs = [], onAddAsset, onUpdateAsset, onDeleteAsset, onAddUser, onUpdateUser
}) => {
    const [activeTab, setActiveTab] = useState<VehicleTab>('DASHBOARD');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
    const [viewingHistory, setViewingHistory] = useState<Asset | null>(null);
    const [vehicleMenuOpen, setVehicleMenuOpen] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

    const [modalTab, setModalTab] = useState<'GERAL' | 'OPERACIONAL' | 'CONTABIL'>('GERAL');
    const [searchTerm, setSearchTerm] = useState('');

    const fileInputVehicle = useRef<HTMLInputElement>(null);

    // Estados de Formulário
    const [newVehicle, setNewVehicle] = useState<Partial<Asset>>({
        id: '', name: '', category: AssetCategory.VEHICLE, state: AssetState.GOOD,
        plate: '', model: '', odometer: 0, fuelType: 'DIESEL', imageUrl: '',
        responsibleId: '',
        accounting: { acquisitionValue: 0, residualValue: 0, usefulLifeYears: 5, accumulatedDepreciation: 0 }
    });

    const [newDriver, setNewDriver] = useState({
        name: '', email: '', phone: '', department: ''
    });

    const fleet = useMemo(() => assets.filter(a => a.category === AssetCategory.VEHICLE), [assets]);

    const drivers = useMemo(() => users.filter(u =>
        u.role === UserRole.OPERATOR ||
        u.department?.toLowerCase().includes('transporte') ||
        u.department?.toLowerCase().includes('frota') ||
        u.department?.toLowerCase().includes('infraestrutura')
    ), [users]);

    // Função para Gerar ID de Patrimônio
    const generateAssetId = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        const newId = `FRO-2025-${random}`;
        setNewVehicle(prev => ({ ...prev, id: newId }));
    };

    const handleSaveVehicle = () => {
        if (!newVehicle.name || !newVehicle.plate || !newVehicle.id) {
            alert("Erro: Informe o Patrimônio, Descrição e Placa do veículo.");
            return;
        }

        const asset: Asset = {
            id: newVehicle.id.toUpperCase(),
            name: newVehicle.name.toUpperCase(),
            category: AssetCategory.VEHICLE,
            state: newVehicle.state || AssetState.GOOD,
            locationId: newVehicle.locationId || locations[0]?.id || 'LOC-1',
            responsibleId: newVehicle.responsibleId || 'PENDING',
            purchaseDate: newVehicle.purchaseDate || new Date().toISOString().split('T')[0],
            plate: newVehicle.plate.toUpperCase(),
            model: newVehicle.model?.toUpperCase(),
            odometer: Number(newVehicle.odometer) || 0,
            fuelType: newVehicle.fuelType || 'FLEX',
            imageUrl: newVehicle.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
            accounting: newVehicle.accounting
        };

        onAddAsset(asset);
        setIsAddModalOpen(false);
        resetVehicleForm();
    };

    const handleSaveDriver = () => {
        if (!newDriver.name || !newDriver.email) {
            alert("Nome e E-mail são obrigatórios.");
            return;
        }

        if (onAddUser) {
            onAddUser({
                id: `DRV-${Date.now()}`,
                name: newDriver.name,
                email: newDriver.email,
                phone: newDriver.phone,
                department: newDriver.department || 'Transporte',
                role: UserRole.OPERATOR,
                status: UserStatus.ACTIVE,
                avatarUrl: `https://i.pravatar.cc/150?u=${newDriver.email}`
            });
        }
        setIsAddDriverModalOpen(false);
        setNewDriver({ name: '', email: '', phone: '', department: '' });
    };

    const resetVehicleForm = () => {
        setNewVehicle({ id: '', name: '', category: AssetCategory.VEHICLE, state: AssetState.GOOD, plate: '', model: '', odometer: 0, fuelType: 'DIESEL', responsibleId: '' });
        setModalTab('GERAL');
    };

    const handleDelete = () => {
        if (vehicleToDelete) {
            onDeleteAsset(vehicleToDelete);
            setIsDeleteConfirmOpen(false);
            setVehicleToDelete(null);
        }
    };

    const handleEditVehicle = (vehicle: Asset) => {
        setNewVehicle({
            id: vehicle.id,
            name: vehicle.name,
            category: vehicle.category,
            state: vehicle.state,
            plate: vehicle.plate,
            model: vehicle.model,
            odometer: vehicle.odometer,
            fuelType: vehicle.fuelType,
            imageUrl: vehicle.imageUrl,
            responsibleId: vehicle.responsibleId,
            locationId: vehicle.locationId,
            purchaseDate: vehicle.purchaseDate,
            accounting: vehicle.accounting
        });
        setVehicleMenuOpen(null);
        setIsAddModalOpen(true);
    };

    const handleTransfer = (vehicle: Asset) => {
        handleEditVehicle(vehicle);
        setModalTab('OPERACIONAL');
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            {/* HEADER INTEGRADO */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10"><Truck size={160} /></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div>
                        <Badge color="blue" className="mb-4 px-4 py-1.5 font-black uppercase text-[10px] tracking-[0.2em] border-none bg-blue-500/20 text-blue-400">Logística de Frota Pública</Badge>
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Gestão de Veículos</h2>
                        <p className="text-slate-400 mt-2 font-medium">Monitoramento de odômetro, combustíveis e condutores oficiais.</p>
                    </div>
                    <div className="flex bg-white/10 p-2 rounded-[1.8rem] backdrop-blur-md border border-white/5 no-print">
                        {(['DASHBOARD', 'FLEET', 'DRIVERS'] as VehicleTab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'}`}
                            >
                                {tab === 'DASHBOARD' ? 'Indicadores' : tab === 'FLEET' ? 'Veículos' : 'Condutores'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="animate-fadeIn">
                {activeTab === 'DASHBOARD' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 rounded-[2.5rem] p-8 border-none shadow-sm bg-white">
                            <div className="flex justify-between items-center mb-8 px-2">
                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                                    <Activity className="text-gov-600" size={18} /> Unidades em Operação
                                </h3>
                                <Button onClick={() => setIsAddModalOpen(true)} className="h-12 px-6 rounded-2xl bg-gov-900 text-[10px] font-black uppercase">
                                    <Plus size={18} className="mr-2" /> Protocolar Veículo
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {fleet.slice(0, 5).map(v => (
                                    <div
                                        key={v.id}
                                        onClick={() => setViewingHistory(v)}
                                        className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:shadow-md hover:bg-slate-100 transition-all group cursor-pointer active:scale-[0.98]"
                                        title="Clique para ver o dossiê completo"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gov-600 shadow-sm font-black group-hover:bg-gov-900 group-hover:text-white transition-all">{v.plate?.substring(0, 3)}</div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase leading-none">{v.name}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge color="gray" className="text-[9px] font-mono font-black border-none bg-slate-200">{v.plate}</Badge>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1"><Gauge size={10} /> {v.odometer?.toLocaleString() || 0} KM</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-gov-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                                {fleet.length === 0 && <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px]">Nenhum veículo cadastrado na base.</p>}
                            </div>
                        </Card>
                        <div className="space-y-6">
                            <Card className="rounded-[2.5rem] bg-white text-slate-900 p-8 border border-slate-100 shadow-xl relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Activity size={100} className="text-slate-900" /></div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 opacity-60">Relatório Executivo</p>
                                <h4 className="text-3xl font-black uppercase tracking-tight text-slate-900">Carga Ativa</h4>
                                <div className="mt-8 flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-[1.5rem] bg-gov-900 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                        {fleet.length}
                                    </div>
                                    <p className="text-xs text-slate-800 font-black leading-relaxed uppercase">Veículos Oficiais<br />Auditados e Ativos</p>
                                </div>
                            </Card>

                            <Card className="rounded-[2.5rem] bg-amber-50 border border-amber-100 p-8 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl text-amber-600 shadow-sm"><Fuel size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Controle de Insumos</p>
                                        <p className="text-sm font-black text-amber-900 uppercase">
                                            {fleet.length > 0
                                                ? (Object.entries(fleet.reduce((acc, v) => {
                                                    acc[v.fuelType || 'FLEX'] = (acc[v.fuelType || 'FLEX'] || 0) + 1;
                                                    return acc;
                                                }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || '--') + ' PREDOMINANTE'
                                                : 'SEM DADOS DE FROTA'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'FLEET' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Frota de Veículos</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Listagem completa de ativos automotivos.</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold w-64 focus:ring-2 focus:ring-gov-500 transition-all outline-none"
                                    placeholder="Placa ou Descrição..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {fleet.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.plate?.toLowerCase().includes(searchTerm.toLowerCase())).map(vehicle => (
                                <Card key={vehicle.id} className="p-0 overflow-hidden rounded-[3rem] border-none shadow-lg hover:shadow-2xl transition-all group bg-white relative">
                                    <div className="absolute top-6 right-6 z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setVehicleMenuOpen(vehicleMenuOpen === vehicle.id ? null : vehicle.id); }}
                                            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-slate-600 hover:bg-gov-900 hover:text-white transition-all"
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        {vehicleMenuOpen === vehicle.id && (
                                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-fadeIn z-30">
                                                <button onClick={() => handleEditVehicle(vehicle)} className="w-full text-left p-4 hover:bg-slate-50 rounded-xl flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-tighter"><Edit2 size={16} className="text-blue-500" /> Editar Veículo</button>
                                                <button onClick={() => handleTransfer(vehicle)} className="w-full text-left p-4 hover:bg-slate-50 rounded-xl flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-tighter"><ArrowRightLeft size={16} className="text-gov-500" /> Transferir Guarda</button>
                                                <button onClick={() => { setVehicleToDelete(vehicle.id); setIsDeleteConfirmOpen(true); }} className="w-full text-left p-4 hover:bg-red-50 rounded-xl flex items-center gap-3 text-xs font-black text-red-500 border-t uppercase tracking-tighter"><Trash2 size={16} /> Baixa Patrimonial</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-56 relative overflow-hidden bg-slate-200">
                                        <img src={vehicle.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                                        <div className="absolute bottom-6 left-6 flex gap-2">
                                            <Badge color="blue" className="bg-white/90 backdrop-blur-md border-none font-black text-[10px] px-4 py-1.5 shadow-xl text-slate-900">{vehicle.plate}</Badge>
                                            <Badge color={vehicle.state === AssetState.GOOD ? 'green' : 'yellow'} className="bg-white/90 backdrop-blur-md border-none font-black uppercase text-[8px] px-3 shadow-xl">{vehicle.state}</Badge>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight mb-6 line-clamp-1">{vehicle.name}</h4>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner text-center">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Kilometragem</p>
                                                <p className="text-sm font-black text-slate-800">{vehicle.odometer?.toLocaleString() || 0} KM</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner text-center">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Energia</p>
                                                <p className="text-sm font-black text-slate-800 uppercase">{vehicle.fuelType || 'FLEX'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?u=${vehicle.responsibleId}`} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fiel Depositário</p>
                                                    <p className="text-[10px] font-black text-slate-700 uppercase truncate w-32">{users.find(u => u.id === vehicle.responsibleId)?.name || 'Sem Condutor'}</p>
                                                </div>
                                            </div>
                                            <Button onClick={() => setViewingHistory(vehicle)} variant="secondary" className="h-12 px-6 rounded-2xl font-black text-[9px] uppercase tracking-widest bg-white border-slate-200">
                                                <History size={16} className="mr-2" /> Dossiê
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'DRIVERS' && (
                    <div className="space-y-6">
                        <div className="bg-indigo-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center shadow-xl gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5"><Users size={32} /></div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Grade de Condutores</h3>
                                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mt-1">Agentes públicos habilitados para condução.</p>
                                </div>
                            </div>
                            <Button onClick={() => setIsAddDriverModalOpen(true)} className="bg-indigo-950 text-white border-2 border-indigo-800 h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-900">
                                <UserPlus size={20} className="mr-2" /> Registrar Condutor
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {drivers.map(driver => {
                                const assignedVehicles = fleet.filter(v => v.responsibleId === driver.id);
                                return (
                                    <Card key={driver.id} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:shadow-xl transition-all group">
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="relative">
                                                <img src={driver.avatarUrl} className="w-20 h-20 rounded-[1.8rem] object-cover border-4 border-slate-50 shadow-md" />
                                                <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-xl border-4 border-white shadow-lg"><BadgeCheck size={14} /></div>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-tight truncate">{driver.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{driver.department}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold"><Phone size={14} className="text-gov-500" /> {driver.phone || '(83) 90000-0000'}</div>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold"><Mail size={14} className="text-gov-500" /> {driver.email}</div>
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Vínculo Atual</p>
                                            {assignedVehicles.length > 0 ? (
                                                <div className="space-y-2">
                                                    {assignedVehicles.map(v => (
                                                        <div key={v.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                                            <span className="text-[10px] font-black text-slate-700 uppercase truncate w-24">{v.name}</span>
                                                            <Badge color="blue" className="text-[8px] font-mono">{v.plate}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-slate-400 font-bold uppercase italic text-center py-2">Sem veículo sob guarda</p>
                                            )}
                                        </div>

                                        <Button fullWidth variant="secondary" className="mt-8 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200 hover:bg-indigo-900 hover:text-white transition-all">
                                            Ver Ficha do Agente
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL: PROTOCOLAR VEÍCULO */}
            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetVehicleForm(); }} title="Protocolar Unidade de Frota" size="lg">
                <div className="space-y-6">
                    <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
                        {['GERAL', 'OPERACIONAL', 'CONTABIL'].map(t => (
                            <button key={t} onClick={() => setModalTab(t as any)} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${modalTab === t ? 'bg-white text-gov-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[480px]">
                        {modalTab === 'GERAL' && (
                            <div className="space-y-5 animate-fadeIn">
                                <div className="relative group">
                                    <Input
                                        label="Número de Patrimônio (Tombamento)"
                                        placeholder="Clique para gerar ou digite..."
                                        value={newVehicle.id}
                                        onChange={e => setNewVehicle({ ...newVehicle, id: e.target.value })}
                                        icon={<Tag size={18} />}
                                        className="pr-20"
                                    />
                                    <button
                                        onClick={generateAssetId}
                                        className="absolute right-3 top-[34px] p-2 bg-gov-100 text-gov-600 rounded-lg hover:bg-gov-900 hover:text-white transition-all group-hover:scale-110 active:scale-95 z-10"
                                        title="Gerar ID Automático"
                                    >
                                        <Zap size={16} fill="currentColor" />
                                    </button>
                                </div>

                                <Input label="Modelo / Descrição do Veículo" placeholder="EX: TOYOTA HILUX SW4 BRANCA" value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} icon={<Truck size={18} />} />

                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Placa Oficial" placeholder="ABC-1234" value={newVehicle.plate} onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })} icon={<ShieldPlus size={18} />} />
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Estado de Conservação</label>
                                        <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase shadow-sm outline-none focus:ring-4 focus:ring-gov-500/10" value={newVehicle.state} onChange={e => setNewVehicle({ ...newVehicle, state: e.target.value as any })}>
                                            <option value={AssetState.GOOD}>Bom Estado</option>
                                            <option value={AssetState.REGULAR}>Regular</option>
                                            <option value={AssetState.BAD}>Ruim</option>
                                            <option value={AssetState.REQUIRES_MAINTENANCE}>Requer Manutenção</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Evidência Fotográfica</label>
                                    <div onClick={() => fileInputVehicle.current?.click()} className="h-48 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-gov-500 transition-all shadow-inner">
                                        {newVehicle.imageUrl ? <img src={newVehicle.imageUrl} className="w-full h-full object-cover" /> : <div className="text-center text-slate-300 group-hover:text-gov-500 transition-colors"><Camera size={44} /><p className="text-[9px] font-black uppercase mt-3">Anexar foto do veículo</p></div>}
                                        <input type="file" ref={fileInputVehicle} className="hidden" accept="image/*" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setNewVehicle(v => ({ ...v, imageUrl: reader.result as string }));
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalTab === 'OPERACIONAL' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex gap-6 shadow-2xl relative overflow-hidden">
                                    <Activity className="absolute -right-6 -bottom-6 opacity-10" size={140} />
                                    <div className="p-5 bg-gov-600 rounded-2xl flex items-center justify-center shadow-xl"><Gauge size={24} /></div>
                                    <div>
                                        <h4 className="text-xl font-black uppercase tracking-tight text-white">Parâmetros de Rodagem</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest leading-relaxed">Controle de odômetro e fiel depositário.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Odômetro Inicial (KM)" type="number" placeholder="0" value={newVehicle.odometer} onChange={e => setNewVehicle({ ...newVehicle, odometer: Number(e.target.value) })} icon={<History size={18} />} />
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Matriz Energética</label>
                                        <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:ring-4 focus:ring-gov-500/10 shadow-sm" value={newVehicle.fuelType} onChange={e => setNewVehicle({ ...newVehicle, fuelType: e.target.value })}>
                                            <option value="DIESEL">Diesel S10</option>
                                            <option value="GASOLINA">Gasolina Comum</option>
                                            <option value="FLEX">Flex (Álcool/Gasolina)</option>
                                            <option value="ELETRICO">Elétrico / Híbrido</option>
                                        </select>
                                    </div>
                                </div>

                                {/* SELEÇÃO DE CONDUTOR */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Vincular Condutor (Fiel Depositário)</label>
                                    <SearchableSelect
                                        options={drivers.map(d => ({ value: d.id, label: d.name, subLabel: d.department }))}
                                        value={newVehicle.responsibleId || ''}
                                        onChange={(val) => setNewVehicle({ ...newVehicle, responsibleId: val })}
                                        placeholder="Selecione o condutor..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {modalTab === 'CONTABIL' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                <Input label="Valor do Ativo (R$)" type="number" value={newVehicle.accounting?.acquisitionValue} onChange={e => setNewVehicle({ ...newVehicle, accounting: { ...newVehicle.accounting!, acquisitionValue: Number(e.target.value) } })} icon={<DollarSign size={18} />} />
                                <Input label="Data de Registro" type="date" value={newVehicle.purchaseDate} onChange={e => setNewVehicle({ ...newVehicle, purchaseDate: e.target.value })} icon={<Calendar size={18} />} />
                                <Input label="Vida Útil Fiscal (Anos)" type="number" defaultValue={5} icon={<History size={18} />} />
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Alocação Geográfica</label>
                                    <SearchableSelect
                                        options={locations.map(l => ({ value: l.id, label: l.name }))}
                                        value={newVehicle.locationId || ''}
                                        onChange={(val) => setNewVehicle({ ...newVehicle, locationId: val })}
                                        placeholder="Selecione o local..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex flex-col gap-3">
                        <Button onClick={handleSaveVehicle} fullWidth className="h-20 bg-gov-900 rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl text-white hover:scale-[1.02] border-none transition-all">
                            Efetivar Protocolo de Veículo
                        </Button>
                        <Button variant="ghost" onClick={() => { setIsAddModalOpen(false); resetVehicleForm(); }} className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-12">Descartar Registro</Button>
                    </div>
                </div>
            </Modal>

            {/* MODAL: CADASTRAR NOVO CONDUTOR */}
            <Modal isOpen={isAddDriverModalOpen} onClose={() => setIsAddDriverModalOpen(false)} title="Registrar Agente de Frota" size="md">
                <div className="space-y-6">
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex gap-6 relative overflow-hidden shadow-xl">
                        <UserCog size={120} className="absolute -right-6 -bottom-6 opacity-10" />
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner"><UserPlus size={32} /></div>
                        <div>
                            <h4 className="text-xl font-black uppercase tracking-tight">Habilitar Condutor</h4>
                            <p className="text-xs text-indigo-100 opacity-80 mt-1">Cadastro de agentes para condução de veículos oficiais.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input label="Nome Completo do Agente" placeholder="Nome completo" value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} icon={<UserIcon size={18} />} />
                        <Input label="E-mail Funcional" placeholder="agente@gov.br" type="email" value={newDriver.email} onChange={e => setNewDriver({ ...newDriver, email: e.target.value })} icon={<Mail size={18} />} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Telefone / Contato" placeholder="(00) 00000-0000" value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} icon={<Phone size={18} />} />
                            <Input label="Sessão / Unidade" placeholder="Ex: Secretaria de Saúde" value={newDriver.department} onChange={e => setNewDriver({ ...newDriver, department: e.target.value })} icon={<Building2 size={18} />} />
                        </div>
                    </div>

                    <Button onClick={handleSaveDriver} fullWidth className="h-16 bg-indigo-900 rounded-2xl font-black uppercase text-[11px] tracking-widest text-white shadow-xl hover:bg-indigo-800 transition-all border-none">
                        Finalizar Cadastro de Condutor
                    </Button>
                </div>
            </Modal>

            {/* MODAL: HISTÓRICO FORENSE / DOSSIÊ */}
            <Modal isOpen={!!viewingHistory} onClose={() => setViewingHistory(null)} title={`Dossiê Operacional: ${viewingHistory?.plate}`} size="lg">
                {viewingHistory && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center shadow-inner gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-white rounded-2xl shadow-sm text-gov-600 border border-slate-100"><History size={28} /></div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Dossiê do Ativo</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Histórico Completo & Status</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge color={viewingHistory.state === AssetState.GOOD ? 'green' : viewingHistory.state === AssetState.REQUIRES_MAINTENANCE ? 'red' : 'yellow'} className="px-5 py-2 font-black uppercase text-[11px] border-none shadow-md">
                                    {viewingHistory.state}
                                </Badge>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewingHistory.odometer?.toLocaleString()} KM RODADOS</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><UserIcon size={100} /></div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Condutor Responsável Atual</p>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?u=${viewingHistory.responsibleId}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-slate-800 uppercase leading-tight">{users.find(u => u.id === viewingHistory.responsibleId)?.name || 'Não Atribuído'}</h5>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Matrícula: {viewingHistory.responsibleId || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><Settings size={100} /></div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Status de Manutenção</p>
                                <div className="relative z-10">
                                    {viewingHistory.state === AssetState.REQUIRES_MAINTENANCE ? (
                                        <div className="flex items-center gap-3 text-red-600">
                                            <AlertCircle size={32} />
                                            <div>
                                                <h5 className="text-sm font-black uppercase leading-tight">Intervenção Necessária</h5>
                                                <p className="text-[10px] text-red-400 font-bold uppercase mt-1">Agendar serviço imediato</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-emerald-600">
                                            <CheckCircle size={32} />
                                            <div>
                                                <h5 className="text-sm font-black uppercase leading-tight">Operacional</h5>
                                                <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Nenhuma pendência ativa</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 relative ml-8 mr-4 pt-4">
                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Linha do Tempo de Eventos</h5>
                            <div className="absolute left-[-1.5rem] top-12 bottom-0 w-1 bg-slate-100 rounded-full"></div>
                            {[
                                { date: '12/05/2024', event: 'Troca de Óleo e Filtros - Oficina Autorizada', type: 'MANUTENÇÃO', icon: <Settings />, color: 'emerald' },
                                { date: '10/01/2024', event: 'Carga Inicial do Bem no Sistema', type: 'SISTEMA', icon: <Save />, color: 'gov' }
                            ].map((log, i) => (
                                <div key={i} className="relative group animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className={`absolute left-[-2.3rem] top-1 w-6 h-6 rounded-full bg-white border-4 shadow-md z-10 transition-all`} style={{ borderColor: log.color === 'emerald' ? '#10b981' : '#0c4a6e' }}></div>
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <h5 className="text-sm font-black text-slate-800 uppercase leading-snug w-3/4">{log.event}</h5>
                                            <Badge color="gray" className="text-[7px] font-black tracking-widest border-none bg-slate-100">{log.type}</Badge>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={12} /> {log.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button onClick={() => setViewingHistory(null)} fullWidth className="h-16 bg-gov-900 text-white rounded-3xl uppercase font-black text-[11px] tracking-widest shadow-2xl border-none">
                            Fechar Dossiê Operacional
                        </Button>
                    </div>
                )}
            </Modal>

            <ConfirmModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={handleDelete} title="Confirmar Baixa Patrimonial" message="Deseja remover este veículo da frota ativa? Este procedimento gera um registro definitivo no ledger de auditoria." />
        </div>
    );
};