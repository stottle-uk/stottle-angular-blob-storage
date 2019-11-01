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

export type BlobStorageToken = (
  options: BlobStorageOptions
) => BlobServiceClient;

export const BLOB_STORAGE_TOKEN = new InjectionToken<BlobStorageToken>(
  'BLOB_STORAGE_TOKEN'
);

export function azureBlobStorageFactory(): BlobStorageToken {
  const buildConnectionString = (sasToken: BlobStorageOptions) => {
    return (
      `BlobEndpoint=https://${sasToken.storageUri}.blob.core.windows.net/;` +
      `SharedAccessSignature=${sasToken.storageAccessToken}`
    );
  };

  return options =>
    BlobServiceClient.fromConnectionString(buildConnectionString(options));
}
