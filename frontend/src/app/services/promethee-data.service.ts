import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiEndpoints } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrometheeDataService {
  private apiUrlPromethee = apiEndpoints.apiUrlPromethee;
  private calculationUrl = apiEndpoints.apiUrlPrometheeCalculation;
  // private apiUrl = 'http://127.0.0.1:8000/promethee-results/';
  // private calculationUrl = 'http://127.0.0.1:8000/promethee/';

  constructor(private http: HttpClient) { }

  getPrometheeData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlPromethee);
  }

  triggerPrometheeCalculation(): Observable<any> {
    return this.http.get(this.calculationUrl); 
  }

}
