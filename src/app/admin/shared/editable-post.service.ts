import { Injectable, inject } from '@angular/core';
import { Post } from '../../shared/post.service';
import { FirebaseService } from '../firebase.service';

/** Firebase keys can't contain . # $ [ ] or /, and "new" is the editor's create route. */
const VALID_SLUG = /^[A-Za-z0-9_-]{3,}$/;

@Injectable()
export class EditablePostService {
    private firebaseService = inject(FirebaseService);

    /** Returns an error message, or null if the post can be saved */
    validate(post: Post): string | null {
        if (!post.id || !VALID_SLUG.test(post.id) || post.id === 'new') {
            return 'The slug must be at least 3 letters, numbers, dashes, or underscores (and not "new").';
        }
        return null;
    }

    /**
     * Save the editable fields of a post. Other children of the post (like `images`) are left untouched.
     * @param savedId The slug the post is currently stored under, or 'new' if it isn't stored yet
     */
    async save(post: Post, savedId: string) {
        const error = this.validate(post);
        if (error) {
            throw new Error(error);
        }

        const fields = {
            id: post.id,
            title: post.title ?? '',
            image: post.image ?? '',
            date: post.date ?? '',
            body: post.body ?? '',
        };
        const path = `/posts/${post.id}`;

        if (post.id === savedId) {
            await this.firebaseService.update(path, fields);
            return;
        }

        // New post or changed slug: make sure we don't overwrite a different post
        if (await this.firebaseService.getOnce(path)) {
            throw new Error(`A post with the slug "${post.id}" already exists.`);
        }

        if (savedId === 'new') {
            await this.firebaseService.set(path, fields);
        } else {
            // Move the whole post (including its images) to the new slug
            const existing = await this.firebaseService.getOnce<object>(`/posts/${savedId}`);
            await this.firebaseService.set(path, { ...existing, ...fields });
            await this.firebaseService.remove(`/posts/${savedId}`);
        }
    }

    /** @returns true if the post was deleted, false if the user cancelled */
    async delete(savedId: string) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return false;
        }
        await this.firebaseService.remove(`/posts/${savedId}`);
        return true;
    }
}
