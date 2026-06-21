export type FoodTime = 'sarapan' | 'siang' | 'sore' | 'malam' | 'cemilan' | 'tengah_malam';

export interface Branch {
  nama: string;
  alamatLengkap: string;
  namaPencarian: string;
  placeId?: string;
  google_maps_url?: string;
  jam_buka: string;
  lat: number;
  lng: number;
  jarakKm?: number;
}

export interface Food {
  id: string;
  nama: string;
  foto_url: string;
  deskripsi: string;
  deskripsi_en?: string;
  kategori_harga?: string;
  jenis: string[];
  cocok_waktu: string[];
  tags: string[];
  rating: number;
  trending: boolean;
  cabang: Branch[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  suggestedFoods?: Food[];
  isChessTrigger?: boolean;
}

export interface Message extends ChatMessage {
  id: string;
  suggestedFoods?: Food[];
  isChessTrigger?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
  isPinned?: boolean;
}

export interface BatteryData {
  level: number;
  isCharging: boolean;
}
