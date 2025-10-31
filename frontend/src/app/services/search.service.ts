import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SearchFilters {
  query: string;
  type?: 'all' | 'users' | 'posts' | 'projects';
  sortBy?: 'relevance' | 'recent' | 'popular';
  technology?: string;
}

export interface SearchResults {
  users: any[];
  posts: any[];
  projects: any[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return { headers: new HttpHeaders(headers) };
  }

  search(filters: SearchFilters): Observable<SearchResults> {
    let params = new HttpParams()
      .set('q', filters.query)
      .set('type', filters.type || 'all')
      .set('sortBy', filters.sortBy || 'relevance');

    if (filters.technology) {
      params = params.set('technology', filters.technology);
    }

    return this.http.get<SearchResults>(`${this.API_URL}/search`, {
      ...this.getHeaders(),
      params
    });
  }

  searchUsers(query: string, limit: number = 10): Observable<any[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<any[]>(`${this.API_URL}/search/users`, {
      ...this.getHeaders(),
      params
    });
  }

  searchPosts(query: string, sortBy: string = 'recent', limit: number = 20): Observable<any[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('sortBy', sortBy)
      .set('limit', limit.toString());

    return this.http.get<any[]>(`${this.API_URL}/search/posts`, {
      ...this.getHeaders(),
      params
    });
  }

  searchProjects(query: string, technology?: string, sortBy: string = 'recent', limit: number = 20): Observable<any[]> {
    let params = new HttpParams()
      .set('q', query)
      .set('sortBy', sortBy)
      .set('limit', limit.toString());

    if (technology) {
      params = params.set('technology', technology);
    }

    return this.http.get<any[]>(`${this.API_URL}/search/projects`, {
      ...this.getHeaders(),
      params
    });
  }
}