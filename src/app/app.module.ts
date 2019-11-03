import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ContainerItemsListComponent } from './azure-storage/components/container-items-list.component';
import { ContainerListComponent } from './azure-storage/components/container-list.component';
import { DeletedItemsComponent } from './azure-storage/components/deleted-items.component';
import { DownloadsComponent } from './azure-storage/components/downloads.component';
import { InputFileComponent } from './azure-storage/components/input-file.component';
import { SelectedContainerComponent } from './azure-storage/components/selected-container.component';
import { UploadsComponent } from './azure-storage/components/uploads.component';
import {
  azureBlobStorageFactory,
  BLOB_STORAGE_TOKEN
} from './azure-storage/services/token';

@NgModule({
  declarations: [
    AppComponent,
    ContainerListComponent,
    ContainerItemsListComponent,
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
