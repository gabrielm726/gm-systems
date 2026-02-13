import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Option {
    value: string;
    label: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Selecione...",
    label,
    className,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options.slice(0, 100); // Limit initial render for performance
        const lowerSearch = searchTerm.toLowerCase();
        return options
            .filter(opt =>
                opt.label.toLowerCase().includes(lowerSearch) ||
                (opt.subLabel && opt.subLabel.toLowerCase().includes(lowerSearch))
            )
            .slice(0, 100); // Limit search results for performance
    }, [options, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={clsx("relative w-full", className)} ref={dropdownRef}>
            {label && <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">{label}</label>}

            <div
                className={clsx(
                    "flex items-center justify-between w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl cursor-pointer transition-all",
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-300",
                    isOpen && "border-gov-500 ring-2 ring-gov-100"
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex-1 overflow-hidden">
                    {selectedOption ? (
                        <div>
                            <p className="text-xs font-black text-slate-800 uppercase truncate">{selectedOption.label}</p>
                            {selectedOption.subLabel && <p className="text-[10px] text-slate-400 font-bold truncate">{selectedOption.subLabel}</p>}
                        </div>
                    ) : (
                        <p className="text-xs font-bold text-slate-400 uppercase">{placeholder}</p>
                    )}
                </div>
                <ChevronDown size={16} className={clsx("text-slate-400 transition-transform", isOpen && "transform rotate-180")} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                        <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2">
                            <Search size={14} className="text-slate-400 mr-2" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="bg-transparent w-full text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none uppercase"
                                placeholder="BUSCAR..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scroll p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={clsx(
                                        "px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between mb-1 group transition-colors",
                                        option.value === value ? "bg-gov-50" : "hover:bg-slate-50"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(option.value);
                                    }}
                                >
                                    <div className="flex-1 overflow-hidden mr-2">
                                        <p className={clsx(
                                            "text-xs font-bold uppercase truncate",
                                            option.value === value ? "text-gov-700" : "text-slate-700 group-hover:text-slate-900"
                                        )}>
                                            {option.label}
                                        </p>
                                        {option.subLabel && (
                                            <p className="text-[10px] text-slate-400 truncate group-hover:text-slate-500">
                                                {option.subLabel}
                                            </p>
                                        )}
                                    </div>
                                    {option.value === value && <Check size={14} className="text-gov-600" />}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-400 font-medium">Nenhum resultado encontrado</div>
                        )}
                        {options.length > 100 && !searchTerm && (
                            <div className="p-2 text-center text-[10px] text-slate-400 border-t border-slate-100 bg-slate-50">
                                Digite para buscar mais resultados...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
