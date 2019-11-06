import { Component } from '@angular/core';
import { BlobDownloadsViewStateService } from '../services/blob-downloads-view-state.service';

@Component({
  selector: 'app-items-downloaded',
  template: `
    <h3>Downloads</h3>
    <div *ngFor="let download of downloads$ | async">
      {{ download.containerName }}:
      <a [href]="download.url" target="_blank">
        {{ download.filename }}
      </a>
    </div>
  `
})
export class ItemsDownloadedComponent {
  downloads$ = this.blobState.downloadedItems$;
  constructor(private blobState: BlobDownloadsViewStateService) {}
}
