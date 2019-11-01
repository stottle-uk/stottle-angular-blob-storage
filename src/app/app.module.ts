import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BlobServiceClient } from '@azure/storage-blob';
import { AppComponent } from './app.component';
import {
  BlobConnectionString,
  BLOB_STORAGE_TOKEN
} from './azure-storage/azureStorage';

export function azureBlobStorageFactory(): BlobConnectionString {
  return BlobServiceClient.fromConnectionString;
}

@NgModule({
  declarations: [AppComponent],
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
