import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        path: '**',
        renderMode: RenderMode.Prerender,
    },
    { path: 'blog/**', renderMode: RenderMode.Server },
    { path: 'admin/**', renderMode: RenderMode.Client },
];
