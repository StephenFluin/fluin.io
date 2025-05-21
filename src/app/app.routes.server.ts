import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        path: '**',
        renderMode: RenderMode.Server,
    },
    { path: 'bio', renderMode: RenderMode.Prerender },
    {
        path: 'blog/:id/**',
        renderMode: RenderMode.Server,
    },
    { path: 'admin/**', renderMode: RenderMode.Client },
    { path: '404', renderMode: RenderMode.Server, status: 404 },
];
