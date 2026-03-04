// API utility functions for frontend
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Helper function to set auth token
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Helper function to remove auth token
function removeAuthToken() {
    localStorage.removeItem('authToken');
}

// Helper function to get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Helper function to set current user
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON, try to get text
            const text = await response.text();
            throw new Error(text || `Server error: ${response.status} ${response.statusText}`);
        }
        
        if (!response.ok) {
            throw new Error(data.error || `API request failed: ${response.status} ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        console.error('API request error:', error);
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please make sure the server is running on http://localhost:3000');
        }
        
        // Re-throw with better error message
        if (error.message) {
            throw error;
        }
        
        throw new Error('An unexpected error occurred. Please try again.');
    }
}

// Authentication API
const authAPI = {
    async register(userData) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        if (data.token) {
            setAuthToken(data.token);
            setCurrentUser(data.user);
        }
        return data;
    },
    
    async login(email, password, role) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, role })
        });
        if (data.token) {
            setAuthToken(data.token);
            setCurrentUser(data.user);
        }
        return data;
    },
    
    logout() {
        removeAuthToken();
        localStorage.removeItem('currentUser');
    },
    
    isAuthenticated() {
        return !!getAuthToken();
    }
};

// Properties API
const propertiesAPI = {
    async getAll(filters = {}) {
        // Build query string manually to ensure proper encoding
        const queryParts = [];
        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && value !== null && value !== '') {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }
        const queryParams = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
        return await apiRequest(`/properties${queryParams}`);
    },
    
    async getById(id) {
        return await apiRequest(`/properties/${id}`);
    },
    
    async create(propertyData) {
        return await apiRequest('/properties', {
            method: 'POST',
            body: JSON.stringify(propertyData)
        });
    },
    
    async update(id, propertyData) {
        return await apiRequest(`/properties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(propertyData)
        });
    },
    
    async delete(id) {
        return await apiRequest(`/properties/${id}`, {
            method: 'DELETE'
        });
    }
};

// Bookings API
const bookingsAPI = {
    async getAll() {
        return await apiRequest('/bookings');
    },
    
    async create(bookingData) {
        return await apiRequest('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },

    async delete(id) {
        return await apiRequest(`/bookings/${id}`, {
            method: 'DELETE'
        });
    }
};

// Host API
const hostAPI = {
    async getStats() {
        return await apiRequest('/host/stats');
    }
};

// Export API object
window.SafariStaysAPI = {
    auth: authAPI,
    properties: propertiesAPI,
    bookings: bookingsAPI,
    host: hostAPI,
    getCurrentUser,
    setCurrentUser
};

