import { useState, useRef, useEffect } from "react";
import { useGeocode } from "../../hooks/useGeocode";
import type { GeocodeResult } from "../../types/geocode";
import { LoadingSpinner } from "../common/LoadingSpinner";
import "./AddressSearch.css";

interface AddressSearchProps {
  onSelect: (result: GeocodeResult) => void;
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading, search, clearResults } = useGeocode();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    search(value);
    setIsOpen(true);
  }

  function handleSelect(result: GeocodeResult) {
    setQuery(result.display_name);
    setIsOpen(false);
    clearResults();
    onSelect(result);
  }

  return (
    <div className="address-search" ref={wrapperRef}>
      <label className="field-label">Adresse suchen</label>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="z.B. Wien Stephansplatz"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              e.preventDefault();
              handleSelect(results[0]);
            }
          }}
        />
        {loading && (
          <div className="search-spinner">
            <LoadingSpinner size={16} />
          </div>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul className="search-results">
          {results.map((r, i) => (
            <li key={i} className="search-result-item" onClick={() => handleSelect(r)}>
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
