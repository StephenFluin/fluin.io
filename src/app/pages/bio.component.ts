import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { JsonLdService, PERSON_SCHEMA } from '../shared/jsonld.service';

/** Recorded talks, newest first */
const TALKS = [
    {
        year: 2025,
        event: 'HeroDevs',
        title: 'Lessons Learned From Moving 2 Million Engineers from AngularJS to Angular',
        url: 'https://www.youtube.com/watch?v=imPpCWyAaD4',
    },
    {
        year: 2021,
        event: 'ng-conf',
        title: 'Day 1 Keynote, with Jessica Janiuk and Emma Twersky',
        url: 'https://www.youtube.com/watch?v=uqYf9gEAlvw',
    },
    { year: 2020, event: 'AngularNL', title: 'Performance Matters', url: 'https://www.youtube.com/watch?v=arQKMwwMcTc' },
    {
        year: 2020,
        event: 'ng-conf: Hardwired',
        title: 'Common Challenges Facing Angular Enterprises',
        url: 'https://www.youtube.com/watch?v=rMOufrAXUog',
    },
    { year: 2020, event: 'Angular Turkey', title: 'Build like Google', url: 'https://www.youtube.com/watch?v=HFPIPMCtp9A' },
    { year: 2019, event: 'Google I/O', title: "What's new in Angular", url: 'https://www.youtube.com/watch?v=FiVw6zjgw24' },
    { year: 2016, event: 'AngularConnect', title: 'Angular CLI', url: 'https://www.youtube.com/watch?v=uBRK6cTr4Vk' },
];

const SHORT_BIO =
    'Stephen Fluin is Head of DevRel at Buildkite, a former Angular core team member, and an Angular GDE. He has spent his career helping developers ship faster.';

const LONG_BIO = [
    'Stephen is Head of DevRel at Buildkite, a former Angular core team member, and a current Angular GDE. He has spent his career helping developers ship faster. Stephen believes that with the right tools, and by staying in front of the wave of AI innovation, everyone can be more effective.',
    'With ~25 years in the Software Development industry, Stephen has served as an executive technologist, consultant, and entrepreneur at Google, Trello, Chainlink Labs, and more.',
    'He builds and runs his own apps, like friendlai.xyz, end to end with AI coding agents, and shares what worked, what broke, and why.',
];

@Component({
    templateUrl: './bio.component.html',
    imports: [RouterLink],
})
export class BioComponent {
    protected readonly talks = TALKS;
    protected readonly shortBio = SHORT_BIO;
    protected readonly longBio = LONG_BIO;

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
