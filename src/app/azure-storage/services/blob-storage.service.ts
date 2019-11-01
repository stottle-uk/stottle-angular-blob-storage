import { Inject, Injectable } from '@angular/core';
import { TransferProgressEvent } from '@azure/core-http';
import { PagedAsyncIterableIterator } from '@azure/core-paging';
import { BlobItem, BlockBlobClient, ContainerItem } from '@azure/storage-blob';
import { from, Observable, Subscriber } from 'rxjs';
import { distinctUntilChanged, scan, startWith } from 'rxjs/operators';
import {
  BlobContainerRequest,
  BlobFileRequest,
  BlobStorageBuilder,
  BlobStorageOptions,
  BLOB_STORAGE_TOKEN
} from './azureStorage';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {
  constructor(
    @Inject(BLOB_STORAGE_TOKEN)
    private getBlobClient: BlobStorageBuilder
  ) {}

  uploadToBlobStorage(
    file: File,
    request: BlobFileRequest
  ): Observable<number> {
    const blockBlobClient = this.getBlockBlobClient(request);
    return this.uploadFile(blockBlobClient, file);
  }

  getContainers(request: BlobStorageOptions): Observable<ContainerItem[]> {
    const blobServiceClient = this.buildClient(request);
    return this.asyncToObservable(blobServiceClient.listContainers()).pipe(
      scan<ContainerItem>((items, item) => [...items, item], [])
    );
  }

  listBlobsInContainer(request: BlobContainerRequest) {
    const containerClient = this.getContainerClient(request);
    return this.asyncToObservable(containerClient.listBlobsFlat()).pipe(
      scan<BlobItem>((items, item) => [...items, item], [])
    );
  }

  downloadBlobItem(request: BlobFileRequest) {
    const blockBlobClient = this.getBlockBlobClient(request);
    return from(blockBlobClient.download());
  }

  deleteBlobItem(request: BlobFileRequest) {
    const blockBlobClient = this.getBlockBlobClient(request);
    return from(blockBlobClient.delete());
  }

  private getBlockBlobClient(request: BlobFileRequest) {
    const containerClient = this.getContainerClient(request);
    return containerClient.getBlockBlobClient(request.filename);
  }

  private getContainerClient(request: BlobContainerRequest) {
    const blobServiceClient = this.buildClient(request);
    const containerClient = blobServiceClient.getContainerClient(
      request.containerName
    );
    return containerClient;
  }

  private buildClient(options: BlobStorageOptions) {
    return this.getBlobClient(options);
  }

  private uploadFile(
    blockBlobClient: BlockBlobClient,
    file: File
  ): Observable<number> {
    return new Observable<number>(observer => {
      blockBlobClient
        .uploadBrowserData(file, {
          onProgress: this.onProgress(observer),
          blobHTTPHeaders: {
            blobContentType: file.type
          }
        })
        .then(
          this.onUploadComplete(observer, file),
          this.onUploadError(observer)
        );
    }).pipe(
      startWith(0),
      distinctUntilChanged()
    );
  }

  private onUploadError(observer: Subscriber<number>) {
    return (error: any) => observer.error(error);
  }

  private onUploadComplete(observer: Subscriber<number>, file: File) {
    return () => {
      observer.next(file.size);
      observer.complete();
    };
  }

  private onProgress(observer: Subscriber<number>) {
    return (progress: TransferProgressEvent) =>
      observer.next(progress.loadedBytes);
  }

  private asyncToObservable<T, TService>(
    iterable: PagedAsyncIterableIterator<T, TService>
  ) {
    return new Observable<T>(
      observer =>
        void (async () => {
          try {
            for await (const item of iterable as AsyncIterable<T>) {
              if (observer.closed) return;
              observer.next(item);
            }
            observer.complete();
          } catch (e) {
            observer.error(e);
          }
        })()
    );
  }
}