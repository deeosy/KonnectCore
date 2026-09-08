import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Search className="h-4 w-4 text-muted-light" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-dark placeholder-muted-light outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary-100"
      />
    </div>
  )
}
