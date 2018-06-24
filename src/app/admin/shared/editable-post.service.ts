import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Post, PostService } from '../../shared/post.service';


@Injectable()
export class EditablePostService {
    constructor(public db: AngularFireDatabase, public ps: PostService) {

    }
    getObject(id: string): AngularFireObject<Post> {
        return this.db.object(`posts/${id}/`);
    }
    getPostList(): AngularFireList<Post> {
        return this.db.list('posts');
    }
    save(post: Post) {
        if(post.key !== undefined || post.key !== null) {
            delete post.key;
        }
        if (post.id) {
            let e = this.getObject(post.id);
            e.update(post).then(console.log, console.error);
        } else {
            let l = this.getPostList();
            l.push(post);
        }
        this.ps.refreshData();
    }
    delete(post: Post) {
        if (post.id && confirm('Are you sure you want to delete this post?')) {
            return this.getObject(post.id).remove();
        } else {
            console.error('Couldn\'t find post to delete');
        }
    }

}