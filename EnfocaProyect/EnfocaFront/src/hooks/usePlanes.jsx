import { useState, useEffect } from 'react';
import { planService } from '../services/api';

export function usePlanes() {
    const [planes, setPlanes]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        planService.listar()
            .then(({ data }) => {
                if (!cancelled) setPlanes(Array.isArray(data) ? data : []);
            })
            .catch(() => { if (!cancelled) setPlanes([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return { planes, loading };
}