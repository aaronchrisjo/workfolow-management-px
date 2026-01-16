export type UserRole = 'admin' | 'supervisor' | 'allocator' | 'employee';

export type LoadStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'transferred';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Load {
  id: string;
  client_name: string;
  client_number: string;
  status: LoadStatus;
  employee_count: number;
  assigned_to: string | null;
  assigned_to_name?: string;
  assigned_to_email?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
