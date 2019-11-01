import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BlobServiceClient } from '@azure/storage-blob';
import { AppComponent } from './app.component';
import {
  BlobConnectionString,
  BLOB_STORAGE_TOKEN
} from './azure-storage/services/azureStorage';
import { ContainerListComponent } from './azure-storage/components/container-list.component';
import { ContainerFilesListComponent } from './azure-storage/components/container-files-list.component';
import { SelectedContainerComponent } from './azure-storage/components/selected-container.component';
import { FileUploaderComponent } from './azure-storage/components/file-uploader.component';

export function azureBlobStorageFactory(): BlobConnectionString {
  return BlobServiceClient.fromConnectionString;
}

@NgModule({
  declarations: [AppComponent, ContainerListComponent, ContainerFilesListComponent, SelectedContainerComponent, FileUploaderComponent],
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
