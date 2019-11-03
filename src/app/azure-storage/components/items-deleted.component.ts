import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-items-deleted',
  template: `
    <div *ngFor="let item of deletedItems$ | async">{{ item | json }}:</div>
  `
})
export class ItemsDeletedComponent {
  deletedItems$ = this.blobState.deletedItems$;
  constructor(private blobState: BlobStateService) {}
}
