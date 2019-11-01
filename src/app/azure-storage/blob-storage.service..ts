import { Inject, Injectable } from '@angular/core';
import { TransferProgressEvent } from '@azure/core-http';
import { PagedAsyncIterableIterator } from '@azure/core-paging';
import { BlobItem, BlockBlobClient, ContainerItem } from '@azure/storage-blob';
import { from, Observable, Subscriber } from 'rxjs';
import { distinctUntilChanged, scan, startWith } from 'rxjs/operators';
import {
  BlobConnectionString,
  BlobUploadRequest,
  BLOB_STORAGE_TOKEN
} from './azureStorage';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {
  constructor(
    @Inject(BLOB_STORAGE_TOKEN)
    private getBlobClientFromConnectionString: BlobConnectionString
  ) {}

  uploadToBlobStorage(
    request: BlobUploadRequest,
    file: File
  ): Observable<number> {
    const blobServiceClient = this.buildClient(request);
    const containerClient = blobServiceClient.getContainerClient(
      request.container
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      request.filename
    );

    return this.uploadFile(blockBlobClient, file);
  }

  getContainers(request: BlobUploadRequest): Observable<ContainerItem[]> {
    const blobServiceClient = this.buildClient(request);
    return this.asyncToObservable(blobServiceClient.listContainers()).pipe(
      scan<ContainerItem>((items, item) => [...items, item], [])
    );
  }

  listBlobsInContainer(request: BlobUploadRequest) {
    const blobServiceClient = this.buildClient(request);
    const containerClient = blobServiceClient.getContainerClient(
      request.container
    );
    return this.asyncToObservable(containerClient.listBlobsFlat()).pipe(
      scan<BlobItem>((items, item) => [...items, item], [])
    );
  }

  deleteBlobItem(request: BlobUploadRequest) {
    const blobServiceClient = this.buildClient(request);
    const containerClient = blobServiceClient.getContainerClient(
      request.container
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      request.filename
    );

    return from(blockBlobClient.delete());
  }

  // : Observable<BlobItem[]>

  private buildClient(sasToken: BlobUploadRequest) {
    const connString = this.buildConnectionString(sasToken);
    return this.getBlobClientFromConnectionString(connString);
  }

  private buildConnectionString(sasToken: BlobUploadRequest) {
    return (
      `BlobEndpoint=https://${sasToken.storageUri}.blob.core.windows.net/;` +
      `SharedAccessSignature=${sasToken.storageAccessToken}`
    );
  }

  private uploadFile(
    blockBlobClient: BlockBlobClient,
    file: File
  ): Observable<number> {
    return new Observable<number>(observer => {
      blockBlobClient
        .uploadBrowserData(file, {
          onProgress: this.onProgress(observer)
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
            for await (const item of iterable) {
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
