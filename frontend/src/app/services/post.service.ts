import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getPosts() {
    return this.http.get<any[]>(`${this.API_URL}/posts`);
  }

  createPost(content: string) {
    return this.http.post<any>(`${this.API_URL}/posts`, { content });
  }

  getComments(postId: number) {
    return this.http.get<any[]>(`${this.API_URL}/comments/${postId}`);
  }

  createComment(post_id: number, text: string) {
    return this.http.post<any>(`${this.API_URL}/comments`, { post_id, text });
  }
}