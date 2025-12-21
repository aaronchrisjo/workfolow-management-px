export type UserRole = 'admin' | 'supervisor' | 'allocator' | 'employee';

export type LoadStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'transferred';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Load {
  id: number;
  clientName: string;
  clientNumber: string;
  status: LoadStatus;
  assignedTo: number | null;
  assignedToName?: string;
  assignedToEmail?: string;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
