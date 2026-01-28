export enum Role{
    ADMIN ="ADMIN",
    ORGANIZER = "ORGANIZER",
    USER = "USER",
    GUEST = "GUEST",
}

export interface User{
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthContextType {
    user: User | null;
    login: (formData: FormData) => void;
    loading: boolean,
    logout: () => void;
    hasPermission: (requiredRole: Role) => boolean;
}
