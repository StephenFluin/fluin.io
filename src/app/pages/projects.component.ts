import { DatePipe } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    DATA_STORE_LABELS,
    HOST_LABELS,
    PROJECTS,
    RENDERING_LABELS,
    type ProjectInfo,
} from '../shared/projects';

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
    /** Newer info from a rescan, if the cached info had expired */
    private readonly refreshed = signal<Record<string, ProjectInfo> | null>(null);

    /** Most recently updated first. Projects without a date keep their listed order at the end. */
    readonly projects = computed(() => {
        const info = this.refreshed() ?? (this.info.hasValue() ? this.info.value() : {});
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
        const http = inject(HttpClient);
        const destroyRef = inject(DestroyRef);

        // Rescanning takes a few seconds, so it's a separate request the page never waits on.
        // Only browsers send it, and the server skips the scan while its cache is fresh.
        afterNextRender(() => {
            http.post<Record<string, ProjectInfo> | null>('/api/project-info/refresh', null)
                .pipe(takeUntilDestroyed(destroyRef))
                .subscribe({
                    next: (info) => info && this.refreshed.set(info),
                    error: () => {},
                });
        });
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
