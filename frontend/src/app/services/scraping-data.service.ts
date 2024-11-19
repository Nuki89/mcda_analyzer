import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrapingDataService {
  private apiUrl = 'http://127.0.0.1:8000/scraped-data/';

  constructor(private http: HttpClient) {}

  getScrapingData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

