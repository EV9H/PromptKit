import { Button } from "@/components/ui/button";
import { Heading } from "@/components/typography/heading";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "PromptKit Chrome Extension",
    description: "Access your PromptKit prompts instantly with our Chrome extension"
};

export default function ExtensionPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col space-y-6 mb-16">
                <div className="text-center space-y-4">
                    <Heading as="h1" size="3xl" className="font-bold">
                        PromptKit Chrome Extension
                    </Heading>
                    <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
                        Access your prompts instantly while browsing the web
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Extension description */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <Heading as="h2" size="2xl">
                            Supercharge your AI workflow
                        </Heading>
                        <p className="text-muted-foreground text-lg">
                            The PromptKit Chrome extension makes it easy to access your prompt library
                            directly in your browser. Save time and boost your productivity with instant
                            access to your carefully crafted prompts.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="text-primary h-6 w-6 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-lg">Access your prompts anywhere</h3>
                                <p className="text-muted-foreground">Use your prompts on any website with AI capabilities</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="text-primary h-6 w-6 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-lg">Save new prompts on the fly</h3>
                                <p className="text-muted-foreground">Found a great prompt? Save it directly to your library</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="text-primary h-6 w-6 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-lg">Organize and categorize</h3>
                                <p className="text-muted-foreground">Keep your prompts organized the way you want</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Button size="lg" asChild>
                            <a
                                href="https://chrome.google.com/webstore/detail/promptkit"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                Add to Chrome
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Extension preview */}
                <div className="relative">
                    <div className="rounded-lg overflow-hidden border shadow-xl">
                        <img
                            src="/chrome-extension-preview.png"
                            alt="PromptKit Chrome Extension Preview"
                            className="w-full h-auto"
                        />
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-muted/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg max-w-xs">
                        <p className="text-sm font-medium">
                            "PromptKit's extension has completely streamlined my workflow. I can access my prompts instantly!"
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            — Sarah L., Content Creator
                        </p>
                    </div>
                </div>
            </div>

            {/* How it works section */}
            <div className="mt-24 space-y-12">
                <div className="text-center">
                    <Heading as="h2" size="2xl">
                        Get Started in 3 Steps
                    </Heading>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-muted/30 p-6 rounded-lg border">
                        <div className="font-bold text-5xl text-primary/30 mb-4">1</div>
                        <h3 className="font-medium text-xl mb-2">Install the extension</h3>
                        <p className="text-muted-foreground">Add PromptKit to Chrome with a single click from the Chrome Web Store</p>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-lg border">
                        <div className="font-bold text-5xl text-primary/30 mb-4">2</div>
                        <h3 className="font-medium text-xl mb-2">Connect your account</h3>
                        <p className="text-muted-foreground">Sign in with your PromptKit account to access your prompt library</p>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-lg border">
                        <div className="font-bold text-5xl text-primary/30 mb-4">3</div>
                        <h3 className="font-medium text-xl mb-2">Use anywhere</h3>
                        <p className="text-muted-foreground">Click the extension icon to access your prompts on any website</p>
                    </div>
                </div>
            </div>


        </div>
    );
} 