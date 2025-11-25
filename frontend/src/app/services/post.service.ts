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

  getComments(postId: string) {
    return this.http.get<any[]>(`${this.API_URL}/comments/${postId}`);
  }
deletePost(postId: string) {
  const token = localStorage.getItem('token');
  console.log('Token:', token ? 'Existe' : 'NO EXISTE');
  console.log('Eliminando post:', postId);
  
  return this.http.delete<any>(`${this.API_URL}/posts/${postId}`);
}
  createComment(post_id: string, text: string) {
    return this.http.post<any>(`${this.API_URL}/comments`, { post_id, text });
  }
}