export async function getUrls(): Promise<string[]> {
    const request = await fetch('https://fluindotio-website-93127.firebaseio.com/posts.json');
    const body = await request.json();

    const result = [...Object.keys(body).map((key) => `/blog/${key}`), '/index.html', '/bio'];
    console.log('Results are:', result);
    return result;
}
