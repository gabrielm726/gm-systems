
import React, { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, ZoomControl, useMapEvents } from 'react-leaflet';
import { Location, Asset } from '../types';
import * as L from 'leaflet';
import { Button, Modal, Input, Badge, ConfirmModal } from '../components/Shared';
import {
    Search, Plus, X, MapPin,
    Globe, Compass, Target, Layers,
    Camera, FileSpreadsheet, Trash2,
    Download, Maximize2, Building2, Map as MapIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getIcon = (color: string) => L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MAP_ICONS = {
    BUILDING: getIcon('blue'),
    DEPOT: getIcon('orange'),
    EXTERNAL: getIcon('violet'),
    VEICULO: getIcon('green'),
    SELECTED: getIcon('red')
};

const MapController = ({ center }: { center: [number, number] | null }) => {
    const map = useMap();
    if (center) map.flyTo(center, 18, { duration: 1.5 });
    return null;
};

const CustomZoomControl = ({ onReset }: { onReset: () => void }) => {
    const map = useMap();
    return (
        <div className="flex flex-col gap-2">
            <button onClick={() => map.zoomIn()} className="w-12 h-12 bg-white text-slate-700 rounded-2xl shadow-xl flex items-center justify-center hover:bg-gov-50 transition-colors font-black border border-slate-100">
                <Plus size={20} />
            </button>
            <button onClick={() => map.zoomOut()} className="w-12 h-12 bg-white text-slate-700 rounded-2xl shadow-xl flex items-center justify-center hover:bg-gov-50 transition-colors font-black border border-slate-100">
                <span className="text-xl leading-none">-</span>
            </button>
            <button onClick={onReset} className="w-12 h-12 bg-gov-900 text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-slate-800 transition-colors font-black border border-slate-900" title="Resetar Visão">
                <Target size={20} />
            </button>
        </div>
    );
};

const MapClickHandler = ({ onTripleClick }: { onTripleClick: (latlng: L.LatLng) => void }) => {
    const [clickCount, setClickCount] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useMapEvents({
        click(e) {
            setClickCount(prev => prev + 1);

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                setClickCount(0);
            }, 600); // 600ms window for triple click

            if (clickCount === 2) { // This is the 3rd click
                onTripleClick(e.latlng);
                setClickCount(0);
                if (timerRef.current) clearTimeout(timerRef.current);
            }
        }
    });
    return null;
};

interface MapPageProps {
    locations: Location[];
    assets?: Asset[];
    onAddLocation?: (loc: Location) => void;
    onUpdateLocation?: (loc: Location) => void;
    onDeleteLocation?: (id: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ locations = [], assets = [], onAddLocation, onDeleteLocation, onUpdateLocation }) => {
    // Safety Check for undefined lists
    if (!locations) return <div className="p-10 text-center text-slate-400">Carregando dados geográficos...</div>;

    const defaultCenter: [number, number] = [-7.5997, -37.6469];

    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [viewMode, setViewMode] = useState<'SATELLITE'>('SATELLITE');
    const [searchQuery, setSearchQuery] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

    const fileInputExt = useRef<HTMLInputElement>(null);

    const [locForm, setLocForm] = useState<Partial<Location>>({
        name: '', type: 'BUILDING', address: '', lat: -7.5997, lng: -37.6469,
        externalPhotoUrl: ''
    });

    const filteredLocations = useMemo(() => {
        const lower = searchQuery.toLowerCase();
        return locations.filter(l =>
            l.name.toLowerCase().includes(lower) ||
            (l.address || '').toLowerCase().includes(lower)
        );
    }, [locations, searchQuery]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocForm(prev => ({ ...prev, externalPhotoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownloadPhoto = (url: string, name: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `FOTO_${name.replace(/\s/g, '_')}.jpg`;
        link.click();
    };

    const handleGenerateGeoReport = () => {
        if (!selectedLocation) return;

        const locAssets = assets.filter(a => a.locationId === selectedLocation.id);

        if (locAssets.length === 0) {
            alert("Não existem ativos vinculados a esta localização para gerar o relatório.");
            return;
        }

        const reportData = locAssets.map(a => ({
            "PATRIMÔNIO": a.id,
            "DESCRIÇÃO": a.name,
            "CATEGORIA": a.category,
            "ESTADO": a.state,
            "VALOR AQUISIÇÃO": a.accounting?.acquisitionValue || a.value || 0,
            "DATA AQUISIÇÃO": a.purchaseDate,
            "UNIDADE": selectedLocation.name,
            "ENDEREÇO": selectedLocation.address
        }));

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventário Local");

        const fileName = `Relatorio_Patrimonial_${selectedLocation.name.replace(/\s+/g, '_')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleSave = () => {
        if (!locForm.name || !onAddLocation) return;
        onAddLocation({
            id: `LOC-${Date.now()}`,
            name: locForm.name.toUpperCase(),
            type: (locForm.type || 'BUILDING') as any,
            address: locForm.address || '',
            lat: locForm.lat || defaultCenter[0],
            lng: locForm.lng || defaultCenter[1],
            externalPhotoUrl: locForm.externalPhotoUrl
        });
        setIsAddModalOpen(false);
        setLocForm({ name: '', type: 'BUILDING', address: '', lat: -7.5997, lng: -37.6469, externalPhotoUrl: '' });
    };

    const handleDelete = () => {
        if (selectedLocation && onDeleteLocation) {
            onDeleteLocation(selectedLocation.id);
            setSelectedLocation(null);
            setIsDeleteConfirmOpen(false);
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] relative overflow-hidden rounded-[2.5rem] bg-slate-200 shadow-2xl border-4 border-white animate-fadeIn">

            {/* CONTROLES SUPERIORES */}
            <div className="absolute top-6 left-6 z-[1000] space-y-3 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-1 flex items-center w-80 md:w-96">
                        <div className="p-3 text-slate-400"><Search size={20} /></div>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm font-black text-slate-700 flex-1 outline-none"
                            placeholder="Localizar unidade..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="p-3 bg-gov-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl border bg-gov-600 text-white border-gov-500"><Globe size={14} /> Visão Satélite</button>
                </div>
            </div>

            {/* MAPA */}
            <MapContainer center={defaultCenter} zoom={15} zoomControl={false} preferCanvas={true} className="w-full h-full z-0">
                {viewMode === 'SATELLITE' ? (
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Tiles &copy; Esri' />
                ) : (
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                )}

                <MapController center={mapCenter} />

                {/* CUSTOM ZOOM CONTROLS */}
                <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
                    <CustomZoomControl onReset={() => setMapCenter(defaultCenter)} />
                </div>

                {filteredLocations.map(loc => {
                    if (!loc.lat || !loc.lng) return null;
                    return (
                        <Marker
                            key={loc.id}
                            position={[loc.lat, loc.lng]}
                            icon={selectedLocation?.id === loc.id ? MAP_ICONS.SELECTED : (MAP_ICONS[loc.type as keyof typeof MAP_ICONS] || MAP_ICONS.BUILDING)}
                            eventHandlers={{ click: () => { setSelectedLocation(loc); setMapCenter([loc.lat || 0, loc.lng || 0]); } }}
                        >
                            <Popup className="custom-popup">
                                <p className="font-black text-xs uppercase text-slate-800">{loc.name}</p>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* PAINEL LATERAL DE DETALHES */}
            <div className={`absolute top-0 right-0 bottom-0 z-[1001] w-full md:w-96 bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] transform transition-transform duration-500 ease-out border-l border-slate-100 ${selectedLocation ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedLocation && (
                    <div className="h-full flex flex-col">
                        {/* HEADER DO PAINEL COM FOTO CLICÁVEL */}
                        <div className="relative h-72 bg-slate-900 overflow-hidden group">
                            {selectedLocation.externalPhotoUrl ? (
                                <img
                                    src={selectedLocation.externalPhotoUrl}
                                    className="w-full h-full object-cover opacity-80 cursor-zoom-in hover:scale-105 transition-transform duration-500"
                                    alt="Fachada"
                                    onClick={() => setViewingPhoto(selectedLocation.externalPhotoUrl!)}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-100">
                                    <Camera size={48} className="mb-2 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Sem imagem de fachada</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>

                            {/* BOTÃO X DE FECHAR - CORRIGIDO PARA ALTO CONTRASTE */}
                            <div className="absolute top-6 left-6 flex gap-2">
                                <button
                                    onClick={() => setSelectedLocation(null)}
                                    className="p-3 bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center"
                                    title="Fechar detalhes"
                                >
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            {selectedLocation.externalPhotoUrl && (
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <button onClick={() => setViewingPhoto(selectedLocation.externalPhotoUrl!)} className="p-3 bg-gov-600 rounded-2xl text-white shadow-xl hover:bg-gov-500 transition-all"><Maximize2 size={20} /></button>
                                    <button onClick={() => handleDownloadPhoto(selectedLocation.externalPhotoUrl!, selectedLocation.name)} className="p-3 bg-emerald-600 rounded-2xl text-white shadow-xl hover:bg-emerald-500 transition-all"><Download size={20} /></button>
                                </div>
                            )}

                            <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                                <Badge color="blue" className="mb-3 px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-lg bg-white text-gov-900 border-none">{selectedLocation.type}</Badge>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{selectedLocation.name}</h3>
                            </div>
                        </div>

                        {/* INFO BODY */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scroll">
                            <div className="space-y-8">
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <MapPin size={12} className="text-gov-600" /> Endereço / Localidade
                                    </h5>
                                    <p className="text-sm font-black text-slate-700 leading-snug">{selectedLocation.address}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Sítio / Bairro / Localização Rural</p>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Compass size={12} className="text-gov-600" /> Coordenadas Geográficas
                                    </h5>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Latitude</p>
                                            <p className="text-xs font-mono font-black text-slate-600">{(selectedLocation.lat || 0).toFixed(6)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Longitude</p>
                                            <p className="text-xs font-mono font-black text-slate-600">{(selectedLocation.lng || 0).toFixed(6)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-gov-50 p-6 rounded-[2rem] border border-gov-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-gov-600"><Layers size={20} /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-gov-800 uppercase">Carga Físiica</p>
                                            <p className="text-xl font-black text-gov-900">{assets.filter(a => a.locationId === selectedLocation.id).length} itens</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setIsDeleteConfirmOpen(true)} className="rounded-2xl h-14 w-14 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"><Trash2 size={20} /></button>
                            <Button
                                onClick={handleGenerateGeoReport}
                                className="flex-1 bg-gov-900 text-white rounded-2xl h-14 uppercase font-black text-[10px] tracking-widest shadow-xl flex gap-2"
                            >
                                <FileSpreadsheet size={18} /> Relatório Geográfico
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* PROFESSIONAL CENTERED MODAL FOR HOMOLOGATION */}
            {isAddModalOpen && (
                <div className="absolute inset-0 z-[2000] bg-slate-900/80 backdrop-blur-sm animate-fadeIn flex items-center justify-center p-6">
                    <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 pb-4 flex justify-between items-center bg-white border-b border-slate-50">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter">Homologar Novo Ponto Geográfico</h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Registro Mestre de Infraestrutura</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-slate-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all text-slate-400"><X size={20} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scroll space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Identificador da Unidade" placeholder="Ex: Escola Municipal ou Secretaria" value={locForm.name} onChange={e => setLocForm({ ...locForm, name: e.target.value })} />
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Natureza do Local</label>
                                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black uppercase outline-none focus:ring-4 focus:ring-gov-500/20" value={locForm.type} onChange={e => setLocForm({ ...locForm, type: e.target.value as any })}>
                                        <option value="BUILDING">Prédio Administrativo</option>
                                        <option value="DEPOT">Depósito / Garagem</option>
                                        <option value="EXTERNAL">Setor Externo / Sítio</option>
                                    </select>
                                </div>
                            </div>

                            <Input label="Endereço / Sítio / Localidade" placeholder="Ex: Rua Tal ou Sítio Boa Vista" value={locForm.address} onChange={e => setLocForm({ ...locForm, address: e.target.value })} />

                            <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                <Input label="Latitude Decimal" type="number" step="0.000001" value={locForm.lat} onChange={e => setLocForm({ ...locForm, lat: parseFloat(e.target.value) })} />
                                <Input label="Longitude Decimal" type="number" step="0.000001" value={locForm.lng} onChange={e => setLocForm({ ...locForm, lng: parseFloat(e.target.value) })} />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Camera size={14} /> Foto Fachada (Evidência Física)</label>
                                <div onClick={() => fileInputExt.current?.click()} className="h-44 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-gov-500 transition-all">
                                    {locForm.externalPhotoUrl ? <img src={locForm.externalPhotoUrl} className="w-full h-full object-cover" /> : <div className="text-center text-slate-300 group-hover:text-gov-600 transition-colors"><Camera size={32} /><p className="text-[9px] font-black uppercase mt-2">Clique para anexar foto</p></div>}
                                    <input type="file" ref={fileInputExt} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 pt-4 bg-slate-50/50 border-t border-slate-100">
                            <Button onClick={handleSave} className="w-full bg-gov-900 h-16 rounded-[1.8rem] font-black uppercase tracking-[0.3em] shadow-xl text-white hover:bg-gov-800 transform hover:scale-[1.01] transition-all">Efetivar Registro Mestre</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* FULLSCREEN PHOTO VIEW - CLICK NO FUNDO PARA SAIR */}
            {viewingPhoto && (
                <div
                    className="fixed inset-0 z-[2000] bg-slate-900/98 backdrop-blur-xl flex flex-col animate-fadeIn cursor-default"
                    onClick={() => setViewingPhoto(null)}
                >
                    <div className="p-8 flex justify-between items-center relative z-10" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-black uppercase tracking-widest text-xs">Inspeção Visual de Unidade</h3>
                        <button onClick={() => setViewingPhoto(null)} className="p-4 bg-white/10 hover:bg-red-500 text-white rounded-2xl transition-all shadow-xl"><X size={24} /></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 relative z-10" onClick={e => e.stopPropagation()}>
                        <img src={viewingPhoto} className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border-4 border-white/5" />
                    </div>
                    <div className="p-12 flex justify-center relative z-10" onClick={e => e.stopPropagation()}>
                        <Button onClick={() => handleDownloadPhoto(viewingPhoto, selectedLocation?.name || 'UNIDADE')} className="bg-emerald-600 h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-white shadow-2xl hover:bg-emerald-500 transition-all"><Download className="mr-3" /> Baixar Imagem Original</Button>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-5 transition-opacity">
                        <X size={400} className="text-white" />
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Expurgar Registro Geográfico"
                message="Deseja remover permanentemente esta unidade do mapa mestre? Os ativos vinculados ficarão sem georeferenciamento."
            />

            <style>{`
                .leaflet-container { font-family: inherit; background: #e2e8f0; }
                .custom-popup .leaflet-popup-content-wrapper { border-radius: 1.5rem; padding: 4px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
                .leaflet-bar { border: none !important; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important; border-radius: 1rem !important; overflow: hidden; }
                .leaflet-bar a { background-color: white !important; color: #1e293b !important; border-bottom: 1px solid #f1f5f9 !important; }
                .cursor-zoom-in { cursor: zoom-in; }
            `}</style>
        </div>
    );
};
