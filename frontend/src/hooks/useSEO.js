/**
 * useSEO — imperatively manages all SEO <head> tags for SetupSpot.
 *
 * Handles:
 *  - document.title
 *  - meta[name=description]
 *  - Open Graph: og:title, og:description, og:image, og:url, og:type, og:site_name
 *  - Twitter Card: twitter:card, twitter:title, twitter:description, twitter:image
 *  - <link rel="canonical">
 *  - meta[name=robots] (for noindex pages)
 *
 * Usage:
 *   useSEO({
 *     title: 'My Battlestation by @creator | SetupSpot',
 *     description: 'Explore an amazing desk setup with mechanical keyboards...',
 *     image: 'https://res.cloudinary.com/...',
 *     url: 'https://setupspot.com/setup/42',
 *     type: 'article',
 *     noindex: false,
 *   })
 */

import { useEffect } from 'react';

const SITE_NAME = 'SetupSpot';
const DEFAULT_DESCRIPTION =
  'Discover and share amazing desk setups. Tag gear, save favorites, and get inspired by creators from around the world.';
const DEFAULT_IMAGE = 'https://setupspot.com/Logo.png';
const BASE_URL = 'https://setupspot.com';

function setMeta(name, content, isProperty = false) {
  if (!content) return;
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url) {
  if (!url) return;
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

function setJsonLd(id, schema) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

function removeJsonLd(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * @param {object} options
 * @param {string}  options.title        Full page title (already includes site name suffix)
 * @param {string}  [options.description]
 * @param {string}  [options.image]      Absolute URL to OG image
 * @param {string}  [options.url]        Canonical URL for this page
 * @param {'website'|'article'|'profile'} [options.type]
 * @param {boolean} [options.noindex]    Set true for 404, auth-only pages
 * @param {object}  [options.jsonLd]     Optional JSON-LD structured data object
 * @param {string}  [options.jsonLdId]   DOM id for the JSON-LD script tag
 */
export function useSEO({
  title,
  description,
  image,
  url,
  type = 'website',
  noindex = false,
  jsonLd,
  jsonLdId = 'page-jsonld',
} = {}) {
  useEffect(() => {
    const resolvedTitle = title || SITE_NAME;
    const resolvedDesc = description || DEFAULT_DESCRIPTION;
    const resolvedImage = image || DEFAULT_IMAGE;
    const resolvedUrl = url || `${BASE_URL}${window.location.pathname}`;

    // ── Basic ─────────────────────────────────────────────────────────────────
    document.title = resolvedTitle;
    setMeta('description', resolvedDesc);
    // Keep both brand spellings indexed so users can find the site with or without the space
    setMeta('keywords', 'Setup Spot, SetupSpot, desk setup, battlestation, workspace, gaming setup, productivity setup, desk tour, gear tag, setup sharing');

    // ── Robots ────────────────────────────────────────────────────────────────
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // ── Open Graph ────────────────────────────────────────────────────────────
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:title', resolvedTitle, true);
    setMeta('og:description', resolvedDesc, true);
    setMeta('og:image', resolvedImage, true);
    setMeta('og:url', resolvedUrl, true);

    // ── Twitter Card ──────────────────────────────────────────────────────────
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', resolvedTitle);
    setMeta('twitter:description', resolvedDesc);
    setMeta('twitter:image', resolvedImage);

    // ── Canonical ─────────────────────────────────────────────────────────────
    setCanonical(resolvedUrl);

    // ── JSON-LD ───────────────────────────────────────────────────────────────
    if (jsonLd) {
      setJsonLd(jsonLdId, jsonLd);
    } else {
      removeJsonLd(jsonLdId);
    }
  }, [title, description, image, url, type, noindex, jsonLd, jsonLdId]);
}

export default useSEO;
