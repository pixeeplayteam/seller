import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { FileUploadProps, FileType } from '../../types/file';
import toast from 'react-hot-toast';

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPTED_TYPES: FileType[] = ['csv', 'xls', 'xlsx'];

const getFileTypeFromMime = (mimeType: string): FileType | null => {
  switch (mimeType) {
    case 'text/csv':
      return 'csv';
    case 'application/vnd.ms-excel':
      return 'xls';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'xlsx';
    default:
      return null;
  }
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileAccept,
  onFileReject,
  isLoading = false,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
}) => {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles[0].errors.map((error: any) => error.message);
      toast.error(errors.join('\n'));
      onFileReject();
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileType = getFileTypeFromMime(file.type);
      
      if (!fileType || !acceptedFileTypes.includes(fileType)) {
        toast.error('Invalid file type. Please upload a CSV or Excel file.');
        onFileReject();
        return;
      }

      if (file.size > maxSize) {
        toast.error(`File size exceeds ${maxSize / 1024 / 1024}MB limit.`);
        onFileReject();
        return;
      }

      onFileSelect(file);
    }
  }, [maxSize, acceptedFileTypes, onFileSelect, onFileReject]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex justify-center">
          {isDragActive ? (
            <Upload className="h-12 w-12 text-blue-500" />
          ) : (
            <FileSpreadsheet className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {isDragActive ? (
              'Drop the file here'
            ) : (
              <>
                Drag and drop your file here, or{' '}
                <span className="text-blue-500">browse</span>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: {acceptedFileTypes.join(', ').toUpperCase()}
          </p>
          <p className="text-xs text-gray-500">
            Maximum file size: {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>
    </div>
  );
};