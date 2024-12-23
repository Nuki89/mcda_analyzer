import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TopsisDataService {
  private apiUrlTopsis = environment.apiUrlTopsis;
  private calculationUrl = environment.apiUrlTopsisCalculation;
  // private apiUrl = 'http://127.0.0.1:8000/topsis-results/';
  // private calculationUrl = 'http://127.0.0.1:8000/topsis/';

  constructor(private http: HttpClient) { }

  getTopsisdata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlTopsis);
  }

  triggerTopsisCalculation(): Observable<any> {
    return this.http.get<any>(this.calculationUrl);
  }

}
