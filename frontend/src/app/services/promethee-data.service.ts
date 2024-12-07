import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrometheeDataService {
  private apiUrl = 'http://127.0.0.1:8000/promethee-results/';
  private calculationUrl = 'http://127.0.0.1:8000/promethee/';

  constructor(private http: HttpClient) { }

  getPrometheeData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  triggerPrometheeCalculation(): Observable<any> {
    return this.http.get(this.calculationUrl); 
  }

}