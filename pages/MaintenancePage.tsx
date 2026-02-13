
import React, { useState, useMemo } from 'react';
import { Asset, Maintenance, MaintenanceStatus, CostRecord, Supplier, MaintenanceCostType, MaintenanceLocation, MaintenanceType } from '../types';
import { Card, Button, Input, Modal, Badge, BadgeColor, SearchableSelect } from '../components/Shared';
import {
    Wrench, Calendar, DollarSign, Plus, Search,
    Clock, CheckCircle2, AlertTriangle, User,
    Truck, Settings, History, ArrowRight,
    Play, Check, XCircle, FileText, Landmark, Hourglass
} from 'lucide-react';
import { MOCK_SUPPLIERS } from '../constants';

interface MaintenancePageProps {
    assets: Asset[];
    suppliers: Supplier[];
    onUpdateAsset?: (asset: Asset) => void;
    onAddCost?: (cost: CostRecord) => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ assets, suppliers, onUpdateAsset, onAddCost }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [assetSearchTerm, setAssetSearchTerm] = useState('');

    const [newOS, setNewOS] = useState<Partial<Maintenance>>({
        type: MaintenanceType.CORRETIVA,
        date: new Date().toISOString().split('T')[0],
        expectedReturnDate: '',
        cost: 0,
        description: '',
        provider: '',
        supplierId: '',
        status: MaintenanceStatus.REQUESTED
    });

    const allMaintenanceOrders = useMemo(() => {
        return assets.flatMap(a => (a.maintenanceHistory || []).map(m => ({ ...m, assetName: a.name, assetTombo: a.id })));
    }, [assets]);

    const stats = useMemo(() => {
        const totalValue = allMaintenanceOrders.reduce((acc, m) => acc + m.cost, 0);
        const active = allMaintenanceOrders.filter(m => m.status !== MaintenanceStatus.FINISHED && m.status !== MaintenanceStatus.CANCELLED).length;
        const delayed = allMaintenanceOrders.filter(m => {
            if (!m.expectedReturnDate || m.status === MaintenanceStatus.FINISHED) return false;
            return new Date(m.expectedReturnDate) < new Date();
        }).length;
        return { totalValue, active, delayed };
    }, [allMaintenanceOrders]);

    const handleCreateOS = () => {
        if (!selectedAssetId || !newOS.description) return;

        const asset = assets.find(a => a.id === selectedAssetId);
        if (!asset) return;

        const maintenance: Maintenance = {
            id: `OS-${Date.now()}`,
            assetId: selectedAssetId,
            date: newOS.date!,
            expectedReturnDate: newOS.expectedReturnDate,
            type: newOS.type as any,
            reason: '',
            description: newOS.description!,
            cost: Number(newOS.cost) || 0,
            costType: MaintenanceCostType.SERVICO,
            provider: newOS.provider!,
            supplierId: newOS.supplierId,
            maintenanceLocation: MaintenanceLocation.OFICINA_EXTERNA,
            status: MaintenanceStatus.REQUESTED
        };

        const updatedAsset = { ...asset, maintenanceHistory: [maintenance, ...(asset.maintenanceHistory || [])] };
        if (onUpdateAsset) onUpdateAsset(updatedAsset);

        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setNewOS({ type: MaintenanceType.CORRETIVA, date: new Date().toISOString().split('T')[0], expectedReturnDate: '', cost: 0, description: '', provider: '', supplierId: '', status: MaintenanceStatus.REQUESTED });
        setSelectedAssetId('');
        setAssetSearchTerm('');
    };

    const handleAdvanceStatus = (tombo: string, osId: string) => {
        const asset = assets.find(a => a.id === tombo);
        if (!asset || !asset.maintenanceHistory) return;

        const os = asset.maintenanceHistory.find(m => m.id === osId);
        if (!os) return;

        let nextStatus: MaintenanceStatus = os.status;
        let shouldLiquidate = false;

        if (os.status === MaintenanceStatus.REQUESTED) nextStatus = MaintenanceStatus.BUDGETING;
        else if (os.status === MaintenanceStatus.BUDGETING) nextStatus = MaintenanceStatus.IN_PROGRESS;
        else if (os.status === MaintenanceStatus.IN_PROGRESS) {
            nextStatus = MaintenanceStatus.FINISHED;
            shouldLiquidate = true;
        }

        const updatedHistory = asset.maintenanceHistory.map(m =>
            m.id === osId ? { ...m, status: nextStatus, completedAt: shouldLiquidate ? new Date().toISOString() : undefined } : m
        );

        if (onUpdateAsset) onUpdateAsset({ ...asset, maintenanceHistory: updatedHistory });

        if (shouldLiquidate && onAddCost) {
            const costRecord: CostRecord = {
                id: `CUST-MAN-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'MAINTENANCE',
                description: `Liq. Manutenção OS: ${os.id} | Bem: ${asset.name} (${asset.id})`,
                value: os.cost,
                supplierId: os.supplierId || 'FORN-MAN-PADRAO',
                maintenanceId: os.id,
                invoiceNumber: `NF-OS-${os.id.split('-')[1]}`,
                status: 'PAGO'
            };
            onAddCost(costRecord);
            alert(`Sucesso! Manutenção enviada para a Central de Custos.`);
        }
    };

    const getStatusColor = (status: MaintenanceStatus): BadgeColor => {
        switch (status) {
            case MaintenanceStatus.FINISHED: return 'green';
            case MaintenanceStatus.IN_PROGRESS: return 'blue';
            case MaintenanceStatus.BUDGETING: return 'yellow';
            case MaintenanceStatus.REQUESTED: return 'orange';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-gov-600 bg-white shadow-sm p-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ativos em Reparo</span>
                        <span className="text-2xl font-black text-gov-800">{stats.active}</span>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-red-500 bg-white shadow-sm p-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Prazos Vencidos</span>
                        <span className="text-2xl font-black text-red-600">{stats.delayed}</span>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 bg-white shadow-sm p-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Investimento Acumulado</span>
                        <span className="text-2xl font-black text-emerald-600">R$ {stats.totalValue.toLocaleString()}</span>
                    </div>
                </Card>
                <Button onClick={() => setIsModalOpen(true)} className="h-full py-4 shadow-lg shadow-gov-100">
                    <Plus className="w-5 h-5 mr-2" /> Abrir Ordem de Manutenção
                </Button>
            </div>

            <div className="space-y-4">
                {allMaintenanceOrders
                    .filter(m => m.assetName.toLowerCase().includes(searchTerm.toLowerCase()) || m.assetTombo.includes(searchTerm))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(os => {
                        const isDelayed = os.expectedReturnDate && new Date(os.expectedReturnDate) < new Date() && os.status !== MaintenanceStatus.FINISHED;
                        return (
                            <Card key={os.id} className={`border-l-4 ${isDelayed ? 'border-l-red-600 bg-red-50/20' : 'border-l-gov-500'} shadow-md`}>
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Badge color={getStatusColor(os.status)}>{os.status}</Badge>
                                            <span className="text-[10px] font-mono text-gray-400">{os.id}</span>
                                            {isDelayed && <Badge color="red" className="animate-pulse">ATRASADO</Badge>}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-800 uppercase">{os.assetName}</h3>
                                            <p className="text-[11px] text-gov-600 font-mono font-black">TOMBO: {os.assetTombo}</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/50 p-3 rounded-xl border">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase">Prestador</p>
                                                <p className="text-xs font-bold text-gray-700 uppercase">{os.provider || 'A definir'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase">Valor do Serviço</p>
                                                <p className="text-xs font-bold text-emerald-600">R$ {os.cost.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase">Data de Saída</p>
                                                <p className="text-xs font-bold text-gray-700">{new Date(os.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase">Previsão de Volta</p>
                                                <p className={`text-xs font-bold ${isDelayed ? 'text-red-600' : 'text-blue-600'}`}>{os.expectedReturnDate ? new Date(os.expectedReturnDate).toLocaleDateString() : 'Não informada'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-end gap-2 min-w-[180px]">
                                        {os.status !== MaintenanceStatus.FINISHED && (
                                            <Button className="w-full bg-gov-900 text-[10px] font-black" onClick={() => handleAdvanceStatus(os.assetTombo, os.id)}>
                                                {os.status === MaintenanceStatus.REQUESTED && "ABRIR ORÇAMENTO"}
                                                {os.status === MaintenanceStatus.BUDGETING && "AUTORIZAR INÍCIO"}
                                                {os.status === MaintenanceStatus.IN_PROGRESS && "CONFIRMAR VOLTA / LIQUIDAR"}
                                            </Button>
                                        )}
                                        {os.status === MaintenanceStatus.FINISHED && (
                                            <div className="text-right">
                                                <p className="text-[10px] text-emerald-600 font-black">CONCLUÍDO EM</p>
                                                <p className="text-sm font-bold text-slate-800">{new Date(os.completedAt!).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Ordem de Manutenção Patrimonial">
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">1. Selecionar Patrimônio</label>
                        <SearchableSelect
                            options={assets.map(a => ({ value: a.id, label: a.name, subLabel: a.id }))}
                            value={selectedAssetId}
                            onChange={setSelectedAssetId}
                            placeholder="Selecione um bem..."
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-4">
                        <Input label="Descrição do Problema / Serviço" value={newOS.description} onChange={e => setNewOS({ ...newOS, description: e.target.value })} />

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Valor Estimado (R$)" type="number" value={newOS.cost} onChange={e => setNewOS({ ...newOS, cost: Number(e.target.value) })} />
                            <Input label="Previsão de Retorno" type="date" value={newOS.expectedReturnDate} onChange={e => setNewOS({ ...newOS, expectedReturnDate: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Vincular Prestador Credenciado</label>
                            <select
                                className="w-full border rounded-lg p-2 text-xs font-bold"
                                value={newOS.supplierId}
                                onChange={e => {
                                    const sup = suppliers.find(s => s.id === e.target.value);
                                    setNewOS({ ...newOS, supplierId: e.target.value, provider: sup?.name || '' });
                                }}
                            >
                                <option value="">Selecione...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <Button onClick={handleCreateOS} className="w-full h-12 bg-gov-900 font-black uppercase">Registrar Saída para Manutenção</Button>
                </div>
            </Modal>
        </div>
    );
};