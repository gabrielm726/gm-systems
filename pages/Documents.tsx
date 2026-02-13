import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Modal, Input, ConfirmModal } from '../components/Shared';
import {
    FileText, Download, Upload, Trash2, Search,
    History, ShieldCheck, ArrowRightLeft, FileSearch,
    Layers, Plus, ExternalLink, Filter, Package,
    ShieldAlert, Database, Info, Activity, Mail,
    User, MessageSquare, Bookmark
} from 'lucide-react';
import { Document, EntityType, DocStatus, DocumentVersion } from '../types';
import { OFFICIAL_PROCESSES, MOCK_GED } from '../constants';

interface DocumentsProps {
    entityType?: EntityType;
    onAddDocument?: (doc: Document) => void;
    documents?: Document[]; // Added prop
}

type GedView = 'TODOS' | 'OFICIOS' | 'CONTRATOS' | 'NOTAS';

export const Documents: React.FC<DocumentsProps> = ({ entityType = 'PUBLIC', onAddDocument, documents = [] }) => {
    // Merge props documents with internal state implies we should likely prioritize props or effect sync
    // For simplicity, we initialize state from props OR mock if empty, but better to use props directly if controlled.
    // Given the architecture, let's trust the prop if provided and non-empty, else fallback.
    const [gedDocs, setGedDocs] = useState<Document[]>(documents.length > 0 ? documents : (MOCK_GED || []));

    // Update local state when props change (Supabase sync)
    React.useEffect(() => {
        if (documents && documents.length > 0) {
            setGedDocs(documents);
        }
    }, [documents]);

    // Safety check to prevent undefined filter crashes
    if (!gedDocs) return <div className="p-8 text-center text-slate-500">Inicializando módulo GED...</div>;
    const [activeView, setActiveView] = useState<GedView>('TODOS');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<string | null>(null);

    const [uploadForm, setUploadForm] = useState<Partial<Document>>({
        title: '',
        type: 'INVOICE',
        linkedProcessId: '',
        assetId: '',
        status: 'VALID',
        entityType: entityType,
        isOficio: false,
        oficioNumber: '',
        oficioRecipient: '',
        oficioSubject: ''
    });

    const filteredDocs = useMemo(() => {
        return gedDocs.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.oficioNumber && doc.oficioNumber.includes(searchTerm));

            const matchesView = activeView === 'TODOS' ||
                (activeView === 'OFICIOS' && doc.isOficio) ||
                (activeView === 'CONTRATOS' && doc.type === 'CONTRACT') ||
                (activeView === 'NOTAS' && doc.type === 'INVOICE');

            return matchesSearch && matchesView;
        });
    }, [gedDocs, searchTerm, activeView]);

    const handleSaveUpload = () => {
        if (!uploadForm.title || !uploadForm.type) {
            alert("Preencha o título e o tipo do documento.");
            return;
        }

        const newDoc: Document = {
            id: `DOC-${Date.now()}`,
            title: uploadForm.title!,
            type: uploadForm.type!,
            entityType: entityType as EntityType,
            linkedProcessId: uploadForm.linkedProcessId || 'AVULSO',
            assetId: uploadForm.assetId,
            date: new Date().toISOString().split('T')[0],
            responsibleId: 'u1',
            status: 'VALID',
            url: '#',
            versions: [{ version: 1, date: new Date().toISOString(), responsible: 'Gabriel M.', url: '#', changeNote: 'Carga inicial' }],
            isOficio: uploadForm.isOficio,
            oficioNumber: uploadForm.oficioNumber,
            oficioRecipient: uploadForm.oficioRecipient,
            oficioSubject: uploadForm.oficioSubject
        };

        const updated = [newDoc, ...gedDocs];
        setGedDocs(updated);
        if (onAddDocument) onAddDocument(newDoc);

        setIsUploadModalOpen(false);
        setUploadForm({ title: '', type: 'INVOICE', linkedProcessId: '', assetId: '', status: 'VALID', entityType: entityType as EntityType, isOficio: false });
    };

    const handleDelete = () => {
        if (docToDelete) setGedDocs(prev => prev.filter(d => d.id !== docToDelete));
        setIsDeleteModalOpen(false);
        setDocToDelete(null);
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 p-8 opacity-5 text-gov-900 pointer-events-none"><Database size={140} /></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                        <Layers className="text-gov-600" size={36} /> Central GED de Ativos
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Gestão eletrônica de documentos e comunicações oficiais.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 no-print z-10">
                    {(['TODOS', 'OFICIOS', 'CONTRATOS', 'NOTAS'] as GedView[]).map(v => (
                        <button
                            key={v}
                            onClick={() => setActiveView(v)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white text-gov-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto relative z-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                        <input
                            className="pl-12 w-full md:w-64 bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 text-sm focus:ring-4 focus:ring-gov-500/20 outline-none transition-all"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => {
                        setIsUploadModalOpen(true);
                        if (activeView === 'OFICIOS') setUploadForm(prev => ({ ...prev, isOficio: true }));
                        else if (activeView === 'CONTRATOS') setUploadForm(prev => ({ ...prev, isOficio: false, type: 'CONTRACT' }));
                        else if (activeView === 'NOTAS') setUploadForm(prev => ({ ...prev, isOficio: false, type: 'INVOICE' }));
                        else setUploadForm(prev => ({ ...prev, isOficio: false, type: 'INVOICE' }));
                    }} className="bg-gov-900 text-white rounded-2xl px-6 h-12 shadow-xl shadow-gov-900/20 uppercase font-black text-[11px] tracking-widest">
                        <Plus size={20} className="mr-2" /> Protocolar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map(doc => (
                    <Card key={doc.id} className={`hover:border-gov-400 border-2 transition-all group rounded-[2.2rem] shadow-sm p-2 bg-white ${doc.isOficio ? 'border-indigo-100' : 'border-transparent'}`}>
                        <div className={`rounded-[2rem] p-6 h-full flex flex-col ${doc.isOficio ? 'bg-indigo-50/30' : 'bg-slate-50'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 bg-white rounded-2xl shadow-sm group-hover:text-white transition-colors duration-500 ${doc.isOficio ? 'group-hover:bg-indigo-600 text-indigo-600' : 'group-hover:bg-gov-900 text-gov-600'}`}>
                                    {doc.isOficio ? <Mail size={32} /> : <FileText size={32} />}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge color={doc.status === 'VALID' ? 'green' : 'red'} className="font-black text-[9px] uppercase px-3 py-1">
                                        {doc.status}
                                    </Badge>
                                    {doc.isOficio && <Badge color="purple" className="text-[8px] font-black uppercase">OFÍCIO</Badge>}
                                </div>
                            </div>

                            <h4 className="font-black text-slate-800 text-sm line-clamp-2 leading-tight mb-2 uppercase group-hover:text-gov-900">{doc.title}</h4>

                            {doc.isOficio ? (
                                <div className="space-y-2 mb-4 bg-white/50 p-3 rounded-xl border border-indigo-100/50">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2"><Bookmark size={10} /> Nº {doc.oficioNumber || 'Não inf.'}</p>
                                    <p className="text-[10px] text-slate-500 font-bold flex items-center gap-2"><User size={10} /> Para: {doc.oficioRecipient || 'Pendente'}</p>
                                    <p className="text-[9px] text-slate-400 italic line-clamp-1">Assunto: {doc.oficioSubject}</p>
                                </div>
                            ) : (
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{doc.type}</p>
                            )}

                            <div className="mt-auto pt-6 border-t border-slate-200/50 space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white rounded-lg border text-gov-600"><Activity size={12} /></div>
                                        Rito: <span className="text-slate-800">{doc.linkedProcessId}</span>
                                    </div>
                                    <span className="text-slate-400 font-mono">v{(doc.versions || []).length}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase mt-4">
                                    <History size={12} /> {new Date(doc.date).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-2">
                                <Button variant="secondary" size="sm" className="flex-1 rounded-xl h-11 text-[10px] font-black uppercase tracking-widest bg-white border-slate-200" onClick={() => setViewingDoc(doc)}>Gerenciar</Button>
                                <Button variant="ghost" size="sm" className="rounded-xl w-11 h-11 text-red-500 hover:bg-red-50" onClick={() => { setDocToDelete(doc.id); setIsDeleteModalOpen(true); }}><Trash2 size={18} /></Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* MODAL DE UPLOAD COM MODO OFÍCIO */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Protocolar Documento / Ofício" size="lg">
                <div className="space-y-6">
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setUploadForm({ ...uploadForm, isOficio: false, type: 'INVOICE' })}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!uploadForm.isOficio ? 'bg-white text-gov-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <FileText size={14} className="inline mr-2" /> Documento Padrão
                        </button>
                        <button
                            onClick={() => setUploadForm({ ...uploadForm, isOficio: true, type: 'CONTRACT' })}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploadForm.isOficio ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Mail size={14} className="inline mr-2" /> Ofício de Comunicação
                        </button>
                    </div>

                    <div className="space-y-5">
                        <Input label="Título do Protocolo" placeholder="Ex: NF-4500 ou Ofício GAB 10/24" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} />

                        {uploadForm.isOficio ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                <Input label="Número do Ofício" placeholder="Ex: 001/2024" value={uploadForm.oficioNumber} onChange={e => setUploadForm({ ...uploadForm, oficioNumber: e.target.value })} />
                                <Input label="Destinatário / Órgão" placeholder="Ex: Secretaria de Obras" value={uploadForm.oficioRecipient} onChange={e => setUploadForm({ ...uploadForm, oficioRecipient: e.target.value })} />
                                <div className="md:col-span-2">
                                    <Input label="Assunto Principal" placeholder="Ex: Solicitação de conserto de ar-condicionado" value={uploadForm.oficioSubject} onChange={e => setUploadForm({ ...uploadForm, oficioSubject: e.target.value })} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Natureza do Documento</label>
                                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black uppercase shadow-sm outline-none focus:ring-4 focus:ring-gov-500/20" value={uploadForm.type} onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}>
                                        <option value="INVOICE">Nota Fiscal</option>
                                        <option value="CONTRACT">Contrato</option>
                                        <option value="POLICY">Termo de Guarda</option>
                                        <option value="MANUAL">Laudo Técnico</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Processo Vinculado</label>
                                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black uppercase shadow-sm outline-none focus:ring-4 focus:ring-gov-500/20" value={uploadForm.linkedProcessId} onChange={e => setUploadForm({ ...uploadForm, linkedProcessId: e.target.value })}>
                                        <option value="">Nenhum (Avulso)</option>
                                        {OFFICIAL_PROCESSES.filter(p => p.scope === 'COMMON' || p.scope === entityType).map(p => (
                                            <option key={p.id} value={p.id}>{p.id} - {p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <label className="flex-1 border-4 border-dashed border-slate-100 p-6 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 group hover:border-gov-500 transition-all cursor-pointer relative">
                                <input type="file" className="hidden" accept="application/pdf,image/*" />
                                <div className="p-4 bg-white rounded-full shadow-lg text-slate-300 group-hover:text-gov-600 transition-colors mb-2"><Upload size={32} /></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Upload PDF/Img</span>
                            </label>
                            <label className="flex-1 border-4 border-dashed border-slate-100 p-6 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 group hover:border-gov-500 transition-all cursor-pointer relative">
                                <input type="file" className="hidden" accept="image/*" capture="environment" />
                                <div className="p-4 bg-white rounded-full shadow-lg text-slate-300 group-hover:text-gov-600 transition-colors mb-2"><Activity size={32} /></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Escanear (Câmera)</span>
                            </label>
                        </div>
                    </div>

                    <Button onClick={handleSaveUpload} className="w-full bg-gov-900 h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl text-white">
                        Registrar e Versionar no GED
                    </Button>
                </div>
            </Modal>

            {/* MODAL GERENCIAR DOCUMENTO (Visualização e Versões) */}
            <Modal isOpen={!!viewingDoc} onClose={() => setViewingDoc(null)} title="Dossiê do Documento Digital" size="lg">
                {viewingDoc && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="p-4 bg-slate-100 rounded-2xl text-slate-500">
                                {viewingDoc.isOficio ? <Mail size={32} /> : <FileText size={32} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase leading-none mb-2">{viewingDoc.title}</h3>
                                <div className="flex gap-2">
                                    <Badge color={viewingDoc.status === 'VALID' ? 'green' : 'red'}>{viewingDoc.status}</Badge>
                                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{viewingDoc.id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Tipo / Categoria</p>
                                <p className="font-bold text-slate-700">{viewingDoc.type}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Processo Vinculado</p>
                                <p className="font-bold text-slate-700">{viewingDoc.linkedProcessId || 'N/A'}</p>
                            </div>
                        </div>

                        {viewingDoc.isOficio && (
                            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                                <h4 className="text-xs font-black text-indigo-800 uppercase mb-3 flex items-center gap-2"><Mail size={14} /> Dados do Ofício</h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div><span className="font-bold text-indigo-400 block">Número:</span> {viewingDoc.oficioNumber}</div>
                                    <div><span className="font-bold text-indigo-400 block">Destinatário:</span> {viewingDoc.oficioRecipient}</div>
                                    <div className="col-span-2"><span className="font-bold text-indigo-400 block">Assunto:</span> {viewingDoc.oficioSubject}</div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <History size={14} /> Histórico de Versões e Uploads
                            </h4>
                            <div className="space-y-3">
                                {(viewingDoc.versions || []).map((v, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-gov-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">v{v.version}</div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">{v.changeNote}</p>
                                                <p className="text-[10px] text-slate-400">{new Date(v.date).toLocaleDateString()} por {v.responsible}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-gov-600"><Download size={16} /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-3">
                            <label className="flex-1">
                                <input type="file" className="hidden" accept="image/*" capture="environment" />
                                <div className="w-full bg-slate-800 text-white h-12 rounded-xl flex items-center justify-center font-bold uppercase text-xs tracking-widest cursor-pointer hover:bg-slate-700 transition-colors shadow-lg">
                                    <Upload size={16} className="mr-2" /> Adicionar Nova Versão (Scan)
                                </div>
                            </label>
                            <Button variant="danger" className="h-12 w-12 rounded-xl" title="Arquivar Documento"><Trash2 size={20} /></Button>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Registro"
                message="Deseja remover este documento permanentemente da trilha de auditoria?"
            />
        </div >
    );
};