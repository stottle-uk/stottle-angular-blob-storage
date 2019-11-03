import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-downloads',
  template: `
    <div *ngFor="let download of downloads$ | async">
      {{ download.containerName }}:
      <a [href]="download.url" target="_blank">
        {{ download.filename }}
      </a>
    </div>
  `
})
export class DownloadsComponent {
  downloads$ = this.blobState.downloadedItems$;
  constructor(private blobState: BlobStateService) {}
}
