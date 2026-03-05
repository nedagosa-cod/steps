import { MarkerType } from 'reactflow'

export const defaultGlobalConfig = {
    timerMin: '',
    timerMax: '',
    bgType: 'color', // 'color' | 'image' | 'transparent'
    bgValue: '#0a0d12'
}

export const edgeDefaults = {
    type: 'buttonEdge',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#7c5cfc' },
    style: { stroke: '#7c5cfc', strokeWidth: 1.5, opacity: 0.6 },
}
