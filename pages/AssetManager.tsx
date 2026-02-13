import React, { useState, useMemo, useRef } from 'react';
import { Card, Button, Input, Badge, Modal, Pagination } from '../components/Shared';
import { Asset, AssetState, AssetCategory, Location, User } from '../types';
import { Search, Plus, Edit2, Eye, Download, Calculator, MapPin, Package, Camera, Tag, Calendar, User as UserIcon, History, Trash2 } from 'lucide-react';
import { supabase } from '../src/utils/supabaseClient';

interface AssetManagerProps {
    assets: Asset[];
    locations: Location[];
    users?: User[];
    onAddAsset: (asset: Asset) => void;
    onUpdateAsset?: (asset: Asset) => void;
    onDeleteAsset?: (id: string) => void;
    onImportAssets: (assets: Asset[]) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
    assets, locations, users = [], onAddAsset, onUpdateAsset, onDeleteAsset
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalTab, setModalTab] = useState<'GERAL' | 'CONTABIL' | 'LOCAL' | 'HISTORY'>('GERAL');
    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleExportExcel = async () => {
        const data = currentAssets.map(a => ({
            Tombo: a.id,
            Nome: a.name,
            Categoria: a.category,
            Estado: a.state,
            Valor: a.value || 0,
            Local: locations.find(l => l.id === a.locationId)?.name || 'N/A',
            Responsavel: users.find(u => u.id === a.responsibleId)?.name || 'N/A'
        }));
        const { exportToExcel } = await import('../utils/exportUtils');
        await exportToExcel(data, "Relatorio_Geral_Ativos");
        setShowExportMenu(false);
    };

    const handleExportWord = async (docType: 'GENERAL' | 'RESPONSIBILITY' | 'RETURN' | 'LAUDO') => {
        const { exportToWord } = await import('../utils/exportUtils');
        await exportToWord(docType, { assets: currentAssets, locations, users });
        setShowExportMenu(false);
    };

    const handleGenerateSecureDoc = async (asset: Asset) => {
        try {
            // SIMULATE SECURE DOC GENERATION
            // Real implementation would go to backend API
            console.log(`Generating secure doc for ${asset.id}...`);
            alert("Simulação: Documento Seguro sendo gerado... (Backend Node.js pendente)");
            // Placeholder: Create a dummy PDF blob
            const blob = new Blob([`Documento Simulado: ${asset.name}`], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Erro ao gerar documento:', err);
        }
    };

    const fileInputAsset = useRef<HTMLInputElement>(null);
    const fileInputTag = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Asset>>({
        id: '', name: '', category: AssetCategory.FURNITURE, state: AssetState.GOOD,
        imageUrl: '', tagImageUrl: '',
        accounting: { acquisitionValue: 0, residualValue: 0, usefulLifeYears: 5, accumulatedDepreciation: 0 }
    });

    const filteredAssets = useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return assets.filter(a => a.name.toLowerCase().includes(lower) || a.id.toLowerCase().includes(lower));
    }, [searchTerm, assets]);

    const itemsPerPage = 8;
    const currentAssets = filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);



    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'ASSET' | 'TAG') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}_${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload para Supabase Storage ('assets' bucket)
            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Obter URL Pública
            const { data: { publicUrl } } = supabase.storage
                .from('assets')
                .getPublicUrl(filePath);

            const key = type === 'ASSET' ? 'imageUrl' : 'tagImageUrl';
            setFormData(prev => ({ ...prev, [key]: publicUrl }));

            // Feedback simples (pode ser melhorado com Toast)
            console.log('Upload Sucesso:', publicUrl);

        } catch (error) {
            console.error('Erro no upload:', error);
            alert("Erro ao enviar imagem. Verifique se o Bucket 'assets' foi criado no Supabase.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.id) return alert("Número de Tombamento e Descrição são obrigatórios.");

        const assetToSave: Asset = {
            id: formData.id!.toUpperCase(),
            name: formData.name.toUpperCase(),
            category: formData.category || AssetCategory.OTHER,
            state: formData.state || AssetState.GOOD,
            value: formData.value || 0,
            locationId: formData.locationId || locations[0]?.id || 'LOC-1',
            responsibleId: formData.responsibleId || users[0]?.id || 'u1',
            purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
            imageUrl: formData.imageUrl || '',
            tagImageUrl: formData.tagImageUrl,
            accounting: formData.accounting!,
            // Added fields
            manufacturer: formData.manufacturer,
            model: formData.model,
            serialNumber: formData.serialNumber
        };

        if (editingId && onUpdateAsset) onUpdateAsset(assetToSave);
        else onAddAsset(assetToSave);

        setIsModalOpen(false);
        setEditingId(null);
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        className="pl-12 pr-4 w-full bg-slate-50 border-none rounded-xl py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-gov-500/20"
                        placeholder="Pesquisar patrimônio..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Button variant="secondary" size="sm" onClick={() => setShowExportMenu(!showExportMenu)}><Download size={16} className="mr-2" /> Exportar</Button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-50 animate-fadeIn">
                                <div className="px-3 py-2 border-b border-slate-50 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Formato</span>
                                </div>
                                {/* REFACTORED EXPORT MENU */}
                                <div className="grid grid-cols-1 gap-1">
                                    <button className="w-full text-left px-3 py-3 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-3 transition-colors" onClick={() => handleExportExcel()}>
                                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Download size={14} /></div>
                                        Exportar Planilha Geral (Excel)
                                    </button>

                                    <div className="my-2 border-t border-slate-100"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-1 block">Documentos Oficiais (Word)</span>

                                    <button className="w-full text-left px-3 py-3 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-3 transition-colors" onClick={() => handleExportWord('GENERAL')}>
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Download size={14} /></div>
                                        Relatório Geral de Ativos
                                    </button>

                                    <button className="w-full text-left px-3 py-3 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-3 transition-colors" onClick={() => handleExportWord('RESPONSIBILITY')}>
                                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Download size={14} /></div>
                                        Termo de Responsabilidade
                                    </button>

                                    <button className="w-full text-left px-3 py-3 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-3 transition-colors" onClick={() => handleExportWord('RETURN')}>
                                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Download size={14} /></div>
                                        Termo de Devolução
                                    </button>

                                    <button className="w-full text-left px-3 py-3 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-3 transition-colors" onClick={() => handleExportWord('LAUDO')}>
                                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Download size={14} /></div>
                                        Laudo Técnico / Baixa
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <Button size="sm" onClick={() => { setEditingId(null); setFormData({ id: `PAT-${Math.floor(Math.random() * 10000)}`, name: '', category: AssetCategory.FURNITURE, state: AssetState.GOOD, imageUrl: '', tagImageUrl: '', accounting: { acquisitionValue: 0, residualValue: 0, usefulLifeYears: 5, accumulatedDepreciation: 0 } }); setIsModalOpen(true); }}>
                        <Plus size={16} className="mr-2" /> Novo Ativo
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentAssets.map(asset => (
                    <Card key={asset.id} className="p-0 overflow-hidden group hover:shadow-lg transition-all rounded-[1.5rem] bg-white border">
                        <div className="h-32 relative">
                            <img src={asset.imageUrl} className="w-full h-full object-cover" alt="" />
                            <div className="absolute top-2 left-2"><Badge color={asset.state === AssetState.GOOD ? 'green' : 'yellow'}>{asset.state}</Badge></div>
                            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-white font-mono text-[9px] font-black">{asset.id}</div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-black text-slate-800 uppercase text-[10px] truncate mb-3">{asset.name}</h3>
                            <div className="flex gap-1">
                                <Button variant="secondary" className="flex-1 h-9 text-[8px] rounded-lg justify-center" onClick={() => { setEditingId(asset.id); setFormData(asset); setIsModalOpen(true); }}><Edit2 size={12} className="mr-1" /> Editar</Button>
                                <Button variant="secondary" className="w-9 h-9 p-0 rounded-lg text-red-500 hover:bg-red-50" onClick={() => { if (confirm('Excluir este ativo permanentemente?')) onDeleteAsset?.(asset.id); }}><Trash2 size={14} /></Button>
                                <Button variant="secondary" className="w-9 h-9 p-0 rounded-lg" onClick={() => setViewingAsset(asset)}><Eye size={14} /></Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {/* MODAL: CADASTRO / EDIÇÃO */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Dossiê de Ativo" : "Protocolar Novo Bem"}>
                <div className="space-y-6">
                    <div className="flex border-b border-slate-100">
                        <button onClick={() => setModalTab('GERAL')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${modalTab === 'GERAL' ? 'border-gov-600 text-gov-600' : 'border-transparent text-slate-400 hover:text-gov-600'}`}>Detalhes</button>
                        <button onClick={() => setModalTab('CONTABIL')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${modalTab === 'CONTABIL' ? 'border-gov-600 text-gov-600' : 'border-transparent text-slate-400 hover:text-gov-600'}`}>Fiscal & Contábil</button>
                        <button onClick={() => setModalTab('LOCAL')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${modalTab === 'LOCAL' ? 'border-gov-600 text-gov-600' : 'border-transparent text-slate-400 hover:text-gov-600'}`}>Trajetória</button>
                        <button onClick={() => setModalTab('HISTORY')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${modalTab === 'HISTORY' ? 'border-gov-600 text-gov-600' : 'border-transparent text-slate-400 hover:text-gov-600'}`}>Manutenções</button>
                    </div>

                    <div className="min-h-[350px]">
                        {modalTab === 'GERAL' && (
                            <div className="space-y-4">
                                <Input label="Número de Tombamento (Patrimônio)" placeholder="EX: PAT-2024-001" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} disabled={!!editingId} />
                                <Input label="Descrição do Bem" placeholder="EX: NOTEBOOK DELL LATITUDE" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Categoria</label>
                                        <select className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-black uppercase" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                                            {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Conservação</label>
                                        <select className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-black uppercase" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value as any })}>
                                            {Object.values(AssetState).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* NEW FIELDS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Fabricante / Marca" placeholder="EX: DELL" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} />
                                    <Input label="Modelo" placeholder="EX: LATITUDE 5420" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                                </div>
                                <Input label="Número de Série" placeholder="EX: SN-123456789" value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase">Foto do Bem</label>
                                        <div onClick={() => fileInputAsset.current?.click()} className="h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden">
                                            {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" />}
                                            <input type="file" ref={fileInputAsset} className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, 'ASSET')} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase">Foto do Tombamento</label>
                                        <div onClick={() => fileInputTag.current?.click()} className="h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden">
                                            {formData.tagImageUrl ? <img src={formData.tagImageUrl} className="w-full h-full object-cover" /> : <Tag className="text-slate-300" />}
                                            <input type="file" ref={fileInputTag} className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, 'TAG')} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalTab === 'CONTABIL' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Valor Aquisição (R$)" type="number" value={formData.accounting?.acquisitionValue} onChange={e => setFormData({ ...formData, accounting: { ...formData.accounting!, acquisitionValue: Number(e.target.value) } })} />
                                <Input label="Data Aquisição" type="date" value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} />
                                <Input label="Vida Útil (Anos)" type="number" value={formData.accounting?.usefulLifeYears} onChange={e => setFormData({ ...formData, accounting: { ...formData.accounting!, usefulLifeYears: Number(e.target.value) } })} />
                                <Input label="Valor Residual (R$)" type="number" value={formData.accounting?.residualValue} onChange={e => setFormData({ ...formData, accounting: { ...formData.accounting!, residualValue: Number(e.target.value) } })} />
                            </div>
                        )}

                        {modalTab === 'LOCAL' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Alocação / Setor</label>
                                    <select className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-black uppercase" value={formData.locationId} onChange={e => setFormData({ ...formData, locationId: e.target.value })}>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Fiel Depositário</label>
                                    <select className="w-full bg-slate-50 border rounded-xl p-3 text-xs font-black uppercase" value={formData.responsibleId} onChange={e => setFormData({ ...formData, responsibleId: e.target.value })}>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        {modalTab === 'HISTORY' && (
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trajetória e Movimentação</h4>

                                {(!formData.locationHistory || formData.locationHistory.length === 0) && (
                                    <div className="text-center py-8 text-slate-400">
                                        <History size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-[10px] font-black uppercase">Nenhuma movimentação registrada</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {formData.locationHistory?.slice().reverse().map((h, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[9px] font-black bg-gov-100 text-gov-700 px-2 py-0.5 rounded uppercase">Transferência</span>
                                                    <span className="text-[9px] font-bold text-slate-400">{new Date(h.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <MapPin size={12} className="text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-500 line-through">{locations.find(l => l.id === h.fromId)?.name}</span>
                                                    <span className="text-[10px] font-black text-slate-300">➔</span>
                                                    <span className="text-[10px] font-black text-gov-700">{locations.find(l => l.id === h.toId)?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t flex flex-col gap-2">
                        <Button onClick={handleSave} fullWidth className="h-12 text-[10px] shadow-lg">Finalizar Protocolo</Button>
                        {editingId && (
                            <Button variant="ghost" className="h-10 text-[10px] text-red-500 hover:bg-red-50" onClick={() => { if (confirm('Excluir este ativo permanentemente?')) { onDeleteAsset?.(editingId); setIsModalOpen(false); } }}>
                                <Trash2 size={14} className="mr-2" /> Excluir Registro
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    </div>
                </div>
            </Modal >

            {/* MODAL: VISUALIZAÇÃO DOSSIÊ CONSOLIDADO (O QUE O USUÁRIO PEDIU) */}
            < Modal isOpen={!!viewingAsset} onClose={() => setViewingAsset(null)} title="Dossiê Consolidado de Ativo" size="2xl" >
                {viewingAsset && (
                    <div className="space-y-8 p-2">
                        <div className="flex flex-col md:flex-row gap-8 pb-8 border-b border-slate-100">
                            <div className="w-full md:w-64 space-y-4">
                                <div className="h-48 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
                                    <img src={viewingAsset.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-20 rounded-2xl overflow-hidden border border-slate-100">
                                        <img src={viewingAsset.tagImageUrl || 'https://picsum.photos/200/100'} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="h-20 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <Plus size={16} className="text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex gap-2 mb-3">
                                        <Badge color="blue" className="text-[8px] font-black">{viewingAsset.category}</Badge>
                                        <Badge color={viewingAsset.state === AssetState.GOOD ? 'green' : 'yellow'} className="text-[8px] font-black">{viewingAsset.state}</Badge>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{viewingAsset.name}</h3>
                                    <p className="text-gov-600 font-mono font-black text-xs mt-3 tracking-widest">ID PATRIMONIAL: {viewingAsset.id}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-400"><MapPin size={20} /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Localização</p>
                                            <p className="text-sm font-black text-slate-800 uppercase leading-tight mt-1">{locations.find(l => l.id === viewingAsset.locationId)?.name || 'Não inf.'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-400"><UserIcon size={20} /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Fiel Depositário</p>
                                            <p className="text-sm font-black text-slate-800 uppercase leading-tight mt-1">{users.find(u => u.id === viewingAsset.responsibleId)?.name || 'Pendente'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calculator size={14} /> Ficha Contábil</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-400">VALOR AQUISIÇÃO</span> <span className="text-xs font-black text-slate-800">R$ {viewingAsset.accounting?.acquisitionValue.toLocaleString()}</span></div>
                                    <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-400">DATA AQUISIÇÃO</span> <span className="text-xs font-black text-slate-800">{new Date(viewingAsset.purchaseDate).toLocaleDateString()}</span></div>
                                    <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-bold text-slate-400">VIDA ÚTIL</span> <span className="text-xs font-black text-slate-800">{viewingAsset.accounting?.usefulLifeYears} ANOS</span></div>
                                </div>
                            </section>

                            <section className="space-y-4 md:col-span-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={14} /> Timeline de Eventos</h4>
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-gov-200 transition-colors">
                                            <div className="w-1 h-full bg-gov-200 rounded-full" />
                                            <div>
                                                <p className="text-[11px] font-black text-slate-800 uppercase">MOVIMENTAÇÃO DE SETOR DETECTADA</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Auditado em: 12/04/2024 via Mobile</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};