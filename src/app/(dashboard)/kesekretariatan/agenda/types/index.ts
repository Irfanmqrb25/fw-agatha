export type AgendaStatus = 
  'open' | 
  'processing_lingkungan' | 
  'processing_stasi' | 
  'processing_paroki' | 
  'forwarded_to_paroki' | 
  'rejected' | 
  'completed';

export type ProcessTarget = 'lingkungan' | 'stasi' | 'paroki';

// Tipe untuk attachment agenda
export interface AgendaAttachment {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
}

export interface Agenda {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  target: ProcessTarget;
  status: AgendaStatus;
  rejectionReason?: string;
  attachment?: AgendaAttachment; // Menambahkan properti opsional untuk lampiran
  createdBy: string | {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface AgendaFormValues {
  title: string;
  description: string;
  date: Date;
  location: string;
  target: ProcessTarget;
  attachment?: File; // Menambahkan field untuk upload file
  removeAttachment?: boolean; // Flag untuk menandai apakah lampiran harus dihapus
}

export interface RejectionFormValues {
  reason: string;
} 