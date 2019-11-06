import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  BlobDeleteResponse,
  BlobDownloadResponseModel
} from '@azure/storage-blob';
import {
  BehaviorSubject,
  from,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  Subject
} from 'rxjs';
import {
  filter,
  finalize,
  map,
  mergeMap,
  scan,
  startWith,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';
import {
  BlobContainerRequest,
  BlobItem,
  BlobItemDownload,
  BlobItemUpload,
  BlobStorageRequest,
  Dictionary
} from '../types/azure-storage';
import { BlobStorageService } from './blob-storage.service';
import { SasGeneratorService } from './sas-generator.service';

@Injectable({
  providedIn: 'root'
})
export class BlobStateService {
  private selectedContainerInner$ = new BehaviorSubject<string>(undefined);
  private downloadQueueInner$ = new Subject<string>();
  private deleteQueueInner$ = new Subject<string>();

  containers$ = this.getStorageOptions().pipe(
    switchMap(options => this.blobStorage.getContainers(options))
  );
  itemsInContainer$ = this.selectedContainer$.pipe(
    filter(containerName => !!containerName),
    switchMap(containerName =>
      this.getStorageOptions().pipe(
        switchMap(options =>
          this.blobStorage.listBlobsInContainer({
            ...options,
            containerName
          })
        )
      )
    )
  );

  downloadedItems$ = this.downloadQueue$.pipe(
    mergeMap(filename => this.downloadFile(filename)),
    this.scanEntries()
  );
  deletedItems$ = this.deleteQueue$.pipe(
    mergeMap(filename => this.deleteFile(filename)),
    this.scanEntries()
  );

  get selectedContainer$() {
    return this.selectedContainerInner$.asObservable();
  }

  get downloadQueue$() {
    return this.downloadQueueInner$.asObservable();
  }

  get deleteQueue$() {
    return this.deleteQueueInner$.asObservable();
  }

  constructor(
    private sasGenerator: SasGeneratorService,
    private blobStorage: BlobStorageService,
    private sanitizer: DomSanitizer
  ) {}

  getContainerItems(containerName: string): void {
    this.selectedContainerInner$.next(containerName);
  }

  deleteItem(filename: string): void {
    this.deleteQueueInner$.next(filename);
  }

  downloadItem(filename: string): void {
    this.downloadQueueInner$.next(filename);
  }

  private downloadFile = (filename: string) =>
    this.getStorageOptionsWithContainer().pipe(
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

  private deleteFile = (filename: string) =>
    this.getStorageOptionsWithContainer().pipe(
      switchMap(options =>
        this.blobStorage
          .deleteBlobItem({
            ...options,
            filename
          })
          .pipe(
            this.mapDeleteResponse(filename, options),
            this.finaliseBlobChange(options.containerName)
          )
      )
    );

  private uploadFile = (file: File) =>
    this.getStorageOptionsWithContainer().pipe(
      switchMap(options =>
        this.blobStorage
          .uploadToBlobStorage(file, {
            ...options,
            filename: file.name + new Date().getTime()
          })
          .pipe(
            this.mapUploadResponse(file, options),
            this.finaliseBlobChange(options.containerName)
          )
      )
    );

  finaliseBlobChange = <T>(
    containerName: string
  ): MonoTypeOperatorFunction<T> => source =>
    source.pipe(
      finalize(
        () =>
          this.selectedContainerInner$.value === containerName &&
          this.selectedContainerInner$.next(containerName)
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

  private mapUploadResponse = (
    file: File,
    options: BlobContainerRequest
  ): OperatorFunction<number, BlobItemUpload> => source =>
    source.pipe(
      map(progress => ({
        filename: file.name,
        containerName: options.containerName,
        progress: parseInt(((progress / file.size) * 100).toString(), 10)
      })),
      startWith({
        filename: file.name,
        containerName: options.containerName,
        progress: 0
      })
    );

  private mapDeleteResponse = (
    filename: string,
    options: BlobContainerRequest
  ): OperatorFunction<BlobDeleteResponse, BlobItem> => source =>
    source.pipe(
      map(() => ({
        filename,
        containerName: options.containerName
      })),
      startWith({
        filename,
        containerName: options.containerName
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

  scanEntries<T extends BlobItem>(): OperatorFunction<T, T[]> {
    return source =>
      source.pipe(
        map(item => ({
          [`${item.containerName}-${item.filename}`]: item
        })),
        scan<Dictionary<T>>(
          (items, item) => ({
            ...items,
            ...item
          }),
          {}
        ),
        map(items => Object.values(items))
      );
  }

  private getStorageOptions(): Observable<BlobStorageRequest> {
    return this.sasGenerator.getSasToken();
  }

  getStorageOptionsWithContainer(): Observable<BlobContainerRequest> {
    return this.getStorageOptions().pipe(
      withLatestFrom(this.selectedContainer$),
      map(([options, containerName]) => ({ ...options, containerName }))
    );
  }
}
