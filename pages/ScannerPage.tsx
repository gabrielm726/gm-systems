
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Modal } from '../components/Shared';
import { Asset, Location, AssetCategory, AssetState } from '../types';
import { Camera, ArrowRight, Save, XCircle, AlertTriangle, QrCode, CheckCircle, Barcode, Search, Zap, Crosshair, Wifi, Tag, RefreshCw, ScanBarcode } from 'lucide-react';

interface ScannerPageProps {
    onAddAsset: (asset: Asset) => void;
    locations: Location[];
}

export const ScannerPage: React.FC<ScannerPageProps> = ({ onAddAsset, locations }) => {
    const [stage, setStage] = useState<0 | 1 | 2>(0);
    const [scannedCode, setScannedCode] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scanMode, setScanMode] = useState<'QR' | 'BARCODE'>('QR');
    const [isSyncing, setIsSyncing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const [tempAsset, setTempAsset] = useState<Partial<Asset>>({ imageUrl: '', tagImageUrl: '' });
    const [torchEnabled, setTorchEnabled] = useState(false);

    const [cameraError, setCameraError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Limpeza da câmera ao sair da página
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    useEffect(() => {
        if (stage === 0 && !isCameraActive) inputRef.current?.focus();
    }, [stage, isCameraActive]);

    const startCamera = async () => {
        setCameraError(false);
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("API de câmera não suportada");
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setIsCameraActive(true);
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            setCameraError(true);
            setIsCameraActive(false);
        }
    };

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isCameraActive]);

    const toggleTorch = () => {
        if (stream) {
            const track = stream.getVideoTracks()[0];
            const newTorchStatus = !torchEnabled;
            track.applyConstraints({
                advanced: [{ torch: newTorchStatus } as any]
            }).then(() => setTorchEnabled(newTorchStatus))
                .catch(e => console.log('Torch not supported', e));
        }
    };

    const handleManualPhoto = () => {
        const photo = capturePhotoFromVideo();
        if (photo) {
            setTempAsset(prev => ({ ...prev, imageUrl: photo }));
            setScannedCode('FOTO-MANUAL'); // Indicador para preencher manual
            stopCamera();
            setStage(1);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Simula escaneamento bem sucedido com o arquivo
                if (stage === 0) {
                    setScannedCode(`UPLOAD-${Math.floor(Math.random() * 10000)}`);
                    setStage(1);
                    // Se estiver no stage 1 (evidence), salva na tempAsset
                    setTempAsset(prev => ({ ...prev, imageUrl: result, tagImageUrl: result }));
                } else {
                    // Stage 1 specific logic handled elsewhere or tailored here if needed
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const capturePhotoFromVideo = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                return canvas.toDataURL('image/jpeg');
            }
        }
        return null;
    };

    const handleRealCapture = () => {
        if (!isCameraActive && cameraError) {
            fileInputRef.current?.click();
            return;
        }

        const photo = capturePhotoFromVideo();
        if (photo) {
            const overlay = document.getElementById('scan-overlay');
            if (overlay) overlay.classList.add('bg-green-500', 'bg-opacity-20');

            setIsSyncing(true);
            setTimeout(() => {
                const fakeCode = scanMode === 'QR' ? `QR-${Math.random().toString(36).substring(7).toUpperCase()}` : `789${Math.floor(Math.random() * 1000000000)}`;
                setScannedCode(fakeCode);
                stopCamera();
                handleScanSubmit(fakeCode);
                setIsSyncing(false);
            }, 800);
        }
    };

    const handleScanSubmit = (code: string) => {
        if (!code) return;
        setTempAsset({ id: code, imageUrl: '', tagImageUrl: '' });
        setStage(1);
    };

    const handleFormScan = (e: React.FormEvent) => {
        e.preventDefault();
        handleScanSubmit(scannedCode);
    };

    const handleBasicInfoSubmit = () => {
        if (!tempAsset.name) {
            alert("Favor preencher nome do item.");
            return;
        }
        // Fotos opcionais no modo manual, obrigatórias no modo câmera se quiser rigor
        setStage(2);
    };

    const handleFinalSave = () => {
        const finalAsset: Asset = {
            id: tempAsset.id || 'ERR',
            name: tempAsset.name || 'Sem nome',
            category: tempAsset.category || AssetCategory.OTHER,
            state: tempAsset.state || AssetState.GOOD,
            locationId: tempAsset.locationId || locations[0]?.id || 'LOC-1',
            responsibleId: 'PENDING',
            purchaseDate: new Date().toISOString().split('T')[0],
            imageUrl: tempAsset.imageUrl || 'https://via.placeholder.com/150',
            tagImageUrl: tempAsset.tagImageUrl,
            description: tempAsset.description
        };
        onAddAsset(finalAsset);
        setScannedCode('');
        setTempAsset({});
        setStage(0);
        // alert('Patrimônio protocolado com sucesso!');
    };

    // Para capturar fotos específicas no Stage 1
    const captureEvidence = async (type: 'ASSET' | 'TAG') => {
        // Se a câmera não estiver ativa, tenta ativar
        if (!isCameraActive && !cameraError) {
            await startCamera();
            return; // Espera usuário clicar de novo para capturar ou ativa e instrui
        }

        if (cameraError) {
            // Trigger file upload for specific field
            // Seria necessário refs separados ou lógica de estado para saber qual campo está sendo preenchido
            // Simplificação: apenas alerta ou usa o input genérico se implementado complexo
            fileInputRef.current?.click();
            // Mas precisamos saber onde salvar. Vamos usar um state temporário ou hack rápido
            // hack: set flag to know which image update
            (window as any).uploadTarget = type;
            return;
        }

        const photo = capturePhotoFromVideo();
        if (photo) {
            setTempAsset(prev => ({
                ...prev,
                [type === 'ASSET' ? 'imageUrl' : 'tagImageUrl']: photo
            }));
        }
    };

    const handleSpecificFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                const target = (window as any).uploadTarget || 'imageUrl';
                setTempAsset(prev => ({ ...prev, [target === 'ASSET' ? 'imageUrl' : 'tagImageUrl']: res }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex justify-center items-center uppercase tracking-widest">
                    <Zap className="w-6 h-6 mr-2 text-gov-600 fill-current" />
                    Terminal de Coleta Inteligente
                </h2>
                <p className="text-gray-500 font-mono text-xs">SISTEMA INTEGRADO DE IDENTIFICAÇÃO V.2.4</p>
            </div>

            {stage === 0 && (
                <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto aspect-[9/16] md:aspect-[3/4] border-8 border-gray-900 ring-1 ring-gray-800">
                    {/* INPUTS DE ARQUIVO OCULTOS PARA FALLBACK */}
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />

                    {!isCameraActive ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 to-black">
                            <div className="mb-8 flex gap-4">
                                <button onClick={() => setScanMode('QR')} className={`p-4 rounded-xl flex flex-col items-center border transition-all w-24 ${scanMode === 'QR' ? 'border-blue-500 bg-blue-900/30 text-blue-400' : 'border-gray-700 hover:bg-gray-800 text-gray-500'}`}><QrCode className="w-8 h-8 mb-2" /><span className="text-[10px] font-bold tracking-widest">QR CODE</span></button>
                                <button onClick={() => setScanMode('BARCODE')} className={`p-4 rounded-xl flex flex-col items-center border transition-all w-24 ${scanMode === 'BARCODE' ? 'border-green-500 bg-green-900/30 text-green-400' : 'border-gray-700 hover:bg-gray-800 text-gray-500'}`}><Barcode className="w-8 h-8 mb-2" /><span className="text-[10px] font-bold tracking-widest">BARRAS</span></button>
                            </div>

                            <Button size="lg" onClick={startCamera} className={`w-full max-w-xs h-14 text-lg mb-6 rounded-md shadow-[0_0_20px_rgba(37,99,235,0.5)] border font-mono tracking-wider ${cameraError ? 'bg-amber-600 hover:bg-amber-500 border-amber-400' : 'bg-blue-600 hover:bg-blue-500 border-blue-400'}`}>
                                <Camera className="w-5 h-5 mr-2" /> {cameraError ? 'USAR ARQUIVO / FOTO' : 'ATIVAR CÂMERA'}
                            </Button>

                            <div className="w-full max-w-xs relative group"><form onSubmit={handleFormScan} className="relative flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-700"><input ref={inputRef} type="text" className="flex-1 bg-transparent border-none text-white focus:ring-0 outline-none px-3 font-mono text-sm placeholder-gray-600" placeholder="Digitar código manual..." value={scannedCode} onChange={(e) => setScannedCode(e.target.value)} /><button type="submit" className="bg-gray-800 p-2 rounded hover:bg-gray-700 border border-gray-600 text-gray-400"><Search className="w-4 h-4" /></button></form></div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-black">
                            {/* VIDEO REAL DA CÂMERA */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            <div className="absolute top-6 left-0 right-0 z-20 flex justify-between items-start px-4">
                                <Button variant="danger" onClick={stopCamera} className="rounded-full w-12 h-12 flex items-center justify-center p-0 border border-white/20 bg-black/40 backdrop-blur text-white shadow-lg">
                                    <XCircle size={24} />
                                </Button>

                                <div className="flex gap-2">
                                    <button onClick={() => setScanMode('QR')} className={`px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all ${scanMode === 'QR' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' : 'bg-black/40 text-gray-300 border border-white/10'}`}>
                                        <QrCode size={16} /> <span className="text-[10px] font-black tracking-widest">QR</span>
                                    </button>
                                    <button onClick={() => setScanMode('BARCODE')} className={`px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all ${scanMode === 'BARCODE' ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' : 'bg-black/40 text-gray-300 border border-white/10'}`}>
                                        <Barcode size={16} /> <span className="text-[10px] font-black tracking-widest">BARRAS</span>
                                    </button>
                                </div>

                                <button onClick={toggleTorch} className={`rounded-full w-12 h-12 flex items-center justify-center border backdrop-blur shadow-lg transition-all ${torchEnabled ? 'bg-amber-500 text-white border-amber-300 shadow-amber-500/50' : 'bg-black/40 text-gray-300 border-white/20'}`}>
                                    <Zap size={20} className={torchEnabled ? 'fill-current' : ''} />
                                </button>
                            </div>

                            <div id="scan-overlay" className="absolute inset-0 flex flex-col items-center justify-center transition-colors duration-200 z-10 pointer-events-none">
                                <div className={`relative transition-all duration-500 ${scanMode === 'QR' ? 'w-64 h-64' : 'w-80 h-40'}`}>
                                    {/* Cantos do Overlay */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>

                                    {/* Laser de Escaneamento */}
                                    <div className={`absolute left-0 w-full h-0.5 bg-red-500 shadow-[0_0_20px_rgba(255,0,0,1)] animate-[scan_2s_infinite_linear] opacity-80 ${scanMode === 'QR' ? 'top-0' : 'top-1/2'}`}></div>

                                    {/* Mira Central */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                        <Crosshair className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <div className="mt-8 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                    <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                        {scanMode === 'QR' ? 'Centralize o QR Code' : 'Alinhe com o Código de Barras'}
                                    </p>
                                </div>
                            </div>

                            {isSyncing && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                                    <RefreshCw className="w-12 h-12 animate-spin text-gov-500 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">Identificando...</p>
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-center gap-8 pb-10">
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={handleManualPhoto} className="w-14 h-14 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all active:scale-95 group">
                                        <Camera className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                    </button>
                                    <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">Foto</span>
                                </div>

                                <button onClick={handleRealCapture} className="h-20 px-8 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] active:scale-95 transition-all flex flex-col items-center justify-center gap-1">
                                    <ScanBarcode size={28} />
                                    <span>Escanear</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {stage === 1 && (
                <Card className="max-w-lg mx-auto animate-fadeIn border-t-4 border-t-blue-500 shadow-xl">
                    <input type="file" className="hidden" id="specific-upload" onChange={handleSpecificFileUpload} accept="image/*" />
                    <div className="text-center mb-6">
                        <span className="bg-gray-100 text-gray-800 text-xs font-mono px-3 py-1 rounded border border-gray-300">ID: {tempAsset.id}</span>
                        <h3 className="text-xl font-bold mt-3 text-gray-800">Coleta de Evidências</h3>
                    </div>

                    {isCameraActive && (
                        <div className="mb-6 rounded-2xl overflow-hidden aspect-video border-2 border-blue-500 relative">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 text-[8px] bg-blue-600 text-white px-2 py-1 rounded font-black uppercase">Câmera Ativa</div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400">Foto do Ativo</label>
                                <div onClick={() => captureEvidence('ASSET')} className="relative h-40 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer">
                                    {tempAsset.imageUrl ? <img src={tempAsset.imageUrl} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400 group-hover:text-blue-600"><Camera className="w-10 h-10 mx-auto mb-1" /><span className="text-[8px] font-bold uppercase tracking-wider">{isCameraActive ? 'Bater Foto' : (cameraError ? 'Carregar Foto' : 'Ativar Câmera')}</span></div>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400">Foto da Etiqueta</label>
                                <div onClick={() => captureEvidence('TAG')} className="relative h-40 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer">
                                    {tempAsset.tagImageUrl ? <img src={tempAsset.tagImageUrl} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400 group-hover:text-blue-600"><Tag className="w-10 h-10 mx-auto mb-1" /><span className="text-[8px] font-bold uppercase tracking-wider">{isCameraActive ? 'Bater Foto' : (cameraError ? 'Carregar Foto' : 'Ativar Câmera')}</span></div>}
                                </div>
                            </div>
                        </div>
                        <Input label="Nome do Item / Descrição Curta" placeholder="Ex: Monitor 24pol Samsung" value={tempAsset.name || ''} onChange={e => setTempAsset({ ...tempAsset, name: e.target.value })} />
                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={() => { stopCamera(); setStage(0); }}>Cancelar</Button>
                            <Button onClick={() => { stopCamera(); handleBasicInfoSubmit(); }} disabled={!tempAsset.name} className="bg-blue-600 hover:bg-blue-700">Continuar <ArrowRight className="w-4 h-4 ml-2" /></Button>
                        </div>
                    </div>
                </Card>
            )}

            {stage === 2 && (
                <Card className="animate-fadeIn shadow-xl border-t-4 border-t-green-500">
                    <div className="flex items-center space-x-4 mb-6 border-b pb-4 bg-gray-50 -m-6 mb-6 p-6 rounded-t-lg">
                        <img src={tempAsset.imageUrl} alt="Thumbnail" className="w-16 h-16 rounded object-cover border-2 border-white shadow-sm" />
                        <div><h3 className="text-xl font-bold text-gray-900">{tempAsset.name}</h3><span className="text-xs text-gray-500 font-mono bg-gray-200 px-2 py-0.5 rounded">ID: {tempAsset.id}</span></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoria</label><select className="block w-full border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500" value={tempAsset.category} onChange={e => setTempAsset({ ...tempAsset, category: e.target.value as any })}><option value={AssetCategory.FURNITURE}>Mobiliário</option><option value={AssetCategory.ELECTRONICS}>Eletrônicos</option><option value={AssetCategory.VEHICLE}>Veículo</option><option value={AssetCategory.MACHINERY}>Maquinário</option><option value={AssetCategory.OTHER}>Outro</option></select></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estado</label><select className="block w-full border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500" value={tempAsset.state} onChange={e => setTempAsset({ ...tempAsset, state: e.target.value as any })}><option value={AssetState.GOOD}>Bom</option><option value={AssetState.REGULAR}>Regular</option><option value={AssetState.BAD}>Ruim</option></select></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Localização</label><select className="block w-full border-gray-300 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500" value={tempAsset.locationId} onChange={e => setTempAsset({ ...tempAsset, locationId: e.target.value })}>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                        <Input label="Detalhes Adicionais" value={tempAsset.description || ''} onChange={e => setTempAsset({ ...tempAsset, description: e.target.value })} />
                    </div>
                    <div className="mt-8 flex justify-end gap-3 border-t pt-4"><Button variant="ghost" onClick={() => setStage(1)}>Voltar</Button><Button onClick={handleFinalSave} className="bg-green-600 hover:bg-green-700">{stage === 2 && <CheckCircle className="w-4 h-4 mr-2" />} Salvar no Sistema</Button></div>
                </Card>
            )}
            <style>{`@keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
        </div>
    );
};
