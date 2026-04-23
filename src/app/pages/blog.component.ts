import { Component, Signal, computed } from '@angular/core';
import { Post, PostService } from '../shared/post.service';
import { RouterOutlet, RouterLink } from '@angular/router';
import { buildOptimizedImageUrl, buildResponsiveImageSet, IMAGE_QUALITY } from '../shared/image-url';

@Component({
    templateUrl: './blog.component.html',
    imports: [RouterOutlet, RouterLink],
})
export class BlogComponent {
    posts: Signal<Post[]>;
    postDefaultImage: 'zzzz.png';
    readonly featuredImageSizes = '240px';

    constructor(posts: PostService) {
        this.posts = computed(() => posts.postList().slice(0, 5));
    }

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
