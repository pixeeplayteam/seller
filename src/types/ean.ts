import { z } from 'zod';

export const eanCodeSchema = z.object({
  code: z.string().regex(/^\d{13}$/, 'EAN code must be 13 digits'),
  status: z.enum(['pending', 'active', 'inactive']).default('pending'),
});

export type EANCode = z.infer<typeof eanCodeSchema>;

export interface EANImportResponse {
  success: boolean;
  totalProcessed: number;
  validCodes: number;
  invalidCodes: number;
  errors?: Array<{
    row: number;
    code: string;
    message: string;
  }>;
}