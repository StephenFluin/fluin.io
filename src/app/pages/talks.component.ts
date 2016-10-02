import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { TalkService } from '../shared/talk.service';

@Component({
    templateUrl: './views/talks.component.html',
})
export class TalksComponent {
    talks: Observable<any[]>;
    constructor(talks: TalkService) {
        this.talks = talks.data;
    }
}
