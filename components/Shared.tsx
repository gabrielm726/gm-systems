import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X, ChevronLeft, ChevronRight, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { ConnectionStatus } from '../constants';

export * from './Card';
export * from './SearchableSelect';

// --- BUTTON ---
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning' | 'info' | 'dark' | 'white';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    ...props
}) => {
    const baseClasses = 'font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
        info: 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-400',
        dark: 'bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-700',
        white: 'bg-white text-slate-800 hover:bg-slate-50 focus:ring-slate-200',
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], widthClass, className)}
            {...props}
        >
            {children}
        </button>
    );
};

// --- INPUT ---
// --- INPUT ---
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
    rows?: number;
    // Override type to allow 'textarea' string
    type?: React.InputHTMLAttributes<HTMLInputElement>['type'] | 'textarea';
    icon?: React.ReactNode;
};

export const Input: React.FC<InputProps> = ({ label, id, error, className, type, icon, ...props }) => {
    const isTextarea = type === 'textarea';
    const baseClass = clsx(
        'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm',
        error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500',
        className
    );

    return (
        <div className="w-full">
            {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
            {isTextarea ? (
                <textarea
                    id={id}
                    className={baseClass}
                    rows={props.rows || 4}
                    {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            ) : (
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        id={id}
                        type={type}
                        className={clsx(baseClass, icon && 'pl-10')}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                </div>
            )}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};


// --- MODAL ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        '2xl': 'max-w-7xl',
        full: 'max-w-full mx-4'
    };

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div className={clsx("bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[85vh] relative overflow-hidden ring-1 ring-white/20", sizeClasses[size])}>
                <div className="p-4 border-b flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{title || 'Modal'}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
                </div>
                <div className="p-6 overflow-y-auto custom-scroll">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- CONFIRM MODAL ---
export const ConfirmModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title?: string; message?: string }> = ({ isOpen, onClose, onConfirm, title, message }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Confirmar Operação"}>
        <div className="py-2 flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">{message || "Esta operação é irreversível. Deseja continuar?"}</p>
        </div>
        <div className="flex gap-2 mt-4">
            <Button variant="danger" fullWidth className="h-10 text-[9px]" onClick={() => { onConfirm(); onClose(); }}>Confirmar</Button>
            <Button variant="secondary" fullWidth className="h-10 text-[9px]" onClick={onClose}>Cancelar</Button>
        </div>
    </Modal>
);


// --- API STATUS ---
interface ApiStatusProps {
    status: ConnectionStatus;
    onRetry: () => void;
    message?: string;
    // New optional props for dynamic URL handling
    currentUrl?: string;
    onUrlChange?: (url: string) => void;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({ status, onRetry, message, currentUrl, onUrlChange }) => {
    const renderContent = () => {
        switch (status) {
            case ConnectionStatus.CONNECTING:
                return {
                    icon: <Wifi className="animate-pulse text-slate-300" size={40} />,
                    title: "Conectando ao backend...",
                    text: `Tentando conectar em: ${currentUrl || '...'}`,
                };
            case ConnectionStatus.ERROR:
                return {
                    icon: <WifiOff className="text-red-400" size={40} />,
                    title: "Falha na Conexão",
                    text: "Não foi possível conectar à API. Verifique se o servidor backend está rodando e se o endereço está correto.",
                };
            case ConnectionStatus.CONNECTED:
                return {
                    icon: <Wifi className="text-emerald-500" size={40} />,
                    title: "Conectado",
                    text: message || "Conexão com a API estabelecida com sucesso.",
                };
        }
    };

    const { icon, title, text } = renderContent();

    return (
        <div className="w-full h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-8">
            <div className="mb-6">{icon}</div>
            <h1 className="text-lg font-black text-slate-800 mb-2">{title}</h1>
            <p className="text-xs text-slate-500 max-w-xs mb-8">{text}</p>

            {status === ConnectionStatus.ERROR && (
                <div className="flex flex-col gap-4 w-full max-w-sm">
                    {onUrlChange && currentUrl && (
                        <div className="text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase">Endereço do Servidor</label>
                            <input
                                type="text"
                                value={currentUrl}
                                onChange={(e) => onUrlChange(e.target.value)}
                                className="w-full mt-1 px-3 py-2 text-sm border rounded bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ex: http://localhost:8000 ou http://192.168.1.5:8000</p>
                        </div>
                    )}
                    <Button onClick={onRetry} variant="primary" size="md">
                        Tentar Novamente
                    </Button>
                </div>
            )}
        </div>
    );
};                                                                            // --- BADGE ---
export type BadgeColor = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'dark' | 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'purple' | 'gray' | 'slate' | 'emerald' | 'amber' | 'rose' | 'indigo';

type BadgeProps = {
    color?: BadgeColor;
    children: React.ReactNode;
    className?: string;
};

export const Badge: React.FC<BadgeProps> = ({ color = 'secondary', children, className }) => {
    const colorClasses: Record<BadgeColor, string> = {
        primary: 'bg-blue-100 text-blue-800',
        secondary: 'bg-slate-100 text-slate-800',
        danger: 'bg-red-100 text-red-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-sky-100 text-sky-800',
        dark: 'bg-slate-800 text-white',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        orange: 'bg-orange-100 text-orange-800',
        purple: 'bg-purple-100 text-purple-800',
        gray: 'bg-gray-100 text-gray-800',
        slate: 'bg-slate-100 text-slate-800',
        emerald: 'bg-emerald-100 text-emerald-800',
        amber: 'bg-amber-100 text-amber-800',
        rose: 'bg-rose-100 text-rose-800',
        indigo: 'bg-indigo-100 text-indigo-800',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                colorClasses[color],
                className
            )}
        >
            {children}
        </span>
    );
};

// --- PAGINATION ---
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex items-center justify-center gap-4 py-4">
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={16} /> Anterior
            </Button>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Página {currentPage} de {totalPages}
            </span>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                Próxima <ChevronRight size={16} />
            </Button>
        </div>
    );
};