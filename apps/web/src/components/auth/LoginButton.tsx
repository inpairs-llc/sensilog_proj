'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface LoginButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export function LoginButton({
    className,
    variant = 'default',
    size = 'md'
}: LoginButtonProps) {
    const { startRiotLogin, isAuthenticated, user, logout, isLoggingOut } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await startRiotLogin();
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
        default: 'bg-[#D13639] hover:bg-[#B82E31] text-white',
        outline: 'border-2 border-[#D13639] text-[#D13639] hover:bg-[#D13639] hover:text-white',
        ghost: 'text-[#D13639] hover:bg-[#D13639]/10',
    };

    if (isAuthenticated && user) {
        return (
            <div className='flex items-center gap-4'>
                <span className='text-white font-medium'>
                    {user.gameName}#{user.tagLine}
                </span>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                        'rounded-lg font-medium transition-colors duration-200',
                        'bg-gray-700 hover:bg-gray-600 text-white',
                        sizeClasses[size],
                        isLoggingOut && 'opacity-50 cursor-not-allowed',
                        className
                    )}
                >
                    {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            disabled={isLoading}
            className={cn(
                'rounded-lg font-medium transition-colors duration-200 flex items-center gap-2',
                variantClasses[variant],
                sizeClasses[size],
                isLoading && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {isLoading ? (
                <>
                    <span className='animate-spin'>⏳</span>
                    ログイン中...
                </>
            ) : (
                <>
                    <RiotLogo className='w-5 h-5' />
                    Riot IDでログイン
                </>
            )}
        </button>
    );
}

function RiotLogo({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.08 5.1 7.63 12 4.18zM4 8.93l7 3.5v6.64l-7-3.5V8.93zm9 10.14v-6.64l7-3.5v6.64l-7 3.5z" />
        </svg>
    );
}
