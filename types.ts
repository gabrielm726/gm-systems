import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  subItems?: NavItem[];
}



declare module '*.jpg';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLogin?: string;
  isOwner?: boolean;
  permissions?: string[];
  department?: string; // Adicionado
  phone?: string;
  cnh?: string;
  cnhCategory?: string;
  cnhExpiration?: string;
  hierarchyLevel?: number;
}

export enum AssetCategory {
  ELECTRONIC = 'Eletrônico',
  ELECTRONICS = 'Eletrônicos',
  FURNITURE = 'Mobiliário',
  VEHICLE = 'Veículo',
  TOOL = 'Ferramenta',
  PROPERTY = 'Imóvel',
  MACHINERY = 'Maquinário',
  OTHER = 'Outros'
}

export enum AssetState {
  GOOD = 'Bom',
  REGULAR = 'Regular',
  BAD = 'Ruim',
  REQUIRES_MAINTENANCE = 'Requer Manutenção',
  MAINTENANCE = 'Em Manutenção',
  DISPOSED = 'Descartado',
  NEW = 'Novo',
  USED = 'Usado'
}

export enum MaintenanceStatus {
  PENDENTE = 'Pendente',
  EM_ANDAMENTO = 'Em Andamento',
  FINALIZADA = 'Finalizada',
  CANCELADA = 'Cancelada',
  // Campos adicionais para compatibilidade
  REQUESTED = 'Solicitada',
  BUDGETING = 'Em Orçamento',
  IN_PROGRESS = 'Em Andamento',
  FINISHED = 'Concluída',
  CANCELLED = 'Cancelada'
}

export enum MaintenanceType {
  CORRETIVA = 'Corretiva',
  PREVENTIVA = 'Preventiva',
  PREDITIVA = 'Preditiva'
}

export enum MaintenanceCostType {
  SERVICO = 'Serviço',
  PECA = 'Peça',
  OUTRO = 'Outro'
}

export enum MaintenanceLocation {
  OFICINA_INTERNA = 'Oficina Interna',
  OFICINA_EXTERNA = 'Oficina Externa',
  IN_LOCO = 'No Local'
}

export interface Maintenance {
  id: string;
  assetId: string;
  date: string;
  type: MaintenanceType;
  reason?: string;
  description: string;
  cost: number;
  costType: MaintenanceCostType;
  provider: string;
  supplierId?: string;
  maintenanceLocation: MaintenanceLocation;
  status: MaintenanceStatus;
  expectedReturnDate?: string;
  completedAt?: string;
}

export interface AccountingInfo {
  acquisitionValue: number;
  residualValue?: number;
  usefulLifeYears?: number;
  accumulatedDepreciation?: number;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  state: AssetState;
  value?: number; // Optional?
  locationId: string;
  purchaseDate: string;
  serialNumber?: string;
  plate?: string;
  responsibleId?: string;
  qrCodeUrl?: string;
  maintenanceHistory?: Maintenance[];
  imageUrl?: string;
  tagImageUrl?: string;
  accounting?: AccountingInfo;
  locationHistory?: {
    date: string;
    fromId: string;
    toId: string;
    responsibleId?: string;
  }[];
  // Added fields for VehiclePage
  model?: string;
  odometer?: number;
  fuelType?: string;
  description?: string;
  // Added for Professional Export
  manufacturer?: string;
  invoiceNumber?: string;
  [key: string]: any;
}

// Convert UserRole and UserStatus to Enums to allow value usage if needed, OR keep as types and fix usage in pages
// VehiclePage uses UserRole.OPERATOR, so it must be an Enum or Const.
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export type EntityType = 'PUBLIC' | 'PRIVATE';
export type DocStatus = 'VALID' | 'INVALID' | 'ARCHIVED';

export interface Location {
  id: string;
  name: string;
  type: 'BUILDING' | 'FLOOR' | 'ROOM' | 'DEPOT' | 'EXTERNAL';
  parentId?: string;
  qrCodeUrl?: string;
  mapCoordinates?: { x: number; y: number };
  floorPlanUrl?: string;
  address?: string;
  lat?: number;
  lng?: number;
  capacity?: number;
  internalPhotoUrl?: string;
  externalPhotoUrl?: string;
}

export interface DocumentVersion {
  version: number;
  date: string;
  responsible: string;
  url: string;
  changeNote: string;
}

export interface Document {
  id: string;
  title: string;
  type: string; // Changed from literal to string to allow more types or keep literal if exhaustive
  entityType: EntityType;
  date: string; // Was uploadDate, Documents.tsx uses date
  url: string;
  // Added fields used in Documents.tsx
  linkedProcessId?: string;
  assetId?: string;
  responsibleId?: string;
  status?: DocStatus;
  versions?: DocumentVersion[];
  isOficio?: boolean;
  oficioNumber?: string;
  oficioRecipient?: string;
  oficioSubject?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface SystemConfig {
  mode: 'DEVELOPMENT' | 'PRODUCTION' | 'HOMOLOGATION';
  entityType: 'PUBLIC' | 'PRIVATE';
  entityName: string;
  version: string;
}

export interface InventorySession {
  id: string;
  name?: string; // key field used in InventoryPage
  type?: string;
  startDate: string;
  endDate?: string;
  locationIds?: string[]; // InventoryPage uses locationIds
  locationId?: string; // Keep for backward compat if needed
  responsibleId?: string;
  status: 'ONGOING' | 'COMPLETED' | 'CANCELED';
  totalAssetsExpected: number;
  totalAssetsScanned: number;
  divergencesCount: number;
  legalFramework?: string;
  fieldSupervisor?: string;
  foundAssets?: string[];
  missingAssets?: string[];
}

export interface SupplierDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  cnpj: string;
  taxId?: string; // Alias for cnpj or alternative ID
  // Added fields used in SupplierCostPage
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  type?: 'PF' | 'PJ';
  supplierType?: 'PRODUTO' | 'SERVICO' | 'AMBOS';
  authorizedSector?: string;
  status?: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
  complianceStatus?: 'REGULAR' | 'PENDENTE' | 'IRREGULAR';
  additionalDocs?: SupplierDocument[];
  metrics?: {
    quality: number;
    delivery: number;
    price: number;
    esg: number;
    support: number;
  };
}

export interface CostRecord {
  id: string;
  assetId?: string; // Tornou-se opcional para custos gerais
  description: string;
  value: number;
  date: string;
  type: 'PURCHASE' | 'MAINTENANCE' | 'UPGRADE' | 'OTHER' | 'DESPESA' | 'MANUTENCAO';
  supplierId?: string;
  status?: 'PAGO' | 'PENDENTE' | 'VENCIDO'; // Adicionado
  maintenanceId?: string;
  invoiceNumber?: string;
  dueDate?: string;
  costCenter?: string;
}

export interface LegalNorm {
  id: string;
  code: string;
  description: string;
  entityType: 'PUBLIC' | 'PRIVATE';
}

export enum MovementStatus {
  PENDING = 'PENDENTE',
  APPROVED = 'APROVADO',
  REJECTED = 'REJEITADO'
}

export interface Movement {
  id: string;
  assetId: string;
  fromLocationId?: string;
  toLocationId: string;
  date?: string; // Keep for compatibility if needed, but Page uses requestDate
  requestDate: string;
  responsibleId?: string; // Keep
  fromResponsibleId?: string;
  toResponsibleId: string;
  justification: string;
  status: MovementStatus;
  approvalDate?: string;
  approverId?: string;
}

export interface OfficialProcess {
  id: string;
  processNumber: string;
  description: string;
  relatedAssets: string[];
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  title: string;
  scope?: 'COMMON' | 'PUBLIC' | 'PRIVATE';
  macro: string;
  requiredDocTypes: string[];
  whenToUse: string;
  steps: string[];
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  responsible?: string;
  deadline?: string;
  type?: string;
}