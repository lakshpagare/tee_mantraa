/**
 * Live Instagram grid (Instagram API with Instagram Login). Set INSTAGRAM_ACCESS_TOKEN (long-lived token).
 * Returns [] when not configured or on error, so the homepage falls back to the CMS images.
 */
export async function getInstagramPosts(limit = 8): Promise<{ src: string; href: string }[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];
  try {
    const res = await fetch(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink&limit=${limit * 2}&access_token=${token}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || [])
      .filter((m: any) => m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM" || m.thumbnail_url)
      .slice(0, limit)
      .map((m: any) => ({ src: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url, href: m.permalink }));
  } catch {
    return [];
  }
}
