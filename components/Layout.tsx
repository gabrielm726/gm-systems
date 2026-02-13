import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/logo.jpg';

import { NAV_ITEMS, MOCK_USER } from '../constants';
import { LogOut, Menu, Bell, AlertTriangle, X, Star, ShieldCheck, User as UserIcon, Camera, Save, Info, RefreshCw, Landmark, Building2, Globe, Shield, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { User, SystemConfig } from '../types';
import { Badge, Modal, Button, Input } from './Shared';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tabId: string) => void;
  onLogout: () => void;
  systemConfig?: SystemConfig;
  notifications?: string[];
  currentUser?: User;
  onUpdateUser?: (u: User) => void;
  toggleEntityType?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  onLogout,
  systemConfig,
  notifications = [],
  currentUser = MOCK_USER,
  onUpdateUser,
  toggleEntityType
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(currentUser.avatarUrl || '');
  const notifRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHomologation = systemConfig?.mode === 'HOMOLOGATION';
  const isOwner = currentUser?.isOwner;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    if (onUpdateUser) {
      onUpdateUser({ ...currentUser, avatarUrl: tempAvatar });
    }
    setIsProfileModalOpen(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-[13px] overflow-hidden">
      {/* OWNER/HOMOLOGATION BANNER - COMPACTO */}
      {(isHomologation || isOwner) && (
        <div className={clsx(
          "flex-shrink-0 px-4 py-1 text-center font-bold text-[9px] flex items-center justify-center shadow-sm z-[60] hide-on-modal transition-all duration-500",
          isOwner ? 'bg-slate-900 text-white border-b border-gov-500' : 'bg-yellow-400 text-yellow-900'
        )}>
          {isOwner ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-2.5 h-2.5 text-gov-500 fill-current animate-pulse" />
                <span className="uppercase tracking-[0.3em] font-black">{currentUser?.role || 'Soberano Master'}</span>
              </div>
              <div className="h-3 w-px bg-white/10 mx-1"></div>
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest">Soberania:</span>
                <div className="flex bg-white/5 p-0.5 rounded-full border border-white/10">
                  <button
                    onClick={() => systemConfig?.entityType !== 'PUBLIC' && toggleEntityType?.()}
                    className={clsx(
                      "flex items-center gap-1 px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all",
                      systemConfig?.entityType === 'PUBLIC' ? 'bg-gov-600 text-white' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Landmark size={8} /> Público
                  </button>
                  <button
                    onClick={() => systemConfig?.entityType !== 'PRIVATE' && toggleEntityType?.()}
                    className={clsx(
                      "flex items-center gap-1 px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all",
                      systemConfig?.entityType === 'PRIVATE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Building2 size={8} /> Privado
                  </button>
                </div>
              </div>
              <div className="h-3 w-px bg-white/10 mx-1"></div>
              <div className="flex items-center gap-2 text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                <Globe size={10} className="animate-spin-slow" /> GLOBAL SYNC
              </div>
            </div>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              MODO HOMOLOGAÇÃO
            </>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* SIDEBAR AMPLIADA (w-80) COM ROLAGEM INDEPENDENTE */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white transition-transform transform lg:translate-x-0 lg:static lg:inset-0 shadow-2xl flex flex-col",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex-shrink-0 flex items-center justify-center h-16 bg-slate-950 border-b border-white/5 px-6">
            <div className="flex items-center gap-4 w-full">
              <div className="w-10 h-10 rounded-lg shadow-lg flex-shrink-0 overflow-hidden border border-gov-500/30">
                <img src={logoImg} alt="Logo GM Systems" className="w-full h-full object-cover" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-black text-base tracking-tighter leading-none truncate">GM Systems <span className="text-gov-500">& Gestão Patrimonial</span></p>
                <p className="text-[8px] text-slate-500 tracking-[0.4em] mt-1 uppercase font-bold">Patrimônio Master v2.5</p>
              </div>
            </div>
          </div>

          {/* ÁREA DE NAVEGAÇÃO DA SIDEBAR COM ROLAGEM */}
          <div className="flex-1 overflow-y-auto sidebar-scroll py-6 px-4 space-y-2">
            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => (
                <div key={item.id}>
                  {item.subItems ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          // Auto-navigate to first sub-item if available
                          if (item.subItems && item.subItems.length > 0) {
                            onNavigate(item.subItems[0].id);
                          } else {
                            onNavigate(item.id);
                          }
                        }}
                        className={clsx(
                          "group flex items-center px-5 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl w-full transition-all duration-150 justify-between",
                          (activeTab === item.id || item.subItems.some(sub => sub.id === activeTab))
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div className="flex items-center">
                          <div className={clsx(
                            "mr-5 transition-colors flex-shrink-0",
                            (activeTab === item.id || item.subItems.some(sub => sub.id === activeTab)) ? "text-gov-500" : "text-slate-600 group-hover:text-white"
                          )}>
                            {React.cloneElement(item.icon as any, { size: 20 })}
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                      </button>

                      {/* RENDER SUB-ITEMS ALWAYS OPEN OR CONTROLLED */}
                      <div className="pl-6 space-y-1 mt-1">
                        {item.subItems.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onNavigate(sub.id);
                              setSidebarOpen(false);
                            }}
                            className={clsx(
                              "flex items-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider rounded-xl w-full transition-all",
                              activeTab === sub.id
                                ? "bg-gov-600 text-white shadow-lg shadow-gov-600/20"
                                : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                            )}
                          >
                            {sub.icon && React.cloneElement(sub.icon as any, { size: 16, className: "mr-3 opacity-70" })}
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                      }}
                      className={clsx(
                        "group flex items-center px-5 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl w-full transition-all duration-150",
                        activeTab === item.id
                          ? "bg-gov-600 text-white shadow-xl shadow-gov-600/20 translate-x-1"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className={clsx(
                        "mr-5 transition-colors flex-shrink-0",
                        activeTab === item.id ? "text-white" : "text-gov-500 group-hover:text-white"
                      )}>
                        {React.cloneElement(item.icon as any, { size: 20 })}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex-shrink-0 p-4 border-t border-white/5 bg-slate-950 pb-8"> {/* Increased bottom padding */}
            <button
              onClick={() => { setTempAvatar(currentUser.avatarUrl || ''); setIsProfileModalOpen(true); }}
              className="flex items-center w-full p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/10"
            >
              <div className="relative flex-shrink-0">
                <img src={currentUser?.avatarUrl || MOCK_USER.avatarUrl} alt="User" className="h-12 w-12 rounded-xl bg-gray-300 border-2 border-gov-400 object-cover shadow-lg" />
                {isOwner && <Star className="absolute -top-1.5 -right-1.5 w-4 h-4 text-gov-500 fill-current border border-slate-950 rounded-full" />}
              </div>
              <div className="ml-4 overflow-hidden text-left">
                <p className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover:text-gov-400 transition-colors">{currentUser?.name || MOCK_USER.name}</p>
                <p className="text-[8px] text-gov-400 uppercase font-black tracking-[0.2em] truncate mt-0.5">{currentUser?.role || 'Visitante'}</p>
              </div>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* HEADER FIXO NO TOPO */}
          <header className={`bg-white shadow-sm z-50 h-14 flex items-center justify-between px-8 flex-shrink-0 border-b border-slate-200 transition-all ${showNotifications ? 'z-[60]' : 'z-40'}`}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gov-600 hover:bg-slate-50 border border-slate-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center gap-4 ml-4">
                <div className="hidden sm:flex flex-col">
                  <h1 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em] leading-none">
                    {NAV_ITEMS.find(n => n.id === activeTab)?.label}
                  </h1>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5">
                    {systemConfig?.entityType === 'PUBLIC' ? 'Regime Governamental' : 'Regime Empresarial'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-5 relative" ref={notifRef}>
                <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className={clsx(
                    "w-2 h-2 rounded-full animate-pulse shadow-sm",
                    systemConfig?.entityType === 'PUBLIC' ? 'bg-gov-500 shadow-gov-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                  )}></div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    {systemConfig?.entityType === 'PUBLIC' ? 'PÚBLICO' : 'PRIVADO'} ATIVO
                  </span>
                </div>

                <div className="relative">
                  <button
                    className={`p-2.5 rounded-xl transition-all duration-300 relative z-50 ${notifications.length > 0 ? 'text-gov-600 bg-white shadow-lg shadow-gov-500/20 scale-105' : 'text-slate-400 hover:text-gov-600 hover:bg-white hover:shadow-md'}`}
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className={`h-5 w-5 ${notifications.length > 0 ? 'animate-tada' : ''}`} />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white animate-pulse"></span>
                    )}
                  </button>

                  {/* NOTIFICATIONS BACKDROP AND DROPDOWN */}
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowNotifications(false)}></div>
                      <div className="absolute top-full right-0 mt-4 w-[400px] bg-white rounded-[2rem] shadow-2xl ring-1 ring-slate-200 p-0 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top-right overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-white relative z-10">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Bell size={14} className="text-gov-500" /> Central de Avisos
                          </h4>
                          <span className="text-[9px] font-black text-slate-500 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">{notifications.length} NOVOS</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scroll p-2">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                              <div className="p-4 bg-slate-50 rounded-full mb-3"><Bell size={24} className="opacity-50" /></div>
                              <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma notificação</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {notifications.map((notif, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (notif.toLowerCase().includes('estoque')) onNavigate('inventory');
                                    else if (notif.toLowerCase().includes('manutenção')) onNavigate('maintenance');
                                    else onNavigate('dashboard');
                                    setShowNotifications(false);
                                  }}
                                  className="flex gap-4 items-start p-4 hover:bg-slate-50 rounded-[1.5rem] transition-all cursor-pointer group mx-2 relative overflow-hidden"
                                >
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gov-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <div className="p-2.5 bg-gov-50 text-gov-600 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform"><Info size={18} /></div>
                                  <div>
                                    <p className="text-[11px] font-bold text-slate-700 leading-snug group-hover:text-gov-700 transition-colors">{notif}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1.5 flex items-center gap-1 group-hover:text-gov-500">
                                      Clique para visualizar <ChevronRight size={10} />
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                          <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-gov-600 transition-colors">Marcar todas como lidas</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="h-8 w-px bg-slate-200"></div>

                <button
                  onClick={onLogout}
                  className="flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all tracking-[0.2em]"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </header>

          {/* ÁREA DE CONTEÚDO PRINCIPAL COM ROLAGEM INDEPENDENTE */}
          <main className="flex-1 overflow-y-auto custom-scroll p-8 bg-slate-50">
            <div className="w-full min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Dossiê de Identidade Master" size="lg">
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-white"><ShieldCheck size={140} /></div>
            <div className="relative group z-10">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-800">
                {tempAvatar ? (
                  <img src={tempAvatar} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={36} className="w-full h-full p-8 text-slate-600" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-3 bg-gov-500 text-slate-900 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-slate-900"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <div className="flex justify-center md:justify-start gap-2 mb-3">
                <Badge color="blue" className="bg-gov-500 text-slate-900 font-black border-none px-3 py-1 uppercase text-[8px] tracking-widest">ID MASTER</Badge>
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{currentUser.name}</h3>
              <p className="text-gov-400 font-black uppercase tracking-[0.3em] text-[10px] mt-3">{currentUser?.role || 'Usuário'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white border border-slate-100 rounded-[2rem] space-y-4 shadow-sm text-xs">
              <Input label="Identificador de Login" value={currentUser.email} disabled className="bg-slate-50 h-12" />
              <Input label="Unidade Administrativa" value={currentUser.department} disabled className="bg-slate-50 h-12" />
            </div>
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2rem] flex flex-col justify-center relative overflow-hidden group">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Soberania</p>
              <div className="flex items-end gap-4">
                <span className="text-6xl font-black text-slate-900 tracking-tighter">01</span>
                <div className="pb-2">
                  <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Rank Mestre</p>
                  <p className="text-xs font-black text-gov-600 uppercase leading-none mt-1.5">{currentUser?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Button variant="secondary" onClick={() => setIsProfileModalOpen(false)} className="h-12 rounded-xl flex-1 text-[10px] font-black uppercase tracking-widest border-slate-200 bg-white">Cancelar</Button>
            <Button onClick={saveProfile} className="h-12 rounded-xl flex-[2] bg-gov-900 text-white font-black uppercase tracking-[0.2em] shadow-xl border-none">
              <Save size={18} className="mr-2" /> Salvar Alterações
            </Button>
          </div>
        </div>
      </Modal>

      <style>{`
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Barra de rolagem robusta na sidebar */
        .sidebar-scroll::-webkit-scrollbar { 
          width: 7px; 
        }
        .sidebar-scroll::-webkit-scrollbar-track { 
          background: rgba(0,0,0,0.15); 
        }
        .sidebar-scroll::-webkit-scrollbar-thumb { 
          background: #334155; 
          border-radius: 10px;
          border: 1.5px solid rgba(255, 255, 255, 0.05);
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { 
          background: #475569; 
        }

        /* Barra de rolagem customizada para o conteúdo */
        .custom-scroll::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* TADA Animation */
        @keyframes tada {
            0% { transform: scale(1); }
            10%, 20% { transform: scale(0.9) rotate(-3deg); }
            30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
            40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
            100% { transform: scale(1) rotate(0); }
        }
        .animate-tada {
            animation: tada 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};