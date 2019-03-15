import { ResourceLoader } from '@angular/compiler';
export declare class FileLoader implements ResourceLoader {
    get(url: string): Promise<string>;
}
