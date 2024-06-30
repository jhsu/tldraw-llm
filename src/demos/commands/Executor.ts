import { EASINGS, Editor, GeoShapeGeoStyle, Vec, VecLike, createShapeId } from '@tldraw/tldraw'
import { z } from 'zod'
import { CommandsSchema, modifierSchema } from './schemas'

type Command = z.infer<typeof CommandsSchema>

const basePoint = {
	type: 'pointer',
	name: 'pointer_down',
	target: 'canvas',
	pointerId: 1,
	button: 0,
	isPen: false,
	shiftKey: false,
	altKey: false,
	ctrlKey: false,
} as const

type Modifiers = z.infer<typeof modifierSchema>

function modifierProperties(modifiers: Modifiers = []) {
	return modifiers.reduce(
		(acc, modifier) => {
			switch (modifier) {
				case 'shift':
					return { ...acc, shiftKey: true }
				case 'control':
					return { ...acc, ctrlKey: true }
				case 'alt':
					return { ...acc, altKey: true }
				default:
					return acc
			}
		},
		{ altKey: false, shiftKey: false, ctrlKey: false }
	)
}

async function movePointer(
	editor: Editor,
	to: VecLike,
	opts = {} as { altKey: boolean; shiftKey: boolean; ctrlKey: boolean }
) {
	const curr = editor.inputs.currentScreenPoint
	const dist = Vec.Dist(curr, to)
	const steps = Math.max(32, Math.ceil(dist / 8))

	const { altKey, shiftKey, ctrlKey } = opts

	for (let i = 0; i < steps; i++) {
		await new Promise((resolve) => setTimeout(resolve, 16))
		const t = EASINGS.easeInOutExpo(i / (steps - 1))
		editor.dispatch({
			...basePoint,
			name: 'pointer_move',
			point: Vec.Lrp(curr, to, t),
			altKey,
			shiftKey,
			ctrlKey,
		})
	}
}

export async function execute(editor: Editor, instruction: Command) {
	if (instruction.command === 'DRAG') {
		const from = editor.pageToScreen({ x: instruction.x1, y: instruction.y1 })
		const to = editor.pageToScreen({ x: instruction.x2, y: instruction.y2 })

		const mods = modifierProperties(instruction.modifiers)
		editor.dispatch({
			...basePoint,
			name: 'pointer_move',
			point: from,
			...mods,
		})
		editor.dispatch({
			...basePoint,
			name: 'pointer_down',
			point: from,
			...mods,
		})

		await movePointer(editor, to, mods)

		editor.dispatch({
			...basePoint,
			name: 'pointer_up',
			point: to,
			...mods,
		})

		editor.cancelDoubleClick()
		return
	}
	if (instruction.command === 'TOOL') {
		switch (instruction.tool) {
			case 'select':
			case 'arrow':
				editor.setCurrentTool(instruction.tool)
				break
			case 'pen':
				editor.setCurrentTool('draw')
				break
			case 'box':
				editor.updateInstanceState(
					{
						stylesForNextShape: {
							...editor.getInstanceState().stylesForNextShape,
							[GeoShapeGeoStyle.id]: 'rectangle',
						},
					},
					{ history: 'ignore' }
				)
				break
			case 'pill':
			case 'diamond':
			case 'ellipse':
			case 'cloud':
			case 'star':
				editor.updateInstanceState(
					{
						stylesForNextShape: {
							...editor.getInstanceState().stylesForNextShape,
							[GeoShapeGeoStyle.id]: instruction.tool,
						},
					},
					{ history: 'ignore' }
				)
				editor.setCurrentTool('geo')
				break
		}
		return
	}

	if (instruction.command === 'LABEL') {
		editor.batch(() => {
			editor.setCurrentTool('text')
			// NOTE: get page point or get from instruction
			// const { x, y } = editor.inputs.currentPagePoint
			const { x, y } = instruction
			const shapeId = createShapeId()
			editor.createShape({
				id: shapeId,
				type: 'text',
				x,
				y,
				props: {
					text: instruction.label,
				},
			})
			const bounds = editor.getShapePageBounds(shapeId)!
			editor.updateShape({
				id: shapeId,
				type: 'text',
				x: x - bounds.w / 2,
				y: y - bounds.h / 2,
			})
		})
		return
	}

	if (instruction.command === 'CLICK') {
		const { x, y } = instruction
		const point = editor.pageToScreen({ x, y })
		const mods = modifierProperties(instruction.modifiers)
		editor.dispatch({
			...basePoint,
			name: 'pointer_move',
			point,
			...mods,
		})
		editor.dispatch({
			...basePoint,
			name: 'pointer_down',
			point,
			...mods,
		})
		editor.dispatch({
			...basePoint,
			name: 'pointer_up',
			point,
			...mods,
		})
		editor.cancelDoubleClick()
		return
	}

	if (instruction.command === 'DOUBLE_CLICK') {
		const { x, y } = instruction
		const point = editor.pageToScreen({ x, y })
		editor.dispatch({
			...basePoint,
			name: 'pointer_move',
			point,
		})
		editor.dispatch({
			...basePoint,
			type: 'click',
			name: 'double_click',
			phase: 'settle',
			point,
		})
		editor.cancelDoubleClick()
		return
	}
	if (instruction.command === 'DELETE') {
		editor.deleteShapes(editor.getSelectedShapeIds())
		return
	}
	if (instruction.command === 'UP') {
		const { x, y } = editor.inputs.currentPagePoint
		const mods = modifierProperties(instruction.modifiers)
		editor.dispatch({
			...basePoint,
			name: 'pointer_up',
			point: { x, y },
			...mods,
		})
		editor.cancelDoubleClick()
		return
	}
	if (instruction.command === 'DOWN') {
		const { x, y } = editor.inputs.currentPagePoint
		const mods = modifierProperties(instruction.modifiers)
		editor.dispatch({
			...basePoint,
			name: 'pointer_down',
			point: { x, y },
			...mods,
		})
		return
	}
	if (instruction.command === 'MOVE') {
		const { x, y } = instruction
		const mods = modifierProperties(instruction.modifiers)
		const next = editor.pageToScreen({ x, y })
		await movePointer(editor, next, mods)
		return
	}
}

export async function executeSequence(editor: Editor, instructions: Array<Command>) {
	for (const instruction of instructions) {
		await execute(editor, instruction)
	}
}
