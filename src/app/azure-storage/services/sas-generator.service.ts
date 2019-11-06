import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BlobStorageRequest } from '../types/azure-storage';

@Injectable({
  providedIn: 'root'
})
export class SasGeneratorService {
  constructor(private http: HttpClient) {}

  getSasToken(): Observable<BlobStorageRequest> {
    if (environment.production) {
      return this.http.get<BlobStorageRequest>(
        `${environment.sasGeneratorUrl}/api/GenerateSas`
      );
    }
    return of({
      storageUri: 'stottleblobstorage',
      storageAccessToken: environment.devSasToken
    });
  }
}
