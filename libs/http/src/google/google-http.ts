import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleConnectionStatus {
  success: boolean;
  configured: boolean;
  model?: string;
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleHttp {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'google';

  /**
   * Retrieves the connection status of the configured environment API key.
   */
  getStatus(): Observable<GoogleConnectionStatus> {
    return this.http.get<GoogleConnectionStatus>(`${this.baseUrl}/status`);
  }

  /**
   * Tests a Google Gemini API key (optional custom key or environment fallback).
   */
  testConnection(apiKey?: string): Observable<GoogleConnectionStatus> {
    return this.http.post<GoogleConnectionStatus>(`${this.baseUrl}/test`, { apiKey });
  }

  /**
   * Generates TRIZ solutions using Gemini based on a problem description and extracted principles.
   */
  generateSolutions(problemDescription: string, principlesText: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/generate-solutions`, { problemDescription, principlesText });
  }
}
