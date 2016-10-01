import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Post } from '../../shared/post.service';


@Injectable()
export class EditablePostService {
    constructor(public af:AngularFire) {

    }
    getObject(id: string): FirebaseObjectObservable<Post> {
        return this.af.database.object(`posts/${id}/`);
    }
    getPostList(): FirebaseListObservable<Post[]> {
        return this.af.database.list('posts');
    }
    save(post: Post): void {
        if(post.id) {
            let e = this.getObject(post.id);
            e.set(post);
        } else {
            let l = this.getPostList();
            let result = l.push(post);
            console.log(result);
            result.then(r => console.log("promise finished with",r));
            
        }
    }

}