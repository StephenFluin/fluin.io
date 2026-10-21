import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { JsonLdService, PERSON_SCHEMA } from '../shared/jsonld.service';

@Component({
    templateUrl: './bio.component.html',
    imports: [RouterLink],
})
export class BioComponent {
    constructor() {
        const jsonLd = inject(JsonLdService);
        jsonLd.setSchema({
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            url: 'https://fluin.io/bio',
            mainEntity: PERSON_SCHEMA,
        });
        inject(DestroyRef).onDestroy(() => jsonLd.removeSchemas());
    }
}
