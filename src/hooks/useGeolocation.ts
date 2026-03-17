// Custom React hook for fetching user's live GPS coordinates
// Uses the browser Geolocation API — never asks user to type their location

import { useCallback, useRef } from 'react';

interface GeoPosition {
    lat: number;
    lng: number;
}

interface UseGeolocationReturn {
    /** Fetch the user's current GPS position. Returns null if unavailable. */
    getLocation: () => Promise<GeoPosition | null>;
}

/**
 * Hook that provides a function to fetch the user's current GPS coordinates.
 * - Automatically requests permission
 * - Returns null with an error message if denied or unavailable
 * - Caches the last known position for quick re-use within 30 seconds
 */
export function useGeolocation(): UseGeolocationReturn {
    const lastPosition = useRef<{ position: GeoPosition; timestamp: number } | null>(null);
    const CACHE_DURATION_MS = 30_000; // 30 seconds

    const getLocation = useCallback(async (): Promise<GeoPosition | null> => {
        // Return cached position if fresh enough
        if (
            lastPosition.current &&
            Date.now() - lastPosition.current.timestamp < CACHE_DURATION_MS
        ) {
            return lastPosition.current.position;
        }

        // Check if Geolocation API is available
        if (!navigator.geolocation) {
            console.error('Geolocation API not available in this browser');
            return null;
        }

        return new Promise<GeoPosition | null>((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const geoPos: GeoPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    lastPosition.current = { position: geoPos, timestamp: Date.now() };
                    resolve(geoPos);
                },
                (error) => {
                    console.error('Geolocation error:', error.message);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10_000,
                    maximumAge: 30_000,
                }
            );
        });
    }, []);

    return { getLocation };
}
