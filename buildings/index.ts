import * as rp from 'request-promise';
import * as fs from 'fs';

const names = require("docker-names");
const shortid = require("shortid");

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
    room: 16,
    sensor: 1,
};

const requestQueue: any[] = [];

function getRandom(min: number, max: number, precision: number = 2) {
    return +((Math.random() * (max - min)) + min).toFixed(precision);
}

const states = ["stopped", "stopped", "running", "running", "running", "running", "running", "running", "running", "error"];

function getRandomState() {
    const i = Math.floor(((Math.random() * 10)));
    return states[i];
}

const entityCounts = Object.assign({}, config);
Object.keys(entityCounts).filter(x => entityCounts[x] = 0);

function createEntity(config: object, index: number, parent: string): object[] {
    const type = Object.keys(config)[index];
    const count = config[type];

    if (!type) {
        return [];
    }

    const childType = Object.keys(config)[index + 1];
    const ids = [];

    for (let i = 0; i < count; i++) {
        const desc = `${parent}:${type}:${i}`;
        if (childType) {
            const id = shortid.generate();
            ids.push({ id });
            const children = createEntity(config, index + 1, desc);
            const entity: any = {
                id,
                description: desc,
                type,
                name: `Entity ${type} ${entityCounts[type]++}`,
                tag: names.getRandomName()
            };

            entity[childType + "s"] = children
            requestQueue.push(entity);
        } else {
            //  leaf
            const sensorId = shortid.generate();

            ids.push({ id: sensorId });

            const sensor: any = {
                id: sensorId,
                description: desc,
                type: 'sensor',
                name: `${type} ${entityCounts[type]++}`,
                tag: names.getRandomName(),


                firmware: getRandom(0, 2, 1).toString(),
                temperature: getRandom(50, 100),
                humidity: getRandom(70, 100),
                pressure: getRandom(900, 1100),
                marker: {
                    status: getRandomState(),
                    red: getRandom(0, 10),
                    blue: getRandom(0, 10),
                    green: getRandom(0, 10),
                    location: {
                        lat: getRandom(47.6, 47.7, 5),
                        long: getRandom(122.3, 122.4, 5)
                    }
                }
            };

            requestQueue.push(sensor);

            const occupancyId = shortid.generate();

            ids.push({ id: occupancyId });

            const occupancy = {
                id: occupancyId,
                description: desc + ':occupancy',
                type: 'occupancy',
                name: `${type} ${entityCounts[type]++}`,
                tag: names.getRandomName(),
                firmware: getRandom(0, 2, 1).toString(),
                occupancy: getRandom(0, 10, 0),
                lastMeeting: {
                    number: getRandom(1, 10, 0),
                    forMinutes: getRandom(10, 60, 0)
                },
                corner1: {
                    temperature: getRandom(50, 100),
                    humidity: getRandom(70, 100)
                },
                corner2: {
                    temperature: getRandom(50, 100),
                    humidity: getRandom(70, 100)
                }
            };

            requestQueue.push(occupancy);
        }
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

async function print() {
    createEntity(config, 0, 'r');
    requestQueue.push(Object.assign({ id: 'stats' }, entityCounts));
    fs.writeFileSync('region.json', JSON.stringify(requestQueue, null, 2));
}

print();
