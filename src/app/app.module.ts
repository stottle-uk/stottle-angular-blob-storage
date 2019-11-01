import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ContainerFilesListComponent } from './azure-storage/components/container-files-list.component';
import { ContainerListComponent } from './azure-storage/components/container-list.component';
import { FileUploaderComponent } from './azure-storage/components/file-uploader.component';
import { SelectedContainerComponent } from './azure-storage/components/selected-container.component';
import {
  azureBlobStorageFactory,
  BLOB_STORAGE_TOKEN
} from './azure-storage/services/azureStorage';

@NgModule({
  declarations: [
    AppComponent,
    ContainerListComponent,
    ContainerFilesListComponent,
    SelectedContainerComponent,
    FileUploaderComponent
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
