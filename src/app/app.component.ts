import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  BlobDeleteResponse,
  BlobItem,
  ContainerItem
} from '@azure/storage-blob';
import {
  BehaviorSubject,
  from,
  MonoTypeOperatorFunction,
  Observable
} from 'rxjs';
import {
  combineAll,
  filter,
  finalize,
  map,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';
import {
  BlobStorageOptions,
  BlobUploadProgress
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
        [uploadProgress]="uploadProgress$ | async"
        (onFilesSelected)="onFileSelected($event)"
      ></app-input-file>

      <hr />

      <app-container-files-list
        [items]="filesInContainer$ | async"
        (onDeleteItem)="onDeleteItem($event)"
        (onDownloadItem)="onDownloadItem($event)"
      ></app-container-files-list>

      <pre>{{ blobDeleteResponse$ | async | json }}</pre>

      <a [href]="blobDownloadResponse$ | async">download</a>
    </app-selected-container>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  uploadProgress$: Observable<BlobUploadProgress[]>;
  containers$: Observable<ContainerItem[]>;
  filesInContainer$: Observable<BlobItem[]>;
  blobDeleteResponse$: Observable<BlobDeleteResponse>;
  blobDownloadResponse$: Observable<SafeUrl>;
  selectedContainerInner$ = new BehaviorSubject<string>(undefined);

  get selectedContainer$() {
    return this.selectedContainerInner$.asObservable();
  }

  constructor(
    private sasGenerator: SasGeneratorService,
    private blobStorage: BlobStorageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.containers$ = this.getStorageOptions().pipe(
      switchMap(info => this.blobStorage.getContainers(info))
    );

    this.filesInContainer$ = this.selectedContainer$.pipe(
      filter(containerName => !!containerName),
      withLatestFrom(this.getStorageOptions()),
      switchMap(([containerName, info]) =>
        this.blobStorage.listBlobsInContainer({
          ...info,
          containerName
        })
      )
    );
  }

  onContainerClick(containerName: string): void {
    this.selectedContainerInner$.next(containerName);
  }

  onDeleteItem(filename: string): void {
    this.blobDeleteResponse$ = this.getStorageOptions().pipe(
      withLatestFrom(this.selectedContainer$),
      switchMap(([info, containerName]) =>
        this.blobStorage
          .deleteBlobItem({
            ...info,
            containerName,
            filename
          })
          .pipe(this.finaliseBlobChange(containerName))
      )
    );
  }

  onDownloadItem(filename: string): void {
    this.blobDownloadResponse$ = this.getStorageOptions().pipe(
      withLatestFrom(this.selectedContainer$),
      switchMap(([info, containerName]) =>
        this.blobStorage
          .downloadBlobItem({
            ...info,
            containerName,
            filename
          })
          .pipe(
            switchMap(res =>
              from(res.blobBody).pipe(
                map(body => window.URL.createObjectURL(body)),
                map(url => this.sanitizer.bypassSecurityTrustUrl(url))
              )
            )
          )
      )
    );
  }

  onFileSelected(files: FileList): void {
    this.uploadProgress$ = from(files).pipe(
      map(file => this.uploadFile(file)),
      combineAll()
    );
  }

  private uploadFile = (file: File) =>
    this.getStorageOptions().pipe(
      withLatestFrom(this.selectedContainer$),
      switchMap(([info, containerName]) =>
        this.blobStorage
          .uploadToBlobStorage(file, {
            ...info,
            containerName,
            filename: file.name + new Date().getTime()
          })
          .pipe(
            map(progress => ({
              filename: file.name,
              progress: parseInt(((progress / file.size) * 100).toString(), 10)
            })),
            this.finaliseBlobChange(containerName)
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

  private getStorageOptions(): Observable<BlobStorageOptions> {
    return this.sasGenerator.getSasToken();
  }
}
