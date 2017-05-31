import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { TalkService } from '../shared/talk.service';

@Component({
    templateUrl: './talks.component.html',
})
export class TalksComponent {
    talks: Observable<any[]>;
    constructor(talks: TalkService) {
        this.talks = talks.data;
    }
}
