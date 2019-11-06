import { Component } from '@angular/core';
import { BlobDeletesViewStateService } from '../services/blob-deletes-view-state.service';
import { BlobDownloadsViewStateService } from '../services/blob-downloads-view-state.service';
import { BlobSharedViewStateService } from '../services/blob-shared-view-state.service';

@Component({
  selector: 'app-items-list',
  template: `
    <ng-container *ngIf="items$ | async as items">
      <ng-container *ngIf="items.length === 0">
        No Items - Try uploading some files
      </ng-container>
      <div *ngFor="let item of items">
        <span>{{ item.name }}</span>
        <span>{{ item.properties.contentLength }}</span>
        <span>{{ item.properties.lastModified | date: 'short' }}</span>
        <div>
          <button (click)="onDownloadClick(item.name)">Download</button>
          <button (click)="onDeleteClick(item.name)">Delete</button>
        </div>
      </div>
    </ng-container>
  `
})
export class ItemsListComponent {
  items$ = this.blobState.itemsInContainer$;

  constructor(
    private blobState: BlobSharedViewStateService,
    private blobDeletes: BlobDeletesViewStateService,
    private blobDownloads: BlobDownloadsViewStateService
  ) {}

  onDownloadClick(filename: string): void {
    this.blobDownloads.downloadItem(filename);
  }

  onDeleteClick(filename: string): void {
    this.blobDeletes.deleteItem(filename);
  }
}
