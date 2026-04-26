import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, apiUrl } from '../api.config';
import { DashboardResponse } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(apiUrl(`${API_CONFIG.endpoints.dashboard}`));
  }
}
