import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, DestroyRef, computed, inject } from '@angular/core';
import {
    DATA_STORE_LABELS,
    HOST_LABELS,
    PROJECTS,
    RENDERING_LABELS,
    type ProjectInfo,
} from '../shared/projects';
import { JsonLdService } from '../shared/jsonld.service';

interface TechBadge {
    label: string;
    icon?: 'angular' | 'firebase';
}

@Component({
    templateUrl: './projects.component.html',
    imports: [DatePipe],
})
export class ProjectsComponent {
    /** Detected info for each project, keyed by project name */
    private readonly info = httpResource<Record<string, ProjectInfo>>(() => '/api/project-info');

    /** Most recently updated first. Projects without a date keep their listed order at the end. */
    readonly projects = computed(() => {
        const info = this.info.hasValue() ? this.info.value() : {};
        return PROJECTS.map((project) => {
            const details = info[project.name] ?? project.tech ?? {};
            return {
                ...project,
                updatedAt: details.updatedAt,
                badges: techBadges(details),
            };
        }).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    });

    constructor() {
        const jsonLd = inject(JsonLdService);
        jsonLd.setSchema({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Projects',
            url: 'https://fluin.io/projects',
            author: { '@id': 'https://fluin.io/#person' },
            mainEntity: {
                '@type': 'ItemList',
                itemListElement: PROJECTS.map((project, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                        '@type': 'WebApplication',
                        name: project.name,
                        url: project.url,
                        description: project.description,
                        image: `https://fluin.io${project.imageSrc}`,
                        applicationCategory: 'WebApplication',
                        author: { '@id': 'https://fluin.io/#person' },
                        ...(project.repo && !project.privateRepo
                            ? { sameAs: `https://github.com/${project.repo}` }
                            : {}),
                    },
                })),
            },
        });
        inject(DestroyRef).onDestroy(() => jsonLd.removeSchemas());
    }
}

function techBadges(info: ProjectInfo): TechBadge[] {
    const badges: TechBadge[] = [];
    if (info.framework) {
        badges.push({
            label: info.version ? `${info.framework} ${info.version}` : info.framework,
            icon: info.framework === 'Angular' ? 'angular' : undefined,
        });
    }
    if (info.zoneless) {
        badges.push({ label: 'Zoneless' });
    }
    if (info.rendering) {
        badges.push({ label: RENDERING_LABELS[info.rendering] });
    }
    if (info.host) {
        badges.push({ label: HOST_LABELS[info.host], icon: info.host === 'github-pages' ? undefined : 'firebase' });
    }
    for (const store of info.dataStores ?? []) {
        badges.push({
            label: DATA_STORE_LABELS[store],
            icon: store === 'mariadb' ? undefined : 'firebase',
        });
    }
    return badges;
}
