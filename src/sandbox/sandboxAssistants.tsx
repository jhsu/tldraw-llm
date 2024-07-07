import { Assistant } from '../Assistant'
import { Spinner } from '../components/Spinner'
import { CompletionCommandsAssistant } from '../demos/competions-commands/CompletionsCommandsAssistant'
import { OpenAiWithFunctionCallingAssistant } from '../demos/function-calling/OpenAiAssistantWithFunctionCalling'
import { AnthropicAssistant } from '../demos/commands/AnthropicAssistant'

type SandboxAssistant<T> = {
	name: string
	create: () => Assistant<T>
	GptOutput: React.ComponentType<{ output: T }>
}

export const sandboxAssistants = [
	create({
		name: 'OpenAI Assistant with commands',
		create: () => new AnthropicAssistant(),
		GptOutput: ({ output }) => <>{output.commands.join('\n\n')}</>,
	}),
	// create({
	// 	name: 'OpenAI Completions with commands',
	// 	create: () => new CompletionCommandsAssistant(),
	// 	GptOutput: ({ output }) => {
	// 		const [final, setFinal] = useState<string | null>(null)
	// 		useEffect(() => {
	// 			let isCancelled = false
	// 			output.finalContent().then((final) => {
	// 				if (isCancelled) return
	// 				setFinal(final)
	// 			})
	// 			return () => {
	// 				isCancelled = true
	// 			}
	// 		}, [output])
	// 		return <>{final ?? <Spinner />}</>
	// 	},
	// }),
	create({
		name: 'OpenAI Assistant with function calling',
		create: () => new AnthropicAssistant(),
		GptOutput: ({ output }) => {
			console.log({ output })
			return (
				<div className="flex gap-2 flex-col">
					{output.commands.map((cmd, i) => {
						const { command, ...args } = cmd
						return <div key={i} className="font-mono">
							{command} ={'> '}
							{Object.keys(args).map(k => (`${k}: ${args[k]}`)).join(', ')}
						</div>
					})}
				</div>
			)
		},
	}),
] as const

function create<T>(v: SandboxAssistant<T>) {
	return v
}
