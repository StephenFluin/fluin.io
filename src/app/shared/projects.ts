export interface Project {
    name: string;
    imageSrc: string;
    imageAlt: string;
    description: string;
    url: string;
    /** GitHub repo as "owner/name". Its last push date is shown as "Updated …". */
    repo?: string;
    /** Private repos are only used for the updated date, never linked */
    privateRepo?: boolean;
}

/** Shared with the server, which only looks up repos listed here */
export const PROJECTS: Project[] = [
    {
        name: 'bingo.fluin.io',
        imageSrc: '/assets/images/projects/bingo.webp',
        imageAlt: 'Screenshot of bingo.fluin.io',
        description:
            'A fast, browser-based bingo game with randomized cards and drawing support, built to be easy to run during live events.',
        url: 'https://bingo.fluin.io',
        repo: 'StephenFluin/bingo',
    },
    {
        name: 'alerts.fluin.io',
        imageSrc: '/assets/images/projects/alerts.webp',
        imageAlt: 'Screenshot of alerts.fluin.io',
        description:
            'A scoped alerting dashboard for tracking updates by product area, with filtering and RSS support for targeted notifications.',
        url: 'https://alerts.fluin.io',
        repo: 'StephenFluin/scopedalerts',
    },
    {
        name: 'fidget.fluin.io',
        imageSrc: '/assets/images/projects/fidget.webp',
        imageAlt: 'Screenshot of fidget.fluin.io',
        description:
            'A playful digital fidget spinner experience focused on smooth interaction and simple, tactile visual feedback.',
        url: 'https://fidget.fluin.io',
        repo: 'StephenFluin/fidget-spinner',
    },
    {
        name: 'prices.fluin.io',
        imageSrc: '/assets/images/projects/prices.webp',
        imageAlt: 'Screenshot of prices.fluin.io',
        description:
            'PokePrice is a Pokemon TCG price tracker that compares set-level and card-level market prices across multiple releases.',
        url: 'https://prices.fluin.io',
        repo: 'StephenFluin/pokemon-price-monitor',
        privateRepo: true,
    },
    {
        name: 'stoic.fluin.io',
        imageSrc: '/assets/images/projects/stoic.webp',
        imageAlt: 'Screenshot of stoic.fluin.io',
        description:
            'A daily Stoic meditation app with focused reading and reflection prompts aimed at consistency and practical philosophy.',
        url: 'https://stoic.fluin.io',
        repo: 'StephenFluin/stoic.fluin.io',
    },
    {
        name: 'baby.fluin.io',
        imageSrc: '/assets/images/projects/baby.webp',
        imageAlt: 'Screenshot of baby.fluin.io',
        description:
            'A baby logging app for parents to quickly track sleep, feeding, and everyday care events in one simple timeline.',
        url: 'https://baby.fluin.io',
        repo: 'StephenFluin/baby-log',
    },
    {
        name: 'match.fluin.io',
        imageSrc: '/assets/images/projects/match.webp',
        imageAlt: 'Screenshot of match.fluin.io',
        description:
            'A memory-match game using emoji cards, designed as a quick challenge that tests recall and pattern recognition.',
        url: 'https://match.fluin.io',
        repo: 'StephenFluin/match',
    },
    {
        name: 'money.fluin.io',
        imageSrc: '/assets/images/projects/money.avif',
        imageAlt: 'Screenshot of money.fluin.io',
        description:
            'A personal spending tracker that imports bank and card statements, learns your categories, and shows where money goes month by month.',
        url: 'https://money.fluin.io',
        repo: 'StephenFluin/money.fluin.io',
        privateRepo: true,
    },
    {
        name: 'devrel.nexus',
        imageSrc: '/assets/images/projects/devrel.avif',
        imageAlt: 'Screenshot of devrel.nexus',
        description:
            'A guide to Developer Relations covering the people, processes, artifacts, and outcomes that make DevRel teams effective.',
        url: 'https://devrel.nexus',
        repo: 'StephenFluin/devrel.nexus',
    },
    {
        name: 'devfest.mn',
        imageSrc: '/assets/images/projects/devfest.avif',
        imageAlt: 'Screenshot of devfest.mn',
        description:
            'The website for DevFestMN, a one-day Minneapolis developer conference covering AI, software engineering, and Google platforms.',
        url: 'https://devfest.mn',
        repo: 'StephenFluin/devfest-mn',
    },
];
