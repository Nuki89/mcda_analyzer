import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrapingDataService {
  private apiUrl = 'http://127.0.0.1:8000/scraped-data/';
  private dataSubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {}


  getScrapingData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }


  sendData(data: any[]) {
    this.dataSubject.next(data);
  }
  

  getData(): Observable<any[]> {
    return this.dataSubject.asObservable();
  }
  
}

