import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-deleted-items',
  template: `
    <div *ngFor="let item of deletedItems$ | async">
      {{ item.containerName | json }}:
    </div>
  `
})
export class DeletedItemsComponent {
  deletedItems$ = this.blobState.deletedItems$;
  constructor(private blobState: BlobStateService) {}
}
