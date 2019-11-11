import { Component } from '@angular/core';
import { BlobUploadsViewStateService } from '../services/blob-uploads-view-state.service';

@Component({
  selector: 'app-items-uploaded',
  template: `
    <h3>Uploads</h3>
    <ng-container *ngFor="let upload of uploads$ | async">
      <pre>{{ upload | json }}</pre>
    </ng-container>
  `
})
export class ItemsUploadedComponent {
  uploads$ = this.blobState.uploadedItems$;
  constructor(private blobState: BlobUploadsViewStateService) {}
}
