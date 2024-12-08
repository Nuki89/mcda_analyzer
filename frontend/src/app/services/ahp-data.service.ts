import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AhpDataService {
  private apiUrl = 'http://127.0.0.1:8000/ahp-results/';
  private calculationUrl = 'http://172.0.0.1:8000/ahp/';

  constructor(private http: HttpClient) { }

  getAHPdata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  triggerAHPCalculation(): Observable<any> {
    return this.http.get(this.calculationUrl); 
  }

}
