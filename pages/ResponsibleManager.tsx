import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from '../components/Shared';
import { User, Asset, UserStatus, UserRole, AssetState } from '../types';
import { Users, UserPlus, Building, Package, Edit2, Eye, Trash2, ShieldCheck, Mail, Search } from 'lucide-react';

interface ResponsibleManagerProps {
    users: User[];
    assets: Asset[];
    onUpdateUser: (user: User) => void;
    onAddUser: (user: User) => void;
    onDeleteUser: (id: string) => void;
}

export const ResponsibleManager: React.FC<ResponsibleManagerProps> = ({ users, assets, onUpdateUser, onAddUser, onDeleteUser }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToViewAssets, setUserToViewAssets] = useState<User | null>(null);
    const [assetSearchTerm, setAssetSearchTerm] = useState('');

    const [formData, setFormData] = useState<Partial<User>>({
        id: '', name: '', email: '', department: 'ADMINISTRATIVO', hierarchyLevel: 3, avatarUrl: 'https://i.pravatar.cc/150'
    });

    const getUserAssetCount = (userId: string) => assets.filter(a => a.responsibleId === userId).length;

    const handleSaveUser = () => {
        if (!formData.name || !formData.email) return alert("Nome e Email são obrigatórios");

        const newUser: User = {
            id: userToEdit ? userToEdit.id : `USR-${Date.now()}`,
            name: formData.name!,
            email: formData.email!,
            department: formData.department as any || 'ADMINISTRATIVO',
            role: userToEdit?.role || UserRole.OPERATOR,
            status: userToEdit?.status || UserStatus.ACTIVE,
            avatarUrl: formData.avatarUrl || 'https://i.pravatar.cc/150',
            hierarchyLevel: formData.hierarchyLevel || 3
        };

        if (userToEdit) {
            onUpdateUser(newUser);
        } else {
            // @ts-ignore - Prop requires update in App.tsx to accept arg
            onAddUser(newUser);
        }

        setIsAddModalOpen(false);
        setUserToEdit(null);
        setFormData({ id: '', name: '', email: '', department: 'ADMINISTRATIVO', hierarchyLevel: 3, avatarUrl: 'https://i.pravatar.cc/150' });
    };

    const openEdit = (u: User) => {
        setUserToEdit(u);
        setFormData(u);
        setIsAddModalOpen(true);
    };

    const getAssetsForUser = (userId: string) => {
        return assets.filter(a => a.responsibleId === userId && (
            a.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
            a.id.toLowerCase().includes(assetSearchTerm.toLowerCase())
        ));
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-gov-500 rounded-3xl text-slate-900 shadow-xl"><Users size={32} /></div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Corpo de Responsáveis</h2>
                        <p className="text-slate-400 font-medium">Gestão de detentores de carga e fiel depositários.</p>
                    </div>
                </div>
                <Button onClick={() => { setUserToEdit(null); setIsAddModalOpen(true); }} className="bg-gov-500 hover:bg-gov-400 text-slate-900 border-none rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest shadow-xl">
                    <UserPlus size={20} className="mr-3" /> Credenciar Novo
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map(user => (
                    <Card key={user.id} className="p-0 overflow-hidden rounded-[2.5rem] border-none shadow-lg hover:shadow-2xl transition-all bg-white group">
                        <div className="p-8">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative">
                                    <img className="h-20 w-20 rounded-[1.5rem] border-4 border-slate-50 shadow-xl object-cover" src={user.avatarUrl} alt="" />
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white shadow-lg"><ShieldCheck size={14} /></div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-tight truncate">{user.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mt-1"><Mail size={10} /> {user.email}</p>
                                    <Badge color="blue" className="mt-2 text-[8px] font-black uppercase tracking-widest">Nível {user.hierarchyLevel || 4}</Badge>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <Building size={16} className="text-gov-600" />
                                    <span className="text-[10px] font-black uppercase truncate">{user.department}</span>
                                </div>
                                <div className="bg-gov-50 p-5 rounded-2xl border-2 border-dashed border-gov-200 flex justify-between items-center group-hover:border-gov-400 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Package size={20} className="text-gov-600" />
                                        <span className="text-[9px] font-black text-gov-800 uppercase">Itens sob Guarda</span>
                                    </div>
                                    <span className="text-2xl font-black text-gov-900">{getUserAssetCount(user.id)}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="secondary" className="flex-1 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest bg-slate-50 border-none hover:bg-gov-100" onClick={() => setUserToViewAssets(user)}>
                                    <Eye size={16} className="mr-2" /> Ver Itens
                                </Button>
                                <Button variant="secondary" className="flex-1 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest bg-slate-50 border-none hover:bg-gov-100" onClick={() => openEdit(user)}>
                                    <Edit2 size={16} className="mr-2" /> Editar
                                </Button>
                                <Button variant="ghost" className="rounded-xl w-12 h-12 text-red-400 hover:bg-red-50 hover:text-red-600" onClick={() => onDeleteUser(user.id)}>
                                    <Trash2 size={20} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* MODAL ADD/EDIT USER */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={userToEdit ? "Editar Credencial" : "Nova Credencial"} size="md">
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                        <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do Responsável" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Corporativo</label>
                        <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@gov.br" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departamento</label>
                            <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20"
                                value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value as any })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível Hierárquico</label>
                            <input type="number" min="1" max="5" className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-500/20"
                                value={formData.hierarchyLevel} onChange={e => setFormData({ ...formData, hierarchyLevel: Number(e.target.value) })} />
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button onClick={handleSaveUser} fullWidth className="h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Salvar Credenciais</Button>
                    </div>
                </div>
            </Modal>

            {/* MODAL VIEW ASSETS */}
            <Modal isOpen={!!userToViewAssets} onClose={() => setUserToViewAssets(null)} title={`Carga Patrimonial: ${userToViewAssets?.name}`} size="lg">
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                        <Search size={20} className="text-slate-400 ml-2" />
                        <input className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700"
                            placeholder="Filtrar itens sob guarda..." value={assetSearchTerm} onChange={e => setAssetSearchTerm(e.target.value)} />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scroll space-y-3 pr-2">
                        {userToViewAssets && getAssetsForUser(userToViewAssets.id).length === 0 && (
                            <div className="text-center py-10 text-slate-400">
                                <Package size={48} className="mx-auto mb-3 opacity-20" />
                                <p className="text-xs font-bold">Nenhum ativo vinculado.</p>
                            </div>
                        )}
                        {userToViewAssets && getAssetsForUser(userToViewAssets.id).map(asset => (
                            <div key={asset.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-gov-300 transition-all">
                                <img src={asset.imageUrl} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                                <div className="flex-1">
                                    <h4 className="text-xs font-black text-slate-800 uppercase">{asset.name}</h4>
                                    <p className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1 font-mono">{asset.id}</p>
                                </div>
                                <div className="text-right">
                                    <Badge color={asset.state === AssetState.GOOD ? 'green' : 'yellow'} className="text-[9px]">{asset.state}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};
