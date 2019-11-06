import { Injectable } from '@angular/core';
import { BlobDeleteResponse } from '@azure/storage-blob';
import { OperatorFunction, Subject } from 'rxjs';
import { map, mergeMap, scan, startWith, switchMap } from 'rxjs/operators';
import {
  BlobContainerRequest,
  BlobItem,
  Dictionary
} from '../types/azure-storage';
import { BlobStateService } from './blob-state.service';
import { BlobStorageService } from './blob-storage.service';

@Injectable({
  providedIn: 'root'
})
export class BlobDeletesViewStateService {
  private deleteQueueInner$ = new Subject<string>();

  deletedItems$ = this.deleteQueue$.pipe(
    mergeMap(filename => this.deleteFile(filename)),
    this.blobState.scanEntries()
  );

  get deleteQueue$() {
    return this.deleteQueueInner$.asObservable();
  }

  constructor(
    private blobStorage: BlobStorageService,
    private blobState: BlobStateService
  ) {}

  deleteItem(filename: string): void {
    this.deleteQueueInner$.next(filename);
  }

  private deleteFile = (filename: string) =>
    this.blobState.getStorageOptionsWithContainer().pipe(
      switchMap(options =>
        this.blobStorage
          .deleteBlobItem({
            ...options,
            filename
          })
          .pipe(
            this.mapDeleteResponse(filename, options),
            this.blobState.finaliseBlobChange(options.containerName)
          )
      )
    );

  private mapDeleteResponse = (
    filename: string,
    options: BlobContainerRequest
  ): OperatorFunction<BlobDeleteResponse, BlobItem> => source =>
    source.pipe(
      map(() => ({
        filename,
        containerName: options.containerName
      })),
      startWith({
        filename,
        containerName: options.containerName
      })
    );

  scanEntries<T extends BlobItem>(): OperatorFunction<T, T[]> {
    return source =>
      source.pipe(
        map(item => ({
          [`${item.containerName}-${item.filename}`]: item
        })),
        scan<Dictionary<T>>(
          (items, item) => ({
            ...items,
            ...item
          }),
          {}
        ),
        map(items => Object.values(items))
      );
  }
}
