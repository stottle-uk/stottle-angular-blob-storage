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

      <app-items-list></app-items-list>

      <app-items-uploaded></app-items-uploaded>

      <app-items-downloaded></app-items-downloaded>

      <app-items-deleted></app-items-deleted>
    </app-selected-container>
  `
})
export class AppComponent {}
