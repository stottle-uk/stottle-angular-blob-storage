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
