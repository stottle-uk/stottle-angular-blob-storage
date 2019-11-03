import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ContainerFilesListComponent } from './azure-storage/components/container-files-list.component';
import { ContainerListComponent } from './azure-storage/components/container-list.component';
import { InputFileComponent } from './azure-storage/components/input-file.component';
import { SelectedContainerComponent } from './azure-storage/components/selected-container.component';
import {
  azureBlobStorageFactory,
  BLOB_STORAGE_TOKEN
} from './azure-storage/services/token';
import { DownloadsComponent } from './azure-storage/components/downloads.component';
import { UploadsComponent } from './azure-storage/components/uploads.component';
import { DeletedItemsComponent } from './azure-storage/components/deleted-items.component';

@NgModule({
  declarations: [
    AppComponent,
    ContainerListComponent,
    ContainerFilesListComponent,
    SelectedContainerComponent,
    InputFileComponent,
    DownloadsComponent,
    UploadsComponent,
    DeletedItemsComponent
  ],
  imports: [BrowserModule],
  providers: [
    {
      provide: BLOB_STORAGE_TOKEN,
      useFactory: azureBlobStorageFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
