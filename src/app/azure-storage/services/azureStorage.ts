import { InjectionToken } from '@angular/core';
import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';

export interface BlobUploadProgress {
  filename: string;
  progress: number;
}

export type BlobConnectionString = (
  connectionString: string,
  options?: StoragePipelineOptions
) => BlobServiceClient;

export interface BlobStorageOptions {
  storageUri: string;
  storageAccessToken: string;
}

export interface BlobContainerListRequest extends BlobStorageOptions {
  container: string;
}

export interface BlobUploadRequest extends BlobStorageOptions {
  container: string;
  filename: string;
}

export const BLOB_STORAGE_TOKEN = new InjectionToken<BlobConnectionString>(
  'BLOB_STORAGE_TOKEN'
);
