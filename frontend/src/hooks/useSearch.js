/**
 * useSearch — Algolia search logic extracted from SearchBar.
 *
 * Handles: debounced querying, suggestion state, keyboard nav index,
 * dropdown open/close, and outside-click detection.
 *
 * Returns everything SearchBar needs to render; SearchBar itself
 * stays pure JSX with no search logic.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const APP_ID    = import.meta.env.VITE_ALGOLIA_APP_ID;
const SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;
const INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'setups';

const searchClient = algoliasearch(APP_ID, SEARCH_KEY);

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useSearch({ onResults }) {
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [activeIdx, setActiveIdx]   = useState(-1);

  const inputRef     = useRef(null);
  const containerRef = useRef(null);

  const debouncedQuery = useDebounce(query, 220);

  // Fetch suggestions whenever the debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      onResults(null);
      return;
    }

    setLoading(true);
    searchClient
      .search({
        requests: [
          {
            indexName: INDEX_NAME,
            query: debouncedQuery,
            hitsPerPage: 6,
            attributesToRetrieve: ['name', 'author', 'image_url', 'items', 'objectID'],
            attributesToHighlight: ['name', 'author', 'items'],
          },
        ],
      })
      .then(({ results }) => {
        const hits = results[0]?.hits ?? [];
        setSuggestions(hits);
        onResults(hits);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQuery, onResults]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    onResults(null);
    setActiveIdx(-1);
  }, [onResults]);

  const selectSuggestion = useCallback((hit) => {
    setQuery(hit.name);
    onResults([hit]);
    setSuggestions([]);
    setFocused(false);
    setActiveIdx(-1);
  }, [onResults]);

  const handleKeyDown = useCallback((e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      clearSearch();
      inputRef.current?.blur();
    }
  }, [suggestions, activeIdx, selectSuggestion, clearSearch]);

  const showDropdown = focused && suggestions.length > 0 && query.trim().length > 0;

  return {
    query,
    setQuery,
    suggestions,
    focused,
    setFocused,
    loading,
    activeIdx,
    setActiveIdx,
    inputRef,
    containerRef,
    showDropdown,
    clearSearch,
    selectSuggestion,
    handleKeyDown,
  };
}
