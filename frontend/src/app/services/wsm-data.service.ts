import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WsmDataService {
  private apiUrlWsm = environment.apiUrlWsm;
  // private apiUrl = 'http://127.0.0.1:8000/wsm-results/';
  private calculationUrl = 'http://127.0.0.1:8000/wsm/';

  constructor(private http: HttpClient) { }

  getWSMdata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlWsm);
  }

  triggerWSmCalculation(): Observable<any> {
    return this.http.get<any>(this.calculationUrl);
  }

}
