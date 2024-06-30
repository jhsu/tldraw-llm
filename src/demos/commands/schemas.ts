import { z } from 'zod'

export const CommandEnum = z.enum([
	'DELETE',
	'LABEL',
	'TOOL', // switch tools
	'CLICK',
	'DOUBLE_CLICK',
	'DRAG',
	'DOWN', // mouse down
	'UP', // mouse up
])

const tools = z.enum([
	'select',
	'arrow',
	'pen',
	'box',
	'pill',
	'diamond',
	'ellipse',
	'cloud',
	'star',
])

export const modifierSchema = z
	.array(z.enum(['shift', 'control', 'alt']))
	.optional()
	.default([])
	.describe('Modifier keys pressed')

export const DragCommandSchema = z.object({
	command: z.literal('DRAG'),
	/**
	 * Starting x-position of the drag
	 */
	x1: z.number().describe('Starting x position'),

	/**
	 * Starting y-position of the drag
	 */
	y1: z.number().describe('Starting y position'),
	x2: z.number().describe('Ending x position'),
	y2: z.number().describe('Ending y position'),
	modifiers: modifierSchema.optional(),
})
export const DeleteCommandSchema = z.object({
	command: z.literal('DELETE'),
})
export const LabelCommandSchema = z.object({
	command: z.literal('LABEL'),
	label: z.string(),
	x: z.number(),
	y: z.number(),
})
export const ToolCommandSchema = z.object({
	command: z.literal('TOOL'),
	tool: tools,
})
export const ClickCommandSchema = z.object({
	command: z.enum(['CLICK', 'DOUBLE_CLICK']),
	x: z.number(),
	y: z.number(),
	modifiers: modifierSchema.optional(),
})
export const DownCommandSchema = z.object({
	command: z.enum(['DOWN', 'UP']),
	modifiers: modifierSchema.optional(),
})
export const MoveCommandSchema = z.object({
	command: z.literal('MOVE'),
	x: z.number(),
	y: z.number(),
	modifiers: modifierSchema.optional(),
})

export const CommandsSchema = z.discriminatedUnion('command', [
	DragCommandSchema,
	DeleteCommandSchema,
	LabelCommandSchema,
	ToolCommandSchema,
	ClickCommandSchema,
	DownCommandSchema,
	MoveCommandSchema,
])

export const Schema = z.object({
	commands: z.array(CommandsSchema).nonempty().describe("Editor commands to execute in order"),
})

// export const CommandSchema = z.object({
// 	command: CommandEnum,
// 	args
// })
