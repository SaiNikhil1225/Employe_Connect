/**
 * IP Address Utility
 * Captures user's public IP address from connected internet
 */

export async function getUserIPAddress(): Promise<string> {
    try {
        // Try multiple IP services for reliability
        const services = [
            'https://api.ipify.org?format=json',
            'https://api.my-ip.io/ip.json',
            'https://ipapi.co/json/',
        ];

        for (const service of services) {
            try {
                const response = await fetch(service, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                });

                if (response.ok) {
                    const data = await response.json();
                    // Different services return IP in different fields
                    return data.ip || data.IP || data.query || 'Unknown';
                }
            } catch (error) {
                console.warn(`Failed to get IP from ${service}`, error);
                continue;
            }
        }

        // Fallback: get IP from request headers (works behind proxy)
        return await getIPFromServer();
    } catch (error) {
        console.error('Error getting IP address:', error);
        return 'Unknown';
    }
}

async function getIPFromServer(): Promise<string> {
    try {
        const response = await fetch('/api/get-client-ip');
        if (response.ok) {
            const data = await response.json();
            return data.ip || 'Unknown';
        }
    } catch (error) {
        console.error('Error getting IP from server:', error);
    }
    return 'Unknown';
}

/**
 * Get IP address with caching (valid for 5 minutes)
 */
let cachedIP: string | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedIPAddress(): Promise<string> {
    const now = Date.now();

    if (cachedIP && (now - cacheTime) < CACHE_DURATION) {
        return cachedIP;
    }

    cachedIP = await getUserIPAddress();
    cacheTime = now;
    return cachedIP;
}
