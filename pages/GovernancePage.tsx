import React, { useState, useMemo } from 'react';
import { Card, Button, Input, Modal, Badge } from '../components/Shared';
import { LegalNorm, EntityType } from '../types';
import {
    Gavel, Scale, FileText, Plus, BookOpen, CheckCircle,
    Landmark, ShieldCheck, Download, FileCode, ExternalLink,
    Shield, ArrowRightLeft, HelpCircle, MapPin,
    Table, Check, XCircle, Info, AlertTriangle, Briefcase, Building2,
    History, Coins, Hammer, UserCheck, Calendar
} from 'lucide-react';

interface GovernancePageProps {
    norms: LegalNorm[];
    onAddNorm: (n: LegalNorm) => void;
    entityType: EntityType;
}

export const GovernancePage: React.FC<GovernancePageProps> = ({ norms, onAddNorm, entityType }) => {
    const [activeTab, setActiveTab] = useState<'NORMS' | 'ACCOUNTING' | 'REPOSITORY' | 'COMPLIANCE'>('REPOSITORY');
    const [accountingManualTab, setAccountingManualTab] = useState<'RECOGNITION' | 'VALUATION' | 'DEPRECIATION' | 'IMPAIRMENT'>('RECOGNITION');

    // Checklist State
    const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

    const [isNormModalOpen, setIsNormModalOpen] = useState(false);
    const [newNorm, setNewNorm] = useState<Partial<LegalNorm & { date: string, authority: string, tags: string, status: string }>>({
        code: 'DECRETO',
        description: '',
        date: new Date().toISOString().split('T')[0],
        authority: '',
        tags: '',
        status: 'VIGENTE'
    });

    const isPublic = entityType === 'PUBLIC';

    const toggleTask = (id: number) => {
        const newSet = new Set(completedTasks);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setCompletedTasks(newSet);
    };

    const handleSaveNorm = () => {
        if (!newNorm.code || !newNorm.description) return;
        onAddNorm({
            id: `NORM-${Date.now()}`,
            code: newNorm.code!,
            description: newNorm.description!,
            entityType: entityType
        });
        setIsNormModalOpen(false);
        setNewNorm({ code: 'DECRETO', description: '' });
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 shadow-gov-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Scale className="w-8 h-8 mr-3 text-gov-600" />
                        Base Legal & Governança
                    </h2>
                    <p className="text-gray-500 mt-1">Soberania jurídica e ritos de conformidade para o Setor {isPublic ? 'Público' : 'Privado'}.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => window.open('http://www.planalto.gov.br', '_blank')}>
                        <ExternalLink size={16} className="mr-2" /> Portal do Planalto
                    </Button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-t-xl px-4 shadow-sm">
                {[
                    { id: 'REPOSITORY', label: 'Biblioteca Normativa', icon: <Landmark className="w-4 h-4 mr-2" /> },
                    { id: 'NORMS', label: 'Atos Internos', icon: <MapPin className="w-4 h-4 mr-2" /> },
                    { id: 'ACCOUNTING', label: 'Manual Contábil', icon: <BookOpen className="w-4 h-4 mr-2" /> },
                    { id: 'COMPLIANCE', label: 'Checklist Conformidade', icon: <ShieldCheck className="w-4 h-4 mr-2" /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center ${activeTab === tab.id ? 'border-gov-600 text-gov-600 bg-gov-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-fadeIn">
                {/* === TAB: BIBLIOTECA FEDERAL (FILTRADA POR SETOR) === */}
                {activeTab === 'REPOSITORY' && (
                    <div className="space-y-10">
                        {/* 1. LEIS OBRIGATÓRIAS (COMUM A TODOS) - Mantido pois aplica a ambos, mas visualmente adaptado */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 border-b-2 border-gov-600 pb-2">
                                <span className="bg-gov-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">1</span>
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Base Jurídica {isPublic ? 'Pública' : 'Privada'}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-gov-500">
                                    <h4 className="font-bold text-gray-900 flex items-center mb-2">Constituição Federal de 1988</h4>
                                    <ul className="text-sm space-y-2 text-gray-600">
                                        <li className="flex gap-2"><Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" /> <strong>Art. 216:</strong> Define patrimônio cultural e prevê o tombamento.</li>
                                        <li className="flex gap-2"><Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" /> <strong>Art. 23, III e IV:</strong> Competência comum de proteção entre entes.</li>
                                    </ul>
                                </Card>
                                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-gov-500">
                                    <h4 className="font-bold text-gray-900 flex items-center mb-2">Decreto-Lei nº 25/1937</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">Lei central indispensável que regula o rito administrativo do tombamento e direitos/deveres do proprietário.</p>
                                </Card>
                            </div>
                        </section>

                        {/* 2. ESPECÍFICO PRIVADA */}
                        {!isPublic && (
                            <section className="space-y-4 animate-fadeIn">
                                <div className="flex items-center gap-3 border-b-2 border-amber-600 pb-2">
                                    <span className="bg-amber-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">2</span>
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Legislação Específica Privada</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Card title="Código Civil (10.406/02)" className="h-full">
                                        <p className="text-xs text-gray-600"><strong>Art. 1.228:</strong> Propriedade deve atender sua função social e limitações de alteração em bens tombados.</p>
                                    </Card>
                                    <Card title="Estatuto da Cidade" className="h-full">
                                        <p className="text-xs text-gray-600">Regras de uso do solo urbano e proteção de ativos imobilizados de relevância histórica.</p>
                                    </Card>
                                    <Card title="Lei de Crimes Ambientais" className="h-full border-t-red-500">
                                        <p className="text-xs text-red-600 font-bold">Responsabilidade penal da pessoa jurídica privada por alteração não autorizada em bens protegidos.</p>
                                    </Card>
                                </div>
                            </section>
                        )}

                        {/* 3. ESPECÍFICO PÚBLICA */}
                        {isPublic && (
                            <section className="space-y-4 animate-fadeIn">
                                <div className="flex items-center gap-3 border-b-2 border-indigo-600 pb-2">
                                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">2</span>
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Legislação Específica Pública</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Card title="Lei 4.320/1964" className="h-full">
                                        <p className="text-xs text-gray-600">Estatística e controle contábil dos bens públicos permanentes e inventário obrigatório.</p>
                                    </Card>
                                    <Card title="Lei 14.133/21 (Licitações)" className="h-full border-t-indigo-500">
                                        <p className="text-xs text-gray-600">Ritos para contratação de restauro e alienação de bens inservíveis públicos.</p>
                                    </Card>
                                    <Card title="MCASP (Tesouro Nacional)" className="h-full">
                                        <p className="text-xs text-gray-600">Padrão de lançamentos para reconhecimento, depreciação e baixas patrimoniais governamentais.</p>
                                    </Card>
                                </div>
                            </section>
                        )}

                        {/* 4. MATRIZ DE APLICABILIDADE (FILTRADA) */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 border-b-2 border-emerald-600 pb-2">
                                <span className="bg-emerald-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">3</span>
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Matriz de Enquadramento Vigente</h3>
                            </div>
                            <Card className="p-0 overflow-hidden shadow-lg border-emerald-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-slate-900 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Normatização</th>
                                            {!isPublic && <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest bg-amber-600">Privado (CPC 27)</th>}
                                            {isPublic && <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest bg-indigo-600">Público (NBC TSP)</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {[
                                            { lei: 'Constituição Federal/88', priv: true, pub: true },
                                            { lei: 'Decreto-Lei 25/1937', priv: true, pub: true },
                                            { lei: 'Código Civil (Uso)', priv: true, pub: false },
                                            { lei: 'Lei 4.320 (Finanças)', priv: false, pub: true },
                                            { lei: 'Lei Crimes Ambientais', priv: true, pub: true },
                                            { lei: 'Normas IFRS / CPC', priv: true, pub: false },
                                            { lei: 'Portarias STN / MCASP', priv: false, pub: true },
                                        ].filter(row => isPublic ? row.pub : row.priv).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-emerald-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-800">{row.lei}</td>
                                                {!isPublic && <td className="px-6 py-4 text-center bg-amber-50/30">{row.priv ? <CheckCircle size={18} className="text-emerald-500 mx-auto" /> : <XCircle size={18} className="text-gray-200 mx-auto" />}</td>}
                                                {isPublic && <td className="px-6 py-4 text-center bg-indigo-50/30">{row.pub ? <CheckCircle size={18} className="text-emerald-500 mx-auto" /> : <XCircle size={18} className="text-gray-200 mx-auto" />}</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </section>
                    </div>
                )}

                {/* === TAB: MANUAL CONTÁBIL (ADAPTADO POR SETOR) === */}
                {activeTab === 'ACCOUNTING' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 space-y-2">
                            <h4 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest px-2">Roteiro {isPublic ? 'NBC TSP 07' : 'CPC 27'}</h4>
                            {[
                                { id: 'RECOGNITION', label: '1. Reconhecimento', icon: <CheckCircle size={16} /> },
                                { id: 'VALUATION', label: '2. Mensuração', icon: <Coins size={16} /> },
                                { id: 'DEPRECIATION', label: '3. Depreciação', icon: <History size={16} /> },
                                { id: 'IMPAIRMENT', label: '4. Recuperabilidade', icon: <Shield size={16} /> }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setAccountingManualTab(m.id as any)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${accountingManualTab === m.id ? 'bg-gov-900 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gov-50'}`}
                                >
                                    {m.icon} {m.label}
                                </button>
                            ))}
                        </div>

                        <Card className="lg:col-span-3 border-none shadow-xl bg-white p-8">
                            <div className="animate-fadeIn">
                                {accountingManualTab === 'RECOGNITION' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Badge color={isPublic ? 'blue' : 'orange'}>{isPublic ? 'NBC TSP 07' : 'CPC 27 / IFRS'}</Badge>
                                            <h3 className="text-2xl font-black text-gray-900">Reconhecimento de Ativos {isPublic ? 'Públicos' : 'Corporativos'}</h3>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            Um item deve ser reconhecido como imobilizado se:
                                        </p>
                                        <div className={`p-6 rounded-2xl border ${isPublic ? 'bg-indigo-50 border-indigo-100 text-indigo-900' : 'bg-amber-50 border-amber-100 text-amber-900'}`}>
                                            <ul className="space-y-4 text-sm font-medium">
                                                <li className="flex gap-3"><Check className="mt-0.5" size={18} /> Provável geração de benefícios econômicos futuros {isPublic ? 'ou potencial de serviços' : ''}.</li>
                                                <li className="flex gap-3"><Check className="mt-0.5" size={18} /> O custo do item pode ser mensurado com segurança.</li>
                                                {isPublic && <li className="flex gap-3"><Check className="mt-0.5" size={18} /> O bem é controlado pela entidade como resultado de eventos passados.</li>}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {accountingManualTab === 'VALUATION' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-900">Mensuração Inicial</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 border rounded-2xl bg-slate-50">
                                                <h5 className="font-bold text-gray-800 mb-2">Custo de Aquisição</h5>
                                                <p className="text-[11px] text-gray-500">Preço de compra + impostos {isPublic ? 'não recuperáveis' : ''} + custos diretos de instalação.</p>
                                            </div>
                                            <div className="p-5 border rounded-2xl bg-slate-50">
                                                <h5 className="font-bold text-gray-800 mb-2">Valor Justo (Doações)</h5>
                                                <p className="text-[11px] text-gray-500">Bens recebidos {isPublic ? 'gratuitamente' : 'em permuta'} devem ser registrados pelo valor de mercado na data.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {accountingManualTab === 'DEPRECIATION' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-900">Depreciação {isPublic ? 'Sistemática' : 'Contábil'}</h3>
                                        <p className="text-gray-600 text-sm">Alocação do valor depreciável ao longo da vida útil {isPublic ? 'conforme prazos da Receita Federal / STN' : 'conforme laudo técnico'}.</p>
                                        <table className="min-w-full text-xs border rounded-lg overflow-hidden">
                                            <thead className="bg-slate-900 text-white font-bold">
                                                <tr><th className="p-3 text-left">Categoria</th><th className="p-3 text-center">Vida Útil (Anos)</th><th className="p-3 text-center">Referência</th></tr>
                                            </thead>
                                            <tbody className="divide-y text-gray-700">
                                                <tr><td className="p-3 font-medium">Veículos</td><td className="p-3 text-center">5</td><td className="p-3 text-center">{isPublic ? 'IN SRF' : 'CPC 27'}</td></tr>
                                                <tr><td className="p-3 font-medium">Mobiliário</td><td className="p-3 text-center">10</td><td className="p-3 text-center">Padrão Mercado</td></tr>
                                                <tr><td className="p-3 font-medium">Máquinas</td><td className="p-3 text-center">10</td><td className="p-3 text-center">Manual Técnico</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {accountingManualTab === 'IMPAIRMENT' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-900">Teste de Recuperabilidade</h3>
                                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-4">
                                            <AlertTriangle className="text-red-600 flex-shrink-0" size={32} />
                                            <div>
                                                <h5 className="font-bold text-red-900">Indícios de Desvalorização</h5>
                                                <p className="text-sm text-red-800 leading-relaxed mt-1">
                                                    Anualmente, deve-se avaliar se o valor contábil excede o valor recuperável por {isPublic ? 'dano físico ou obsolescência de serviço' : 'fluxo de caixa futuro ou venda'}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* === TAB: COMPLIANCE E NORMAS LOCAIS (MANTIDOS CONFORME ESTADO ATUAL) === */}
                {activeTab === 'COMPLIANCE' && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-6">
                            <div className="p-4 bg-emerald-600 text-white rounded-full shadow-lg"><ShieldCheck size={32} /></div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-emerald-900">Checklist de Conformidade Mensal</h3>
                                <p className="text-sm text-emerald-700">Roteiro obrigatório para auditoria interna no regime {entityType}.</p>
                            </div>
                            <Badge color="green" className="text-lg px-4 py-2 font-black">{Math.round((completedTasks.size / 6) * 100)}%</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 1, t: "Conciliação Físico-Contábil", d: "Validar se o saldo do sistema bate com o balancete gerado pela contabilidade.", icon: <ArrowRightLeft /> },
                                { id: 2, t: "Termos de Responsabilidade", d: "Garantir que 100% dos novos bens possuem fiel depositário assinado e digitalizado.", icon: <UserCheck /> },
                                { id: 3, t: "Vistoria de Bens Críticos", d: "Inspeção física in loco em veículos e máquinas de alto valor.", icon: <Hammer /> },
                                { id: 4, t: "Aferição de Insumos (Placas)", d: "Contagem de placas de alumínio/QR codes virgens em almoxarifado.", icon: <Info /> },
                                { id: 5, t: "Auditoria de Baixas", d: "Verificar se todos os bens sucateados possuem laudo técnico anexado.", icon: <XCircle /> },
                                { id: 6, t: "Atualização de Portarias", d: "Validar se a Comissão de Inventário está com mandato vigente.", icon: <FileText /> }
                            ].map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${completedTasks.has(task.id) ? 'bg-emerald-50 border-emerald-200 opacity-60' : 'bg-white hover:border-gov-300 shadow-sm'}`}
                                >
                                    <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${completedTasks.has(task.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-200 group-hover:border-gov-400'}`}>
                                        {completedTasks.has(task.id) && <Check size={14} />}
                                    </div>
                                    <div>
                                        <h5 className={`font-bold text-sm ${completedTasks.has(task.id) ? 'text-emerald-900 line-through' : 'text-gray-800'}`}>{task.t}</h5>
                                        <p className="text-xs text-gray-500 mt-1">{task.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'NORMS' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FileCode className="text-gov-600" size={24} />
                                    Repositório de Atos Internos
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Gestão de Decretos, Portarias e Leis Municipais.</p>
                            </div>
                            <Button onClick={() => setIsNormModalOpen(true)} className="px-6 py-3 rounded-xl shadow-lg bg-gov-900 text-white font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                                <Plus size={16} className="mr-2" /> Novo Documento Oficial
                            </Button>
                        </div>

                        <Card className="p-0 overflow-hidden border-none shadow-xl rounded-2xl bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b">
                                        <tr>
                                            <th className="px-6 py-4">Tipo de Norma</th>
                                            <th className="px-6 py-4">Numeração / Ano</th>
                                            <th className="px-6 py-4">Ementa (Descrição)</th>
                                            <th className="px-6 py-4">Esfera</th>
                                            <th className="px-6 py-4 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {norms.length > 0 ? (
                                            norms.map(norm => (
                                                <tr key={norm.id} className="hover:bg-blue-50/50 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        <Badge color="blue" className="px-3 py-1">{norm.code}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">
                                                        {norm.description.split('-')[0] || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 max-w-md truncate" title={norm.description}>
                                                        {norm.description}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                            {norm.entityType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Button variant="ghost" size="sm" onClick={() => alert('Download do PDF oficial iniciado...')} className="hover:bg-gov-100 text-gov-600 hover:text-gov-800 rounded-lg p-2">
                                                            <Download size={18} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <FileText size={32} className="opacity-20" />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Nenhum ato registrado</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* MODAL NOVA NORMA */}
            <Modal isOpen={isNormModalOpen} onClose={() => setIsNormModalOpen(false)} title="Registrar Ato Interno Administrativo" size="lg">
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6">
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-gov-600 border border-slate-100"><Gavel size={32} /></div>
                        <div>
                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Protocolo Legislativo/Administrativo</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Cadastro oficial de normas e regulamentos.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tipo de Ato</label>
                            <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-black uppercase shadow-sm outline-none focus:ring-4 focus:ring-gov-500/10" value={newNorm.code} onChange={e => setNewNorm({ ...newNorm, code: e.target.value as any })}>
                                <option value="LAW">Lei Ordinária / Complementar</option>
                                <option value="DECREE">Decreto Executivo</option>
                                <option value="ORDINANCE">Portaria / Resolução</option>
                                <option value="INSTRUCTION">Instrução Normativa</option>
                            </select>
                        </div>
                        <Input label="Numeração / Ano" placeholder="Ex: 450/2024" value={newNorm.description} onChange={e => setNewNorm({ ...newNorm, description: e.target.value })} icon={<FileText size={18} />} />
                    </div>

                    <Input label="Ementa (Descrição Completa)" placeholder="Dispõe sobre procedimentos de..." value={newNorm.description} onChange={e => setNewNorm({ ...newNorm, description: e.target.value })} icon={<FileText size={18} />} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Autoridade Signatária" placeholder="Ex: Prefeito Municipal" value={newNorm.authority} onChange={e => setNewNorm({ ...newNorm, authority: e.target.value })} icon={<UserCheck size={18} />} />
                        <Input label="Data de Publicação" type="date" value={newNorm.date} onChange={e => setNewNorm({ ...newNorm, date: e.target.value })} icon={<Calendar size={18} />} />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Arquivo Digital (PDF/A)</label>
                        <div className="h-32 border-4 border-dashed border-slate-100 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-gov-500 transition-colors group">
                            <Download size={32} className="text-slate-300 group-hover:text-gov-500 mb-2 transition-colors" />
                            <p className="text-[9px] font-black text-slate-400 uppercase group-hover:text-gov-600 transition-colors">Clique para anexar documento assinado</p>
                        </div>
                    </div>

                    <Button onClick={handleSaveNorm} fullWidth className="h-16 bg-gov-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-transform border-none">
                        Protocolar Documento
                    </Button>
                </div>
            </Modal>
        </div >
    );
};