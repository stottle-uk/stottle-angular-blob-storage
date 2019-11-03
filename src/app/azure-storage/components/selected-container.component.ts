import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-selected-container',
  template: `
    <div *ngIf="selectedContainer$ | async as containerName">
      <h2>Container: {{ containerName }} Files</h2>

      <ng-content></ng-content>
    </div>
  `
})
export class SelectedContainerComponent {
  selectedContainer$ = this.blobState.selectedContainer$;

  constructor(private blobState: BlobStateService) {}
}
