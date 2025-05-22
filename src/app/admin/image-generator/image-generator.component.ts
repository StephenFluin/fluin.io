import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClient and HttpClientModule
import { finalize } from 'rxjs/operators'; // Import finalize
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading indicator
import { PostService, Post } from '../../../shared/post.service'; // Import PostService and Post

@Component({
  selector: 'app-image-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule
    MatFormFieldModule, // Add Material modules
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    HttpClientModule // Add HttpClientModule
  ],
  templateUrl: './image-generator.component.html',
  styleUrls: ['./image-generator.component.scss']
})
export class ImageGeneratorComponent {
  posts = this.postService.postList; // Signal of Post[]
  selectedPostKey: string | null = null;
  generatedImageUrl: string | null = null;
  isLoading: boolean = false;

  constructor(
    private postService: PostService,
    private http: HttpClient // Inject HttpClient
  ) { }

  onGenerateImage() {
    if (!this.selectedPostKey) {
      console.error('No post selected.');
      return;
    }

    const selectedPost = this.posts().find(p => p.key === this.selectedPostKey);

    if (!selectedPost || !selectedPost.body) {
      console.error('Selected post not found or has no body.');
      return;
    }

    this.isLoading = true;
    this.generatedImageUrl = null;
    const postText = selectedPost.body;

    this.http.post<{ imageUrl?: string; error?: string }>('/api/generate-image', { text: postText })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.imageUrl) {
            this.generatedImageUrl = response.imageUrl;
          } else if (response.error) {
            console.error('Error generating image:', response.error);
            // Optionally, set a user-facing error message property here
          }
        },
        error: (err) => {
          console.error('HTTP error generating image:', err);
          // Optionally, set a user-facing error message property here
        }
      });
  }
}
