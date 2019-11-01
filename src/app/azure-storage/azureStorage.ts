import { InjectionToken } from '@angular/core';
import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';

// export interface IAzureStorage {
//   Blob: IBlobStorage;
// }

// export interface IBlobStorage {
//   ExponentialRetryPolicyFilter: any;
//   createBlobServiceWithSas: (uri: string, sharedAccessToken: string) => IBlobService;
// }

// export interface ISpeedSummary {
//   on: (event: string, callback: () => void) => void;
//   getCompletePercent: (len?: number) => string;
//   getAverageSpeed: () => string;
//   getSpeed: () => string;
// }

// export interface IBlobService {
//   withFilter: (filter: any) => IBlobService;
//   createBlockBlobFromBrowserFile: (
//     container: string,
//     filename: string,
//     file: File,
//     options: any,
//     callback: (error: any, response: any) => void
//   ) => ISpeedSummary;
//   singleBlobPutThresholdInBytes: number;
// }

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
