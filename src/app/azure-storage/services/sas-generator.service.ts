import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BlobStorageRequest } from '../types/azure-storage';

@Injectable({
  providedIn: 'root'
})
export class SasGeneratorService {
  constructor(private http: HttpClient) {}

  getSasToken(): Observable<BlobStorageRequest> {
    return this.http.get<BlobStorageRequest>(
      `${environment.sasGeneratorUrl}/api/GenerateSasToken`
    );
  }
}
