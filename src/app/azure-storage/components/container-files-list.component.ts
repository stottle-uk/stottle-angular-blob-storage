import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BlobItem } from '@azure/storage-blob';

@Component({
  selector: 'app-container-files-list',
  template: `
    <div *ngFor="let item of items">
      <div>
        {{ item.name }} | {{ item.properties.contentLength }} |
        {{ item.properties.lastModified }}
        <button (click)="onDownloadItem.emit(item.name)">Download File</button>
        <button (click)="onDeleteClick(item.name)">Delete File</button>
      </div>
    </div>
  `,
  styles: []
})
export class ContainerFilesListComponent {
  @Input() items: BlobItem[];
  @Output() onDeleteItem = new EventEmitter<string>();
  @Output() onDownloadItem = new EventEmitter<string>();

  onDeleteClick(itenName: string) {
    this.onDeleteItem.emit(itenName);
  }
}
