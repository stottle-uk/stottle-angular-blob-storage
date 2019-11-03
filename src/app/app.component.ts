import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div style="text-align:center">
      <h1>
        Welcome to stottle-angular-blob-storage-upload
      </h1>
    </div>

    <app-container-list></app-container-list>

    <hr />

    <app-selected-container>
      <app-input-file></app-input-file>

      <hr />

      <app-container-files-list></app-container-files-list>

      <app-uploads></app-uploads>

      <app-downloads></app-downloads>

      <app-deleted-items></app-deleted-items>
    </app-selected-container>
  `
})
export class AppComponent {}
