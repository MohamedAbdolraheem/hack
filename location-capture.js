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
        
        // Store in localStorage for persistence
        this.saveToLocalStorage(locationInfo);
        
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
     * Get comprehensive device/browser fingerprint
     */
    getDeviceInfo() {
        return {
            // Screen & Display
            screenResolution: `${screen.width}x${screen.height}`,
            availableScreenSize: `${screen.availWidth}x${screen.availHeight}`,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            
            // Browser Info
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            onLine: navigator.onLine,
            
            // System Info
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            
            // Hardware Info
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints,
            
            // Browser Capabilities
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            plugins: Array.from(navigator.plugins).map(plugin => ({
                name: plugin.name,
                filename: plugin.filename,
                description: plugin.description
            })),
            mimeTypes: Array.from(navigator.mimeTypes).map(type => type.type),
            
            // WebGL Fingerprint
            webglVendor: this.getWebGLInfo().vendor,
            webglRenderer: this.getWebGLInfo().renderer,
            
            // Canvas Fingerprint
            canvasFingerprint: this.getCanvasFingerprint(),
            
            // Audio Fingerprint
            audioFingerprint: this.getAudioFingerprint(),
            
            // Network Info
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : 'unknown',
            
            // Storage
            localStorage: typeof(Storage) !== "undefined",
            sessionStorage: typeof(Storage) !== "undefined",
            indexedDB: !!window.indexedDB,
            
            // Permissions
            permissions: this.checkPermissions(),
            
            // Battery (if available)
            battery: this.getBatteryInfo()
        };
    }

    /**
     * Get WebGL information for fingerprinting
     */
    getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                return {
                    vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
                    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'
                };
            }
        } catch (e) {
            return { vendor: 'error', renderer: 'error' };
        }
        return { vendor: 'not supported', renderer: 'not supported' };
    }

    /**
     * Generate canvas fingerprint
     */
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Canvas fingerprint test 🔍', 2, 2);
            return canvas.toDataURL().slice(-50); // Last 50 chars for brevity
        } catch (e) {
            return 'error';
        }
    }

    /**
     * Generate audio fingerprint
     */
    getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gain = audioContext.createGain();
            
            oscillator.connect(analyser);
            analyser.connect(gain);
            gain.connect(audioContext.destination);
            
            oscillator.frequency.value = 1000;
            gain.gain.value = 0;
            
            const buffer = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(buffer);
            
            audioContext.close();
            return buffer.slice(0, 10).join(','); // First 10 values
        } catch (e) {
            return 'error';
        }
    }

    /**
     * Check various permissions
     */
    async checkPermissions() {
        const permissions = {};
        const permissionNames = ['geolocation', 'camera', 'microphone', 'notifications', 'push'];
        
        for (const name of permissionNames) {
            try {
                if (navigator.permissions) {
                    const result = await navigator.permissions.query({ name });
                    permissions[name] = result.state;
                }
            } catch (e) {
                permissions[name] = 'unknown';
            }
        }
        
        return permissions;
    }

    /**
     * Get battery information
     */
    async getBatteryInfo() {
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                return {
                    charging: battery.charging,
                    level: battery.level,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            }
        } catch (e) {
            return 'not available';
        }
        return 'not supported';
    }

    /**
     * Capture camera/microphone (with permission)
     */
    async captureMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // Get device list
            const devices = await navigator.mediaDevices.enumerateDevices();
            
            return {
                hasCamera: stream.getVideoTracks().length > 0,
                hasMicrophone: stream.getAudioTracks().length > 0,
                devices: devices.map(device => ({
                    kind: device.kind,
                    label: device.label,
                    deviceId: device.deviceId
                }))
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get network information
     */
    getNetworkInfo() {
        return {
            userAgent: navigator.userAgent,
            ip: 'Use external service to get IP',
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null,
            onLine: navigator.onLine
        };
    }

    /**
     * Save location data to localStorage
     */
    saveToLocalStorage(data) {
        try {
            // Get existing data or initialize empty array
            const existingData = JSON.parse(localStorage.getItem('capturedLocations') || '[]');
            
            // Add new location data
            existingData.push({
                ...data,
                captureId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                sessionId: this.getSessionId()
            });
            
            // Save back to localStorage
            localStorage.setItem('capturedLocations', JSON.stringify(existingData));
            
            console.log('Location saved to localStorage. Total locations:', existingData.length);
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Get or create session ID
     */
    getSessionId() {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    /**
     * Get all stored location data
     */
    getAllStoredLocations() {
        try {
            return JSON.parse(localStorage.getItem('capturedLocations') || '[]');
        } catch (error) {
            console.error('Failed to retrieve stored locations:', error);
            return [];
        }
    }

    /**
     * Clear all stored location data
     */
    clearStoredLocations() {
        localStorage.removeItem('capturedLocations');
        console.log('All stored locations cleared');
    }

    /**
     * Download stored locations as JSON file
     */
    downloadStoredLocations() {
        const data = this.getAllStoredLocations();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `location-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Location data downloaded');
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
// const locationCapture = new LocationCapture(); // Moved to HTML file

// Simple usage
function captureUserLocation() {
    const locationCapture = new LocationCapture();
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
    // Don't create a global instance - let the HTML page handle it
}
