import { Component } from '@angular/core';
import { BlobStateService } from '../services/blob-state.service';

@Component({
  selector: 'app-input-file',
  template: `
    <input
      type="file"
      multiple="multiple"
      (change)="onSelected($event.target.files)"
    />
  `
})
export class InputFileComponent {
  constructor(private blobState: BlobStateService) {}

  onSelected(files: FileList): void {
    this.blobState.uploadItems(files);
  }
}
