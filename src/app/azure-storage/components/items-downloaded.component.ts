import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-items-downloaded',
  template: `
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
  constructor(private blobState: BlobStateService) {}
}
