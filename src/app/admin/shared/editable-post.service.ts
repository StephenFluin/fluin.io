import { Injectable } from '@angular/core';
import { Post, PostService } from '../../shared/post.service';
import { FirebaseService } from '../firebase.service';
import { remove as deleteDB } from 'firebase/database';

@Injectable()
export class EditablePostService {
    constructor(public firebaseService: FirebaseService, public ps: PostService) {}
    save(post: Post) {
        const key = post.key;
        const path = '/posts/' + post.id;
        if (post.key) {
            delete post.key;
        }
        if (post.id && post.id.length >= 3) {
            this.firebaseService.set(path, post).then(console.log, console.error);
        } else {
            console.error("Won't save without an id of at least 3 characters");
        }
        this.ps.refreshData();
    }
    delete(post: Post) {
        if (post.id && confirm('Are you sure you want to delete this post?')) {
            return deleteDB(this.firebaseService.dbRef('/posts/' + post.id));
        } else {
            console.error("Couldn't find post to delete or user cancelled.");
        }
    }
}
