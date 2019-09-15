import * as rp from 'request-promise';

// const names = require("docker-names");
// const shortid = require("shortid");
// const chalk = require("chalk");
// const clui = require("clui");
// const Gauge = clui.Gauge;

const host = 'http://localhost:5000';
const appId = 'app006';

const config: object = {
    region: 2,
    zone: 2,
    building: 8,
    floor: 4,
    room: 2,
    sensor: 2,
};

const requestQueue: any[] = [];

function getRandom(min: number, max: number) {
    return +((Math.random() * (max - min)) + min).toFixed(2);
}

const states = ["stopped", "stopped", "running", "running", "running", "running", "running", "running", "running", "error"];

function getRandomState() {
    const i = Math.floor(((Math.random() * 10)));
    return states[i];
}

function createEntity(config: object, index: number, parent: string): object[] {
    const type = Object.keys(config)[index];
    const count = config[type];

    if (!type) {
        return [];
    }

    const childType = Object.keys(config)[index + 1];
    const ids = [];

    for (let i = 0; i < count; i++) {
        const id = `${parent}:${type}:${i}`;
        ids.push({ id });
        const children = createEntity(config, index + 1, id);
        const entity: any = {
            id,
            type,
            name: `Entity ${type} ${i}`,
        };

        if (childType) {
            entity[childType + "s"] = children
        } else {
            entity.temperature = getRandom(50, 70);
            entity.humidity = getRandom(0, 20);
            entity.pressure = getRandom(900, 1100);
            entity.marker = {
                status : getRandomState(),
                red: getRandom(0, 10),
                blue: getRandom(0, 10),
                green: getRandom(0, 10)
            };
        }
        requestQueue.push(entity);
    }
    return ids;
}

async function postEntity(entity: any) {
    const uri = `${host}/api/store/${appId}?strict=true`;
    try {
        const rsp = await rp(uri, {
            method: 'POST',
            json: true,
            body: entity,
        });
        return rsp;
    } catch (err) {
        return null;
    }
}

async function run() {
    createEntity(config, 0, 'r');
    for (var item of requestQueue) {
        console.log(JSON.stringify(item));
        await postEntity(item);
    }
}

// run().then(() => { console.log('Done') });

async function print() {
    createEntity(config, 0, 'r');
    console.log(JSON.stringify(requestQueue), null, 2);
}

print();
