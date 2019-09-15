import * as rp from 'request-promise';

export async function ingest(baseurl: string, url: string) {
    const ingestUrl = `${baseurl}/ingest`;
    try {
        const rsp = await rp(ingestUrl, {
            method: 'POST',
            json: true,
            body: {
                url
            },
            resolveWithFullResponse: true
        });
        console.log(`Response Code: ${rsp.statusCode}`);
    } catch (e) {
        console.error('Failed', e.message);
    }
}

export async function query(baseurl:string, query: object) : Promise<any>{
    console.log(JSON.stringify(query, null, 2));
    if (!query) {
        console.error('No query');
        return {};
    }
    const queryUrl = `${baseurl}/query`;
    try {
        const rsp = await rp(queryUrl, {
            method: 'POST',
            json: true,
            body: query,
            resolveWithFullResponse: true
        });
        console.log(`Response Code: ${rsp.statusCode}`);
        return rsp.body;
    } catch (e) {
        console.error('Failed', e.message);
    }
}