import { Component, OnInit } from '@angular/core';
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
  BlobStorageOptions,
  Dictionary
} from './azure-storage/services/azureStorage';
import { BlobStorageService } from './azure-storage/services/blob-storage.service';
import { SasGeneratorService } from './azure-storage/services/sas-generator.service';

@Component({
  selector: 'app-root',
  template: `
    <div style="text-align:center">
      <h1>
        Welcome to stottle-angular-blob-storage-upload
      </h1>
    </div>

    <app-container-list
      [containers]="containers$ | async"
      (onContainerClick)="onContainerClick($event)"
    ></app-container-list>

    <hr />

    <app-selected-container [containerName]="selectedContainer$ | async">
      <app-input-file
        [uploadProgress]="blobUploadProgress$ | async"
        (onFilesSelected)="onFileSelected($event)"
      ></app-input-file>

      <hr />

      <app-container-files-list
        [items]="filesInContainer$ | async"
        (onDeleteItem)="onDeleteItem($event)"
        (onDownloadItem)="onDownloadItem($event)"
      ></app-container-files-list>

      <pre>{{ blobDeleteResponse$ | async | json }}</pre>

      <div *ngFor="let response of blobDownloadResponse$ | async">
        <a [href]="response.url" target="_blank">
          {{ response.filename }} -- {{ response.containerName }}
        </a>
      </div>
    </app-selected-container>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  selectedContainerInner$ = new BehaviorSubject<string>(undefined);
  uploadQueueInner$ = new Subject<FileList>();
  downloadQueueInner$ = new Subject<string>();
  blobDeleteResponse$: Observable<BlobDeleteResponse>;

  containers$ = this.getStorageOptions().pipe(
    switchMap(options => this.blobStorage.getContainers(options))
  );
  filesInContainer$ = this.selectedContainer$.pipe(
    filter(containerName => !!containerName),
    withLatestFrom(this.getStorageOptions()),
    switchMap(([containerName, options]) =>
      this.blobStorage.listBlobsInContainer({
        ...options,
        containerName
      })
    )
  );
  blobUploadProgress$ = this.uploadQueue$.pipe(
    mergeMap(file => this.uploadFile(file)),
    this.scanEntries()
  );
  blobDownloadResponse$ = this.downloadQueue$.pipe(
    mergeMap(filename => this.downloadFile(filename)),
    this.scanEntries()
  );

  get selectedContainer$() {
    return this.selectedContainerInner$.asObservable();
  }

  get downloadQueue$() {
    return this.downloadQueueInner$.asObservable();
  }

  get uploadQueue$() {
    return this.uploadQueueInner$
      .asObservable()
      .pipe(mergeMap(files => from(files)));
  }

  constructor(
    private sasGenerator: SasGeneratorService,
    private blobStorage: BlobStorageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  onContainerClick(containerName: string): void {
    this.selectedContainerInner$.next(containerName);
  }

  onDeleteItem(filename: string): void {
    this.blobDeleteResponse$ = this.getStorageOptions().pipe(
      withLatestFrom(this.selectedContainer$),
      switchMap(([options, containerName]) =>
        this.blobStorage
          .deleteBlobItem({
            ...options,
            containerName,
            filename
          })
          .pipe(this.finaliseBlobChange(containerName))
      )
    );
  }

  onDownloadItem(filename: string): void {
    this.downloadQueueInner$.next(filename);
  }

  onFileSelected(files: FileList): void {
    this.uploadQueueInner$.next(files);
  }

  downloadFile = (filename: string) =>
    this.getStorageOptionsWithContainer().pipe(
      switchMap(options =>
        this.blobStorage
          .downloadBlobItem({
            ...options,
            filename
          })
          .pipe(this.getDownloadInfo(options.containerName, filename))
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
            this.mapUploadProgress(file, options),
            this.finaliseBlobChange(options.containerName)
          )
      )
    );

  private finaliseBlobChange = <T>(
    containerName: string
  ): MonoTypeOperatorFunction<T> => source =>
    source.pipe(
      finalize(
        () =>
          this.selectedContainerInner$.value === containerName &&
          this.selectedContainerInner$.next(containerName)
      )
    );

  private getDownloadInfo = (
    containerName: string,
    filename: string
  ): OperatorFunction<BlobDownloadResponseModel, BlobItemDownload> => source =>
    source.pipe(
      switchMap(res =>
        from(res.blobBody).pipe(
          map(body => window.URL.createObjectURL(body)),
          map(url => this.sanitizer.bypassSecurityTrustUrl(url) as string),
          map(url => ({
            containerName,
            filename,
            url
          }))
        )
      ),
      startWith({
        containerName,
        filename,
        url: ''
      })
    );

  private mapUploadProgress = (
    file: File,
    options: BlobContainerRequest
  ): OperatorFunction<number, BlobItemUpload> => source =>
    source.pipe(
      map(progress => ({
        filename: file.name,
        containerName: options.containerName,
        progress: parseInt(((progress / file.size) * 100).toString(), 10)
      }))
    );

  private scanEntries(): OperatorFunction<BlobItem, BlobItem[]> {
    return source =>
      source.pipe(
        map(item => ({
          [`${item.containerName}-${item.filename}`]: item
        })),
        scan<Dictionary<BlobItem>>(
          (items, item) => ({
            ...items,
            ...item
          }),
          {}
        ),
        map(items => Object.values(items))
      );
  }

  private getStorageOptions(): Observable<BlobStorageOptions> {
    return this.sasGenerator.getSasToken();
  }

  private getStorageOptionsWithContainer(): Observable<BlobContainerRequest> {
    return this.getStorageOptions().pipe(
      withLatestFrom(this.selectedContainer$),
      map(([options, containerName]) => ({ ...options, containerName }))
    );
  }
}
