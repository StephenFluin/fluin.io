import { Component, computed, inject } from '@angular/core';
import { Post, PostService } from '../shared/post.service';
import { RouterOutlet, RouterLink } from '@angular/router';
import { buildOptimizedImageUrl, buildResponsiveImageSet, IMAGE_QUALITY } from '../shared/image-url';

@Component({
    templateUrl: './blog.component.html',
    imports: [RouterOutlet, RouterLink],
})
export class BlogComponent {
    private readonly postService = inject(PostService);
    /** The five most recent posts, for the sidebar */
    readonly posts = computed(() => this.postService.postList().slice(0, 5));
    readonly featuredImageSizes = '240px';

    featuredPostImage(post: Post) {
        return buildOptimizedImageUrl(post.image, {
            width: 480,
            height: 300,
            fit: 'cover',
            quality: IMAGE_QUALITY.feature,
        });
    }

    featuredPostImageSet(post: Post) {
        return buildResponsiveImageSet(post.image, [240, 480], {
            width: 240,
            height: 150,
            fit: 'cover',
            quality: IMAGE_QUALITY.feature,
        });
    }
}
