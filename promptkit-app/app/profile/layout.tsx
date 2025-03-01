export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}

export const metadata = {
    title: 'Profile | PromptKit',
    description: 'Manage your profile settings and preferences',
}; 