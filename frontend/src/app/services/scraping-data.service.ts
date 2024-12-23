import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
// import { environment } from '../../environments/environment.dev';
import { apiEndpoints } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ScrapingDataService {
  // private apiUrl = 'http://127.0.0.1:8000/scraped-data/';
  // private apiUrl = 'http://172.179.236.116:8000/scraped-data/';
  private apiUrl = apiEndpoints.apiUrl;
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

