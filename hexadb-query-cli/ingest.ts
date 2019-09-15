
import * as inquirer from 'inquirer';
import { ingest } from './client';

export async function ingestPrompt(baseUrl: string) {
    const urlQuestion = [
        {
            type: 'input',
            name: 'url',
            message: "URL",
            default: "https://gist.githubusercontent.com/angshuman/05df4eca9661bd28858f09bc060a0607/raw/8b59761ea3d36e106824890b190920cdf2926104/med_region.json"
        }
    ];
    const answer = await inquirer.prompt(urlQuestion);
    if (!answer.url) {
        console.log('Invalid url');
        return;
    }

    await ingest(baseUrl, answer.url.toString());
}