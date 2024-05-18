export function keyify<T>(source: T[]) {
    for (let key of Object.keys(source)) {
        source[key]['key'] = key;
    }
}
