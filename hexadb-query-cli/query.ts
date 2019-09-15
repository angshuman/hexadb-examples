import * as inquirer from 'inquirer';
import { query, get } from './client';
import Table = require('cli-table');
import * as pretty from 'prettyjson';

export async function getPrompt(baseurl: string) {
    const idQuestion = [
        {
            type: 'input',
            name: 'id',
            message: "Id",
            validate: (v: string) => {
                if (v) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'level',
            message: "Expand level",
            default: 2,
            validate: (v: string) => {
                if (parseInt(v) >= 0) {
                    return true;
                }
                return false;
            }
        },

    ];
    const answer = await inquirer.prompt(idQuestion);
    const rsp = await get(baseurl, answer.id.toString(), answer.level.toString());
    if (rsp) {
        print([rsp], null);
        console.log(pretty.render(rsp));
    }
}

export async function queryPrompt(baseurl: string) {
    let answer = { text: '' };
    let context: any = null;
    while (answer.text !== 'run') {
        const queryQuestion = [
            {
                type: 'input',
                name: 'text',
                message: "Filter",
                default: 'run',
                validate: (v: string) => {
                    if (v.length === 0) {
                        return false;
                    }
                    if (v === 'run' && context == null) {
                        return false;
                    }
                    if (v === 'run' || v === 'outgoing' || v === 'incoming') {
                        return true;
                    }
                    const parts = v.trim().split(' ');
                    return parts.length === 3;
                }
            }
        ];
        answer = await inquirer.prompt(queryQuestion);
        if (answer.text === 'run') {
            console.log('Running');
            var rsp = await query(baseurl, context);
            print(rsp.values, rsp.continuation);
            return;
        }

        if (answer.text === 'outgoing' || answer.text === 'incoming') {
            const targetQuestion = [
                {
                    type: 'input',
                    name: 'target',
                    message: `${answer.text} Format: <path> <level> <filter>`,
                    validate: (v: string) => {
                        const parts = v.trim().split(' ');
                        return parts.length === 5;
                    }
                }
            ];
            const targetAnswer = await inquirer.prompt(targetQuestion);
            context = await addTarget(context, answer.text, targetAnswer.target.toString());

        } else {
            context = await addFilter(context, answer.text);
        }
    }
}

async function addTarget(context: any, targetType: string, target: string) {
    const parts = target.trim().split(' ');
    if (parts.length != 5) {
        console.error('Invalid filter');
        return;
    }
    const path = parts[0];
    const level = parts[1] === '_' ? undefined : parseInt(parts[1]);

    const targetFilter = await addFilter({}, `${parts[2]} ${parts[3]} ${parts[4]}`)
    context[targetType] = context[targetType] || [];
    context[targetType].push({
        path,
        level,
        target: {
            filter: targetFilter.filter
        }
    });
    return context;
}

async function addFilter(context: any, text: string) {
    context = context || {};
    context.filter = context.filter || {};

    const parts = text.trim().split(' ');
    if (parts.length != 3) {
        console.error('Invalid: ' + text);
        throw { message: 'cannot parse query: ' + text };
    }

    const stringValue = parts[2];
    const numberValue = parseFloat(stringValue);

    context.filter[parts[0]] = {
        op: parts[1],
        value: numberValue ? numberValue : stringValue
    };
    return context;
}

function print(values: any[], continutation: any) {
    if (values.length === 0) {
        console.error('Empty');
        return;
    }
    const first = values[0];

    const columns = {};
    for (const key in first) {
        switch (typeof first[key]) {
            case 'object':
            case null:
            case undefined:
                break;
            default:
                columns[key] = true;
        }
    }

    const table = new Table({
        head: Object.keys(columns)
    });


    const rows = values.map(x => {
        const row = [];
        for (const key in columns) {
            row.push(x[key] || null);
        }
        table.push(row);
        return row;
    });

    console.log(table.toString());
    if (continutation) {
        console.log('Has More...');
    }
}