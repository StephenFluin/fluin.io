import { Component, Input, Signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Post, PostService } from '../shared/post.service';
import { buildOptimizedImageUrl, buildResponsiveImageSet, IMAGE_QUALITY } from '../shared/image-url';

@Component({
    selector: 'post-list',
    template: `
        <div id="posts-block">
          @for (post of posts(); track post) {
            <a class="card featured-blog-post" [routerLink]="['blog', post.id]">
              <img
                class="post-image"
                [src]="postCardImage(post)"
                [attr.srcset]="postCardImageSet(post)"
                [sizes]="postCardSizes"
                alt=""
                width="300"
                height="180"
                loading="lazy"
                decoding="async"
              />
              <div class="post-details">
                <h2 class="post-title">
                  {{ post.title }}
                </h2>
                <div class="post-date">
                  {{ post.date }}
                </div>
              </div>
            </a>
          }
        </div>
        `,
    imports: [RouterLink],
})
export class PostListComponent {
    @Input() limit = 12;
  readonly postCardSizes = '(max-width: 600px) min(100vw - 32px, 300px), 300px';
    posts: Signal<Post[]>;

    constructor(posts: PostService) {
        this.posts = computed(() => posts.postList().slice(0, this.limit));
    }

  postCardImage(post: Post) {
    return buildOptimizedImageUrl(post.image, {
      width: 600,
      height: 360,
      fit: 'cover',
      quality: IMAGE_QUALITY.card,
    });
  }

  postCardImageSet(post: Post) {
    return buildResponsiveImageSet(post.image, [300, 600], {
      width: 300,
      height: 180,
      fit: 'cover',
      quality: IMAGE_QUALITY.card,
    });
  }
}
