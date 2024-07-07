import { z } from 'zod'
import { createAnthropic } from '@ai-sdk/anthropic'
import { convertToCoreMessages, generateObject } from 'ai'
import commandsPrompt from './commands-prompt-structured.md'
import { fetchText } from '../../lib/fetchText'

import { Schema } from "./schemas";
import { Assistant, Thread } from '../../Assistant';
import { Editor } from '@tldraw/tldraw';
import { getUserMessage } from './getUserMessage';
import { executeSequence } from './Executor'

// import dotenv from 'dotenv'

// dotenv.config()

const anthropic = createAnthropic({
	baseURL: 'http://localhost:5173/',
})

const model = anthropic("claude-3-haiku-20240307")

const getSystemPrompt = () => {
	return fetchText(commandsPrompt)
}

export async function getInstructions(prompt = "") {
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

export class AnthropicAssistant implements Assistant<z.infer<typeof Schema>> {
	systemPrompt: string = ""
	constructor() {
		getSystemPrompt().then((text) => {
			this.systemPrompt = text
		})
	}
	async getDefaultSystemPrompt(): Promise<string> {
		return await getSystemPrompt()
	}
	async setSystemPrompt(prompt: string): Promise<void> {
		this.systemPrompt = prompt
	}
	async createThread(editor: Editor) {
		console.log('new thread')
		return new AnthropicThread(editor, this.systemPrompt)
	}
}

export class AnthropicThread implements Thread<z.infer<typeof Schema>> {
	thread: { role: 'user' | 'assistant', content: string }[]
	systemPrompt: string
	constructor(readonly editor: Editor, systemPrompt: string) {
		this.systemPrompt = systemPrompt
		this.thread = []
	}
	getUserMessage(input: string): string {
		return getUserMessage(this.editor, input)
	}
	async sendMessage(userMessage: string) {
		this.thread.push({ role: 'user', content: userMessage })
		console.log('thread', convertToCoreMessages(this.thread))
		const resp = await generateObject({
			model,
			system: this.systemPrompt,
			messages: convertToCoreMessages(this.thread),
			temperature: 0.8,
			maxRetries: 3,
			schema: Schema,
		})
		// TODO: get the tool_id from the response
		// AI sdk mode or anthropic
		// https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-object#messages-content-type
		// https://docs.anthropic.com/en/docs/build-with-claude/tool-use
		this.thread.push({
			role: 'tool', content: [
				{
					type: 'tool-result',
					toolCallId: ''
					result: '',
				}
			]
		})
		return resp.object
	}
	async cancel(): Promise<void> {
		return Promise.resolve()
	}

	handleAssistantResponse(result: z.infer<typeof Schema>) {
		return executeSequence(this.editor, result.commands)
	}
}



// 	const { object } = await generateAnthropicObject("Create a red circle at 100, 100 with a radius of 50")
// 	console.log(object)
// })()
