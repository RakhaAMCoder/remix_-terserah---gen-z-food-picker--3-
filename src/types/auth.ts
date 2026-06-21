
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  onboarding_completed: boolean;
  created_at: string;
}

export type MenuStatus = 'pending' | 'approved' | 'rejected';

export interface MenuLocation {
  place_name: string;
  address?: string;
  google_maps_url?: string;
  opening_hours?: string;
}

export interface FoodMenu {
  id: string;
  submitted_by: string;
  name: string;
  description: string | null;
  category: 'makanan' | 'minuman' | 'cemilan';
  price: number | null;
  hashtags: string[];
  image_url: string | null;
  image_path: string | null;
  locations: MenuLocation[];
  status: MenuStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}
