import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed } from '@angular/core';
import { PROJECTS } from '../shared/projects';

@Component({
    templateUrl: './projects.component.html',
    imports: [DatePipe],
})
export class ProjectsComponent {
    /** Last push date (ISO string) of each project's repo, keyed by "owner/name" */
    private readonly updates = httpResource<Record<string, string>>(() => '/api/project-updates');

    readonly projects = computed(() => {
        const updates = this.updates.hasValue() ? this.updates.value() : {};
        return PROJECTS.map((project) => ({
            ...project,
            updatedAt: project.repo ? updates[project.repo] : undefined,
        }));
    });
}
