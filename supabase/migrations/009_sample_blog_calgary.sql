-- Sample published post: Calgary destinations (TipTap JSON with image layout attrs)
-- Upserts by slug; picks first admin profile, else oldest profile.

INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    cover_image,
    content,
    author_id,
    status,
    published_at
)
SELECT
    'Beautiful Places to Visit in Calgary',
    'beautiful-places-to-visit-in-calgary',
    'From skyline views to river paths, discover scenic spots in Calgary - perfect for weekends or hosting friends.',
    'https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?auto=format&fit=crop&w=2360&q=80',
    $json$
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Calgary mixes prairie hospitality with a modern skyline and quick access to the mountains. Whether you are new to Alberta or planning a weekend visit, these spots show the city at its best."
        }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://images.unsplash.com/photo-1503614472-8c93d63619b7?auto=format&fit=crop&w=1840&q=80",
        "alt": "Mountain view west of Calgary",
        "title": null,
        "layout": "featured_top"
      }
    },
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Stephen Avenue Walk" }]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "This pedestrian-friendly stretch in the downtown core is lined with historic buildings, local shops, and patios. It is an easy place to meet friends, grab coffee, and take in public art without needing a car."
        }
      ]
    },
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Prince's Island Park and the Bow River" }]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Green space threads through Calgary along the Bow River. Prince's Island hosts festivals in summer and quiet walks year-round - ideal for a study break or a picnic after work."
        }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1840&q=80",
        "alt": "Rocky Mountain foothills",
        "title": null,
        "layout": "center_large"
      }
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Many trails connect the park to nearby communities. If you are preparing for life in Canada, learning your neighbourhood parks is a simple way to feel at home."
        }
      ]
    },
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Calgary Tower and the downtown view" }]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://images.unsplash.com/photo-1569516449771-5fa8a7f68207?auto=format&fit=crop&w=1060&q=80",
        "alt": "Calgary Tower and skyline",
        "title": null,
        "layout": "right_wrap"
      }
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "The tower is a classic landmark and a great orientation point when you are learning street names downtown. On clear days the observation deck looks toward the Rockies - a reminder of how close wilderness really is. Many newcomers use evenings on the Plus-15 network or along the river to practise English conversation in low-pressure settings, then plan a longer hike for the weekend."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Together, river paths, downtown walks, and short drives to Kananaskis or Banff make Calgary an easy city to explore. Pick one spot per weekend and you will know the city quickly."
        }
      ]
    }
  ]
}
$json$::jsonb,
    p.id,
    'published',
    NOW()
FROM (
    SELECT id
    FROM public.profiles
    ORDER BY
        CASE WHEN role = 'admin' THEN 0 ELSE 1 END,
        created_at
    LIMIT 1
) p
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    cover_image = EXCLUDED.cover_image,
    content = EXCLUDED.content,
    status = EXCLUDED.status,
    updated_at = NOW();
