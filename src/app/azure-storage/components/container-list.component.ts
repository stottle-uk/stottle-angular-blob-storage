import { Component } from '@angular/core';
import { BlobSharedViewStateService } from '../services/blob-shared-view-state.service';

@Component({
  selector: 'app-container-list',
  template: `
    <h2>Containers</h2>
    <div *ngFor="let container of containers$ | async">
      {{ container.name }}
      <button (click)="onClick(container.name)">View</button>
    </div>
  `
})
export class ContainerListComponent {
  containers$ = this.blobState.containers$;

  constructor(private blobState: BlobSharedViewStateService) {}

  onClick(containerName: string): void {
    this.blobState.getContainerItems(containerName);
  }
}
