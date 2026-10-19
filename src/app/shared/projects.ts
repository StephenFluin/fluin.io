export type Framework = 'Angular' | 'Eleventy';
export type Rendering = 'ssr' | 'ssg' | 'client' | 'static';
export type Host = 'app-hosting' | 'firebase-hosting' | 'github-pages';
export type DataStore = 'rtdb' | 'firestore' | 'storage' | 'mariadb';

/** What a project is built with. Each field is detected from GitHub, then the live site, then hardcoded. */
export interface ProjectTech {
    framework?: Framework;
    /** Major version, e.g. "22" */
    version?: string;
    rendering?: Rendering;
    /** Angular apps only: true if the app runs without zone.js */
    zoneless?: boolean;
    host?: Host;
    dataStores?: DataStore[];
}

/** Everything /api/project-info knows about a project */
export interface ProjectInfo extends ProjectTech {
    /** When the repo was last pushed to (ISO string) */
    updatedAt?: string;
}

export interface Project {
    name: string;
    imageSrc: string;
    imageAlt: string;
    description: string;
    url: string;
    /** GitHub repo as "owner/name". Its last push date is shown as "Updated …". */
    repo?: string;
    /** Private repos are only used for detection, never linked */
    privateRepo?: boolean;
    /** Folder within the repo holding package.json and firebase.json, when it isn't the root */
    repoDir?: string;
    /** Fallbacks for anything that can't be detected */
    tech?: ProjectTech;
}

export const RENDERING_LABELS: Record<Rendering, string> = {
    ssr: 'SSR',
    ssg: 'Prerendered',
    client: 'Client-rendered',
    static: 'Static',
};

export const HOST_LABELS: Record<Host, string> = {
    'app-hosting': 'App Hosting',
    'firebase-hosting': 'Firebase Hosting',
    'github-pages': 'GitHub Pages',
};

export const DATA_STORE_LABELS: Record<DataStore, string> = {
    rtdb: 'Realtime Database',
    firestore: 'Firestore',
    storage: 'Cloud Storage',
    mariadb: 'MariaDB',
};

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
        tech: { dataStores: ['firestore'] },
    },
    {
        name: 'stoic.fluin.io',
        imageSrc: '/assets/images/projects/stoic.webp',
        imageAlt: 'Screenshot of stoic.fluin.io',
        description:
            'A daily Stoic meditation app with focused reading and reflection prompts aimed at consistency and practical philosophy.',
        url: 'https://stoic.fluin.io',
        repo: 'StephenFluin/stoic.fluin.io',
        repoDir: 'web',
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
        tech: { dataStores: ['mariadb'] },
    },
    {
        name: 'devrel.nexus',
        imageSrc: '/assets/images/projects/devrel.avif',
        imageAlt: 'Screenshot of devrel.nexus',
        description:
            'A guide to Developer Relations covering the people, processes, artifacts, and outcomes that make DevRel teams effective.',
        url: 'https://devrel.nexus',
        repo: 'StephenFluin/devrel.nexus',
        tech: { rendering: 'static' },
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
    {
        name: 'starplan.fluin.io',
        imageSrc: '/assets/images/projects/starplan.avif',
        imageAlt: 'Screenshot of starplan.fluin.io',
        description:
            'Starplan is a fast, open source Stardew Valley farm planner for laying out buildings, crops, paths, and decor on any farm map.',
        url: 'https://starplan.fluin.io',
        repo: 'StephenFluin/starplan',
    },
    {
        name: 'friendlai.xyz',
        imageSrc: '/assets/images/projects/friendlai.avif',
        imageAlt: 'Screenshot of friendlai.xyz',
        description:
            'Friendlai serves open AI models from a network of community-run computers, with a web chat and an OpenAI-compatible API.',
        url: 'https://friendlai.xyz',
        repo: 'StephenFluin/friendlai',
        privateRepo: true,
        tech: { dataStores: ['mariadb'] },
    },
    {
        name: 'scan.fluin.io',
        imageSrc: '/assets/images/projects/scan.avif',
        imageAlt: 'Screenshot of scan.fluin.io',
        description:
            'A Pokemon card scanner that recognizes cards through your camera and adds them to a collection as you scan.',
        url: 'https://scan.fluin.io',
        repo: 'StephenFluin/card-scanner',
    },
    {
        name: 'pizza.fluin.io',
        imageSrc: '/assets/images/projects/pizza.avif',
        imageAlt: 'Screenshot of pizza.fluin.io',
        description:
            'Pizza Online, a browser-based pizza restaurant tycoon game inspired by the 1994 classic Pizza Tycoon, drawn entirely with PixiJS.',
        url: 'https://pizza.fluin.io',
        repo: 'StephenFluin/pizza-online',
    },
    {
        name: 'bundlesize.dev',
        imageSrc: '/assets/images/projects/bundlesize.avif',
        imageAlt: 'Screenshot of the bundlesize.dev report',
        description:
            'BundleSize.dev scans any site for its JavaScript size, frameworks, and delivery best practices, and benchmarks it against the rest of the web.',
        url: 'https://bundlesize.dev',
        repo: 'StephenFluin/watcher',
        privateRepo: true,
        tech: { dataStores: ['mariadb'] },
    },
    {
        name: 'TrollAttack',
        imageSrc: '/assets/images/projects/trollattack.avif',
        imageAlt: 'Screenshot of the TrollAttack telnet welcome screen',
        description:
            'TrollAttack is a SMAUG-style telnet MUD written in Java in 2005, with over 500 rooms to explore and still running today.',
        url: 'https://trollattack.com',
        repo: 'StephenFluin/trollattack',
    },
];
