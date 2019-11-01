import { Component, OnInit } from '@angular/core';
import {
  BlobDeleteResponse,
  BlobItem,
  ContainerItem
} from '@azure/storage-blob';
import { from, Observable, ReplaySubject } from 'rxjs';
import { combineAll, finalize, first, map, switchMap } from 'rxjs/operators';
import { BlobStorageService } from './azure-storage/blob-storage.service.';

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
      <input type="file" multiple="multiple" (change)="onFileChange($event)" />
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

  constructor(private blobStorage: BlobStorageService) {}

  ngOnInit() {
    this.containers$ = this.blobStorage.getContainers({
      storageUri: 'stottleblobstorage',
      storageAccessToken:
        'sv=2019-02-02&ss=b&srt=sco&sp=rwdlac&se=2019-11-14T19:20:59Z&st=2019-11-01T11:20:59Z&spr=https&sig=dG1zvo67VNDrqeWlrcrlz78W2ONVbYn2FlGJeFDifGg%3D',
      container: 'NOT NEEDED',
      filename: 'NOT NEEDED'
    });

    this.filesInContainer$ = this.selectedContainer$.pipe(
      switchMap(containerName =>
        this.blobStorage.listBlobsInContainer({
          storageUri: 'stottleblobstorage',
          storageAccessToken:
            'sv=2019-02-02&ss=b&srt=sco&sp=rwdlac&se=2019-11-14T19:20:59Z&st=2019-11-01T11:20:59Z&spr=https&sig=dG1zvo67VNDrqeWlrcrlz78W2ONVbYn2FlGJeFDifGg%3D',
          container: containerName,
          filename: 'NOT NEEDED'
        })
      )
    );
  }

  onFileChange(event: any): void {
    this.uploadProgress$ = from(event.target.files as FileList).pipe(
      map(file => this.uploadFile(file)),
      combineAll()
    );
  }

  onContainerClick(containerName: string): void {
    this.selectedContainerInner$.next(containerName);
  }

  onFileClick(filename: string): void {
    this.blobDeleteResponse$ = this.selectedContainer$.pipe(
      first(),
      switchMap(containerName =>
        this.blobStorage
          .deleteBlobItem({
            storageUri: 'stottleblobstorage',
            storageAccessToken:
              'sv=2019-02-02&ss=b&srt=sco&sp=rwdlac&se=2019-11-14T19:20:59Z&st=2019-11-01T11:20:59Z&spr=https&sig=dG1zvo67VNDrqeWlrcrlz78W2ONVbYn2FlGJeFDifGg%3D',
            container: containerName,
            filename: filename
          })
          .pipe(
            finalize(() => this.selectedContainerInner$.next(containerName))
          )
      )
    );
  }

  private uploadFile = (file: File) => {
    return this.selectedContainer$.pipe(
      first(),
      switchMap(containerName =>
        this.blobStorage
          .uploadToBlobStorage(
            {
              storageUri: 'stottleblobstorage',
              storageAccessToken:
                'sv=2019-02-02&ss=b&srt=sco&sp=rwdlac&se=2019-11-14T19:20:59Z&st=2019-11-01T11:20:59Z&spr=https&sig=dG1zvo67VNDrqeWlrcrlz78W2ONVbYn2FlGJeFDifGg%3D',
              container: containerName,
              filename: file.name // + new Date().getTime()
            },
            file
          )
          .pipe(
            map(progress => ({
              filename: file.name,
              progress: parseInt(((progress / file.size) * 100).toString(), 10)
            })),
            finalize(() => this.selectedContainerInner$.next(containerName))
          )
      )
    );
  };
}

// docker run -p 10000:10000 mcr.microsoft.com/azure-storage/azurite  azurite-blob --blobHost 0.0.0.0 --blobPort 10000

// BlobEndpoint=https://stottleblobstorage.blob.core.windows.net/;QueueEndpoint=https://stottleblobstorage.queue.core.windows.net/;FileEndpoint=https://stottleblobstorage.file.core.windows.net/;TableEndpoint=https://stottleblobstorage.table.core.windows.net/;SharedAccessSignature=sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2019-11-01T19:15:27Z&st=2019-11-01T11:15:27Z&spr=https&sig=6sYMMwpGAPM5%2Bdfo%2BwLqvkb9gbS5NocxNpTzqTIS%2FwU%3D
