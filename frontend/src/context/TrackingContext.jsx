import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TrackingContext = createContext();

const useTracking = () => useContext(TrackingContext);

const TrackingProvider = ({ children }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [notification, setNotification] = useState(null);
    const [lastCoord, setLastCoord] = useState(null);
    const [locationName, setLocationName] = useState('Acquiring Location...');
    const watchId = useRef(null);
    const timerId = useRef(null);

    // Clean up on unmount of provider (which is whole app, so basically on close)
    useEffect(() => {
        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            if (timerId.current) clearInterval(timerId.current);
        };
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const getAreaName = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: { 'User-Agent': 'EmployeePortal/1.0' }
            });
            const data = await res.json();
            if (data.address) {
                const { road, suburb, city, town, village, state_district } = data.address;
                const name = [road, suburb, city || town || village].filter(Boolean).join(', ') || state_district || 'Unknown Area';
                setLocationName(name);
                return name;
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
        }
        return 'Unknown Location';
    };

    const startTracking = async () => {
        setLoading(true);
        try {
            if (!navigator.geolocation) throw new Error('Geolocation not supported.');

            let lat = 28.6139; // Default fallback (New Delhi)
            let lng = 77.2090;

            try {
                // Wrap in explicit timeout because browser's native timeout can sometimes hang
                const position = await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => reject(new Error('Location timeout')), 5000);
                    navigator.geolocation.getCurrentPosition(
                        (pos) => { clearTimeout(timeoutId); resolve(pos); },
                        (err) => { clearTimeout(timeoutId); reject(err); },
                        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
                    );
                });
                lat = position.coords.latitude;
                lng = position.coords.longitude;
            } catch (e) {
                console.warn('Geolocation slow or blocked. Using fallback coordinates.', e);
                showNotification('error', 'Location service delayed. Using fallback coordinates.');
            }

            // Start backend tracking, let the name 'Acquire' in the background
            const trackPromise = api.post('tracking/start', {
                latitude: lat,
                longitude: lng,
                locationName: 'Acquiring...'
            });

            // Wait exactly 1.5s for UX
            await Promise.all([
                trackPromise,
                new Promise((resolve) => setTimeout(resolve, 1500))
            ]);

            setLastCoord({ lat, lng });
            setIsTracking(true);
            setDuration(0);

            // Silently resolve real area name
            getAreaName(lat, lng).then(name => {
                api.post('tracking/update', { latitude: lat, longitude: lng, locationName: name }).catch(() => { });
            });

            // Start Timer
            timerId.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            // Start continuous watch
            watchId.current = navigator.geolocation.watchPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setLastCoord({ lat: latitude, lng: longitude });
                    const currentName = await getAreaName(latitude, longitude);
                    try {
                        await api.post('tracking/update', {
                            latitude,
                            longitude,
                            locationName: currentName
                        });
                    } catch (err) {
                        console.error('Tracking update failed:', err);
                    }
                },
                (err) => {
                    console.error('Watch error:', err);
                },
                { enableHighAccuracy: true, distanceFilter: 15 }
            );

            showNotification('success', 'Field pulse initialized. Tracking active.');
            toast.success('Field tracking active');
        } catch (err) {
            showNotification('error', err.message || 'Initialization failed.');
        } finally {
            setLoading(false);
        }
    };

    const stopTracking = async () => {
        setLoading(true);
        try {
            let finalCoords = lastCoord || {};
            let finalName = locationName;

            try {
                const pos = await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => reject(new Error('Location timeout')), 1500);
                    navigator.geolocation.getCurrentPosition(
                        (res) => { clearTimeout(timeoutId); resolve(res); },
                        (err) => { clearTimeout(timeoutId); reject(err); },
                        { enableHighAccuracy: false, timeout: 1500, maximumAge: 10000 }
                    );
                });
                finalCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                finalName = await getAreaName(pos.coords.latitude, pos.coords.longitude);
            } catch (e) {
                console.warn('Could not get instant final position:', e);
            }

            await api.post('tracking/end', {
                ...finalCoords,
                locationName: finalName
            });

            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            if (timerId.current) clearInterval(timerId.current);

            setIsTracking(false);
            setDuration(0);
            setLastCoord(null);
            setLocationName('Acquiring Location...');
            showNotification('success', 'Field operation concluded.');
            toast.success('Field tracking stopped');
        } catch (err) {
            showNotification('error', 'Termination failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TrackingContext.Provider value={{
            isTracking,
            loading,
            duration,
            notification,
            lastCoord,
            locationName,
            startTracking,
            stopTracking
        }}>
            {children}
        </TrackingContext.Provider>
    );
};
export { TrackingProvider, useTracking };
