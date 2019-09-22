#!/usr/bin/env node
import * as dotenv from 'dotenv';
import { EventProcessorHost, delay, PartitionContext, EventData, MessagingError } from '@azure/event-processor-host';
import { patch } from './client';

dotenv.config();

const config = getConfig();

async function run() {
    const eph = EventProcessorHost.createFromConnectionString(
        EventProcessorHost.createHostName(config.ephName),
        config.storageConnection,
        config.storageContainer,
        config.ehConnection
    );

    eph.start(onReceive, onError);
}

async function onReceive(context: PartitionContext, eventData: EventData): Promise<void> {
    let type: 'data' | 'properties' = 'data';
    let deviceId = eventData.annotations && eventData.annotations["iothub-connection-device-id"];
    if (!deviceId) {
        const atid: string = eventData.body['@id'];
        deviceId = atid && atid.split(':').splice(-1)[0];
        type = 'properties';
    }

    if (!deviceId) {
        console.error('Wow! no device id');
        return;
    }

    switch (type) {
        case 'data':
            const data = {
                id: deviceId,
                type: 'device',
                data: eventData.body
            }
            await patch(config.hexastore, data);
            break;
        case 'properties':
            const properties = {
                id: deviceId,
                type: 'device',
                displayName: eventData.body.displayName,
                instanceOf: eventData.body.instanceOf,
                simulated: eventData.body.simulated,
                data : eventData.body.data
            };
            await patch(config.hexastore, properties);
            break;
    }
}

function onError(error: MessagingError | Error) {
    console.error(error.message);
}

function getConfig(): any {
    return {
        ehConnection: process.env.EVENT_HUB_CONNECTION,
        ehName: process.env.EVENT_HUB_NAME,
        storageConnection: process.env.STORAGE_CONNECTION_STRING,
        storageContainer: 'hexcde1',
        ephName: 'eph1',
        hexastore: process.env.HEXASTORE_TARGET_PATH
    }
}

run();