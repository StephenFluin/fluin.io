import { Component } from '@angular/core';

interface Project {
    name: string;
    imageSrc: string;
    imageAlt: string;
    description: string;
    url: string;
    github: string;
}

@Component({
    templateUrl: './projects.component.html',
    standalone: true,
})
export class ProjectsComponent {
    readonly projects: Project[] = [
        {
            name: 'bingo.fluin.io',
            imageSrc: '/assets/images/projects/bingo.png',
            imageAlt: 'Screenshot of bingo.fluin.io',
            description:
                'A fast, browser-based bingo game with randomized cards and drawing support, built to be easy to run during live events.',
            url: 'https://bingo.fluin.io',
            github: 'https://github.com/StephenFluin/bingo',
        },
        {
            name: 'alerts.fluin.io',
            imageSrc: '/assets/images/projects/alerts.png',
            imageAlt: 'Screenshot of alerts.fluin.io',
            description:
                'A scoped alerting dashboard for tracking updates by product area, with filtering and RSS support for targeted notifications.',
            url: 'https://alerts.fluin.io',
            github: 'https://github.com/StephenFluin/scopedalerts',
        },
        {
            name: 'fidget.fluin.io',
            imageSrc: '/assets/images/projects/fidget.png',
            imageAlt: 'Screenshot of fidget.fluin.io',
            description:
                'A playful digital fidget spinner experience focused on smooth interaction and simple, tactile visual feedback.',
            url: 'https://fidget.fluin.io',
            github: 'https://github.com/StephenFluin/fidget-spinner',
        },
        {
            name: 'prices.fluin.io',
            imageSrc: '/assets/images/projects/prices.png',
            imageAlt: 'Screenshot of prices.fluin.io',
            description:
                'PokePrice is a Pokemon TCG price tracker that compares set-level and card-level market prices across multiple releases.',
            url: 'https://prices.fluin.io',
            github: 'https://github.com/StephenFluin/pokemon-price-monitor',
        },
        {
            name: 'stoic.fluin.io',
            imageSrc: '/assets/images/projects/stoic.png',
            imageAlt: 'Screenshot of stoic.fluin.io',
            description:
                'A daily Stoic meditation app with focused reading and reflection prompts aimed at consistency and practical philosophy.',
            url: 'https://stoic.fluin.io',
            github: 'https://github.com/StephenFluin/stoic.fluin.io',
        },
        {
            name: 'baby.fluin.io',
            imageSrc: '/assets/images/projects/baby.png',
            imageAlt: 'Screenshot of baby.fluin.io',
            description:
                'A baby logging app for parents to quickly track sleep, feeding, and everyday care events in one simple timeline.',
            url: 'https://baby.fluin.io',
            github: 'https://github.com/StephenFluin/baby-log',
        },
        {
            name: 'match.fluin.io',
            imageSrc: '/assets/images/projects/match.png',
            imageAlt: 'Screenshot of match.fluin.io',
            description:
                'A memory-match game using emoji cards, designed as a quick challenge that tests recall and pattern recognition.',
            url: 'https://match.fluin.io',
            github: 'https://github.com/StephenFluin/match',
        },
    ];
}
