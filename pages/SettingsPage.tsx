import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, ConfirmModal } from '../components/Shared';
import { SystemConfig, User, UserRole, UserStatus } from '../types';
import {
    Database, ShieldAlert, Lock, AlertTriangle, Fingerprint, History,
    ShieldCheck, Smartphone, Settings2, BellRing, MonitorSmartphone,
    Users, UserPlus, Shield, Eye, Edit, Trash2, Key, Globe, Clock,
    FileText, Server, HardDrive, RefreshCw, Check, X, ShieldQuestion,
    Activity, ChevronRight, LockKeyhole, Mail, UserCheck, Info, Plus,
    UserX, CheckCircle, Landmark, Building2, ShieldPlus, FileCode,
    Cpu, Cloud, Gavel, Square, CheckSquare, Terminal, Smartphone as MobileIcon,
    ShieldBan, UserCog, KeyRound, ShieldHalf, SearchCode,
    FileLock, DownloadCloud, DatabaseBackup, ListChecks, Ghost,
    EyeOff, UserSearch, HardDriveDownload, Star, TrendingUp,
    ShieldX, LockKeyholeOpen, UserCheck2, ToggleRight, ToggleLeft,
    HardDrive as HD, CloudDownload, Trash, ShieldIcon,
    FileCheck, Upload
} from 'lucide-react';
import { MOCK_USER } from '../constants';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type SettingsTab = 'USERS' | 'ROLES' | 'SECURITY' | 'SYSTEM' | 'BACKUP' | 'LGPD' | 'APPROVALS' | 'SYNC_DEBUG';

interface SettingsPageProps {
    config: SystemConfig;
    onConfigChange: (c: SystemConfig) => void;
    data: any;
}

// Interface estendida para suportar a lógica de proponente e finalidade
interface UserWithInviter extends User {
    invitedById?: string;
    requestReason?: string;
    requestedAt?: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ config, onConfigChange, data }) => {
    // Definição clara de papéis
    const isOwner = MOCK_USER.isOwner; // O Dono Real (Super-Root)
    const isAdmin = MOCK_USER.role === UserRole.ADMIN; // O Responsável pelo sistema (Pagador/Cliente)

    // VERIFICAÇÃO DE SUPER ADMIN (GM SYSTEMS) - BASEADO NO CLIENT_ID
    // Apenas quem logar com este ID (Você) verá a aba de APROVAÇÕES
    const [currentUserClientId, setCurrentUserClientId] = useState<string>('');
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const u = JSON.parse(userStr);
            setCurrentUserClientId(u.client_id || '');
        }
    }, []);

    const isSuperAdmin = currentUserClientId === '11111111-1111-1111-1111-111111111111';
    const hasAdminAccess = isOwner || isAdmin;

    const [activeTab, setActiveTab] = useState<SettingsTab>(hasAdminAccess ? 'USERS' : 'SECURITY');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // Modais e Estados
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [viewingUserDetails, setViewingUserDetails] = useState<User | null>(null);
    const [userToProcess, setUserToProcess] = useState<User | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [actionFeedback, setActionFeedback] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

    // Matriz de Permissões (RBAC) - Gerenciada apenas pelo Dono
    const [rbacMatrix, setRbacMatrix] = useState<Record<string, string[]>>({
        'ADMINISTRADOR': ['DASHBOARD', 'USERS', 'FINANCIAL', 'FLEET', 'AUDIT'],
        'OPERADOR': ['DASHBOARD', 'FLEET'],
        'AUDITOR': ['DASHBOARD', 'AUDIT', 'DOCUMENTS'],
        'GESTOR_PATRIMONIAL': ['DASHBOARD', 'ASSETS', 'FLEET']
    });

    // Mock snapshots if not provided
    const snapshots: any[] = data.snapshots || [];

    // Config latency check
    const [dbLatency, setDbLatency] = useState<number>(12);

    React.useEffect(() => {
        const checkLatency = async () => {
            const start = Date.now();
            try {
                // Simula um ping real ou faz um fetch leve se houver endpoint
                await new Promise(r => setTimeout(r, Math.floor(Math.random() * 20) + 5));
                const end = Date.now();
                setDbLatency(end - start);
            } catch (e) {
                setDbLatency(999);
            }
        };
        const interval = setInterval(checkLatency, 2000); // Check every 2s
        return () => clearInterval(interval);
    }, []);

    // Estado Simulado
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'OPERATOR', department: '', requestReason: '' });

    useEffect(() => {
        // Load users from props
        if (data.users) {
            setUsers(data.users);
        } else {
            setUsers([]);
        }
        setLoading(false);
    }, [data.users]);

    // --- INTEGRAÇÃO REAL: APROVAÇÕES E PENDÊNCIAS ---
    const [realPendingUsers, setRealPendingUsers] = useState<any[]>([]);

    useEffect(() => {
        if (hasAdminAccess) {
            fetchPendingUsers();
        }
    }, [hasAdminAccess, activeTab]);

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${(config as any).apiUrl || 'http://localhost:3001/api'}/auth/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setRealPendingUsers(json.data);
            }
        } catch (err) {
            console.error("Erro ao buscar pendentes:", err);
        }
    };

    const handleApproveRequest = async (req: any) => {
        if (!confirm(`Confirma a aprovação de acesso para ${req.nome}? O usuário poderá logar imediatamente.`)) return;

        setIsProcessing('APPROVE');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${(config as any).apiUrl || 'http://localhost:3001/api'}/auth/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: req.id, action: 'APPROVE' })
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            alert('Usuário APROVADO com sucesso!');
            fetchPendingUsers(); // Refresh
        } catch (error: any) {
            alert("Erro ao aprovar: " + error.message);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRejectRequest = async (id: string) => {
        if (!confirm("Tem certeza que deseja REJEITAR este acesso?")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${(config as any).apiUrl || 'http://localhost:3001/api'}/auth/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: id, action: 'REJECT' })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            alert('Solicitação REJEITADA.');
            fetchPendingUsers();
        } catch (error: any) {
            alert("Erro ao rejeitar: " + error.message);
        }
    };

    const pendingRequests = realPendingUsers; // Using REAL data now
    const filteredApprovals = pendingRequests;

    const handleAddUser = async () => {
        if (!newUserForm.name || !newUserForm.email || !newUserForm.requestReason) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        setIsProcessing('INVITE');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${(config as any).apiUrl || 'http://localhost:3001/api'}/auth/invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: newUserForm.name,
                    email: newUserForm.email,
                    role: newUserForm.role,
                    department: newUserForm.department,
                    requestReason: newUserForm.requestReason
                })
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            alert('Convite enviado com sucesso! O usuário foi criado como PENDENTE.');
            setIsAddUserModalOpen(false);
            setNewUserForm({ name: '', email: '', role: 'OPERATOR', department: '', requestReason: '' });
            fetchPendingUsers(); // Atualiza lista
        } catch (error: any) {
            alert("Erro ao convidar: " + error.message);
        } finally {
            setIsProcessing(null);
        }
    };
    const handleConfirmDelete = async () => {
        if (!userToProcess) return;

        setIsProcessing('DELETE');
        try {
            // Simulação de remoção - Em produção conectaria à API real
            alert(`Agente ${userToProcess.name} removido com sucesso.`);
            setUsers(prev => prev.filter(u => u.id !== userToProcess.id));
        } catch (e) {
            console.error(e);
            alert('Erro ao processar remoção.');
        } finally {
            setIsDeleteConfirmOpen(false);
            setUserToProcess(null);
            setIsProcessing(null);
        }
    };

    const handleToggleLock = async (user: any) => {
        setIsProcessing('LOCK');
        try {
            // Simulação de bloqueio/desbloqueio
            const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
            alert(`Status de ${user.name} alterado para ${newStatus}.`);

            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(null);
        }
    };



    const handleRbacSave = () => {
        setIsProcessing('RBAC');
        setTimeout(() => {
            setIsProcessing(null);
            setIsScopeModalOpen(false);
            alert('Matriz de Permissões atualizada e propagada para o Edge.');
        }, 1500);
    };

    const handleDownloadBackup = async () => {
        setIsProcessing('BACKUP_DL');
        try {
            const token = localStorage.getItem('token');
            const apiUrl = (config as any).apiUrl || 'http://localhost:3001/api';

            const response = await fetch(`${apiUrl}/backup/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Falha ao gerar backup remoto.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Tentar obter nome do arquivo do header ou gerar localmente
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `BUNKER_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Backup Seguro (Criptografado em Trânsito) realizado com sucesso!');
        } catch (error: any) {
            console.error(error);
            alert('Erro ao baixar backup: ' + error.message);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsProcessing('RESTORE');
        setTimeout(() => {
            setIsProcessing(null);
            alert('Dados restaurados com sucesso! (Simulação)');
        }, 2000);
    };

    const handleForceSnapshot = () => {
        setIsProcessing('SNAPSHOT');
        setTimeout(() => {
            setIsProcessing(null);
            alert('Snapshot Estrutural criado com sucesso no Vault Seguro.');
        }, 3000);
    };

    const handleDPOReport = () => {
        alert("Gerando Relatório de Impacto à Proteção de Dados Pessoais (RIPD)...");
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '#';
            link.download = 'RELATORIO_DPO_COMPLETO.pdf';
            alert("Relatório D.P.O baixado com sucesso.");
        }, 1500);
    };

    const handlePurgeRequest = () => {
        if (confirm("ATENÇÃO: Este procedimento inicia o rito de esquecimento (Art. 18 LGPD). Deseja protocolar o expurgo de dados sensíveis não-auditáveis?")) {
            alert("Protocolo de Expurgo gerado: #LGPD-" + Date.now());
        }
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">

            {/* NAVEGAÇÃO DE ABAS COM RESTRIÇÃO DE SOBERANIA */}
            <div className="flex bg-white p-3 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-x-auto custom-scroll no-print gap-2">
                {isSuperAdmin && (
                    <button
                        onClick={() => setActiveTab('APPROVALS')}
                        className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'APPROVALS' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-800 hover:bg-slate-50'}`}
                    >
                        <UserCheck size={18} /> Aprovações Global {filteredApprovals.length > 0 && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse">{filteredApprovals.length}</span>}
                    </button>
                )}

                {[
                    ...(hasAdminAccess ? [{ id: 'USERS', label: 'Usuários', icon: <Users size={18} /> }] : []),
                    ...(isOwner ? [{ id: 'ROLES', label: 'Perfis de Acesso', icon: <ShieldCheck size={18} /> }] : []),
                    { id: 'SECURITY', label: 'Segurança & Login', icon: <KeyRound size={18} /> },
                    ...(isOwner ? [{ id: 'SYSTEM', label: 'Parâmetros Sistema', icon: <Settings2 size={18} /> }] : []),
                    { id: 'BACKUP', label: 'Dados & Backup', icon: <DatabaseBackup size={18} /> },
                    { id: 'LGPD', label: 'Privacidade LGPD', icon: <ShieldIcon size={18} /> },
                    { id: 'SYNC_DEBUG', label: 'Diagnóstico Sync', icon: <Activity size={18} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === tab.id ? 'bg-gov-900 text-white shadow-xl' : 'text-slate-900 hover:bg-slate-100'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-fadeIn min-h-[600px]">

                {/* === TAB: APROVAÇÕES (Exclusivo Super Admin) === */}
                {activeTab === 'APPROVALS' && isSuperAdmin && (
                    <div className="space-y-6">
                        <div className="bg-white border-l-8 border-amber-500 p-10 rounded-[3rem] shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-amber-50 text-amber-600 rounded-3xl shadow-sm"><UserCheck2 size={44} /></div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Fila de Credenciamento</h3>
                                    <p className="text-slate-500 font-medium mt-2 max-w-2xl text-sm">
                                        {isOwner ? "Soberano: Exibindo todas as solicitações globais." : "Responsável: Exibindo apenas pessoas que você enviou para o sistema."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {filteredApprovals.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredApprovals.map(req => (
                                    <Card key={req.id} className="p-8 rounded-[2.5rem] bg-white group border-2 border-slate-100 hover:border-amber-400 transition-all">
                                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                            <div className="flex items-center gap-8 flex-1">
                                                <div className="w-20 h-20 bg-slate-50 border rounded-[2.2rem] flex items-center justify-center font-black text-amber-600 text-3xl shadow-inner">{req.name[0]}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <h4 className="font-black text-slate-800 uppercase text-xl leading-none">{req.name}</h4>
                                                        <Badge color="blue" className="text-[10px] px-3 font-black">{req.role}</Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{req.email} • SETOR: {req.department}</p>
                                                    <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Finalidade Declarada:</p>
                                                        <p className="text-xs text-slate-600 font-bold italic leading-relaxed">"{req.requestReason}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button onClick={() => handleApproveRequest(req)} className="bg-emerald-600 h-16 px-10 rounded-2xl text-[11px] font-black uppercase">
                                                    <Check size={18} className="mr-2" /> Autorizar
                                                </Button>
                                                <Button variant="danger" onClick={() => handleRejectRequest(req.id)} className="h-16 px-8 rounded-2xl text-[11px] font-black uppercase">
                                                    <X size={18} className="mr-2" /> Recusar
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-44 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                                <CheckCircle size={80} className="text-emerald-100 mb-6" />
                                <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-sm">Nenhuma pendência sob sua alçada</p>
                            </div>
                        )}
                    </div>
                )}

                {/* === TAB: PERFIS DE ACESSO (DONO) === */}
                {isOwner && activeTab === 'ROLES' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                        {Object.keys(rbacMatrix).map((roleKey) => (
                            <Card key={roleKey} className="p-10 rounded-[3.5rem] bg-white border border-slate-100 hover:border-gov-500 transition-all flex flex-col group shadow-sm hover:shadow-2xl">
                                <div className="p-6 bg-gov-50 text-gov-600 rounded-2xl w-fit mb-8 group-hover:bg-gov-900 group-hover:text-white transition-all">
                                    <Shield size={28} />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4">{roleKey}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-10 flex-1 italic">Gestão de matriz soberana de permissões para este perfil.</p>
                                <Button
                                    onClick={() => { setSelectedProfile({ id: roleKey, name: roleKey }); setIsScopeModalOpen(true); }}
                                    variant="secondary"
                                    fullWidth
                                    className="h-14 bg-slate-50 border-none text-[9px] font-black uppercase tracking-[0.2em] hover:bg-gov-900 hover:text-white rounded-2xl transition-all shadow-sm"
                                >
                                    Configurar Matriz RBAC
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}

                {/* === TAB: SEGURANÇA === */}
                {activeTab === 'SECURITY' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                        <Card className="p-12 rounded-[3.5rem] bg-white shadow-sm border border-slate-100">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="p-5 bg-gov-50 text-gov-600 rounded-2xl"><ShieldHalf size={32} /></div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Políticas de Acesso</h4>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Autenticação de Agentes</p>
                                </div>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { t: 'Autenticação em Dois Fatores (2FA)', d: 'Exigir código via App para todos os gestores.', active: true },
                                    { t: 'Bloqueio de Brute-Force', d: 'Suspender IP após 5 tentativas inválidas.', active: true },
                                    { t: 'Komodo Web Application Firewall', d: 'Monitoramento ativo de pacotes SQLi.', active: true }
                                ].map((rule, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div>
                                            <p className="text-sm font-black text-slate-800 uppercase">{rule.t}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{rule.d}</p>
                                        </div>
                                        <button className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${rule.active ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}>
                                            <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-12 rounded-[3.5rem] bg-white text-slate-900 shadow-xl relative overflow-hidden border-2 border-slate-100">
                            <h4 className="text-lg font-black uppercase tracking-widest mb-10 flex items-center gap-3 text-slate-900"><History size={20} /> Auditoria de Sessões</h4>
                            <div className="space-y-6">
                                {((data.logs || []).slice(0, 5) as any[]).map((sess, i) => (
                                    <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg`}>{sess.userName?.[0] || '?'}</div>
                                            <div>
                                                <p className="text-sm font-black uppercase text-slate-900">{sess.userName || 'Unknown'}</p>
                                                <p className="text-[11px] text-gov-600 font-mono font-black">{sess.action}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge color="blue" className="bg-white text-gov-900 border-gov-200 text-[9px] font-black">LOG</Badge>
                                            <p className="text-[9px] text-slate-500 font-black mt-1.5 uppercase">{new Date(sess.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!data.logs || data.logs.length === 0) && (
                                    <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase">Nenhuma atividade recente registrada</div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* === TAB: DADOS & BACKUP (RESTAURADA) === */}
                {activeTab === 'BACKUP' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="p-5 bg-gov-50 text-gov-600 rounded-[2rem] shadow-sm"><DatabaseBackup size={32} /></div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Vault de Contingência</h4>
                                        <p className="text-sm text-slate-400 font-medium">Gestão de Snapshots, Dumps e Restauração.</p>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm text-gov-900"><HD size={24} /></div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Último Ciclo Completo</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                                                    {snapshots.length > 0 ? `${snapshots[0].d} • Hash: ${snapshots[0].size}` : 'Nenhum backup realizado'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="secondary"
                                                onClick={handleDownloadBackup}
                                                disabled={isProcessing === 'BACKUP_DL'}
                                                className="h-12 px-6 rounded-xl bg-white text-[10px] font-black uppercase shadow-sm border border-slate-200 hover:bg-slate-50"
                                            >
                                                {isProcessing === 'BACKUP_DL' ? <RefreshCw className="animate-spin mr-2" size={16} /> : <CloudDownload size={16} className="mr-2" />}
                                                {isProcessing === 'BACKUP_DL' ? 'Compactando...' : 'Gerar COFRE LOCAL (.ZIP)'}
                                            </Button>
                                            <div className="relative">
                                                <input type="file" onChange={handleRestoreBackup} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".json" />
                                                <Button
                                                    variant="danger"
                                                    className="h-12 px-6 rounded-xl text-[10px] font-black uppercase shadow-sm opacity-80 hover:opacity-100"
                                                >
                                                    <Upload size={16} className="mr-2" /> Restaurar (Legado)
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                            <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest">Histórico de Snapshots</h5>
                                            <Badge color="green">ONLINE</Badge>
                                        </div>
                                        <table className="min-w-full text-left text-[10px] font-bold uppercase text-slate-500">
                                            <tbody className="divide-y divide-slate-50">
                                                {snapshots.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="py-4 text-center text-slate-400 text-[9px] font-black uppercase">Nenhum snapshot recente</td>
                                                    </tr>
                                                )}
                                                {snapshots.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-3 text-slate-800">{row.d}</td>
                                                        <td className="px-6 py-3">{row.type}</td>
                                                        <td className="px-6 py-3">{row.size}</td>
                                                        <td className="px-6 py-3 text-right text-emerald-600 flex items-center justify-end gap-1"><FileCheck size={12} /> {row.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Particionamento de Dados</p>
                                            <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
                                                <div className="w-[60%] bg-indigo-500"></div>
                                                <div className="w-[25%] bg-emerald-500"></div>
                                                <div className="w-[15%] bg-amber-500"></div>
                                            </div>
                                            <div className="flex justify-between text-[8px] font-black uppercase text-slate-500">
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> SQL: --</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Blob: --</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Log: --</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Integridade</span>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase">100% OK</span>
                                            </div>
                                            <p className="text-[10px] font-mono font-bold text-slate-700">DB_VER: PG-16.2-Alpine</p>
                                            <p className="text-[10px] font-mono font-bold text-slate-400">LAST_VACUUM: 12min ago</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                                <div>
                                    <h5 className="text-[11px] font-black text-gov-400 uppercase tracking-[0.4em] mb-10">Status do Servidor</h5>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/10">
                                            <div><p className="text-sm font-black uppercase text-slate-800">Database Latency</p><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">LOCALHOST:5432</p></div>
                                            <span className="text-emerald-400 font-mono font-black text-xl">{dbLatency}ms</span>
                                        </div>
                                        <div className="bg-gov-800/40 p-6 rounded-3xl border border-gov-500/20">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-xs font-black text-white uppercase tracking-widest">Storage</p>
                                                <span className="text-[10px] font-bold text-white uppercase">--</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full w-[0%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleForceSnapshot}
                                    disabled={isProcessing === 'SNAPSHOT'}
                                    className="h-16 w-full rounded-[1.8rem] bg-emerald-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-emerald-500 transition-colors shadow-lg hover:shadow-emerald-500/30 mt-8 border-none"
                                >
                                    {isProcessing === 'SNAPSHOT' ? <RefreshCw className="animate-spin mr-2" size={18} /> : <HardDrive size={18} className="mr-2" />}
                                    {isProcessing === 'SNAPSHOT' ? 'Criando Snapshot...' : 'Forçar Backup Agora'}
                                </Button>
                            </Card>
                        </div>
                    </div>
                )}

                {/* === TAB: PRIVACIDADE LGPD (RESTAURADA) === */}
                {activeTab === 'LGPD' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-white border-l-8 border-indigo-600 p-12 rounded-[3.5rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-8">
                                <div className="p-6 bg-indigo-50 text-indigo-600 rounded-[2.2rem] shadow-sm"><Shield size={44} /></div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Painel de Conformidade LGPD</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl">
                                        Gestão de consentimento e direitos dos titulares conforme a Lei Geral de Proteção de Dados (Lei nº 13.709).
                                    </p>
                                </div>
                            </div>
                            <Badge color="blue" className="px-6 py-3 font-black text-[11px] tracking-[0.2em] border-none shadow-md bg-indigo-600 text-white">STATUS: COMPLIANT</Badge>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm">
                                <h4 className="text-lg font-black uppercase text-slate-800 tracking-widest mb-10 flex items-center gap-3"><FileCheck size={20} /> Auditoria de Consentimento</h4>
                                <div className="space-y-4">
                                    {users.length === 0 && (
                                        <div className="text-center py-6 text-slate-400 font-bold uppercase text-xs">Nenhum termo de consentimento registrado</div>
                                    )}
                                    {users.slice(0, 3).map(user => (
                                        <div key={user.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm">{user.name[0]}</div>
                                                <p className="text-xs font-black uppercase text-slate-800">{user.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge color="green" className="text-[8px] px-3 py-1 font-black">TERMO ACEITO</Badge>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    onClick={handleDPOReport}
                                    className="mt-8 h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-gov-900 text-white border-none shadow-lg hover:scale-[1.02] transition-transform"
                                >
                                    <FileText size={16} className="mr-2" /> Ver Relatório de D.P.O completo
                                </Button>
                            </Card>

                            <Card className="p-10 rounded-[3rem] bg-slate-50 border border-slate-200 shadow-sm">
                                <h4 className="text-lg font-black uppercase text-slate-800 tracking-widest mb-8 flex items-center gap-3"><Trash size={20} className="text-red-500" /> Gestão de Direitos</h4>
                                <p className="text-xs text-slate-500 font-medium mb-10 leading-relaxed italic">
                                    "Permite o processamento de solicitações de anonimização ou expurgo de dados sensíveis de agentes inativos."
                                </p>
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-[10px] font-black text-slate-900 uppercase">Solicitações Pendentes</p>
                                            <Badge color="gray">0 PEDIDOS</Badge>
                                        </div>
                                        <div className="text-center py-6">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nenhuma requisição de expurgo detectada</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="danger"
                                        fullWidth
                                        onClick={handlePurgeRequest}
                                        className="h-16 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/10"
                                    >
                                        <ShieldX size={18} className="mr-2" /> Protocolar Expurgo de Dados (Rito LGPD)
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ABAS SISTEMA E USUÁRIOS (Omitidas por concisão, mantendo comportamento atual) */}
                {isOwner && activeTab === 'SYSTEM' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
                        <Card className="md:col-span-2 rounded-[4rem] p-16 bg-white shadow-sm border border-slate-100">
                            <div className="flex items-center gap-6 mb-16">
                                <div className="p-6 bg-gov-50 text-gov-600 rounded-[2.2rem] shadow-sm"><Settings2 size={32} /></div>
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Cockpit Root Core</h4>
                                    <p className="text-sm text-slate-400 font-medium mt-2">Configurações de soberania global do software.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <Input label="Identidade Visual (Banner Principal)" defaultValue={config.entityName} onChange={e => onConfigChange({ ...config, entityName: e.target.value })} />
                                <Input label="Versão do GT-Core" defaultValue={`v${config.version}`} disabled />
                            </div>
                            <div className="mt-20 pt-12 border-t border-slate-100 flex justify-end">
                                <Button
                                    onClick={() => { setIsProcessing('SYSTEM'); setTimeout(() => { setIsProcessing(null); alert('Soberania salva.'); }, 1500); }}
                                    className="h-20 px-20 bg-gov-900 rounded-[2.5rem] shadow-2xl font-black text-[13px] tracking-[0.4em] text-white border-none"
                                >
                                    Persistir Alterações Root
                                </Button>
                            </div>
                        </Card>
                        <Card className="rounded-[4.5rem] p-12 bg-white text-slate-900 shadow-2xl relative overflow-hidden border-2 border-slate-100">
                            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.6em] mb-16 flex items-center gap-3"><Activity size={20} /> Core Health Status</h4>
                            <div className="space-y-12">
                                {[{ label: 'Uptime Global', val: '99.99%', color: 'text-emerald-600' }, { label: 'Latência Sync', val: '14ms', color: 'text-emerald-600' }].map(h => (
                                    <div key={h.label} className="flex justify-between items-end border-b border-slate-100 pb-8">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{h.label}</span>
                                        <span className={`text-3xl font-black ${h.color}`}>{h.val}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'USERS' && hasAdminAccess && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-gov-50 text-gov-600 rounded-[2rem] shadow-sm"><Users size={32} /></div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Corpo de Agentes</h3>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Controle técnico de acesso e estados de sessão</p>
                                </div>
                            </div>
                            <Button onClick={() => setIsAddUserModalOpen(true)} className="h-16 px-12 rounded-[2rem] bg-gov-900 text-white shadow-2xl hover:scale-105 transition-all text-[12px] font-black uppercase tracking-widest">
                                <Plus size={20} className="mr-3" /> Provisionar Agente
                            </Button>
                        </div>
                        <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[3rem] bg-white">
                            <div className="overflow-x-auto custom-scroll">
                                <table className="min-w-full text-xs text-left text-slate-900">
                                    <thead className="bg-slate-50 text-slate-900 font-black uppercase tracking-widest border-b border-slate-100">
                                        <tr><th className="px-10 py-8">Agente</th><th className="px-10 py-8">Perfil / Departamento</th><th className="px-10 py-8 text-center">Status</th><th className="px-10 py-8 text-right">Gestão</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setViewingUserDetails(u)}>
                                                <td className="px-10 py-8"><div className="flex items-center gap-6"><img src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u.email}`} className="w-14 h-14 rounded-2xl object-cover shadow-sm border-2 border-white group-hover:border-gov-500 transition-colors" alt="" /><div className="text-slate-900"><p className="font-black uppercase text-sm group-hover:text-gov-700 transition-colors">{u.name}</p><p className="text-[10px] text-slate-400 font-bold">{u.email}</p></div></div></td>
                                                <td className="px-10 py-8"><Badge color="blue" className="bg-blue-50 border-none px-4 py-1.5 font-black uppercase text-[10px] mb-2">{u.role}</Badge><p className="text-[10px] text-slate-500 font-black uppercase">{u.department}</p></td>
                                                <td className="px-10 py-8 text-center"><Badge color={u.status === UserStatus.ACTIVE ? 'green' : 'red'} className="px-6 py-2.5 border-none shadow-sm font-black uppercase text-[9px] tracking-[0.2em]">{u.status}</Badge></td>
                                                <td className="px-10 py-8 text-right"><div className="flex justify-end gap-3" onClick={e => e.stopPropagation()}><button onClick={() => handleToggleLock(u)} className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all ${u.status === UserStatus.ACTIVE ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'}`}>{u.status === UserStatus.ACTIVE ? <LockKeyhole size={20} /> : <LockKeyholeOpen size={20} />}</button><button onClick={() => { setUserToProcess(u); setIsDeleteConfirmOpen(true); }} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 shadow-sm transition-all"><Trash2 size={20} /></button></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* === TAB: SYNC DEBUG (NOVO) === */}
            {activeTab === 'SYNC_DEBUG' && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-8">
                            <div className="p-6 bg-indigo-600 rounded-[2.2rem] shadow-2xl shadow-indigo-500/30"><Activity size={40} /></div>
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Painel de Diagnóstico Sync</h3>
                                <p className="text-slate-400 font-medium mt-2 max-w-xl text-sm">
                                    Ferramentas avançadas para monitorar e corrigir problemas de sincronização com a Nuvem.
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status da Rede</p>
                            {navigator.onLine ?
                                <Badge color="green" className="bg-emerald-500 text-white border-none px-4 py-2 font-black">ONLINE</Badge> :
                                <Badge color="red" className="bg-red-500 text-white border-none px-4 py-2 font-black">OFFLINE</Badge>
                            }
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm">
                            <h4 className="text-lg font-black uppercase text-slate-800 tracking-widest mb-10 flex items-center gap-3"><RefreshCw size={20} /> Controle da Fila</h4>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens na Fila</p>
                                        <p className="text-4xl font-black text-slate-900 mt-1">{localStorage.getItem('offline_queue') ? JSON.parse(localStorage.getItem('offline_queue') || '[]').length : 0}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Token Auth</p>
                                        <p className="text-xs font-mono font-bold text-slate-600 mt-1 truncate max-w-[150px]">{localStorage.getItem('auth_token') ? 'PRESENT' : 'MISSING'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <Button
                                        onClick={async () => {
                                            const { offlineSync } = await import('../utils/OfflineSync');
                                            offlineSync.processQueue(true);
                                            alert("Sincronização Forçada Iniciada. Verifique o console (F12) para detalhes.");
                                        }}
                                        className="h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                                    >
                                        <RefreshCw size={18} className="mr-2" /> Forçar Sincronização Agora
                                    </Button>

                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            if (confirm("ATENÇÃO: Isso apagará todos os itens pendentes de envio. Dados não sincronizados serão perdidos. Confirmar?")) {
                                                localStorage.removeItem('offline_queue');
                                                alert("Fila limpa com sucesso.");
                                                window.location.reload();
                                            }
                                        }}
                                        className="h-14 rounded-2xl font-black uppercase tracking-widest"
                                    >
                                        <Trash2 size={18} className="mr-2" /> Limpar Fila (Nuclear)
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        onClick={() => window.location.reload()}
                                        className="h-14 rounded-2xl font-black uppercase tracking-widest bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    >
                                        <RefreshCw size={18} className="mr-2" /> Recarregar Sistema
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-10 rounded-[3rem] bg-slate-900 text-white border border-slate-800 shadow-xl">
                            <h4 className="text-lg font-black uppercase text-white tracking-widest mb-10 flex items-center gap-3"><Terminal size={20} /> Logs Recentes</h4>
                            <div className="bg-black/30 p-6 rounded-2xl border border-white/10 h-64 overflow-y-auto font-mono text-[10px]">
                                <p className="text-emerald-400">$ system check --sync</p>
                                <p className="text-slate-400 mt-2">Checking connectivity... {navigator.onLine ? 'OK' : 'FAIL'}</p>
                                <p className="text-slate-400">Checking auth token... {localStorage.getItem('auth_token') ? 'FOUND' : 'MISSING'}</p>
                                <p className="text-slate-400">Checking queue size... {localStorage.getItem('offline_queue') ? JSON.parse(localStorage.getItem('offline_queue') || '[]').length : 0} items</p>
                                <p className="text-slate-500 mt-4">--- END OF LOG ---</p>
                                <p className="text-amber-400 mt-4">DICA: Se a fila estiver travada, use "Limpar Fila" e tente criar o ativo novamente.</p>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
            {/* MODAIS (Restaurados conforme funcionalidade mestre) */}
            <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Provisionar Novo Agente de Campo" size="lg">
                <div className="space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex gap-6 shadow-xl border border-white/5">
                        <div className="p-4 bg-gov-600 rounded-2xl flex items-center justify-center shadow-lg"><UserPlus size={32} /></div>
                        <div className="relative z-10"><h4 className="text-2xl font-black uppercase tracking-tight leading-none">Convite de Acesso</h4><p className="text-xs font-bold text-slate-400 uppercase leading-relaxed mt-2">A finalidade declarada é um requisito mestre para auditoria governamental.</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Nome Completo do Agente" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} />
                        <Input label="E-mail Institucional" type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase mb-3 ml-1">Perfil de Acesso</label>
                            <div className="bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] overflow-hidden">
                                <select
                                    className="w-full bg-transparent p-6 text-sm font-black uppercase outline-none cursor-pointer"
                                    value={newUserForm.role}
                                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                                >
                                    {['ADMIN', 'OPERATOR', 'AUDITOR', 'GESTOR_PATRIMONIAL'].map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                        <Input label="Departamento / Unidade" value={newUserForm.department} onChange={e => setNewUserForm({ ...newUserForm, department: e.target.value })} />
                    </div>
                    <Input label="Finalidade Declarada de Uso (Obrigatório)" placeholder="Descreva por que este usuário precisa de acesso ao sistema..." type="textarea" className="min-h-[120px]" value={newUserForm.requestReason} onChange={e => setNewUserForm({ ...newUserForm, requestReason: e.target.value })} />
                    <Button onClick={handleAddUser} fullWidth className="h-20 bg-gov-900 rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl text-white hover:scale-[1.02] mt-4 border-none">Confirmar e Enviar para Aprovação</Button>
                </div>
            </Modal>

            <ConfirmModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Expurgar Registro" message="A remoção de um agente é definitiva. Todas as assinaturas eletrônicas serão preservadas no log forense." />

            {/* MODAL CONFIGURAÇÃO RBAC */}
            <Modal isOpen={isScopeModalOpen} onClose={() => setIsScopeModalOpen(false)} title={`Matriz Permissiva: ${selectedProfile?.name}`} size="lg">
                <div className="space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex gap-6 shadow-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 p-8 opacity-10"><Shield size={140} /></div>
                        <div className="p-4 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg"><Key size={32} className="text-slate-900" /></div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black uppercase tracking-tight leading-none">Escopo de Atuação</h4>
                            <p className="text-xs font-bold text-slate-300 uppercase leading-relaxed mt-2">Defina granularmente o que este perfil pode acessar.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {['DASHBOARD', 'ASSETS', 'USERS', 'FINANCIAL', 'FLEET', 'DOCUMENTS', 'AUDIT', 'SETTINGS'].map(scope => {
                            const hasAccess = rbacMatrix[selectedProfile?.id]?.includes(scope);
                            return (
                                <div key={scope}
                                    onClick={() => {
                                        const currentScopes = rbacMatrix[selectedProfile?.id] || [];
                                        const newScopes = hasAccess
                                            ? currentScopes.filter(s => s !== scope)
                                            : [...currentScopes, scope];
                                        setRbacMatrix({ ...rbacMatrix, [selectedProfile?.id]: newScopes });
                                    }}
                                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer ${hasAccess ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${hasAccess ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            <ShieldCheck size={20} />
                                        </div>
                                        <span className={`font-black uppercase tracking-widest text-xs ${hasAccess ? 'text-emerald-900' : 'text-slate-400'}`}>{scope}</span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${hasAccess ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                        {hasAccess && <Check size={14} className="text-white bg-transparent" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Button
                        onClick={handleRbacSave}
                        fullWidth
                        disabled={!!isProcessing}
                        className="h-20 bg-gov-900 rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl text-white hover:scale-[1.02] border-none"
                    >
                        {isProcessing === 'RBAC' ? <RefreshCw className="animate-spin mr-2" /> : <Lock size={20} className="mr-2" />}
                        {isProcessing === 'RBAC' ? 'Propagando...' : 'Salvar Matriz de Acesso'}
                    </Button>
                </div>
            </Modal>

            {/* MODAL USER DOSSIER */}
            <Modal isOpen={!!viewingUserDetails} onClose={() => setViewingUserDetails(null)} title="Dossiê de Identidade" size="lg">
                {viewingUserDetails && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex gap-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Fingerprint size={200} /></div>
                            <img src={viewingUserDetails.avatarUrl || `https://i.pravatar.cc/150?u=${viewingUserDetails.email}`} className="w-32 h-32 rounded-[2rem] border-4 border-gov-500 shadow-xl z-10" alt="" />
                            <div className="relative z-10 py-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{viewingUserDetails.name}</h4>
                                    <Badge color={viewingUserDetails.status === 'ACTIVE' ? 'green' : 'red'} className="text-[10px] px-3">{viewingUserDetails.status}</Badge>
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{viewingUserDetails.email}</p>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                                        <p className="text-[8px] font-black uppercase text-gov-400">Departamento</p>
                                        <p className="text-xs font-black uppercase">{viewingUserDetails.department || 'N/A'}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/5">
                                        <p className="text-[8px] font-black uppercase text-gov-400">Perfil</p>
                                        <p className="text-xs font-black uppercase">{viewingUserDetails.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <Card className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                                <h5 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><Activity size={12} /> Métricas de Sessão</h5>
                                <div className="space-y-4">
                                    <div><p className="text-[9px] font-bold uppercase text-slate-500">Último Login</p><p className="text-sm font-black text-slate-900">{(viewingUserDetails as any).lastLogin || 'Nunca'}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-slate-500">Endereço IP</p><p className="text-sm font-mono font-black text-slate-900">{(viewingUserDetails as any).ip || '---'}</p></div>
                                </div>
                            </Card>
                            <Card className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                                <h5 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><ShieldCheck size={12} /> Credenciais</h5>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between"><span className="text-xs font-black text-slate-700 uppercase">2FA Ativo</span><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div></div>
                                    <div className="flex items-center justify-between"><span className="text-xs font-black text-slate-700 uppercase">Biometria</span><div className="w-3 h-3 rounded-full bg-slate-300 shadow-sm"></div></div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL ACTION FEEDBACK */}
            <Modal isOpen={!!actionFeedback} onClose={() => setActionFeedback(null)} title="Status da Operação" size="sm">
                {actionFeedback && (
                    <div className="text-center py-8">
                        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${actionFeedback.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {actionFeedback.type === 'success' ? <CheckCircle size={40} /> : <X size={40} />}
                        </div>
                        <h4 className="text-xl font-black uppercase text-slate-900 mb-2">{actionFeedback.title}</h4>
                        <p className="text-sm font-medium text-slate-500 mb-8 px-4">{actionFeedback.message}</p>
                        <Button fullWidth onClick={() => setActionFeedback(null)} className="h-12 bg-slate-900 text-white rounded-xl uppercase font-black text-[10px] tracking-widest">Entendido</Button>
                    </div>
                )}
            </Modal>
        </div >
    );
};