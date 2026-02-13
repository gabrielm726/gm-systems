import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { Asset, Maintenance, MaintenanceStatus, CostRecord, Supplier, MaintenanceType, MaintenanceLocation, MaintenanceCostType } from '../types';
import { Card, Button, Input, Modal, Badge, SearchableSelect } from '../components/Shared';
import {
    Wrench, Calendar, DollarSign, Plus, Search,
    Clock, CheckCircle2, AlertTriangle, History,
    Eye, Building, Package, ArrowRight,
    Receipt, Settings, User, FileText
} from 'lucide-react';

interface AssetMaintenancePageProps {
    assets: Asset[];
    suppliers: Supplier[];
    onUpdateAsset?: (asset: Asset) => void;
    onAddCost?: (cost: CostRecord) => void;
}

export const AssetMaintenancePage: React.FC<AssetMaintenancePageProps> = ({ assets, suppliers, onUpdateAsset, onAddCost }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingOS, setViewingOS] = useState<Maintenance & { assetName: string; assetTombo: string } | null>(null);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [assetSearchTerm, setAssetSearchTerm] = useState('');

    // Fixed: Using MaintenanceType enum instead of string literal to match the defined type
    const [newOS, setNewOS] = useState<Partial<Maintenance>>({
        type: MaintenanceType.CORRETIVA, date: new Date().toISOString().split('T')[0],
        cost: 0, costType: MaintenanceCostType.SERVICO,
        description: '', supplierId: '', status: MaintenanceStatus.PENDENTE
    });

    const allMaintenanceOrders = useMemo(() => {
        return assets.flatMap(a => (a.maintenanceHistory || []).map(m => ({
            ...m, assetName: a.name, assetTombo: a.id
        })));
    }, [assets]);

    const handleCreateOS = () => {
        if (!selectedAssetId || !newOS.description || !newOS.supplierId) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }
        const asset = assets.find(a => a.id === selectedAssetId);
        const supplier = suppliers.find(s => s.id === newOS.supplierId);
        if (!asset || !supplier) return;

        const maintenance: Maintenance = {
            id: `OS-${Date.now()}`,
            assetId: selectedAssetId,
            date: newOS.date!,
            type: newOS.type as MaintenanceType,
            reason: newOS.reason || 'Manutenção Corretiva',
            description: newOS.description!,
            cost: Number(newOS.cost) || 0,
            costType: newOS.costType as MaintenanceCostType,
            provider: supplier.name,
            supplierId: newOS.supplierId,
            maintenanceLocation: MaintenanceLocation.OFICINA_EXTERNA,
            status: MaintenanceStatus.PENDENTE
        };

        if (onUpdateAsset) onUpdateAsset({ ...asset, maintenanceHistory: [maintenance, ...(asset.maintenanceHistory || [])] });
        if (onAddCost && maintenance.cost > 0) {
            onAddCost({
                id: `CUST-OS-${Date.now()}`, date: maintenance.date, type: 'MANUTENCAO',
                description: `OS: ${maintenance.id} | Bem: ${asset.name}`, value: maintenance.cost,
                supplierId: maintenance.supplierId!, status: 'PAGO'
            });
        }
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        // Fixed: Using MaintenanceType enum instead of string literal
        setNewOS({ type: MaintenanceType.CORRETIVA, date: new Date().toISOString().split('T')[0], cost: 0, description: '', supplierId: '', status: MaintenanceStatus.PENDENTE });
        setSelectedAssetId('');
    };

    const getStatusColor = (status: MaintenanceStatus) => {
        switch (status) {
            case MaintenanceStatus.FINALIZADA: return 'green';
            case MaintenanceStatus.EM_ANDAMENTO: return 'blue';
            case MaintenanceStatus.CANCELADA: return 'red';
            case MaintenanceStatus.PENDENTE: return 'orange';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gov-900 text-white rounded-2xl shadow-lg"><Wrench size={32} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Sistema de Manutenção</h2>
                        <p className="text-sm text-slate-500 font-medium">Controle de reparos, manutenções preventivas e corretivas.</p>
                    </div>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="h-12 px-8 rounded-2xl bg-gov-900 shadow-xl"><Plus size={20} className="mr-2" /> Abrir OS</Button>
            </div>

            <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[2.5rem]">
                <div className="overflow-x-auto custom-scroll">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest border-b border-slate-800">
                            <tr>
                                <th className="px-8 py-5">Ativo / Tombo</th>
                                <th className="px-8 py-5">Prestador</th>
                                <th className="px-8 py-5 text-right">Valor OS</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {allMaintenanceOrders.map(os => (
                                <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5">
                                        <p className="font-black text-slate-800 uppercase truncate w-48">{os.assetName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-1">{os.assetTombo}</p>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-700 uppercase">{os.provider}</td>
                                    <td className="px-8 py-5 text-right font-black text-slate-900">R$ {os.cost.toLocaleString('pt-BR')}</td>
                                    <td className="px-8 py-5 text-center"><Badge color={getStatusColor(os.status)}>{os.status}</Badge></td>
                                    <td className="px-8 py-5 text-right"><button onClick={() => setViewingOS(os)} className="p-2.5 bg-slate-100 rounded-xl text-gov-600 hover:bg-gov-900 hover:text-white transition-all"><Eye size={18} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Ordem de Serviço Integrada" size="xl">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Selecionar Patrimônio</label>
                            <SearchableSelect
                                options={assets.map(a => ({ value: a.id, label: a.name, subLabel: a.id }))}
                                value={selectedAssetId}
                                onChange={setSelectedAssetId}
                                placeholder="ESCOLHA O BEM NA LISTA..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Fornecedor Credenciado</label>
                            <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase" value={newOS.supplierId} onChange={e => setNewOS({ ...newOS, supplierId: e.target.value })}>
                                <option value="">ESCOLHA O PRESTADOR...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Valor do Reparo (R$)" type="number" value={newOS.cost} onChange={e => setNewOS({ ...newOS, cost: Number(e.target.value) })} />
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tipo Manutenção</label>
                            <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase" value={newOS.type} onChange={e => setNewOS({ ...newOS, type: e.target.value as MaintenanceType })}>
                                <option value={MaintenanceType.CORRETIVA}>{MaintenanceType.CORRETIVA}</option>
                                <option value={MaintenanceType.PREVENTIVA}>{MaintenanceType.PREVENTIVA}</option>
                                <option value={MaintenanceType.PREDITIVA}>{MaintenanceType.PREDITIVA}</option>
                            </select>
                        </div>
                        <Input label="Data de Abertura" type="date" value={newOS.date} onChange={e => setNewOS({ ...newOS, date: e.target.value })} />
                    </div>
                    <Input label="Descrição Técnica do Problema" type="textarea" value={newOS.description} onChange={e => setNewOS({ ...newOS, description: e.target.value })} />
                    <Button onClick={handleCreateOS} className="w-full h-16 bg-gov-900 font-black uppercase shadow-2xl rounded-3xl">Protocolar OS e Gerar Lançamento Contábil</Button>
                </div>
            </Modal>

        </div>
    );
};