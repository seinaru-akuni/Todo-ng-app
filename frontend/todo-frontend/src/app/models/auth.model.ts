export interface LoginDto {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterDto {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export interface UserProfile {
    id: number;
    email: string;
    username: string;
}

