import React from 'react';
import { Button } from '../ui/Button';
import type { FilePreviewData, FileValidationError } from '../../types/file';

interface FilePreviewProps {
  data: FilePreviewData;
  errors?: FileValidationError[];
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  data,
  errors = [],
  onAccept,
  onReject,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">File Preview</h3>
        <div className="text-sm text-gray-500">
          Showing {data.previewRows} of {data.totalRows} rows
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Validation Errors
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">
                Row {error.row}: {error.message} (Column: {error.column})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onReject}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={onAccept}
          disabled={errors.length > 0 || isLoading}
          isLoading={isLoading}
        >
          Import Products
        </Button>
      </div>
    </div>
  );
};