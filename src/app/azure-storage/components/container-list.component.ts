import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-container-list',
  template: `
    <h2>Containers</h2>

    <div *ngFor="let container of containers$ | async">
      {{ container.name }}
      <button (click)="onClick(container.name)">View</button>
    </div>
  `,
  styles: []
})
export class ContainerListComponent {
  containers$ = this.blobState.containers$;

  constructor(private blobState: BlobStateService) {}

  onClick(containerName: string): void {
    this.blobState.getContainerItems(containerName);
  }
}
