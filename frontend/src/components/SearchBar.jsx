/**
 * SearchBar — pure render component.
 * All search logic lives in hooks/useSearch.js.
 *
 * Props:
 *   onResults(hits | null) — called with Algolia hits when searching, null when cleared
 */
import React from 'react';
import { useSearch } from '../hooks/useSearch';

export default function SearchBar({ onResults }) {
  const {
    query, setQuery,
    suggestions,
    focused, setFocused,
    loading,
    activeIdx, setActiveIdx,
    inputRef,
    containerRef,
    showDropdown,
    clearSearch,
    selectSuggestion,
    handleKeyDown,
  } = useSearch({ onResults });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
      {/* Input row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#ffffff',
          border: focused ? '2px solid #0066ff' : '2px solid #E2E8F0',
          borderRadius: '14px',
          padding: '0 16px',
          height: '48px',
          boxShadow: focused
            ? '0 0 0 4px rgba(0,102,255,0.10)'
            : '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* Search / spinner icon */}
        {loading ? (
          <svg
            style={{ width: 18, height: 18, color: '#0066ff', flexShrink: 0 }}
            className="animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
          </svg>
        ) : (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: focused ? '#0066ff' : '#94a3b8', flexShrink: 0 }}
          >
            search
          </span>
        )}

        <input
          ref={inputRef}
          id="explore-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search setups, authors, items…"
          autoComplete="off"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            fontFamily: 'Inter, sans-serif',
            color: '#0F172A',
            backgroundColor: 'transparent',
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              color: '#94a3b8',
              borderRadius: '50%',
              transition: 'color 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
          {suggestions.map((hit, i) => (
            <button
              key={hit.objectID}
              onClick={() => selectSuggestion(hit)}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                borderBottom: i < suggestions.length - 1 ? '1px solid #F1F5F9' : 'none',
                background: i === activeIdx ? '#F8FAFF' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
            >
              {/* Thumbnail */}
              {hit.image_url ? (
                <img
                  src={hit.image_url}
                  alt={hit.name}
                  style={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: '#F1F5F9' }}
                />
              ) : (
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '8px', background: '#F1F5F9', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#CBD5E1' }}>desktop_windows</span>
                </div>
              )}

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {hit.name}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{hit.author}
                  {hit.items?.length > 0 && (
                    <span style={{ color: '#94a3b8' }}> · {hit.items.slice(0, 2).join(', ')}</span>
                  )}
                </p>
              </div>

              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#CBD5E1', flexShrink: 0 }}>north_west</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
