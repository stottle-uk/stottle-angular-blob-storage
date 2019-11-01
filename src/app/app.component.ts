import { Component, OnInit } from '@angular/core';
import {
  BlobDeleteResponse,
  BlobItem,
  ContainerItem
} from '@azure/storage-blob';
import { from, Observable, ReplaySubject } from 'rxjs';
import {
  combineAll,
  finalize,
  map,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { BlobStorageOptions } from './azure-storage/services/azureStorage';
import { BlobStorageService } from './azure-storage/services/blob-storage.service.';
import { SasGeneratorService } from './azure-storage/services/sas-generator.service';

interface IUploadProgress {
  filename: string;
  progress: number;
}

@Component({
  selector: 'app-root',
  template: `
    <div style="text-align:center">
      <h1>
        Welcome to stottle-angular-blob-storage-upload
      </h1>
    </div>

    <h2>Containers</h2>

    <div *ngFor="let container of containers$ | async">
      <div (click)="onContainerClick(container.name)">
        {{ container.name }}
      </div>
    </div>

    <hr />

    <div *ngIf="selectedContainer$ | async as container">
      <h2>Container: {{ container }} Files</h2>
      <hr />
      <input
        type="file"
        multiple="multiple"
        (change)="onFileSelected($event)"
      />
      <div *ngIf="uploadProgress$ | async as progress">
        <h2>Upload Progress</h2>
        <pre>{{ progress | json }}</pre>
      </div>
      <hr />

      <!-- <pre>{{ filesInContainer$ | async | json }}</pre>-->
      <div *ngFor="let file of filesInContainer$ | async">
        <div>
          {{ file.name }} | {{ file.properties.contentLength }} |
          {{ file.properties.lastModified }}
          <button (click)="onFileClick(file.name)">Delete File</button>
        </div>
      </div>

      <pre>{{ blobDeleteResponse$ | async | json }}</pre>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  uploadProgress$: Observable<IUploadProgress[]>;
  containers$: Observable<ContainerItem[]>;
  filesInContainer$: Observable<BlobItem[]>;
  blobDeleteResponse$: Observable<BlobDeleteResponse>;
  selectedContainerInner$ = new ReplaySubject<string>(1);

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
  }

  onFileSelected(event: any): void {
    this.uploadProgress$ = from(event.target.files as FileList).pipe(
      map(file => this.uploadFile(file)),
      combineAll()
    );
  }

  onContainerClick(containerName: string): void {
    this.selectedContainerInner$.next(containerName);

    this.filesInContainer$ = this.selectedContainer$.pipe(
      withLatestFrom(this.getStorageOptions()),
      switchMap(([container, info]) =>
        this.blobStorage.listBlobsInContainer({ ...info, container })
      )
    );
  }

  onFileClick(filename: string): void {
    this.blobDeleteResponse$ = this.getStorageOptions().pipe(
      withLatestFrom(this.selectedContainer$),
      switchMap(([info, container]) =>
        this.blobStorage
          .deleteBlobItem({
            ...info,
            container,
            filename
          })
          .pipe(tap(() => this.selectedContainerInner$.next(container)))
      )
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
            filename: file.name // + new Date().getTime()
          })
          .pipe(
            map(progress => ({
              filename: file.name,
              progress: parseInt(((progress / file.size) * 100).toString(), 10)
            })),
            finalize(() => this.selectedContainerInner$.next(container))
          )
      )
    );

  private getStorageOptions(): Observable<BlobStorageOptions> {
    return this.sasGenerator.getSasToken();
  }
}

// docker run -p 10000:10000 mcr.microsoft.com/azure-storage/azurite  azurite-blob --blobHost 0.0.0.0 --blobPort 10000

// BlobEndpoint=https://stottleblobstorage.blob.core.windows.net/;QueueEndpoint=https://stottleblobstorage.queue.core.windows.net/;FileEndpoint=https://stottleblobstorage.file.core.windows.net/;TableEndpoint=https://stottleblobstorage.table.core.windows.net/;SharedAccessSignature=sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2019-11-01T19:15:27Z&st=2019-11-01T11:15:27Z&spr=https&sig=6sYMMwpGAPM5%2Bdfo%2BwLqvkb9gbS5NocxNpTzqTIS%2FwU%3D
