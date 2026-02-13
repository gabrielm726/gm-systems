import React, { useState, useMemo } from 'react';
import { User, Asset } from '../types';
import { Button, Modal, Input, Badge, BadgeColor, ConfirmModal } from '../components/Shared';

import {
    UserCheck, Shield, Briefcase, Users, User as UserIcon,
    Edit2, Package, Search, UserPlus,
    Save, Trash2, ClipboardList
} from 'lucide-react';

interface HierarchyPageProps {
    users: User[];
    assets: Asset[];
    onDeleteUser: (id: string) => void;
    onAddUser: (user: User, password?: string) => void;
    onUpdateUser: (user: User) => void;
}

export const HierarchyPage: React.FC<HierarchyPageProps> = ({ users, assets, onDeleteUser, onAddUser, onUpdateUser }) => {
    // UI State
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User>>({});
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // View Assets Modal
    const [viewingUserItems, setViewingUserItems] = useState<User | null>(null);

    // --- FILTROS ---
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const lower = searchTerm.toLowerCase();
        return users.filter(u =>
            u.name.toLowerCase().includes(lower) ||
            u.email.toLowerCase().includes(lower) ||
            u.department?.toLowerCase().includes(lower)
        );
    }, [users, searchTerm]);

    // --- HANDLERS ---
    const handleOpenAdd = () => {
        setIsCreating(true);
        setEditingUser({
            id: `USR-${Date.now()}`,
            name: '',
            email: '',
            department: '',
            role: 'OPERATOR',
            status: 'ACTIVE',
            hierarchyLevel: 4,
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
        });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setIsCreating(false);
        setEditingUser({ ...user });
        setIsEditModalOpen(true);
    };

    const handleSave = () => {
        if (!editingUser.name || !editingUser.email) return alert("Preencha os campos obrigatórios.");
        if (isCreating) onAddUser(editingUser as User, (editingUser as any).password);
        else onUpdateUser(editingUser as User);
        setIsEditModalOpen(false);
    };

    // Função centralizada para iniciar o processo de exclusão
    const handleDeleteInit = (id: string) => {
        const user = users.find(u => u.id === id);
        if (user) {
            setUserToDelete(user);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.id);
            setUserToDelete(null);
            setIsDeleteModalOpen(false);
            // Se o modal de edição estava aberto com este usuário, fechamos
            setIsEditModalOpen(false);
        }
    };

    const levelConfig = [
        { level: 1, title: "Autoridade Máxima", icon: Shield, color: 'purple' as BadgeColor },
        { level: 2, title: "Gestão Central", icon: Briefcase, color: 'blue' as BadgeColor },
        { level: 3, title: "Gestão Setorial", icon: Users, color: 'green' as BadgeColor },
        { level: 4, title: "Fiel Depositário", icon: UserIcon, color: 'orange' as BadgeColor },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header com Busca */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-gov-900 text-white rounded-3xl shadow-lg">
                        <UserCheck size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Pirâmide de Autoridade</h2>
                        <p className="text-sm text-slate-500 font-medium">Estrutura hierárquica e níveis de responsabilidade patrimonial.</p>
                    </div>
                </div>

                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                    <input
                        className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold w-full md:w-80 focus:ring-4 focus:ring-gov-500/20 outline-none transition-all"
                        placeholder="Buscar responsável na estrutura..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleOpenAdd} className="bg-gov-900 text-white rounded-2xl h-12 px-6 ml-2 font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-transform">
                        <UserPlus size={18} className="mr-2" /> Novo Cargo
                    </Button>
                </div>
            </div>

            {/* Conteúdo: Pirâmide Hierárquica */}
            <div className="flex flex-col items-center gap-2 py-10">
                {levelConfig.map(cfg => (
                    <div key={cfg.level} className="w-full flex flex-col items-center">
                        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg border-l-8 mb-4 overflow-hidden" style={{ borderColor: cfg.level === 1 ? '#8b5cf6' : cfg.level === 2 ? '#3b82f6' : cfg.level === 3 ? '#10b981' : '#f59e0b' }}>
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        <cfg.icon size={20} />
                                    </div>
                                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{cfg.title}</h3>
                                </div>
                                <Badge color={cfg.color}>{filteredUsers.filter(u => (u.hierarchyLevel || 4) === cfg.level).length} Pessoas</Badge>
                            </div>
                            <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredUsers.filter(u => (u.hierarchyLevel || 4) === cfg.level).map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-gov-50 transition-colors cursor-pointer group" onClick={() => setViewingUserItems(u)}>
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatarUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase">{u.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">{u.department}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(u); }} className="p-2 text-gov-600 hover:bg-white rounded-lg"><Edit2 size={14} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteInit(u.id); }} className="p-2 text-red-500 hover:bg-white rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {cfg.level < 4 && <div className="h-8 w-1 bg-slate-200 rounded-full mb-2"></div>}
                    </div>
                ))}
            </div>

            {/* MODAL: EDIÇÃO/CADASTRO */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={isCreating ? "Novo Responsável" : "Editar Cadastro"}>
                <div className="space-y-4">
                    <Input label="Nome Completo" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                    <Input label="E-mail" type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
                    <Input label="Departamento" value={editingUser.department} onChange={e => setEditingUser({ ...editingUser, department: e.target.value })} />
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nível Hierárquico</label>
                        <select
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black uppercase outline-none focus:ring-4 focus:ring-gov-500/20"
                            value={editingUser.hierarchyLevel || 4}
                            onChange={e => setEditingUser({ ...editingUser, hierarchyLevel: parseInt(e.target.value) as any })}
                        >
                            <option value={1}>1 - Autoridade Máxima</option>
                            <option value={2}>2 - Gestão Central</option>
                            <option value={3}>3 - Gestão Setorial</option>
                            <option value={4}>4 - Fiel Depositário</option>
                        </select>
                    </div>
                    {isCreating && (
                        <Input
                            label="Senha Inicial (Temporária)"
                            type="password"
                            placeholder="Defina uma senha..."
                            value={(editingUser as any).password || ''}
                            onChange={e => setEditingUser({ ...editingUser, password: e.target.value } as any)}
                        />
                    )}
                    <div className="flex gap-3 pt-4">
                        {!isCreating && (
                            <Button variant="danger" className="rounded-xl h-14 uppercase font-black text-[10px]" onClick={() => handleDeleteInit(editingUser.id!)}>
                                <Trash2 size={18} className="mr-2" /> Excluir Registro
                            </Button>
                        )}
                        <Button onClick={handleSave} className="flex-1 h-14 rounded-2xl bg-gov-900 font-black uppercase">
                            <Save size={18} className="mr-2" /> {isCreating ? "Criar Responsável" : "Salvar Alterações"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* MODAL: BENS SOB GUARDA */}
            <Modal isOpen={!!viewingUserItems} onClose={() => setViewingUserItems(null)} title="Inventário sob Guarda Direta" size="lg">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl text-white">
                        <img src={viewingUserItems?.avatarUrl} className="w-16 h-16 rounded-xl object-cover border-2 border-white/20" alt="" />
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">{viewingUserItems?.name}</h3>
                            <p className="text-xs text-gov-400 font-bold uppercase">{viewingUserItems?.department} • Nível {viewingUserItems?.hierarchyLevel}</p>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scroll space-y-2">
                        {assets.filter(a => a.responsibleId === viewingUserItems?.id).length > 0 ? (
                            assets.filter(a => a.responsibleId === viewingUserItems?.id).map(asset => (
                                <div key={asset.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-gov-400 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><Package size={20} /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase">{asset.name}</p>
                                            <p className="text-[9px] font-mono text-gov-600 font-bold">{asset.id} • {asset.category}</p>
                                        </div>
                                    </div>
                                    <Badge color={asset.state === 'GOOD' ? 'green' : 'yellow'}>{asset.state}</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 opacity-30">
                                <ClipboardList size={48} className="mx-auto mb-2" />
                                <p className="text-xs font-black uppercase">Nenhum bem vinculado a este CPF.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Expurgar Responsável"
                message={`Deseja realmente remover "${userToDelete?.name}"? Esta ação removerá o vínculo de todos os bens atualmente sob sua guarda.`}
            />
        </div>
    );
};