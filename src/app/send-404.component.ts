import { Component } from '@angular/core';

@Component({
    template: '<div style="margin:128px 16px;text-align:center;">Path not found. Forwarding to 404 error.</div>'
})
export class Send404Component {
    constructor() {
        window.location.assign('/404');
    }
}
