import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-container-items-list',
  template: `
    <div *ngFor="let item of items$ | async">
      <div>
        {{ item.name }} | {{ item.properties.contentLength }} |
        {{ item.properties.lastModified }}
        <button (click)="onDownloadClick(item.name)">Download File</button>
        <button (click)="onDeleteClick(item.name)">Delete File</button>
      </div>
    </div>
  `
})
export class ContainerItemsListComponent {
  items$ = this.blobState.itemsInContainer$;

  constructor(private blobState: BlobStateService) {}

  onDownloadClick(filename: string): void {
    this.blobState.downloadItem(filename);
  }

  onDeleteClick(filename: string): void {
    this.blobState.deleteItem(filename);
  }
}
