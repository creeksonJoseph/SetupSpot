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

          {/* Algolia attribution — required by ToS on free plan */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', padding: '6px 14px', background: '#FAFAFA', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Search by</span>
            <svg height="10" viewBox="0 0 613 168" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M276.7 66.4c-19.8 0-34.5 14.7-34.5 35.4 0 20.8 14.7 35.4 34.5 35.4 19.9 0 34.6-14.6 34.6-35.4 0-20.7-14.7-35.4-34.6-35.4zm0 55.2c-10.6 0-18.2-7.9-18.2-19.8 0-11.8 7.6-19.8 18.2-19.8 10.7 0 18.3 8 18.3 19.8 0 11.9-7.6 19.8-18.3 19.8zM352.3 66.4c-19.8 0-34.5 14.7-34.5 35.4 0 20.8 14.7 35.4 34.5 35.4 19.9 0 34.6-14.6 34.6-35.4 0-20.7-14.7-35.4-34.6-35.4zm0 55.2c-10.6 0-18.2-7.9-18.2-19.8 0-11.8 7.6-19.8 18.2-19.8 10.7 0 18.3 8 18.3 19.8 0 11.9-7.6 19.8-18.3 19.8zM137.4 75.6V68h-16v66.8h16.4V98.5c0-11 7.5-17 17.5-17 1.5 0 3 .2 4.5.4V67c-1.3-.2-2.7-.4-4.1-.4-8.2.1-15.1 3.8-18.3 9zM208.1 68v7.3c-4.6-5.5-11.4-9-20.4-9-17.8 0-31.7 14.7-31.7 35.4 0 20.8 13.9 35.4 31.7 35.4 9 0 15.8-3.5 20.4-9v7.7h16V68h-16zm-18 55.2c-10.3 0-17.6-7.9-17.6-19.8 0-11.8 7.3-19.8 17.6-19.8 10.4 0 17.6 8 17.6 19.8.1 11.9-7.2 19.8-17.6 19.8zM425.2 36h-16.4v98.8h16.4V36zM481.4 66.4c-19.8 0-34.5 15.3-34.5 35.4 0 21.1 15.3 35.4 35.7 35.4 11 0 20.4-3.8 27.2-11l-10-9.5c-4.3 4.6-10 7.1-16.8 7.1-9.7 0-17.2-5.5-19.2-14.3H512c.3-1.9.5-3.9.5-6-.1-20-14.2-37.1-31.1-37.1zm-17.6 29.1c1.8-9 8.6-14.6 17.6-14.6 8.8 0 15.7 5.6 17.3 14.6H463.8zM558 66.4c-8.2 0-15.4 2.8-20.4 7.8V36H521v98.8h16V127c5 5 12.2 7.8 20.4 7.8 19.3 0 33.6-14.7 33.6-35.4 0-20.6-14.3-35-33-35zm-2.5 55.2c-10.4 0-17.6-8-17.6-19.8 0-11.8 7.2-19.8 17.6-19.8 10.3 0 17.6 8 17.6 19.8 0 11.9-7.3 19.8-17.6 19.8z" fill="#003DFF"/>
              <path d="M80.4 0C55.1 0 34.5 20.6 34.5 46v76.8L57 134V46c0-12.9 10.4-23.4 23.4-23.4 12.9 0 23.4 10.5 23.4 23.4v40.6H80.4v22.5h23.4v15.4l22.5 11V46C126.3 20.6 105.7 0 80.4 0z" fill="#5468FF"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
