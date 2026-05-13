// src/hooks/useGamification.jsx
import { useState, useEffect } from 'react';
import { gamificationService } from '../services/api';

export function useGamification() {
    const [perfil,  setPerfil]  = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        let cancelled = false;

        gamificationService.getPerfil()
            .then(({ data }) => {
                if (!cancelled) setPerfil(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    return { perfil, loading, error };
}