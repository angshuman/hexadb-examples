
import * as inquirer from 'inquirer';
import { ingest } from './client';

export async function ingestPrompt(baseUrl: string) {
    const urlQuestion = [
        {
            type: 'input',
            name: 'url',
            message: "URL",
            default: "https://gist.githubusercontent.com/angshuman/2c401165a2bb4f76d581779e96d4a0ff/raw/a37c997e664ed8e548145c36b18adb038ad0a2ac/Regions1.json"
        }
    ];
    const answer = await inquirer.prompt(urlQuestion);
    if (!answer.url) {
        console.log('Invalid url');
        return;
    }

    await ingest(baseUrl, answer.url.toString());
}