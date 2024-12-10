import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WsmDataService {
  private apiUrl = 'http://127.0.0.1:8000/wsm-results/';
  private calculationUrl = 'http://127.0.0.1:8000/wsm/';

  constructor(private http: HttpClient) { }

  getWSMdata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  triggerWSmCalculation(): Observable<any> {
    return this.http.get<any>(this.calculationUrl);
  }

}
