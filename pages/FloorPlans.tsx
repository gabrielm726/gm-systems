import React, { useState, useMemo, useRef } from 'react';
import { Card, Button, Modal, Input, Badge } from '../components/Shared';
import { Location, Asset } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import * as L from 'leaflet';
import {
    LayoutTemplate, Search, Edit2, Plus,
    Building, MapPin, Upload, Eye,
    X, Maximize2, Trash2, Package, Layers, Info,
    FileImage, Navigation, Download, Compass
} from 'lucide-react';

const MapEventsHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

interface FloorPlansProps {
    locations: Location[];
    assets: Asset[];
    onUpdateLocation?: (loc: Location) => void;
    onAddLocation?: (loc: Location) => void;
    onDeleteLocation?: (id: string) => void;
}

export const FloorPlans: React.FC<FloorPlansProps> = ({ locations, assets, onUpdateLocation, onAddLocation, onDeleteLocation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingHD, setViewingHD] = useState<Location | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Location>>({
        name: '', type: 'BUILDING', address: '', lat: -7.5997, lng: -37.6469, floorPlanUrl: ''
    });

    const filteredLocations = useMemo(() =>
        locations.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [locations, searchTerm]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, floorPlanUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.floorPlanUrl) {
            alert("Nome e Imagem da Planta são obrigatórios.");
            return;
        }

        const loc: Location = {
            id: formData.id || `LOC-${Date.now()}`,
            name: formData.name!,
            type: (formData.type || 'BUILDING') as any,
            address: formData.address || '',
            lat: formData.lat || -7.5997,
            lng: formData.lng || -37.6469,
            floorPlanUrl: formData.floorPlanUrl
        };

        if (formData.id && onUpdateLocation) onUpdateLocation(loc);
        else if (onAddLocation) onAddLocation(loc);

        setIsAddModalOpen(false);
        setFormData({ name: '', type: 'BUILDING', address: '', lat: -7.5997, lng: -37.6469, floorPlanUrl: '' });
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10"><Layers size={160} /></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <Badge color="blue" className="bg-blue-500/20 text-blue-300 border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px] mb-4">Engenharia e Layout</Badge>
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Plantas e Georeferência</h2>
                        <p className="text-slate-400 mt-2 font-medium">Gestão de ambientes com coordenadas integradas ao mapa mestre.</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-gov-500 text-slate-900 border-none rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest shadow-lg hover:bg-gov-400 transition-colors">
                        <Plus size={24} className="mr-2" /> Adicionar Planta
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredLocations.map(loc => {
                    return (
                        <Card key={loc.id} className="p-0 overflow-hidden rounded-[2.5rem] border-none shadow-lg hover:shadow-2xl transition-all group bg-white">
                            <div className="h-64 relative overflow-hidden bg-slate-100">
                                {loc.floorPlanUrl ? (
                                    <img
                                        src={loc.floorPlanUrl}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                        onClick={() => setViewingHD(loc)}
                                        alt="Planta Baixa"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><FileImage size={48} className="opacity-10" /></div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none duration-300">
                                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl text-slate-900 transform scale-90 group-hover:scale-100 transition-transform"><Maximize2 size={24} /></div>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge color="blue" className="px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">{loc.type || 'UNIT'}</Badge>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight truncate">{loc.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-slate-400"><MapPin size={12} /><span className="text-[10px] font-bold uppercase truncate">{loc.address}</span></div>
                                    </div>
                                    <button onClick={() => { setFormData(loc); setIsAddModalOpen(true); }} className="ml-4 p-3 bg-slate-50 hover:bg-gov-900 hover:text-white rounded-xl text-slate-400 transition-colors duration-200 shadow-sm active:scale-95"><Edit2 size={18} /></button>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 mb-6 border border-slate-100">
                                    <Compass size={20} className="text-gov-500" />
                                    <div className="flex gap-4">
                                        <div><p className="text-[8px] font-black text-slate-400 uppercase">Lat</p><p className="text-xs font-mono font-bold text-slate-600">{(loc.lat || 0).toFixed(5)}</p></div>
                                        <div><p className="text-[8px] font-black text-slate-400 uppercase">Lng</p><p className="text-xs font-mono font-bold text-slate-600">{(loc.lng || 0).toFixed(5)}</p></div>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <Button
                                        onClick={() => setViewingHD(loc)}
                                        className="w-full rounded-xl h-11 bg-gov-900 text-white uppercase font-black text-[9px] tracking-[0.2em] shadow-md hover:bg-slate-800 border-none transition-colors flex items-center justify-center gap-3"
                                    >
                                        <Eye size={16} /> Ver Detalhes HD
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* MODAL ADICIONAR PLANTA */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Protocolar Planta Baixa Estratégica">
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-3xl text-white flex gap-5 items-center shadow-lg">
                        <Compass className="text-gov-400" size={28} />
                        <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">Integração Mestra: As coordenadas informadas aqui sincronizam automaticamente com a aba Mapa Geográfico.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Identificador da Unidade" placeholder="Ex: Sede Administrativa" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <Input label="Tipo / Natureza do Prédio" placeholder="Ex: Hospital, Escola, Almoxarifado" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-3xl overflow-hidden h-64">
                            <div className="p-4 space-y-4 bg-slate-50">
                                <Input label="Latitude Decimal" type="number" step="0.000001" value={formData.lat} onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })} />
                                <Input label="Longitude Decimal" type="number" step="0.000001" value={formData.lng} onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })} />
                                <p className="text-[9px] text-slate-400 mt-2">Dica: Use o mapa ao lado para capturar as coordenadas automaticamente.</p>
                            </div>
                            <div className="relative bg-slate-200">
                                <MapContainer center={[formData.lat || -7.5997, formData.lng || -37.6469]} zoom={15} className="w-full h-full" zoomControl={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[formData.lat || -7.5997, formData.lng || -37.6469]} />
                                    <MapEventsHandler onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))} />
                                </MapContainer>
                            </div>
                        </div>

                        <Input label="Endereço / Sítio" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />

                        <div onClick={() => fileInputRef.current?.click()} className="h-48 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center group hover:border-gov-500 hover:bg-white transition-all cursor-pointer overflow-hidden">
                            {formData.floorPlanUrl ? <img src={formData.floorPlanUrl} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="mx-auto mb-2 text-slate-300" size={32} /><span className="text-[10px] font-black uppercase text-slate-400">Selecionar Imagem da Planta</span></div>}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>
                    <Button onClick={handleSave} fullWidth className="h-16 bg-gov-900 rounded-3xl mt-4 shadow-xl text-[11px] font-black tracking-[0.2em] text-white uppercase">Registrar Planta e Ponto de Mapa</Button>
                </div>
            </Modal>

            {/* VISUALIZADOR HD - PANORÂMICO E EXPANDIDO EM ALTURA */}
            <Modal
                isOpen={!!viewingHD}
                onClose={() => setViewingHD(null)}
                title={`Terminal de Inspeção em Alta Definição: ${viewingHD?.name}`}
                size="xl"
            >
                {viewingHD && (
                    <div className="space-y-4 animate-fadeIn max-w-[95vw] mx-auto overflow-hidden">
                        {/* Header Panorâmico Ultra Slim */}
                        <div className="w-full bg-slate-900 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gov-500 text-slate-900 rounded-lg shadow-lg"><Layers size={18} /></div>
                                <div className="flex items-center gap-3">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tighter">{viewingHD.name}</h4>
                                    <div className="h-4 w-px bg-white/10"></div>
                                    <span className="text-[9px] font-bold text-gov-400 uppercase tracking-widest">{viewingHD.type || 'ESPECIFICAÇÃO'}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase">GPS Lat:</p>
                                    <p className="text-[10px] font-mono font-bold text-white">{(viewingHD.lat || 0).toFixed(6)}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase">GPS Lng:</p>
                                    <p className="text-[10px] font-mono font-bold text-white">{(viewingHD.lng || 0).toFixed(6)}</p>
                                </div>
                                <Button onClick={() => {
                                    if (!viewingHD?.floorPlanUrl) return;
                                    const link = document.createElement('a');
                                    link.href = viewingHD.floorPlanUrl;
                                    link.download = `PLANTA_${viewingHD.name.replace(/\s/g, '_')}.jpg`;
                                    link.click();
                                }} className="bg-emerald-600 h-9 px-4 rounded-xl font-black uppercase tracking-widest text-[8px] text-white shadow-lg hover:bg-emerald-500 transition-all border-none">
                                    <Download className="mr-2" size={14} /> Download HD
                                </Button>
                            </div>
                        </div>

                        {/* Área da Imagem Panorâmica e Maior em Altura (max-h-75vh) */}
                        <div className="relative group rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-200 flex items-center justify-center min-h-[60vh]">
                            <img
                                src={viewingHD.floorPlanUrl}
                                className="w-full h-auto object-contain max-h-[75vh] transition-transform duration-700 hover:scale-[1.05]"
                                alt="Visualização Detalhada"
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-white text-[8px] font-black uppercase tracking-[0.4em]">Inspeção de Alta Escala</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                .cursor-zoom-in { cursor: zoom-in; }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                /* Override de largura máxima para o modal específico de detalhes HD */
                .system-modal-backdrop:has(.max-w-\[95vw\]) .system-modal-container {
                    max-width: 95% !important;
                }
            `}</style>
        </div>
    );
};