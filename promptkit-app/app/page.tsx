import { createClient } from "@/utils/supabase/server";
import { Heading } from "@/components/typography/heading";
import { TrendingPromptCard } from "@/components/prompts/trending-prompt-card";
import { PromptCategoryList } from "@/components/prompts/prompt-category-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  // Fetch trending prompts
  const { data: trendingPromptsRaw, error: trendingError } = await supabase
    .from('prompts')
    .select('*, content')
    .limit(12);

  // Process prompts to include only a preview of content
  const trendingPrompts = trendingPromptsRaw?.map(prompt => ({
    ...prompt,
    content: prompt.content && prompt.content.length > 300 ?
      prompt.content.substring(0, 300) : prompt.content
  }));

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-24 space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Heading as="h1" size="4xl" className="font-bold tracking-tighter">
            PromptKit: Discover, Create & Share AI Prompts
          </Heading>
          <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
            Your personal library for organizing, creating, and sharing powerful AI prompts.
            Search through thousands of community prompts or create your own.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <Button asChild size="lg">
              <Link href="/prompts/explore">
                Explore Prompts
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Prompts Section */}
      <section className="py-12 space-y-6">
        <div className="flex items-center justify-between">
          <Heading as="h2" size="2xl">
            Trending Prompts
          </Heading>
          <Button variant="ghost" asChild>
            <Link href="/prompts/explore">
              View all →
            </Link>
          </Button>
        </div>

        {trendingError ? (
          <p className="text-destructive">Failed to load trending prompts</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingPrompts?.map((prompt) => (
              <TrendingPromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="py-12 space-y-6">
        <Heading as="h2" size="2xl">
          Browse by Category
        </Heading>

        {categoriesError ? (
          <p className="text-destructive">Failed to load categories</p>
        ) : (
          <PromptCategoryList categories={categories || []} />
        )}
      </section>
    </div>
  );
}
