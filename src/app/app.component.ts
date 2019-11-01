import { Component, OnInit } from '@angular/core';
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
import { BlobStorageService } from './azure-storage/services/blob-storage.service.';
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
      <app-file-uploader
        [uploadProgress]="uploadProgress$ | async"
        (onFilesSelected)="onFileSelected($event)"
      ></app-file-uploader>

      <hr />

      <app-container-files-list
        [items]="filesInContainer$ | async"
        (onDeleteItem)="onDeleteItem($event)"
      ></app-container-files-list>

      <pre>{{ blobDeleteResponse$ | async | json }}</pre>
    </app-selected-container>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  uploadProgress$: Observable<BlobUploadProgress[]>;
  containers$: Observable<ContainerItem[]>;
  filesInContainer$: Observable<BlobItem[]>;
  blobDeleteResponse$: Observable<BlobDeleteResponse>;
  selectedContainerInner$ = new BehaviorSubject<string>(undefined);

  get selectedContainer$() {
    return this.selectedContainerInner$.asObservable();
  }

  constructor(
    private sasGenerator: SasGeneratorService,
    private blobStorage: BlobStorageService
  ) {}

  ngOnInit() {
    this.containers$ = this.getStorageOptions().pipe(
      switchMap(info => this.blobStorage.getContainers(info))
    );

    this.filesInContainer$ = this.selectedContainer$.pipe(
      filter(container => !!container),
      withLatestFrom(this.getStorageOptions()),
      switchMap(([container, info]) =>
        this.blobStorage.listBlobsInContainer({ ...info, container })
      )
    );
  }

  onContainerClick(containerName: string): void {
    this.selectedContainerInner$.next(containerName);
  }

  onDeleteItem(filename: string): void {
    this.blobDeleteResponse$ = this.getStorageOptions().pipe(
      withLatestFrom(this.selectedContainer$),
      switchMap(([info, container]) =>
        this.blobStorage
          .deleteBlobItem({
            ...info,
            container,
            filename
          })
          .pipe(this.finaliseBlobChange(container))
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
      switchMap(([info, container]) =>
        this.blobStorage
          .uploadToBlobStorage(file, {
            ...info,
            container,
            filename: file.name + new Date().getTime()
          })
          .pipe(
            map(progress => ({
              filename: file.name,
              progress: parseInt(((progress / file.size) * 100).toString(), 10)
            })),
            this.finaliseBlobChange(container)
          )
      )
    );

  private finaliseBlobChange = <T>(
    container: string
  ): MonoTypeOperatorFunction<T> => source =>
    source.pipe(
      finalize(
        () =>
          this.selectedContainerInner$.value === container &&
          this.selectedContainerInner$.next(container)
      )
    );

  private getStorageOptions(): Observable<BlobStorageOptions> {
    return this.sasGenerator.getSasToken();
  }
}

// docker run -p 10000:10000 mcr.microsoft.com/azure-storage/azurite  azurite-blob --blobHost 0.0.0.0 --blobPort 10000

// BlobEndpoint=https://stottleblobstorage.blob.core.windows.net/;QueueEndpoint=https://stottleblobstorage.queue.core.windows.net/;FileEndpoint=https://stottleblobstorage.file.core.windows.net/;TableEndpoint=https://stottleblobstorage.table.core.windows.net/;SharedAccessSignature=sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2019-11-01T19:15:27Z&st=2019-11-01T11:15:27Z&spr=https&sig=6sYMMwpGAPM5%2Bdfo%2BwLqvkb9gbS5NocxNpTzqTIS%2FwU%3D
