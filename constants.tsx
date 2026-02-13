import React from 'react';
import {
    User, UserRole, UserStatus, Asset, AssetCategory, AssetState, Location,
    Document, AuditLog, LegalNorm, InventorySession, Supplier, CostRecord,
    Movement, OfficialProcess, NavItem
} from './types';
import {
    LayoutDashboard, Package, ClipboardList, ScanBarcode, TrendingUp, Settings,
    FileText, Map, Building, Truck, Activity, Scale, ShieldCheck,
    LayoutTemplate, BarChartHorizontal, UserCheck, DollarSign, Wrench
} from 'lucide-react';

// AUTOMATIC GLOBAL CONNECTION (Vercel + TiDB)
// AUTOMATIC GLOBAL CONNECTION (Vercel + TiDB)
// Smart Detection: If on Vercel (Cloud), use relative path. If on Local/App, use Full URL.
const isVercel = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('syst'));

// Logic to determine API URL
let determinedUrl = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api';

if (isVercel) {
    determinedUrl = '/api';
} else {
    // We are on Localhost or Desktop App
    // SECURITY UPDATE: API GATEWAY MODE
    // Default to Vercel (Cloud Proxy) to avoid needing local DB keys.
    // The Desktop App should talk to "https://...vercel.app/api"

    // OFFLINE MODE is handled by LoginPage.tsx catching errors from this URL 
    // and switching to SQLite.

    // determinedUrl = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api'; 
    // (Already set above as default)

    const custom = localStorage.getItem('custom_api_url');
    // Only use custom if explicitly set
    if (custom && !custom.startsWith('/')) {
        determinedUrl = custom;
    }

    // FORCE LOCALHOST FOR TESTING (Removed for Production Sync)
    // determinedUrl = 'http://localhost:3001/api';
}

export const API_URL = determinedUrl;
// NOTE: For local testing, you can use http://localhost:3001/api (requires code change)
// NOTE: For local testing, you can use http://localhost:3001/api (requires code change)

export enum ConnectionStatus {
    CONNECTING,
    CONNECTED,
    ERROR
}

export const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard size={20} /> },
    {
        id: 'assets',
        label: 'Gestão de Ativos',
        icon: <Package size={20} />,
        subItems: [
            { id: 'assets', label: 'Cadastro de Bens', icon: <Package size={18} /> },
            { id: 'status_overview', label: 'Status dos Bens', icon: <Activity size={18} /> },
            { id: 'print_center', label: 'Central de Impressão', icon: <ScanBarcode size={18} /> },
        ]
    },
    {
        id: 'responsible',
        label: 'Responsáveis',
        icon: <UserCheck size={20} />,
        subItems: [
            { id: 'hierarchy', label: 'Pirâmide de Autoridade', icon: <UserCheck size={18} /> },
            { id: 'responsible_list', label: 'Lista de Agentes', icon: <ClipboardList size={18} /> },
        ]
    },
    {
        id: 'suppliers',
        label: 'Fornecedores e Custos',
        icon: <DollarSign size={20} />,
        subItems: [
            { id: 'suppliers_costs', label: 'Ecosystem Financeiro', icon: <DollarSign size={18} /> },
        ]
    },
    {
        id: 'maintenance',
        label: 'Manutenção',
        icon: <Wrench size={20} />,
        subItems: [
            { id: 'maintenance_orders', label: 'Ordens de Serviço', icon: <Wrench size={18} /> },
            { id: 'asset_maintenance', label: 'Histórico Técnico', icon: <ClipboardList size={18} /> },
        ]
    },
    {
        id: 'operations',
        label: 'Operações e Movimentação',
        icon: <Truck size={20} />,
        subItems: [
            { id: 'movements', label: 'Movimentações', icon: <Truck size={18} /> },
            { id: 'vehicles', label: 'Frota', icon: <Truck size={18} /> },
            { id: 'inventory', label: 'Inventário Digital', icon: <ClipboardList size={18} /> },
            { id: 'scanner', label: 'Coleta Mobile', icon: <ScanBarcode size={18} /> },
        ]
    },
    {
        id: 'governance',
        label: 'Governança e Leis',
        icon: <Scale size={20} />,
        subItems: [
            { id: 'governance', label: 'Base Jurídica', icon: <Scale size={18} /> },
            { id: 'processes', label: 'Processos Oficiais', icon: <ShieldCheck size={18} /> },
            { id: 'documents', label: 'Documentos GED', icon: <FileText size={18} /> },
        ]
    },
    {
        id: 'locations',
        label: 'Mapas e Infra',
        icon: <Map size={20} />,
        subItems: [
            { id: 'map', label: 'Mapa Geográfico', icon: <Map size={18} /> },
            { id: 'floorplans', label: 'Plantas Baixas', icon: <LayoutTemplate size={18} /> },
            { id: 'depots', label: 'Depósitos', icon: <Building size={18} /> },
        ]
    },
    {
        id: 'intelligence',
        label: 'Inteligência',
        icon: <BarChartHorizontal size={20} />,
        subItems: [
            { id: 'reports', label: 'Relatórios & BI', icon: <BarChartHorizontal size={18} /> },
            { id: 'audit', label: 'Auditoria & Logs', icon: <ShieldCheck size={18} /> },
        ]
    },
    { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
];


// MOCK DATA
// MOCK DATA - CLEARED FOR PRODUCTION
// The app should rely on Supabase Authentication
export const MOCK_USER: User = {
    id: '',
    name: '',
    email: '',
    role: UserRole.VIEWER, // Default safe role
    status: UserStatus.PENDING,
    isOwner: false,
    avatarUrl: '',
};

export const MOCK_LOCATIONS: Location[] = [];
export const MOCK_ASSETS: Asset[] = [];
export const MOCK_LOGS: AuditLog[] = [];
export const MOCK_DOCUMENTS: Document[] = [];
export const MOCK_INVENTORY: InventorySession[] = [];
export const MOCK_COSTS: CostRecord[] = [];
export const MOCK_SUPPLIERS: Supplier[] = [];
export const MOCK_NORMS: LegalNorm[] = [];
export const MOCK_MOVEMENTS: Movement[] = [];
export const MOCK_PROCESSES: OfficialProcess[] = [];
export const OFFICIAL_PROCESSES = MOCK_PROCESSES;
export const MOCK_GED = MOCK_DOCUMENTS;
