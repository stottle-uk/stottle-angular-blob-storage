import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-items-deleted',
  template: `
    <h3>Deleted</h3>
    <div *ngFor="let item of deletedItems$ | async">
      <pre> {{ item | json }}</pre>
    </div>
  `
})
export class ItemsDeletedComponent {
  deletedItems$ = this.blobState.deletedItems$;
  constructor(private blobState: BlobStateService) {}
}
