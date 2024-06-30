import react from '@vitejs/plugin-react'
import { config } from 'dotenv'
import { defineConfig } from 'vite'

config()

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		proxy: {
			'/messages': 'https://api.anthropic.com/v1',
		},
	},
	plugins: [react()],
	define: {
		'process.env.ANTHROPIC_API_KEY': JSON.stringify(process.env.ANTHROPIC_API_KEY),
		'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
		'process.env.OPENAI_ASSISTANT_ID': JSON.stringify(process.env.OPENAI_ASSISTANT_ID),
		'process.env.OPENAI_FUNCTIONS_ASSISTANT_ID': JSON.stringify(
			process.env.OPENAI_FUNCTIONS_ASSISTANT_ID
		),
	},
	assetsInclude: ['**/*.tldr', '**/*.md'],
})
