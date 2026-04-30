/* eslint-disable */

/** Accepts SSR client (cookies) or anon `createClient` from `@supabase/supabase-js`. */
export function fromBlogPosts(client: { from: (name: string) => unknown }) {
  return (client as any).from('blog_posts')
}
