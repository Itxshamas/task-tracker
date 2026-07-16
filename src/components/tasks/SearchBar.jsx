function SearchBar({ value, onChange }) {
  return (
    <label className="block">
      <span className="sr-only">Search tasks</span>
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
        <svg
          className="h-4 w-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M11 4a7 7 0 110 14 7 7 0 010-14zM21 21l-4.2-4.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search tasks"
          className="w-full border-0 bg-transparent text-sm outline-none"
        />
      </div>
    </label>
  );
}

export default SearchBar;
