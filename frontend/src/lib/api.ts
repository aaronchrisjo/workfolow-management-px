import { supabase } from './supabase';
import type { Load, User, LoadStatus } from '../types/index';

// Users (from profiles table)
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<User> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const adminSession = sessionData.session;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        role: userData.role,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    });

  if (profileError) throw profileError;

  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  return {
    id: authData.user.id,
    email: userData.email,
    name: userData.name,
    role: userData.role as 'admin' | 'supervisor' | 'allocator' | 'employee',
    created_at: new Date().toISOString(),
  };
};

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Helper to map RPC response to Load type
// DB has 'title', frontend uses 'client_name'
const mapRpcToLoad = (row: Record<string, unknown>): Load => ({
  id: row.id as string,
  client_name: (row.title as string) || (row.client_name as string) || '',
  client_number: (row.client_number as string) || '',
  status: row.status as LoadStatus,
  employee_count: (row.employee_count as number) ?? 1,
  assigned_to: row.assigned_to as string | null,
  assigned_to_name: (row.assigned_to_name as string) || undefined,
  assigned_to_email: (row.assigned_to_email as string) || undefined,
  created_by: row.created_by as string,
  created_by_name: (row.created_by_name as string) || undefined,
  created_at: row.created_at as string,
  updated_at: row.updated_at as string,
});

// Loads
export const getLoads = async (): Promise<Load[]> => {
  const { data, error } = await supabase.rpc('get_loads_with_profiles');

  if (error) throw error;

  return (data || []).map(mapRpcToLoad);
};

export const getLoadsByStatus = async (status: LoadStatus): Promise<Load[]> => {
  const { data, error } = await supabase.rpc('get_loads_with_profiles');

  if (error) throw error;

  return (data || [])
    .filter((row: Record<string, unknown>) => row.status === status)
    .map(mapRpcToLoad);
};

export const getLoad = async (id: string): Promise<Load | null> => {
  const { data, error } = await supabase.rpc('get_loads_with_profiles');

  if (error) throw error;

  const row = (data || []).find((r: Record<string, unknown>) => r.id === id);
  if (!row) return null;

  return mapRpcToLoad(row);
};

export const createLoad = async (loadData: {
  client_name: string;
  client_number: string;
  status?: LoadStatus;
  employee_count?: number;
  assigned_to?: string;
}): Promise<Load> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('loads')
    .insert({
      title: loadData.client_name,
      client_number: loadData.client_number,
      status: loadData.status || 'pending',
      employee_count: loadData.employee_count || 1,
      assigned_to: loadData.assigned_to || null,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '42501' || error.message?.includes('policy')) {
      throw new Error('Permission denied: You do not have access to create loads');
    }
    throw error;
  }

  const load = await getLoad(data.id);
  if (!load) throw new Error('Failed to fetch created load');
  return load;
};

export const updateLoad = async (
  id: string,
  loadData: Partial<{
    client_name: string;
    client_number: string;
    status: LoadStatus;
    assigned_to: string | null;
  }>
): Promise<Load> => {
  const { client_name, ...rest } = loadData;
  const dbData: Record<string, unknown> = {
    ...rest,
    updated_at: new Date().toISOString(),
  };
  if (client_name !== undefined) {
    dbData.title = client_name;
  }

  const { error } = await supabase
    .from('loads')
    .update(dbData)
    .eq('id', id);

  if (error) {
    if (error.code === '42501' || error.message?.includes('policy')) {
      throw new Error('Permission denied: You do not have access to update this load');
    }
    throw error;
  }

  const load = await getLoad(id);
  if (!load) throw new Error('Failed to fetch updated load');
  return load;
};

export const deleteLoad = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('loads')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === '42501' || error.message?.includes('policy')) {
      throw new Error('Permission denied: You do not have access to delete this load');
    }
    throw error;
  }
};

// Realtime subscription for loads
export const subscribeToLoads = (
  callback: (payload: { eventType: string; new: Load | null; old: Load | null }) => void
) => {
  return supabase
    .channel('loads-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'loads' },
      async (payload) => {
        let newLoad: Load | null = null;
        let oldLoad: Load | null = null;

        if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
          newLoad = await getLoad(payload.new.id as string);
        }

        if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
          const oldRec = payload.old as Record<string, unknown>;
          oldLoad = {
            id: oldRec.id as string,
            client_name: (oldRec.title as string) || (oldRec.client_name as string) || '',
            client_number: (oldRec.client_number as string) || '',
            status: oldRec.status as LoadStatus,
            employee_count: (oldRec.employee_count as number) || 1,
            assigned_to: oldRec.assigned_to as string | null,
            created_by: oldRec.created_by as string,
            created_at: oldRec.created_at as string,
            updated_at: oldRec.updated_at as string,
          };
        }

        callback({
          eventType: payload.eventType,
          new: newLoad,
          old: oldLoad,
        });
      }
    )
    .subscribe();
};
