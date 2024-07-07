import { TLEditorComponents, Tldraw, createTLStore, defaultShapeUtils } from '@tldraw/tldraw'
import { useEffect, useMemo, useState } from 'react'
import { UserPrompt } from '../../components/UserPrompt'
import { AnthropicAssistant } from './AnthropicAssistant'

const components: TLEditorComponents = {
	InFrontOfTheCanvas: () => {
		const assistant = useMemo(() => new AnthropicAssistant(), [])
		return <UserPrompt assistant={assistant} />
	},
}

export default function CommandsDemo() {
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
			<Tldraw autoFocus store={store} components={components}>
			</Tldraw>
		</div>
	)
}
