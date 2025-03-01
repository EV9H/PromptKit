"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isExtension = searchParams.get('extension') === 'true';
    const [message, setMessage] = useState<string>("Processing authentication...");
    const [debugInfo, setDebugInfo] = useState<string | null>(null);

    useEffect(() => {
        const processAuth = async () => {
            try {
                const supabase = createClient();

                // Get auth data
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setMessage("Authentication failed. Please try again.");
                    return;
                }

                // Get username from profiles if available
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                const username = profile?.username || user.email?.split('@')[0] || 'User';

                if (isExtension) {
                    // If this is a callback for the extension, expose auth data to be captured
                    // by the extension's content script

                    // IMPORTANT: In a production environment, use a more secure method
                    // to pass auth data to the extension

                    // Get the auth token
                    const token = await getAuthToken();

                    // Create a global object with auth data
                    const authData = {
                        token,
                        userId: user.id,
                        username: username
                    };

                    // Expose auth data for extension to read
                    (window as any).EXTENSION_AUTH_DATA = authData;

                    // Add a debug message
                    setDebugInfo(JSON.stringify({
                        authDataSet: true,
                        token: token ? token.substring(0, 10) + '...' : 'missing',
                        userId: user.id,
                        username
                    }, null, 2));

                    setMessage("Authentication successful! The extension will automatically close this tab once it processes your login.");

                    // Also try to notify the extension directly through a custom event
                    try {
                        const event = new CustomEvent('PROMPTKIT_AUTH_SUCCESS', { detail: authData });
                        window.dispatchEvent(event);
                        console.log("Custom auth event dispatched");
                    } catch (error) {
                        console.error("Error dispatching custom event:", error);
                    }
                } else {
                    // For normal app flow, redirect to the intended destination
                    const callbackUrl = searchParams.get('callbackUrl') || '/';
                    router.push(callbackUrl);
                }
            } catch (error) {
                console.error("Auth callback error:", error);
                setMessage("An error occurred during authentication. Please try again.");
                setDebugInfo(error instanceof Error ? error.message : String(error));
            }
        };

        processAuth();
    }, [isExtension, router, searchParams]);

    // Helper to get the auth token from Supabase
    async function getAuthToken() {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || '';
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-2xl font-semibold mb-4 text-center">Authentication</h1>
                <p className="text-center text-muted-foreground mb-4">{message}</p>

                {isExtension && (
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                            If this tab doesn't close automatically, you can close it manually after the extension has processed your login.
                        </p>
                    </div>
                )}

                {debugInfo && isExtension && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                        <h3 className="text-sm font-medium mb-2">Debug Information</h3>
                        <pre className="text-xs overflow-auto p-2 bg-background rounded">
                            {debugInfo}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
} 