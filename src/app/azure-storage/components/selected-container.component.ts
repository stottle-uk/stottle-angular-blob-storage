import { Component } from '@angular/core';
import { BlobSharedViewStateService } from '../services/blob-shared-view-state.service';

@Component({
  selector: 'app-selected-container',
  template: `
    <ng-container *ngIf="selectedContainer$ | async as containerName">
      <h2>Container Files: {{ containerName }}</h2>

      <ng-content></ng-content>
    </ng-container>
  `
})
export class SelectedContainerComponent {
  selectedContainer$ = this.blobState.selectedContainer$;

  constructor(private blobState: BlobSharedViewStateService) {}
}
