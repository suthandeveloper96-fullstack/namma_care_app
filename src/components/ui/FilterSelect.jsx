/** Compact labelled select used in horizontal filter bars. `options` = [[value, label], …]. */
export default function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <label className="filter-select" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
