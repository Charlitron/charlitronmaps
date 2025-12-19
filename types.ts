
export type Sector = 'Industrial' | 'Logistica' | 'Corporativo' | 'Salud' | 'Comercio' | 'Construccion';

export interface Business {
  id: string;
  name: string;
  sector: Sector;
  category: string;
  description: string;
  address: string;
  city: string; 
  officePhone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  services: string[];
  gallery: string[];
  x: number;
  y: number;
  rating: number;
  status: 'active' | 'warning' | 'offline';
  logo: string;
  reliability: number;
  isPremium: boolean;
  industrialCapacity?: string;
  viewCount?: number; // Para analítica
  leadCount?: number; // Para analítica
}

export interface LandingConfig {
  heroImage: string;
  adBannerImage: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
