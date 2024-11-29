export interface FilePreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  previewRows: number;
}

export interface FileValidationError {
  row: number;
  column: string;
  message: string;
}

export interface FileUploadResponse {
  success: boolean;
  data?: FilePreviewData;
  errors?: FileValidationError[];
  message: string;
}

export type FileType = 'csv' | 'xls' | 'xlsx';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileAccept: (data: FilePreviewData) => void;
  onFileReject: () => void;
  isLoading?: boolean;
  maxSize?: number; // in bytes
  acceptedFileTypes?: FileType[];
}