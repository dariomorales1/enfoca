// src/hooks/useWeeklyChart.js
import { useState, useEffect } from 'react';
import { metricsService } from '../services/api';

const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export function useWeeklyChart() {
    const [raw,     setRaw]     = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        metricsService.getLast7Days()
            .then(({ data }) => {
                if (cancelled) return;

                const today = new Date().toISOString().slice(0, 10);

                // Normaliza los 7 días al formato que espera el SVG
                const mapped = (Array.isArray(data) ? data : []).map((d) => ({
                    day:     DAYS[new Date(d.date + 'T12:00:00').getDay()],
                    cycles:  d.sessionsCount,
                    minutes: d.focusedMinutes,
                    current: d.date === today,
                }));

                setRaw(mapped);
            })
            .catch(() => { if (!cancelled) setRaw([]); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, []);

    // Promedio móvil simple de 3 días
    const avg = raw.map((d, i, arr) => {
        const slice = arr.slice(Math.max(0, i - 1), i + 2);
        const mean  = slice.reduce((s, x) => s + x.cycles, 0) / slice.length;
        return { ...d, cycles: parseFloat(mean.toFixed(1)) };
    });

    return { raw, avg, loading };
}