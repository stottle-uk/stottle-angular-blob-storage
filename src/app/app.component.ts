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

    <app-selected-container class="container">
      <app-input-file class="input-file"></app-input-file>

      <app-items-list class="items-list"></app-items-list>

      <div class="item-details">
        <app-items-uploaded class="items-uploaded"></app-items-uploaded>

        <app-items-downloaded class="items-downloaded"></app-items-downloaded>

        <app-items-deleted class="items-deleted"></app-items-deleted>
      </div>
    </app-selected-container>
  `
})
export class AppComponent {}
