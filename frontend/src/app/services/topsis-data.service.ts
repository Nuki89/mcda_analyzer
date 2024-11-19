import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TopsisDataService {
  private apiUrl = 'http://127.0.0.1:8000/topsis/';

  constructor(private http: HttpClient) { }

  getTopsisdata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

}
