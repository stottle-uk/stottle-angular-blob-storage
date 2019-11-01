import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BlobUploadProgress } from '../services/azureStorage';

@Component({
  selector: 'app-file-uploader',
  template: `
    <input type="file" multiple="multiple" (change)="onSelected($event)" />
    <div *ngIf="uploadProgress as progress">
      <h2>Upload Progress</h2>
      <pre>{{ progress | json }}</pre>
    </div>
  `,
  styles: []
})
export class FileUploaderComponent {
  @Input() uploadProgress: BlobUploadProgress[];
  @Output() onFilesSelected = new EventEmitter<FileList>();

  onSelected(event: any) {
    this.onFilesSelected.emit(event.target.files as FileList);
  }
}
