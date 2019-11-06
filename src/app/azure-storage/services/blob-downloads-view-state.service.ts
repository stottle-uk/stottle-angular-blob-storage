import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BlobDownloadResponseModel } from '@azure/storage-blob';
import { from, OperatorFunction, Subject } from 'rxjs';
import { map, mergeMap, startWith, switchMap } from 'rxjs/operators';
import { BlobContainerRequest, BlobItemDownload } from '../types/azure-storage';
import { BlobSharedViewStateService } from './blob-shared-view-state.service';
import { BlobStorageService } from './blob-storage.service';

@Injectable({
  providedIn: 'root'
})
export class BlobDownloadsViewStateService {
  private downloadQueueInner$ = new Subject<string>();

  downloadedItems$ = this.downloadQueue$.pipe(
    mergeMap(filename => this.downloadFile(filename)),
    this.blobState.scanEntries()
  );

  get downloadQueue$() {
    return this.downloadQueueInner$.asObservable();
  }

  constructor(
    private blobStorage: BlobStorageService,
    private blobState: BlobSharedViewStateService,
    private sanitizer: DomSanitizer
  ) {}

  downloadItem(filename: string): void {
    this.downloadQueueInner$.next(filename);
  }

  private downloadFile = (filename: string) =>
    this.blobState.getStorageOptionsWithContainer().pipe(
      switchMap(options =>
        this.blobStorage
          .downloadBlobItem({
            ...options,
            filename
          })
          .pipe(
            this.getDownloadUrlFromResponse(),
            this.mapDownloadResponse(filename, options)
          )
      )
    );

  private mapDownloadResponse = (
    filename: string,
    options: BlobContainerRequest
  ): OperatorFunction<string, BlobItemDownload> => source =>
    source.pipe(
      map(url => ({
        filename,
        containerName: options.containerName,
        url
      })),
      startWith({
        filename,
        containerName: options.containerName,
        url: ''
      })
    );

  private getDownloadUrlFromResponse = (): OperatorFunction<
    BlobDownloadResponseModel,
    string
  > => source =>
    source.pipe(
      switchMap(res =>
        from(res.blobBody).pipe(
          map(body => window.URL.createObjectURL(body)),
          map(url => this.sanitizer.bypassSecurityTrustUrl(url) as string)
        )
      )
    );
}
