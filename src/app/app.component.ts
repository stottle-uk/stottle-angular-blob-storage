import { Component } from '@angular/core';
import { BlobStateService } from './azure-storage/services/blob-state.service';

@Component({
  selector: 'app-root',
  template: `
    <div style="text-align:center">
      <h1>
        Welcome to stottle-angular-blob-storage-upload
      </h1>
    </div>

    <app-container-list></app-container-list>

    <hr />

    <app-selected-container [containerName]="selectedContainer$ | async">
      <app-input-file
        [uploadProgress]="blobUploadProgress$ | async"
        (onFilesSelected)="onFileSelected($event)"
      ></app-input-file>

      <hr />

      <app-container-files-list></app-container-files-list>

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
export class AppComponent {
  blobUploadProgress$ = this.blobState.blobUploadProgress$;
  blobDownloadResponse$ = this.blobState.blobDownloadResponse$;
  blobDeleteResponse$ = this.blobState.blobDeleteResponse$;
  selectedContainer$ = this.blobState.selectedContainer$;

  constructor(private blobState: BlobStateService) {}

  onDeleteItem(filename: string): void {
    this.blobState.deleteItem(filename);
  }

  onDownloadItem(filename: string): void {
    this.blobState.downloadItem(filename);
  }

  onFileSelected(files: FileList): void {
    this.blobState.uploadItems(files);
  }
}
