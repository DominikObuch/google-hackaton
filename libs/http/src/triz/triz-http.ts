import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TrizHttp {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'triz';

  browseMatrix(improving: number[], preserving: number[]): Observable<{ result: string }> {
    const improvingStr = improving.join(',');
    const preservingStr = preserving.join(',');
    return this.http.get<{ result: string }>(`${this.baseUrl}/matrix`, {
      params: { improving: improvingStr, preserving: preservingStr }
    });
  }

  searchParameters(query: string, limit = 5): Observable<{ result: string }> {
    return this.http.get<{ result: string }>(`${this.baseUrl}/parameters/search`, {
      params: { query, limit }
    });
  }

  searchPrinciples(query: string, limit = 5): Observable<{ result: string }> {
    return this.http.get<{ result: string }>(`${this.baseUrl}/principles/search`, {
      params: { query, limit }
    });
  }

  getRandomPrinciples(limit = 5): Observable<{ result: string }> {
    return this.http.get<{ result: string }>(`${this.baseUrl}/principles/random`, {
      params: { limit }
    });
  }

  getParameter(id: number): Observable<{ result: string }> {
    return this.http.get<{ result: string }>(`${this.baseUrl}/parameters/${id}`);
  }

  getPrinciple(id: number): Observable<{ result: string }> {
    return this.http.get<{ result: string }>(`${this.baseUrl}/principles/${id}`);
  }

  getEntireMatrix(): Observable<{ result: string }> {
    return this.http.get<{ result: string }>(`${this.baseUrl}/matrix/all`);
  }
}
