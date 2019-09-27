import * as rp from 'request-promise';
import * as clui from 'clui';

const inq = require('inquirer');
const names = require("docker-names");
const shortid = require("shortid");

const appId = 'app-load-01';

const requestQueue: any[] = [];

function getRandom(min: number, max: number, precision: number = 2) {
    return +((Math.random() * (max - min)) + min).toFixed(precision);
}

const states = ["stopped", "stopped", "running", "running", "running", "running", "running", "running", "running", "error"];

function getRandomState() {
    const i = Math.floor(((Math.random() * 10)));
    return states[i];
}

function createEntity(index: number) {
    const sensorId = shortid.generate();
    const sensor: any = {
        id: sensorId,
        description: `Device ${index}`,
        type: 'sensor',
        tag: names.getRandomName(),

        firmware: getRandom(0, 2, 1).toString(),
        temperature: getRandom(50, 100),
        humidity: getRandom(70, 100),
        pressure: getRandom(900, 1100)
    };
    requestQueue.push(sensor);
}

async function postEntity(host:string, entity: any) {
    const uri = `${host}/api/store/${appId}/json`;
    try {
        const rsp = await rp(uri, {
            method: 'PATCH',
            json: true,
            body: entity,
        });
        return rsp;
    } catch (err) {
        throw err;
    }
}

async function load(config: any) {
    console.log()
    const total = parseInt(config.total);
    const batchSize = parseInt(config.batch);

    console.log('creating request queue');
    const progress1 = new clui.Progress(20);

    for (let i = 0; i < total; i++) {
        createEntity(i);
        // process.stdout.write("\r\x1b[K");
        // process.stdout.write(progress1.update(i, total));
    }

    console.log('posting data');

    const progress2 = new clui.Progress(50);

    let errCount = 0;
    let lastErrCount = 0;

    const start = new Date().getTime();

    while (requestQueue.length > 0) {
        const batch = requestQueue.splice(0, batchSize);
        const promises = batch.map(x => postEntity(config.connection, x));
        try {
            await Promise.all(promises);
        } catch (err) {
            errCount++;
        }
        if (lastErrCount != errCount) {
            console.log(`error count ${errCount}`);
            console.log();
        }
        process.stdout.write("\r\x1b[K");
        process.stdout.write(progress2.update(total - requestQueue.length, total));
        
    }

    const latency = new Date().getTime() - start;
    console.log(`Total time: ${latency}ms`);
    console.log(`req/sec: ${(total * 1.0 )/(latency / 1000)}`);
}


async function prompt() {
    const questions = [
        {
            type: 'input',
            name: 'connection',
            default: 'http://localhost:8000',
            message: 'Headb host url'
        },
        {
            type: 'input',
            name: 'total',
            default: 10000,
            message: 'Total instances'
        },
        {
            type: 'input',
            name: 'batch',
            default: 100,
            message: 'Batch size'
        },
        {
            type: 'input',
            name: 'app',
            default: 'app-load-01',
            message: 'App'
        }
    ];

    const config = await inq.prompt(questions);
    return config;
}

async function run() {
    load(await prompt());
}

run();
