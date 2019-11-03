import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ContainerListComponent } from './azure-storage/components/container-list.component';
import { InputFileComponent } from './azure-storage/components/input-file.component';
import { ItemsDeletedComponent } from './azure-storage/components/items-deleted.component';
import { ItemsDownloadedComponent } from './azure-storage/components/items-downloaded.component';
import { ItemsListComponent } from './azure-storage/components/items-list.component';
import { ItemsUploadedComponent } from './azure-storage/components/items-uploaded.component';
import { SelectedContainerComponent } from './azure-storage/components/selected-container.component';
import {
  azureBlobStorageFactory,
  BLOB_STORAGE_TOKEN
} from './azure-storage/services/token';

@NgModule({
  declarations: [
    AppComponent,
    ContainerListComponent,
    ItemsListComponent,
    SelectedContainerComponent,
    InputFileComponent,
    ItemsDownloadedComponent,
    ItemsUploadedComponent,
    ItemsDeletedComponent
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
