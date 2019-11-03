import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-items-uploaded',
  template: `
    <div *ngFor="let upload of uploads$ | async">
      <pre>{{ upload | json }}</pre>
    </div>
  `
})
export class ItemsUploadedComponent {
  uploads$ = this.blobState.uploadedItems$;
  constructor(private blobState: BlobStateService) {}
}
