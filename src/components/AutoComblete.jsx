import { useState, useRef, useEffect } from "react";

function Autocomplete({ data }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selected, setSelected] = useState(null);
    const wrapperRef = useRef(null);

    // Filter the array on every keystroke
    const suggestions = query.trim()
        ? data.filter((item) =>
              item.toLowerCase().includes(query.toLowerCase()),
          )
        : [];

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function handleSelect(item) {
        setQuery(item);
        setSelected(item);
        setOpen(false);
        setActiveIndex(-1);
    }

    function handleKeyDown(e) {
        if (!open || !suggestions.length) return;
        if (e.key === "ArrowDown")
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        if (e.key === "ArrowUp") setActiveIndex((i) => Math.max(i - 1, 0));
        if (e.key === "Enter" && activeIndex >= 0)
            handleSelect(suggestions[activeIndex]);
        if (e.key === "Escape") setOpen(false);
    }

    return (
        <div ref={wrapperRef} style={{ position: "relative" }}>
            <input
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim() && setOpen(true)}
                placeholder="Search..."
                autoComplete="off"
            />

            {open && suggestions.length > 0 && (
                <ul className="dropdown">
                    {suggestions.map((item, i) => (
                        <li
                            key={item}
                            onMouseDown={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(i)}
                            className={i === activeIndex ? "active" : ""}>
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
