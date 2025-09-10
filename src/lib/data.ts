import { Product, Supply, AppSettings } from './types';

// Configuración de la aplicación
export const defaultSettings: AppSettings = {
  businessName: 'Print & Co',
  currency: '$',
  taxRate: 21, // IVA 21%
  lowStockThreshold: 10,
};

// Insumos de stock inicial
export const initialSupplies: Supply[] = [
  // Papeles Obra
  { id: 'papel_obra_80_a4', name: 'Papel Obra 80gr A4', category: 'papel', currentStock: 500, minStock: 50, unit: 'hoja', cost: 15 },
  { id: 'papel_obra_80_oficio', name: 'Papel Obra 80gr Oficio', category: 'papel', currentStock: 200, minStock: 30, unit: 'hoja', cost: 18 },
  { id: 'papel_obra_80_a3', name: 'Papel Obra 80gr A3', category: 'papel', currentStock: 150, minStock: 25, unit: 'hoja', cost: 30 },
  { id: 'papel_obra_120_a4', name: 'Papel Obra 120gr A4', category: 'papel', currentStock: 300, minStock: 40, unit: 'hoja', cost: 22 },
  { id: 'papel_obra_180_a4', name: 'Papel Obra 180gr A4', category: 'papel', currentStock: 200, minStock: 30, unit: 'hoja', cost: 35 },
  { id: 'papel_obra_240_a4', name: 'Papel Obra 240gr A4', category: 'papel', currentStock: 100, minStock: 20, unit: 'hoja', cost: 45 },

  // Papeles Ilustración
  { id: 'papel_ilustracion_150_a4', name: 'Papel Ilustración 150gr A4', category: 'papel', currentStock: 250, minStock: 35, unit: 'hoja', cost: 28 },
  { id: 'papel_ilustracion_200_a4', name: 'Papel Ilustración 200gr A4', category: 'papel', currentStock: 200, minStock: 30, unit: 'hoja', cost: 38 },
  { id: 'papel_ilustracion_250_a4', name: 'Papel Ilustración 250gr A4', category: 'papel', currentStock: 150, minStock: 25, unit: 'hoja', cost: 48 },
  { id: 'papel_ilustracion_150_a3', name: 'Papel Ilustración 150gr A3', category: 'papel', currentStock: 100, minStock: 20, unit: 'hoja', cost: 55 },
  { id: 'papel_ilustracion_200_a3', name: 'Papel Ilustración 200gr A3', category: 'papel', currentStock: 80, minStock: 15, unit: 'hoja', cost: 75 },
  { id: 'papel_ilustracion_250_a3', name: 'Papel Ilustración 250gr A3', category: 'papel', currentStock: 60, minStock: 12, unit: 'hoja', cost: 95 },

  // Papeles Fotográficos
  { id: 'papel_foto_115', name: 'Papel Fotográfico 115gr', category: 'papel', currentStock: 100, minStock: 20, unit: 'hoja', cost: 65 },
  { id: 'papel_foto_135', name: 'Papel Fotográfico 135gr', category: 'papel', currentStock: 80, minStock: 15, unit: 'hoja', cost: 75 },
  { id: 'papel_foto_190', name: 'Papel Fotográfico 190gr', category: 'papel', currentStock: 60, minStock: 12, unit: 'hoja', cost: 95 },
  { id: 'papel_foto_230', name: 'Papel Fotográfico 230gr', category: 'papel', currentStock: 50, minStock: 10, unit: 'hoja', cost: 115 },
  { id: 'papel_foto_220_doble', name: 'Papel Fotográfico 220gr Doble Faz', category: 'papel', currentStock: 40, minStock: 8, unit: 'hoja', cost: 135 },

  // Autoadhesivos
  { id: 'autoadhesivo_a4', name: 'Papel Autoadhesivo A4', category: 'papel', currentStock: 120, minStock: 20, unit: 'hoja', cost: 85 },
  { id: 'autoadhesivo_a3', name: 'Papel Autoadhesivo A3', category: 'papel', currentStock: 60, minStock: 12, unit: 'hoja', cost: 165 },

  // Espirales
  { id: 'espiral_9mm', name: 'Espiral 9mm', category: 'espiral', currentStock: 100, minStock: 20, unit: 'unidad', cost: 45 },
  { id: 'espiral_14mm', name: 'Espiral 14mm', category: 'espiral', currentStock: 80, minStock: 15, unit: 'unidad', cost: 55 },
  { id: 'espiral_17mm', name: 'Espiral 17mm', category: 'espiral', currentStock: 70, minStock: 15, unit: 'unidad', cost: 65 },
  { id: 'espiral_20mm', name: 'Espiral 20mm', category: 'espiral', currentStock: 60, minStock: 12, unit: 'unidad', cost: 75 },
  { id: 'espiral_25mm', name: 'Espiral 25mm', category: 'espiral', currentStock: 50, minStock: 10, unit: 'unidad', cost: 85 },
  { id: 'espiral_33mm', name: 'Espiral 33mm', category: 'espiral', currentStock: 40, minStock: 8, unit: 'unidad', cost: 105 },
  { id: 'espiral_40mm', name: 'Espiral 40mm', category: 'espiral', currentStock: 30, minStock: 6, unit: 'unidad', cost: 125 },
  { id: 'espiral_50mm', name: 'Espiral 50mm', category: 'espiral', currentStock: 20, minStock: 5, unit: 'unidad', cost: 155 },

  // Tapas de encuadernación
  { id: 'tapa_transparente', name: 'Tapa Transparente', category: 'tapa', currentStock: 200, minStock: 30, unit: 'unidad', cost: 25 },
  { id: 'tapa_color', name: 'Tapa Color', category: 'tapa', currentStock: 150, minStock: 25, unit: 'unidad', cost: 35 },
];

// Productos y servicios disponibles
export const initialProducts: Product[] = [
  // Impresiones A4 Obra 80gr
  {
    id: 'imp_a4_obra80_simple_color',
    name: 'Impresión A4 Obra 80gr Simple Faz Color',
    category: 'impresion',
    price: 150,
    cost: 45,
    requiredSupplies: { 'papel_obra_80_a4': 1 },
    description: 'Impresión color en papel obra 80gr A4'
  },
  {
    id: 'imp_a4_obra80_simple_bn',
    name: 'Impresión A4 Obra 80gr Simple Faz B&N',
    category: 'impresion',
    price: 80,
    cost: 25,
    requiredSupplies: { 'papel_obra_80_a4': 1 },
    description: 'Impresión blanco y negro en papel obra 80gr A4'
  },
  {
    id: 'imp_a4_obra80_doble_color',
    name: 'Impresión A4 Obra 80gr Doble Faz Color',
    category: 'impresion',
    price: 250,
    cost: 75,
    requiredSupplies: { 'papel_obra_80_a4': 1 },
    description: 'Impresión color doble faz en papel obra 80gr A4'
  },
  {
    id: 'imp_a4_obra80_doble_bn',
    name: 'Impresión A4 Obra 80gr Doble Faz B&N',
    category: 'impresion',
    price: 130,
    cost: 40,
    requiredSupplies: { 'papel_obra_80_a4': 1 },
    description: 'Impresión blanco y negro doble faz en papel obra 80gr A4'
  },

  // Impresiones A3 Obra 80gr
  {
    id: 'imp_a3_obra80_simple_color',
    name: 'Impresión A3 Obra 80gr Simple Faz Color',
    category: 'impresion',
    price: 300,
    cost: 85,
    requiredSupplies: { 'papel_obra_80_a3': 1 },
    description: 'Impresión color en papel obra 80gr A3'
  },
  {
    id: 'imp_a3_obra80_simple_bn',
    name: 'Impresión A3 Obra 80gr Simple Faz B&N',
    category: 'impresion',
    price: 150,
    cost: 50,
    requiredSupplies: { 'papel_obra_80_a3': 1 },
    description: 'Impresión blanco y negro en papel obra 80gr A3'
  },

  // Impresiones Ilustración
  {
    id: 'imp_a4_ilus150_color',
    name: 'Impresión A4 Ilustración 150gr Color',
    category: 'impresion',
    price: 220,
    cost: 68,
    requiredSupplies: { 'papel_ilustracion_150_a4': 1 },
    description: 'Impresión color en papel ilustración 150gr A4'
  },
  {
    id: 'imp_a4_ilus200_color',
    name: 'Impresión A4 Ilustración 200gr Color',
    category: 'impresion',
    price: 280,
    cost: 88,
    requiredSupplies: { 'papel_ilustracion_200_a4': 1 },
    description: 'Impresión color en papel ilustración 200gr A4'
  },
  {
    id: 'imp_a4_ilus250_color',
    name: 'Impresión A4 Ilustración 250gr Color',
    category: 'impresion',
    price: 350,
    cost: 108,
    requiredSupplies: { 'papel_ilustracion_250_a4': 1 },
    description: 'Impresión color en papel ilustración 250gr A4'
  },

  // Impresiones Fotográficas
  {
    id: 'imp_foto_115',
    name: 'Impresión Fotográfica 115gr',
    category: 'fotografico',
    price: 450,
    cost: 145,
    requiredSupplies: { 'papel_foto_115': 1 },
    description: 'Impresión en papel fotográfico 115gr'
  },
  {
    id: 'imp_foto_190',
    name: 'Impresión Fotográfica 190gr',
    category: 'fotografico',
    price: 650,
    cost: 215,
    requiredSupplies: { 'papel_foto_190': 1 },
    description: 'Impresión en papel fotográfico 190gr'
  },
  {
    id: 'imp_foto_230',
    name: 'Impresión Fotográfica 230gr',
    category: 'fotografico',
    price: 850,
    cost: 275,
    requiredSupplies: { 'papel_foto_230': 1 },
    description: 'Impresión en papel fotográfico 230gr'
  },

  // Autoadhesivos
  {
    id: 'imp_autoadh_a4',
    name: 'Impresión Autoadhesivo A4',
    category: 'autoadhesivo',
    price: 580,
    cost: 185,
    requiredSupplies: { 'autoadhesivo_a4': 1 },
    description: 'Impresión en papel autoadhesivo A4'
  },
  {
    id: 'imp_autoadh_a3',
    name: 'Impresión Autoadhesivo A3',
    category: 'autoadhesivo',
    price: 980,
    cost: 305,
    requiredSupplies: { 'autoadhesivo_a3': 1 },
    description: 'Impresión en papel autoadhesivo A3'
  },

  // Servicios de Encuadernación
  {
    id: 'enc_9mm',
    name: 'Encuadernado Espiral 9mm',
    category: 'encuadernacion',
    price: 450,
    cost: 115,
    requiredSupplies: { 'espiral_9mm': 1, 'tapa_transparente': 2 },
    description: 'Encuadernación con espiral 9mm + 2 tapas'
  },
  {
    id: 'enc_14mm',
    name: 'Encuadernado Espiral 14mm',
    category: 'encuadernacion',
    price: 550,
    cost: 145,
    requiredSupplies: { 'espiral_14mm': 1, 'tapa_transparente': 2 },
    description: 'Encuadernación con espiral 14mm + 2 tapas'
  },
  {
    id: 'enc_17mm',
    name: 'Encuadernado Espiral 17mm',
    category: 'encuadernacion',
    price: 650,
    cost: 175,
    requiredSupplies: { 'espiral_17mm': 1, 'tapa_transparente': 2 },
    description: 'Encuadernación con espiral 17mm + 2 tapas'
  },
  {
    id: 'enc_20mm',
    name: 'Encuadernado Espiral 20mm',
    category: 'encuadernacion',
    price: 750,
    cost: 205,
    requiredSupplies: { 'espiral_20mm': 1, 'tapa_transparente': 2 },
    description: 'Encuadernación con espiral 20mm + 2 tapas'
  },
  {
    id: 'enc_25mm',
    name: 'Encuadernado Espiral 25mm',
    category: 'encuadernacion',
    price: 850,
    cost: 235,
    requiredSupplies: { 'espiral_25mm': 1, 'tapa_transparente': 2 },
    description: 'Encuadernación con espiral 25mm + 2 tapas'
  },
  {
    id: 'enc_33mm',
    name: 'Encuadernado Espiral 33mm',
    category: 'encuadernacion',
    price: 980,
    cost: 275,
    requiredSupplies: { 'espiral_33mm': 1, 'tapa_transparente': 2 },
    description: 'Encuadernación con espiral 33mm + 2 tapas'
  },
  {
    id: 'enc_40mm',
    name: 'Encuadernado Espiral 40mm',
    category: 'encuadernacion',
    price: 1150,
    cost: 315,
    requiredSupplies: { 'espiral_40mm': 1, 'tapa_transparente': 2 },
    description: 'Encuadernación con espiral 40mm + 2 tapas'
  },
  {
    id: 'enc_50mm',
    name: 'Encuadernado Espiral 50mm',
    category: 'encuadernacion',
    price: 1350,
    cost: 365,
    requiredSupplies: { 'espiral_50mm': 1, 'tapa_transparente': 2 },
    description: 'Encuadernación con espiral 50mm + 2 tapas'
  },
];