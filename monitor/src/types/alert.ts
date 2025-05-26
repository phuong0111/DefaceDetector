// src/types/alert.ts
export interface WazuhAlert {
    id: string;
    timestamp: string;
    rule: {
        id: number;
        description: string;
        level: number;
    };
    agent: {
        name: string;
        ip: string;
    };
    data: any;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';