import * as XLSX from 'xlsx';
import { supabase } from './supabase';
import type { Load, LoadStatus } from '../types/index';

export type ExportFilterType = 'all' | 'paused' | 'allocated';

export interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  filterType: ExportFilterType;
}

interface LoadRow {
  id: string;
  title?: string;
  client_name?: string;
  client_number: string;
  status: LoadStatus;
  employee_count?: number;
  assigned_to: string | null;
  assigned_to_name?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

const mapRowToLoad = (row: LoadRow): Load => ({
  id: row.id,
  client_name: row.title || row.client_name || '',
  client_number: row.client_number || '',
  status: row.status,
  employee_count: row.employee_count || 1,
  assigned_to: row.assigned_to,
  assigned_to_name: row.assigned_to_name,
  created_by: row.created_by,
  created_by_name: row.created_by_name,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

async function fetchLoadsForExport(filters: ExportFilters): Promise<Load[]> {
  const { data, error } = await supabase.rpc('get_loads_with_profiles');

  if (error) throw error;

  let loads = (data || []).map(mapRowToLoad);

  if (filters.filterType === 'paused') {
    loads = loads.filter((l: Load) => l.status === 'paused');
  } else if (filters.filterType === 'allocated') {
    loads = loads.filter((l: Load) => l.assigned_to !== null);
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    from.setHours(0, 0, 0, 0);
    loads = loads.filter((l: Load) => new Date(l.created_at) >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    loads = loads.filter((l: Load) => new Date(l.created_at) <= to);
  }

  return loads;
}

function formatStatus(status: LoadStatus): string {
  const statusMap: Record<LoadStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    paused: 'Paused',
    completed: 'Completed',
    transferred: 'Transferred',
  };
  return statusMap[status] || status;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getFilename(filterType: ExportFilterType): string {
  const today = new Date().toISOString().split('T')[0];
  if (filterType === 'paused') {
    return `paused_loads_${today}.xlsx`;
  }
  return `loads_report_${today}.xlsx`;
}

export async function exportLoadsToExcel(filters: ExportFilters): Promise<void> {
  const loads = await fetchLoadsForExport(filters);

  const exportData = loads.map((load) => ({
    'Client Name': load.client_name,
    'Client Number': load.client_number,
    'Status': formatStatus(load.status),
    'Assigned To': load.assigned_to_name || 'Unassigned',
    'Created Date': formatDate(load.created_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const colWidths = [
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
    { wch: 15 },
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Loads');

  const filename = getFilename(filters.filterType);
  XLSX.writeFile(workbook, filename);
}
