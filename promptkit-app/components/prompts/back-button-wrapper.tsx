import { cookies } from 'next/headers';
import { BackButton } from './back-button';

interface BackButtonWrapperProps {
    fallbackUrl: string;
    className?: string;
}

export async function BackButtonWrapper({ fallbackUrl, className }: BackButtonWrapperProps) {
    // Get the last prompts page from the cookie
    const cookieStore = await cookies();
    const lastPromptsPage = cookieStore.get('lastPromptsPage')?.value;

    return (
        <BackButton
            fallbackUrl={fallbackUrl}
            className={className}
            lastPromptsPage={lastPromptsPage}
        />
    );
} 