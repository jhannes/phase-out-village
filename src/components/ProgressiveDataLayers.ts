// ProgressiveDataLayers.ts
// Defines which data fields/metrics are shown at each unlockable layer in the game

export type DataLayer = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface DataLayerConfig {
    [layer: string]: string[];
}

export const DATA_LAYERS: DataLayerConfig = {
    basic: [
        'fieldName',
        'production',
        'basicEmissions',
        'workers',
    ],
    intermediate: [
        'efficiency',
        'emissionTrends',
        'shutdownCost',
    ],
    advanced: [
        'financialBreakdown',
        'futureProjections',
        'lifetimeEmissions',
    ],
    expert: [
        'hiddenStats',
        'expertTips',
        'advancedComparisons',
    ],
}; 