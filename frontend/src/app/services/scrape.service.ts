import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScrapeService {
  private scrapeUrl = 'http://localhost:8000/scrape/';

  constructor(private http: HttpClient) {}

  scrapeData(): Observable<any> {
    return this.http.get(this.scrapeUrl);
  }
}
