import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/Shared';
import { Printer, FileText, CheckSquare, Filter, RefreshCw } from 'lucide-react';
import { Asset, User, Location } from '../types';

interface PrintManagerProps {
    assets?: Asset[];
    users?: User[];
    locations?: Location[];
}

export const PrintManager: React.FC<PrintManagerProps> = ({ assets = [], users = [], locations = [] }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState({
        category: '',
        state: '',
        responsibleId: '',
        locationId: ''
    });

    const filteredAssets = useMemo(() => {
        return assets.filter(a => {
            if (filters.category && a.category !== filters.category) return false;
            if (filters.state && a.state !== filters.state) return false;
            if (filters.responsibleId && a.responsibleId !== filters.responsibleId) return false;
            if (filters.locationId && a.locationId !== filters.locationId) return false;
            return true;
        });
    }, [assets, filters]);

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredAssets.length && filteredAssets.length > 0) {
            setSelectedIds(new Set());
        } else {
            const newSet = new Set(selectedIds);
            filteredAssets.forEach(a => newSet.add(a.id));
            setSelectedIds(newSet);
        }
    };

    const handlePrint = async () => {
        if (selectedIds.size === 0) {
            alert("Selecione pelo menos um item para imprimir.");
            return;
        }

        // Use the official Word template instead of browser print
        const { exportToWord } = await import('../utils/exportUtils');
        await exportToWord('GENERAL', {
            assets: assetsToPrint,
            users,
            locations
        });
    };

    const clearFilters = () => setFilters({ category: '', state: '', responsibleId: '', locationId: '' });

    // Filter assets for display in print view
    const assetsToPrint = assets.filter(a => selectedIds.has(a.id));

    return (
        <div className="space-y-6">
            <div className="no-print space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Central de Impressão</h2>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={toggleAll}>
                            {selectedIds.size > 0 && selectedIds.size === filteredAssets.length ? 'Desmarcar Visíveis' : 'Selecionar Visíveis'}
                        </Button>
                        <Button variant="primary" onClick={() => window.print()} disabled={selectedIds.size === 0}>
                            <Printer className="w-4 h-4 mr-2" />
                            Impressão Direta
                        </Button>
                        <Button onClick={handlePrint} disabled={selectedIds.size === 0}>
                            <FileText className="w-4 h-4 mr-2" />
                            Gerar Word (Oficial)
                        </Button>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Categoria</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase outline-none" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                            <option value="">Todas</option>
                            {Array.from(new Set(assets.map(a => a.category))).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Estado</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase outline-none" value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })}>
                            <option value="">Todos</option>
                            {Array.from(new Set(assets.map(a => a.state))).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Responsável</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase outline-none" value={filters.responsibleId} onChange={e => setFilters({ ...filters, responsibleId: e.target.value })}>
                            <option value="">Todos</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Localização/Setor</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase outline-none" value={filters.locationId} onChange={e => setFilters({ ...filters, locationId: e.target.value })}>
                            <option value="">Todas</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <Button variant="secondary" onClick={clearFilters} fullWidth className="h-[42px] rounded-xl text-[10px] font-black uppercase">
                            <RefreshCw size={14} className="mr-2" /> Limpar
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                        <input type="checkbox" checked={selectedIds.size === filteredAssets.length && filteredAssets.length > 0} onChange={toggleAll} />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tombamento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAssets.length > 0 ? filteredAssets.map(asset => (
                                    <tr key={asset.id} className={selectedIds.has(asset.id) ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(asset.id)}
                                                onChange={() => toggleSelection(asset.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                            <div className="text-xs text-gray-400">{asset.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-600">{asset.manufacturer || '-'}</div>
                                            <div className="text-xs text-gray-500">{asset.model || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color="gray">{asset.category}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {asset.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {locations.find(l => l.id === asset.locationId)?.name || asset.locationId}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-bold uppercase text-xs">Nenhum bem encontrado com estes filtros.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Print Only Section - Visible when printing */}
            <div className="hidden print:block p-8 bg-white h-full">
                <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
                    <div className="flex justify-center items-center mb-2 gap-4">
                        {/* Placeholder for Logo if available */}
                        {/* <img src="/logo.png" className="h-16 w-auto" /> */}
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-wide uppercase">G.T Gestão Patrimonial</h2>
                            <p className="text-xs font-serif text-gray-500 uppercase tracking-widest">Controle de Ativos e Auditoria</p>
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-gray-800 mt-4 uppercase border px-4 py-1 inline-block rounded-sm">Relatório de Patrimônio</h1>

                    <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-mono uppercase border-t pt-2 max-w-2xl mx-auto">
                        <span>Emissão: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                        <span>Total de Itens: {assetsToPrint.length}</span>
                        <span>Usuário: {users.find(u => u.id === 'CURRENT_USER')?.name || 'Sistema'}</span>
                    </div>
                </div>

                <table className="w-full border-collapse border border-gray-400 text-[10px] font-sans">
                    <thead>
                        <tr className="bg-slate-800 text-white print:bg-slate-200 print:text-black">
                            <th className="border border-gray-400 p-1 text-left uppercase font-bold">Tombo</th>
                            <th className="border border-gray-400 p-1 text-left uppercase font-bold w-1/3">Descrição / Modelo</th>
                            <th className="border border-gray-400 p-1 text-left uppercase font-bold">Nº Série</th>
                            <th className="border border-gray-400 p-1 text-left uppercase font-bold">NF</th>
                            <th className="border border-gray-400 p-1 text-left uppercase font-bold">Categoria</th>
                            <th className="border border-gray-400 p-1 text-left uppercase font-bold">Estado</th>
                            <th className="border border-gray-400 p-1 text-left uppercase font-bold">Local</th>
                            <th className="border border-gray-400 p-1 text-left uppercase font-bold">Responsável</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assetsToPrint.length > 0 ? (
                            assetsToPrint.map((asset, index) => (
                                <tr key={asset.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 print:bg-gray-100'}>
                                    <td className="border border-gray-300 p-1 font-mono font-bold text-center">{asset.id}</td>
                                    <td className="border border-gray-300 p-1">
                                        <div className="font-bold">{asset.name}</div>
                                        <div className="flex gap-2 text-[9px] text-gray-600">
                                            {asset.manufacturer && <span>Fab: {asset.manufacturer}</span>}
                                            {asset.model && <span>Mod: {asset.model}</span>}
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 p-1 font-mono text-[9px]">{asset.serialNumber || '-'}</td>
                                    <td className="border border-gray-300 p-1 font-mono text-[9px]">{asset.invoiceNumber || '-'}</td>
                                    <td className="border border-gray-300 p-1 uppercase text-[9px]">{asset.category}</td>
                                    <td className="border border-gray-300 p-1 uppercase text-[9px]">{asset.state}</td>
                                    <td className="border border-gray-300 p-1 uppercase text-[9px]">{locations.find(l => l.id === asset.locationId)?.name || asset.locationId}</td>
                                    <td className="border border-gray-300 p-1 uppercase text-[9px]">{users.find(u => u.id === asset.responsibleId)?.name || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="border p-4 text-center text-gray-500">Nenhum item selecionado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footer Signature Block */}
                <div className="mt-16 grid grid-cols-2 gap-20 px-12">
                    <div className="text-center">
                        <div className="border-t border-black pt-2 font-bold uppercase text-[10px]">Gestor Patrimonial</div>
                        <div className="text-[9px] text-gray-500">Visto / Assinatura</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black pt-2 font-bold uppercase text-[10px]">Conferente / Responsável</div>
                        <div className="text-[9px] text-gray-500">Visto / Assinatura</div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 text-center text-[8px] text-gray-400 border-t p-2">
                    Sistema G.T Gestão Patrimonial - Documento Gerado em {new Date().toLocaleString()}
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background-color: white; }
                    .print\\:block { display: block !important; }
                    @page { margin: 1cm; size: A4; }
                }
            `}</style>
        </div>
    );
};