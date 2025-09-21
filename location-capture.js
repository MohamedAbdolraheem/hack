/**
 * Location Capture Function - Educational Purpose Only
 * Demonstrates how location data can be accessed via browser APIs
 * 
 * IMPORTANT: This is for educational purposes to understand privacy risks.
 * Always obtain proper consent before accessing user location data.
 */

class LocationCapture {
    constructor() {
        this.locationData = null;
        this.options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };
    }

    /**
     * Main function to capture user location
     * @param {Function} onSuccess - Callback for successful location capture
     * @param {Function} onError - Callback for error handling
     */
    async captureLocation(onSuccess, onError) {
        try {
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by this browser');
            }

            // Request location permission and get coordinates
            navigator.geolocation.getCurrentPosition(
                (position) => this.handleLocationSuccess(position, onSuccess),
                (error) => this.handleLocationError(error, onError),
                this.options
            );

        } catch (error) {
            console.error('Location capture failed:', error);
            if (onError) onError(error);
        }
    }

    /**
     * Handle successful location capture
     */
    handleLocationSuccess(position, callback) {
        const locationInfo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toISOString(),
            // Additional browser/device info
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };

        this.locationData = locationInfo;
        
        // Log to console (for educational demonstration)
        console.log('Location captured:', locationInfo);
        
        // Send to callback if provided
        if (callback) callback(locationInfo);
        
        // Optional: Send to server (commented out for safety)
        // this.sendToServer(locationInfo);
    }

    /**
     * Handle location capture errors
     */
    handleLocationError(error, callback) {
        let errorMessage = '';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'User denied the request for Geolocation';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable';
                break;
            case error.TIMEOUT:
                errorMessage = 'The request to get user location timed out';
                break;
            default:
                errorMessage = 'An unknown error occurred';
                break;
        }
        
        console.error('Geolocation error:', errorMessage);
        if (callback) callback({ error: errorMessage, code: error.code });
    }

    /**
     * Get additional device/browser information
     */
    getDeviceInfo() {
        return {
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookieEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            plugins: Array.from(navigator.plugins).map(plugin => plugin.name),
            mimeTypes: Array.from(navigator.mimeTypes).map(type => type.type)
        };
    }

    /**
     * Optional: Send data to server (commented out for safety)
     * Uncomment and modify URL for actual implementation
     */
    /*
    async sendToServer(data) {
        try {
            const response = await fetch('YOUR_SERVER_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: data,
                    deviceInfo: this.getDeviceInfo(),
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log('Data sent successfully');
            }
        } catch (error) {
            console.error('Failed to send data:', error);
        }
    }
    */

    /**
     * Watch position for continuous tracking
     */
    startWatching(onSuccess, onError) {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return null;
        }

        return navigator.geolocation.watchPosition(
            (position) => this.handleLocationSuccess(position, onSuccess),
            (error) => this.handleLocationError(error, onError),
            this.options
        );
    }

    /**
     * Stop watching position
     */
    stopWatching(watchId) {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
    }
}

// Usage example
const locationCapture = new LocationCapture();

// Simple usage
function captureUserLocation() {
    locationCapture.captureLocation(
        (data) => {
            console.log('Location successfully captured:', data);
            // Here you would typically send data to your server
            alert(`Location captured: ${data.latitude}, ${data.longitude}`);
        },
        (error) => {
            console.error('Failed to capture location:', error);
            alert('Failed to get location: ' + error.error);
        }
    );
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationCapture;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.LocationCapture = LocationCapture;
    window.captureUserLocation = captureUserLocation;
}
