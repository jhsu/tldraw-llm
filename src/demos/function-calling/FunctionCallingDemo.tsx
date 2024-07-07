import { TLEditorComponents, Tldraw, createTLStore, defaultShapeUtils } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useEffect, useMemo, useState } from 'react'
import { UserPrompt } from '../../components/UserPrompt'
import { OpenAiWithFunctionCallingAssistant } from './OpenAiAssistantWithFunctionCalling'
import { AnthropicAssistant } from '../commands/AnthropicAssistant'

const components: TLEditorComponents = {
	InFrontOfTheCanvas: () => {
		const assistant = useMemo(() => new AnthropicAssistant(), [])
		return <UserPrompt assistant={assistant} />
	},
}

export default function FunctionCallingDemo() {
	const [store,] = useState(() => createTLStore({ shapeUtils: [...defaultShapeUtils] }))
	useEffect(() => {
		let unsubs = []
		let pendingChanges = []

		const handleChange = (event) => {
			if (event.source !== 'user') return
			console.log('change: ', event)
			pendingChanges.push(event)
			// sendChanges
		}
		unsubs.push(
			store.listen(handleChange, {
				source: 'user',
				scope: 'document',
			})
		)

		return () => {
			unsubs.forEach((unsub) => unsub())
		}
	}, [])
	return (
		<div className="tldraw__editor">
			<Tldraw autoFocus persistenceKey="tldraw_llm_starter" components={components} />
		</div>
	)
}
