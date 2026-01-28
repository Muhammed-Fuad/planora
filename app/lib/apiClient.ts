const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async request(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config: RequestInit = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            credentials: "include", // Important for cookies
            ...options,
        };

        const response = await fetch(url, config);

        // Handle 401
        if (response.status === 401) {
            throw new Error("Unauthorized"); // ✅ Throw error instead of returning null
        }
        
        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: "Network error" }));
            throw new Error(error.error || "Request failed");
        }

        // ✅ CRITICAL FIX: Return the response data
        return response.json();
    }

    // Auth methods
    async register(userData: unknown) {
        return this.request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    }


    async login(email: string, password: string) {
        return this.request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }

    async logout() {
        return this.request("/api/auth/logout", {
            method: "POST",
        });
    }

    async getCurrentUser() {
        return this.request("/api/auth/me");
    }

    // User Methods
    async getUsers() {
        return this.request("/api/user");
    }

    // Admin methods
    async updateUserRole(userId: string, role: string) {
        return this.request(`/api/user/${userId}`, { // ✅ Fixed endpoint
            method: "PATCH", // ✅ Added method
            body: JSON.stringify({ role }), // ✅ Added body
        });
    }


    // Public events
    async getPublicEvents() {
         return this.request("/api/events/show");
    }


}

export const apiClient = new ApiClient();