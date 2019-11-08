import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <div>
      <h1 style="text-align: center">stottle-angular-blob-storage</h1>
      <div>
        Medium Article:
        <a
          href="https://medium.com/@stuarttottle/upload-to-azure-blob-storage-with-angular-8-2ed80dfc6672"
          target="_blank"
          rel="noopener noreferrer"
        >
          Upload to Azure Blob Storage with Angular 8
        </a>
      </div>
      <div>
        Github:
        <a
          href="https://github.com/stottle-uk/stottle-angular-blob-storage"
          target="_blank"
          rel="noopener noreferrer"
        >
          stottle-angular-blob-storage
        </a>
      </div>
    </div>
  `
})
export class HeaderComponent {}
