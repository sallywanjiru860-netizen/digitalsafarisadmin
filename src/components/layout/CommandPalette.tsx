import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, CornerDownLeft, Search, X } from 'lucide-react';

const destinations = [
    { label: 'Dashboard', group: 'Overview', path: '/' },
    { label: 'Reports', group: 'Overview', path: '/reports' },
    { label: 'Partners', group: 'Management', path: '/partners' },
    { label: 'Customers', group: 'Management', path: '/customers' },
    { label: 'Locations', group: 'Management', path: '/locations' },
    { label: 'Payments', group: 'Management', path: '/payments' },
    { label: 'Disputes', group: 'Management', path: '/disputes' },
    { label: 'Backups', group: 'Management', path: '/backups' },
    { label: 'Administrators', group: 'Management', path: '/admins' },
    { label: 'Settings', group: 'Configuration', path: '/settings' },
    { label: 'Branding', group: 'Configuration', path: '/branding' },
    { label: 'Legal', group: 'Configuration', path: '/legal' },
];

interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
}

const CommandPalette = ({ open, onClose }: CommandPaletteProps) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const normalizedQuery = query.trim().toLowerCase();
    const results = destinations.filter((destination) =>
        `${destination.label} ${destination.group}`.toLowerCase().includes(normalizedQuery)
    );

    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIndex(0);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    if (!open) return null;

    const openDestination = (path: string) => {
        navigate(path);
        onClose();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, results.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === 'Enter' && results[activeIndex]) {
            event.preventDefault();
            openDestination(results[activeIndex].path);
        } else if (event.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 px-4 pt-[12vh] backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="command-palette-title"
                className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
                <h2 id="command-palette-title" className="sr-only">Search admin pages</h2>
                <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
                    <Search size={19} className="shrink-0 text-slate-400" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search pages and sections..."
                        aria-label="Search admin pages"
                        className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                    />
                    <button type="button" onClick={onClose} aria-label="Close search" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">
                        <X size={17} />
                    </button>
                </div>
                <div className="max-h-[min(55vh,420px)] overflow-y-auto p-2">
                    {results.length ? results.map((result, index) => (
                        <button
                            key={result.path}
                            type="button"
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => openDestination(result.path)}
                            className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition-colors ${activeIndex === index ? 'bg-primary-50 text-primary-900 dark:bg-primary-950/50 dark:text-primary-100' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'}`}
                        >
                            <span>
                                <span className="block text-sm font-semibold">{result.label}</span>
                                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{result.group}</span>
                            </span>
                            {activeIndex === index && <CornerDownLeft size={16} className="shrink-0 text-slate-400" />}
                        </button>
                    )) : (
                        <p className="px-3 py-8 text-center text-sm text-slate-500">No matching pages</p>
                    )}
                </div>
                <div className="flex items-center gap-4 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1"><ArrowUp size={13} /><ArrowDown size={13} /> Navigate</span>
                    <span className="inline-flex items-center gap-1"><CornerDownLeft size={13} /> Open</span>
                    <span className="ml-auto">Esc to close</span>
                </div>
            </section>
        </div>
    );
};

export default CommandPalette;
