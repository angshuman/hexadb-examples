import * as rp from 'request-promise';

export async function patch(baseurl: string, body: any) {
    try {
        const rsp = await rp(`${baseurl}/json`, {
            method: 'PATCH',
            json: true,
            body,
            resolveWithFullResponse: true
        });
        console.log(`Response Code: ${rsp.statusCode}`);
    } catch (e) {
        console.error('Failed', e.message);
        throw e;
    }
}

export async function query(baseurl: string, query: object): Promise<any> {
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

export async function get(baseurl: string, id: string, level: string): Promise<any> {
    const queryUrl = level ? `${baseurl}/${id}?level=${level}` : `${baseurl}/${id}`;
    try {
        const rsp = await rp(queryUrl, {
            method: 'GET',
            json: true,
            resolveWithFullResponse: true
        });
        console.log(`Response Code: ${rsp.statusCode}`);
        return rsp.body;
    } catch (e) {
        console.error('Failed', e.message);
    }
}