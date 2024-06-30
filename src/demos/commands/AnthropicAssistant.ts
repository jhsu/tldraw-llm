import {createAnthropic} from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import commandsPrompt from './commands-prompt-structured.md'
import { fetchText } from '../../lib/fetchText'

import { Schema } from "./schemas";

// import dotenv from 'dotenv'

// dotenv.config()

const anthropic = createAnthropic({
	baseURL: 'http://localhost:5173/',
})

const model = anthropic("claude-3-haiku-20240307")

const getSystemPrompt = () => {
	return fetchText(commandsPrompt)
}

export async function getInstructions(prompt="") {
	const resp = await generateObject({
		model,
		prompt,
		system: await getSystemPrompt(),
		temperature: 0.8,
		maxRetries: 3,
		schema: Schema,
	})
	return resp.object
}

// (async () => {
// 	const { object } = await generateAnthropicObject("Create a red circle at 100, 100 with a radius of 50")
// 	console.log(object)
// })()