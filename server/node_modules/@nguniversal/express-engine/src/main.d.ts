import { Request, Response } from 'express';
import { NgModuleFactory, Type, StaticProvider } from '@angular/core';
/**
 * These are the allowed options for the engine
 */
export interface NgSetupOptions {
    bootstrap: Type<{}> | NgModuleFactory<{}>;
    providers?: StaticProvider[];
}
/**
 * These are the allowed options for the render
 */
export interface RenderOptions extends NgSetupOptions {
    req: Request;
    res?: Response;
    url?: string;
    document?: string;
}
/**
 * This is an express engine for handling Angular Applications
 */
export declare function ngExpressEngine(setupOptions: NgSetupOptions): (filePath: string, options: RenderOptions, callback: (err?: Error | null | undefined, html?: string | undefined) => void) => void;
