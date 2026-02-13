
import React, { useState } from 'react';
import { X, Minus, Square, Copy } from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

export const TitleBar: React.FC = () => {
    const [isMaximized, setIsMaximized] = useState(false);

    const handleClose = () => {
        if (ipcRenderer) ipcRenderer.send('window-close');
    };

    const handleMinimize = () => {
        if (ipcRenderer) ipcRenderer.send('window-minimize');
    };

    const handleMaximize = () => {
        if (ipcRenderer) {
            ipcRenderer.send('window-maximize');
            setIsMaximized(!isMaximized); // Optimistic UI update
        }
    };

    return (
        <div className="h-10 bg-slate-900 flex items-center justify-between px-4 select-none flex-row-reverse [-webkit-app-region:drag] border-b border-slate-800 shrink-0 z-50">
            {/* Right Side: Title */}
            <div className="flex items-center gap-3 pr-2">
                <img src="/logo.png" alt="GM Logo" className="w-6 h-6 rounded-md border border-slate-700" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">GM Systems</span>
            </div>

            {/* Left Side: Window Controls (Mac/Gnome Style with Native Icons & Spacing) */}
            {ipcRenderer ? (
                <div className="flex items-center gap-4 [-webkit-app-region:no-drag] pl-1">
                    {/* Increased gap from 2 to 4 for "less cramped" look */}
                    <div className="flex items-center gap-2.5">
                        <button onClick={handleClose} className="p-1.5 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all group" title="Fechar">
                            <X size={14} strokeWidth={3} />
                        </button>
                        <button onClick={handleMinimize} className="p-1.5 bg-yellow-400/10 hover:bg-yellow-400 rounded-lg text-yellow-500 hover:text-slate-900 transition-all group" title="Minimizar">
                            <Minus size={14} strokeWidth={3} />
                        </button>
                        <button onClick={handleMaximize} className="p-1.5 bg-green-500/10 hover:bg-green-500 rounded-lg text-green-500 hover:text-white transition-all group" title="Maximizar">
                            {isMaximized ? (
                                <Copy size={14} strokeWidth={3} />
                            ) : (
                                <Square size={14} strokeWidth={3} />
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-4 bg-slate-800 mx-2"></div>
                </div>
            ) : (
                <div className="flex items-center gap-2 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest"> </span>
                </div>
            )}
        </div>
    );
};
