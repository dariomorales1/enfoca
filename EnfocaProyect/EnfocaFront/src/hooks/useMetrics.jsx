import { useState, useEffect } from 'react';
import { metricsService } from '../services/api';

export function useMetrics() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        metricsService.getSummary()
            .then(({ data }) => { if (!cancelled) setSummary(data); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return { summary, loading };
}