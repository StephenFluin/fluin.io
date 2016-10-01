// Stolen from Ames project 2016-10-01

import { Pipe, PipeTransform } from '@angular/core';

/**
 * take in a firebase object map like
 * { "a": {
 *      "name":"myName",
 *      "description":"myDescription"
 *   },
 *   "b": {
 *      "name":"myName",
 *      "description":"myDescription"
 *   }
 * }
 * 
 * And turn it into
 * [{$key:"a",name:"myName","description":"myDescription"},{$key:"b",name:"myName","description":"myDescription"}]
 */
@Pipe({ name: 'refirebase' })
export class RefirebasePipe implements PipeTransform {
    transform(value: any, args?: any[]): any[] {
        if (value) {
            let keys = Object.keys(value);
            let output = [];
            keys.forEach(key => {
                let arrayItem = value[key];

                // Support firebase "true" key arrays
                if (arrayItem == true) {
                    output.push(key);
                } else if (key != "$key") {
                    let newItem = {$key:''};
                    (<any>Object).assign(newItem, arrayItem);
                    newItem.$key = key;
                    output.push(newItem);
                }
            });
            return output;
        }
    }
}