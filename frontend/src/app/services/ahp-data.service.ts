import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AhpDataService {
  private apiUrlAHP = environment.apiUrlAHP;
  // private apiUrlAHP = 'http://127.0.0.1:8000/ahp-results/';
  private calculationUrl = 'http://127.0.0.1:8000/ahp/';

  constructor(private http: HttpClient) { }

  getAHPdata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlAHP);
  }

  triggerAHPCalculation(): Observable<any> {
    return this.http.get(this.calculationUrl); 
  }

}
