import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usePuterStore } from './puter';

export function useAuthGuard(next: string) {
    const { auth, isLoading, puterReady } = usePuterStore();
    const navigate = useNavigate();
    useEffect(() => {
        if (puterReady && !isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=${encodeURIComponent(next)}`, { replace: true });
        }
    }, [puterReady, isLoading, auth.isAuthenticated, navigate, next]);
    return puterReady && !isLoading && auth.isAuthenticated;
}
