import { Component, Input } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';
import { BlobItemUpload } from '../types/azure-storage';

@Component({
  selector: 'app-input-file',
  template: `
    <input
      type="file"
      multiple="multiple"
      (change)="onSelected($event.target.files)"
    />
    <div *ngIf="isUploadInProgress">
      <h2>Upload Progress</h2>
      <pre>{{ uploadProgress | json }}</pre>
    </div>
  `,
  styles: []
})
export class InputFileComponent {
  @Input() uploadProgress: BlobItemUpload[];

  get isUploadInProgress() {
    return (this.uploadProgress || []).some(up => up.progress < 100);
  }

  constructor(private blobState: BlobStateService) {}

  onSelected(files: FileList): void {
    this.blobState.uploadItems(files);
  }
}
