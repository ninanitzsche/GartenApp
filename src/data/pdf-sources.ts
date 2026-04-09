/**
 * PDF processing registry
 */

export interface ProcessedPDF {
  filename: string;
  processedAt: string;
  articleCount: number;
  plantsFound: string[];
}

export const PROCESSED_PDFS: ProcessedPDF[] = [];
