import { InjectionToken } from '@angular/core';
import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';

export interface BlobItem {
  filename: string;
  containerName: string;
}

export interface BlobItemDownload extends BlobItem {
  url: string;
}

export interface BlobItemUpload extends BlobItem {
  progress: number;
}

export interface BlobItemDownload {
  filename: string;
  url: string;
  containerName: string;
}

export type BlobConnectionString = (
  connectionString: string,
  options?: StoragePipelineOptions
) => BlobServiceClient;

export interface BlobStorageOptions {
  storageUri: string;
  storageAccessToken: string;
}

export interface BlobContainerRequest extends BlobStorageOptions {
  containerName: string;
}

export interface BlobFileRequest extends BlobContainerRequest {
  filename: string;
}

export type Dictionary<T> = { [key: string]: T };
export type UploadDictionary = { [key: string]: BlobItemUpload };

export type DownloadDictionary = { [key: string]: BlobItemDownload };

export type BlobStorageBuilder = (
  options: BlobStorageOptions
) => BlobServiceClient;

export const BLOB_STORAGE_TOKEN = new InjectionToken<BlobStorageBuilder>(
  'BLOB_STORAGE_TOKEN'
);

export function azureBlobStorageFactory(): BlobStorageBuilder {
  const buildConnectionString = (options: BlobStorageOptions) => {
    return (
      `BlobEndpoint=https://${options.storageUri}.blob.core.windows.net/;` +
      `SharedAccessSignature=${options.storageAccessToken}`
    );
  };

  return options =>
    BlobServiceClient.fromConnectionString(buildConnectionString(options));
}
