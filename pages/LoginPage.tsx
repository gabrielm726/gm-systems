import React, { useState } from 'react';
import logoImg from '../assets/gm_logo.jpg';

import { Button, Input, Badge } from '../components/Shared';
// Added Info to the imports from lucide-react
import { ShieldCheck, Zap, Globe, Fingerprint, ChevronRight, ArrowLeft, Send, Settings } from 'lucide-react';
import { EntityType } from '../types';
import { API_URL } from '../constants';

interface LoginPageProps {
    onLogin: (email: string) => void;
}

type AuthView = 'LOGIN' | 'FORGOT' | 'RESET_TOKEN' | 'REGISTER' | 'CONFIG';

import { AuthService } from '../src/services/AuthService';

// ... (imports remain)

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [view, setView] = useState<AuthView>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Reset States
    const [resetEmail, setResetEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Config State
    const [tempApiUrl, setTempApiUrl] = useState('');

    const [loading, setLoading] = useState(false);

    // API CONFIG
    // Dynamically get from Constants (which reads from localStorage) or fallback
    const AUTH_URL = `${API_URL}/auth`;

    const saveConfig = () => {
        if (!tempApiUrl) return;
        localStorage.setItem('custom_api_url', tempApiUrl);
        alert('Configuração salva! O sistema será recarregado.');
        window.location.reload();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Helper to process successful login response
        const processLoginSuccess = async (data: any) => {
            if (data.user.status !== 'ATIVO') {
                alert('SEU CADASTRO ESTÁ PENDENTE.\nAguarde aprovação do administrador.');
                return false;
            }
            AuthService.setToken(data.token);
            AuthService.setUser(data.user);
            await AuthService.saveSessionOffline(data.user, data.token, password);
            console.log('✅ Login realizado:', data.user.nome);
            onLogin(email);
            return true;
        };

        try {
            // 1. Authenticate with Node.js Backend (TiDB/MySQL) - CLOUD
            console.log('🚀 Tentando Login Nuvem:', AUTH_URL);

            let response: Response;

            try {
                response = await fetch(`${AUTH_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, client_id: '11111111-1111-1111-1111-111111111111' })
                });

                // CRITICAL FIX: If Cloud returns 500/404/etc, treat as failure to trigger Local Fallback
                if (!response.ok) {
                    throw new Error(`Cloud Error: ${response.status}`);
                }

            } catch (cloudErr) {
                // Cloud failed (Network or 500), try LOCAL
                console.warn('⚠️ Nuvem instável/indisponível. Mudando para Motor Local...');
                try {
                    // TRY LOCAL BACKEND (Hybrid Mode)
                    // Note: Localhost doesn't have /api prefix in the fallback URL if not careful, 
                    // but server.js mounts at /, routes are at /api... wait.
                    // server.js: app.use('/api/auth', ...). 
                    // So URL should be http://localhost:3002/api/auth/login
                    response = await fetch(`http://localhost:3002/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, client_id: '11111111-1111-1111-1111-111111111111' })
                    });
                    console.log('✅ Conectado ao Servidor Local!');
                } catch (localErr) {
                    // FORCE ERROR TO GO TO CATCH BLOCK FOR OFFLINE FALLBACK
                    throw new Error('Todas as conexões falharam (Nuvem e Local).');
                }
            }

            // Process Response (Cloud or Local)
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Servidor retornou erro não-JSON (500/502).`);
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha na autenticação');

            // Success
            await processLoginSuccess(data);

        } catch (error: any) {
            console.error('Login Error:', error);

            // FALLBACK FINAL: OFFLINE CACHE (SQLite)
            console.log('⚠️ Falha de Conexão Geral. Tentando Modo Offline (Cache de Sessão)...');
            const offlineUser = await AuthService.loginOffline(email, password);

            if (offlineUser) {
                AuthService.setToken(offlineUser.token);
                AuthService.setUser(offlineUser);
                alert('MODO OFFLINE ATIVADO (Sem Internet)\n\nVocê entrou usando seus dados salvos localmente.');
                onLogin(email);
                return;
            }

            // Exibir erro detalhado para diagnóstico
            alert(`FALHA DE CONEXÃO 🚫\n\nErro Técnico: ${error.message}\n\nTentativas:\n1. Nuvem: ${AUTH_URL}\n2. Local: http://localhost:3002\n\nDica: Verifique se o 'AMBIENTE_COMPLETO.bat' está rodando.`);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${AUTH_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            alert(`SUCESSO!\n\n${data.message}`);
            setView('RESET_TOKEN');
        } catch (err: any) {
            alert("Erro: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${AUTH_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, newPassword })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            alert("Senha redefinida com sucesso! Faça login agora.");
            setView('LOGIN');
        } catch (err: any) {
            alert("Erro: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const nome = (document.getElementById('reg_name') as HTMLInputElement)?.value;
        const motivo = "Cadastro inicial via App";

        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    email,
                    password,
                    // Envia 'NEW' para forçar criação de nova organização (SaaS Mode)
                    // O backend vai ignorar o ID antigo e criar um UUID novo baseado no nome da organização
                    client_id: 'NEW',
                    motivo_cadastro: (document.getElementById('reg_reason') as HTMLInputElement)?.value,
                    organization: (document.getElementById('reg_org') as HTMLInputElement)?.value,
                    cnpj: (document.getElementById('reg_cnpj') as HTMLInputElement)?.value
                })
            })


            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Erro no cadastro');

            alert('Cadastro realizado com sucesso!\n\nSeu acesso ficará como PENDENTE aguardando aprovação do administrador Master.');
            setView('LOGIN');

        } catch (error: any) {
            alert('Erro ao cadastrar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of render)
    return (
        <div className="w-full h-full bg-white flex flex-col lg:flex-row relative font-sans">
            {/* LADO ESQUERDO: INFRAESTRUTURA E CONCEITO (MANTIDO IGUAL) */}
            <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-gov-900 to-slate-900"></div>

                <div className="relative z-10">
                    <div className="flex flex-row items-center gap-6 mb-8">
                        {/* INCREASED LOGO SIZE */}
                        <div className="w-24 h-24 rounded-2xl shadow-2xl overflow-hidden border border-gov-500/50 shrink-0">
                            <img src={logoImg} className="w-full h-full object-cover" alt="Logo GT" />
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">GM Systems <br /><span className="text-gov-500 text-xl">& Gestão Patrimonial</span></h1>
                    </div>

                    <h2 className="text-3xl font-black leading-tight tracking-tighter mb-4">
                        Soberania de Dados <br /><span className="text-gov-500">Setorial Integrada.</span>
                    </h2>

                    <div className="space-y-3">
                        {[
                            { t: 'Híbrido Nativo', d: 'Conformidade NBC TSP e IFRS simultânea.' },
                            { t: 'Blockchain Ready', d: 'Logs imutáveis para prestação de contas.' },
                            { t: 'Auditável 24/7', d: 'Monitoramento via Mobile/Web.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="mt-1">
                                    <Zap size={14} className="text-gov-400" />
                                </div>
                                <div>
                                    <p className="font-black uppercase text-[9px] tracking-widest text-white">{item.t}</p>
                                    <p className="text-[11px] text-slate-400 font-medium">{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-6 border-t border-white/5 flex items-center justify-between text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <span>Enterprise v2.5.0</span>
                    <span className="flex items-center gap-1"><Globe size={10} /> Sistema Federado</span>
                </div>
            </div>

            {/* LADO DIREITO: OPERAÇÃO (LOGIN/CADASTRO) */}
            <div className="p-8 lg:p-12 bg-white flex flex-col justify-center">

                {/* HEADER MOBILE (Visible only on small screens) */}
                <div className="lg:hidden w-full flex flex-col items-center mb-8 text-center">
                    <div className="w-20 h-20 rounded-2xl shadow-lg overflow-hidden border border-slate-200 mb-4">
                        <img src="/logo-gt.jpg" className="w-full h-full object-cover" alt="Logo GT" />
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">GM Systems</h1>
                    <span className="text-gov-600 text-sm font-bold uppercase tracking-widest mt-1">& Gestão Patrimonial</span>
                </div>

                {/* VIEW: LOGIN */}
                {view === 'LOGIN' && (
                    <div className="animate-fadeIn w-full max-w-md mx-auto">
                        <div className="mb-6">
                            <Badge color="dark" className="mb-2 px-3 py-1 font-black uppercase tracking-widest text-[10px] border-none bg-slate-900 text-white">Acesso Corporativo</Badge>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Login do Sistema</h3>
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">Entre com suas credenciais.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="E-mail"
                                type="email"
                                placeholder="seu.email@empresa.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="h-14 rounded-xl text-base"
                            />

                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                                    <button type="button" onClick={() => setView('FORGOT')} className="text-[10px] font-black text-gov-600 uppercase hover:underline">Recuperar Senha</button>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="h-14 rounded-xl text-base"
                                />
                            </div>

                            <Button
                                fullWidth
                                disabled={loading}
                                className="h-16 bg-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center group"
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={18} />
                                ) : (
                                    <>Acessar Sistema <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-500 font-medium">
                                Não tem conta?{' '}
                                <button onClick={() => setView('REGISTER')} className="font-black text-gov-600 uppercase tracking-wide hover:underline">
                                    Criar Cadastro
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {/* VIEW: REGISTER */}
                {view === 'REGISTER' && (
                    <div className="animate-fadeIn">
                        <button onClick={() => setView('LOGIN')} className="mb-4 flex items-center text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-gov-600">
                            <ArrowLeft size={12} className="mr-2" /> Voltar ao Login
                        </button>
                        <div className="mb-6">
                            <Badge color="indigo" className="mb-2 px-2 py-0.5 font-black uppercase tracking-widest text-[7px] border-none bg-gov-600 text-white">Nova Organização</Badge>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Criar Conta</h3>
                            <p className="text-slate-400 font-bold uppercase text-[8px] tracking-widest mt-1">Dados da Entidade e Admin.</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tipo de Entidade</label>
                                    <select id="reg_type" className="w-full h-10 rounded-xl text-xs border border-slate-200 bg-slate-50 px-3 font-medium focus:ring-2 focus:ring-gov-500 outline-none">
                                        <option value="PUBLIC">PUBLICA (Governo/Autarquia)</option>
                                        <option value="PRIVATE">PRIVADA (Empresa/ONG)</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nome da Organização</label>
                                    <input id="reg_org" type="text" placeholder="Prefeitura de..." className="w-full h-10 rounded-xl text-xs border border-slate-200 bg-slate-50 px-3 font-medium outline-none focus:border-gov-500" required />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tipo de Documento</label>
                                    <div className="flex gap-4 mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="docType" className="accent-gov-500" defaultChecked />
                                            <span className="text-xs text-slate-700 font-medium">CNPJ</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="docType" className="accent-gov-500" />
                                            <span className="text-xs text-slate-700 font-medium">CPF / Outro</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Número do Documento</label>
                                    <input id="reg_cnpj" type="text" placeholder="Digite apenas números ou identificador" className="w-full h-10 rounded-xl text-xs border border-slate-200 bg-slate-50 px-3 font-medium outline-none focus:border-gov-500 uppercase" required />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Seu Nome</label>
                                    <input id="reg_name" type="text" placeholder="Gestor Responsável" className="w-full h-10 rounded-xl text-xs border border-slate-200 bg-slate-50 px-3 font-medium outline-none focus:border-gov-500" required />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-2 space-y-2">
                                <Input
                                    label="E-mail de Login"
                                    type="email"
                                    placeholder="admin@organizacao.gov.br"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="h-10 rounded-xl text-xs"
                                />
                                <Input
                                    label="Senha de Acesso"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="h-10 rounded-xl text-xs"
                                />
                                <div className="col-span-2 mt-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Finalidade do Acesso (Obrigatório)</label>
                                    <textarea
                                        id="reg_reason"
                                        placeholder="Justifique a necessidade operacional..."
                                        className="w-full h-16 rounded-xl text-[10px] border border-slate-200 bg-slate-50 px-3 py-2 font-medium outline-none focus:border-gov-500 resize-none"
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <Button
                                fullWidth
                                disabled={loading}
                                className="h-12 bg-gov-600 rounded-2xl font-black uppercase text-[8px] tracking-[0.2em] shadow-xl hover:bg-gov-700 transition-all flex items-center justify-center group text-white mt-4"
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={16} />
                                ) : (
                                    <>Registrar Entidade <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </Button>
                        </form>
                    </div>
                )}

                {view === 'FORGOT' && (
                    <div className="animate-fadeIn">
                        <button onClick={() => setView('LOGIN')} className="mb-4 flex items-center text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-gov-600">
                            <ArrowLeft size={12} className="mr-2" /> Voltar ao Início
                        </button>
                        <div className="mb-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Recuperar Senha</h3>
                            <p className="text-slate-400 font-bold uppercase text-[8px] tracking-widest mt-1">Enviaremos um link para seu e-mail.</p>
                        </div>
                        <form onSubmit={handleForgotRequest} className="space-y-4">
                            <Input
                                label="E-mail Cadastrado"
                                type="email"
                                placeholder="agente@gov.br"
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                                className="h-12 rounded-xl text-xs"
                            />
                            <Button fullWidth disabled={loading} className="h-14 bg-slate-900 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em]">
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <><Send size={14} className="mr-2" /> Enviar Link</>}
                            </Button>
                        </form>
                    </div>
                )}

                {/* VIEW: RESET TOKEN */}
                {view === 'RESET_TOKEN' && (
                    <div className="animate-fadeIn">
                        <div className="mb-6">
                            <Badge color="green" className="mb-2 px-2 py-0.5 font-black uppercase tracking-widest text-[7px] border-none bg-emerald-600 text-white">Segurança</Badge>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Definir Nova Senha</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Insira o código recebido.</p>
                        </div>
                        <form onSubmit={handleResetConfirm} className="space-y-4">
                            {/* Warning Removed */}

                            <Input
                                label="Token de Segurança"
                                placeholder="Cole o token aqui..."
                                value={resetToken}
                                onChange={e => setResetToken(e.target.value)}
                                className="h-12 rounded-xl text-xs font-mono"
                            />
                            <Input
                                type="password"
                                label="Nova Senha"
                                placeholder="Mínimo 6 caracteres"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="h-12 rounded-xl text-xs"
                            />
                            <Button fullWidth disabled={loading} className="h-14 bg-emerald-600 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] hover:bg-emerald-500 shadow-xl shadow-emerald-500/20">
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <>Redefinir Senha <ChevronRight size={14} className="ml-2" /></>}
                            </Button>
                        </form>
                    </div>
                )}

                <div className="mt-12 text-center opacity-90">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">

                        <div className="flex items-center gap-2">
                            <Fingerprint size={16} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] cursor-default select-none">
                                Criptografia Militar SHA-512
                            </p>
                        </div>

                        <button
                            onClick={() => alert('📞 SUPORTE TÉCNICO\n\nWhatsApp/Telefone: (87) 98112-1024\nHorário: Seg-Sex, 08h às 18h')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            <Settings size={14} /> Contatar Suporte
                        </button>
                    </div>
                </div>
            </div>

            {/* CACHE CLEANER REMOVED - We usually want to keep manual config if set */}
            {(() => {
                return (
                    <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-300 pointer-events-none">
                        v2.10.2 (S.O.S MODE)
                    </div>
                );
            })()}

            {/* FLOATING CONFIG BUTTON REMOVED FOR SECURITY */}
        </div>
    );
};

const RefreshCw = ({ className, size }: { className?: string; size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);