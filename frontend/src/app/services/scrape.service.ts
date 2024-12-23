import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { apiEndpoints } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ScrapeService {
  // private scrapeUrl = 'http://172.179.236.116:8000/scrape/';
  // private scrapeUrl = 'http://127.0.0.1:8000/scrape/';
    private scrapeUrl = apiEndpoints.scrapeUrl;

  constructor(private http: HttpClient) {}

  scrapeData(): Observable<any> {
    return this.http.get(this.scrapeUrl);
  }
  
}
