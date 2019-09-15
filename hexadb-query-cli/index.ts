#!/usr/bin/env node
import * as inquirer from 'inquirer';
import { ingestPrompt } from './ingest';
import { queryPrompt, getPrompt } from './query';

async function run() {
    const baseQuestions = [
        {
            type: 'rawlist',
            name: 'baseurl',
            message: "Base URL",
            choices: [
                "http://localhost:5000",
                "http://localhost:8000"]
        },
        {
            type: 'input',
            name: 'storeId',
            message: 'Store Id'
        }
    ];

    const answers = await inquirer.prompt(baseQuestions);
    const baseurl = `${answers.baseurl}/api/store/${answers.storeId}`;

    while (true) {
        const commandQuestion = [
            {
                type: 'rawlist',
                name: 'command',
                message: 'command',
                choices: ['query', 'get', 'ingest', 'exit'],
                default: "query"
            }
        ];

        const commandAnswer = await inquirer.prompt(commandQuestion);

        inquirer.createPromptModule();
        switch (commandAnswer.command) {
            case 'ingest':
                await ingestPrompt(baseurl);
                break;
            case 'query':
                await queryPrompt(baseurl);
                break;
            case "get":
                await getPrompt(baseurl);
                break;
            case 'exit':
                return 0;
        }
    }
}

run();