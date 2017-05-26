import { Component, OnInit, ComponentFactoryResolver, ComponentRef, ComponentFactory, ElementRef, Injector, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { DomSanitizer } from '@angular/platform-browser';

import { PostService } from '../shared/post.service';
import 'rxjs/add/operator/switchMap';

import * as Showdown from 'showdown';

import { EmbedComponents } from '../embeddable/embeddable.module';


interface EmbeddedComponentFactory {
    contentPropertyName: string;
    factory: ComponentFactory<any>;
}

@Component({
    templateUrl: './views/blog-post.component.html',
})
export class BlogPostComponent {
    post;
    embeddedComponents = [];
    embeddedComponentFactories: Map<string, EmbeddedComponentFactory> = new Map();
    hostElement;

    constructor(activatedRoute: ActivatedRoute,
        posts: PostService,
        title: Title,
        componentFactoryResolver: ComponentFactoryResolver,
        elementRef: ElementRef,
        private injector: Injector,
        private sanitized: DomSanitizer) {
        this.hostElement = elementRef.nativeElement;

        activatedRoute.params.switchMap((params) => {
            let filter;
            if (!params['id']) {
                // If none specified, just get last, it should already be sorted by date
                filter = list => list[Object.keys(list)[Object.keys(list).length - 1]]
            } else {
                // Otherwise, get specified
                filter = list => list[params['id']];
            }
            return posts.data.map(response => {

                let item = filter(response);
                title.setTitle(item.title + ' | fluin.io blog');
                let converter = new Showdown.Converter();
                converter.setOption('noHeaderId', 'true');
                item.renderedBody = converter.makeHtml(item.body);
                item.renderedBody = this.sanitized.bypassSecurityTrustHtml(item.renderedBody.replace(/[\r\n]/g, ''));
                return item;
            })
        }).subscribe(post => {
            this.post = post;
            this.build();
        });

        for (const component of EmbedComponents) {
            const factory = componentFactoryResolver.resolveComponentFactory(component);
            console.log("Found the factory", factory);
            const selector = factory.selector;
            const contentPropertyName = this.selectorToContentPropertyName(selector);
            this.embeddedComponentFactories.set(selector, { contentPropertyName, factory });
            console.log(this.embeddedComponentFactories);
        }


    }
    build() {
        this.embeddedComponentFactories.forEach(({ contentPropertyName, factory }, selector) => {
            const embeddedComponentElements = this.hostElement.querySelectorAll(selector);

            // cast due to https://github.com/Microsoft/TypeScript/issues/4947
            for (const element of embeddedComponentElements as any as HTMLElement[]) {
                console.log("Evaluating element", element);
                // hack: preserve the current element content because the factory will empty it out
                // security: the source of this innerHTML is always authored by the documentation team
                // and is considered to be safe
                element[contentPropertyName] = element.innerHTML;
                this.embeddedComponents.push(factory.create(this.injector, [], element));
            }
        });
    }



    ngDoCheck() {
        this.build();
        this.embeddedComponents.forEach(comp => comp.changeDetectorRef.detectChanges());
    }
    ngOnDestroy() {
        // destroy these components else there will be memory leaks
        this.embeddedComponents.forEach(comp => comp.destroy());
    }

    /**
 * Compute the component content property name by converting the selector to camelCase and appending
 * 'Content', e.g. live-example => liveExampleContent
 * taken from https://github.com/angular/angular/blob/master/aio/src/app/layout/doc-viewer/doc-viewer.component.ts#L34
 */
    private selectorToContentPropertyName(selector: string) {
        return selector.replace(/-(.)/g, (match, $1) => $1.toUpperCase()) + 'Content';
    }
}
