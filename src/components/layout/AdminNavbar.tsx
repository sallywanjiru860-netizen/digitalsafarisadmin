import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { formatCompact } from '../../utils/formatCurrency';
import usePlatformConfig, { getPlatformAssetUrl } from '../../hooks/usePlatformConfig';
import { Search } from 'lucide-react';

interface AdminNavbarProps {
    onToggleSidebar?: () => void;
    onOpenCommandPalette?: () => void;
}

const AdminNavbar = ({ onToggleSidebar, onOpenCommandPalette }: AdminNavbarProps) => {
    const { user, logout } = useAuth();
    const { stats } = useDashboard();
    const { config } = usePlatformConfig();
    const logoUrl = getPlatformAssetUrl(config.site_logo);

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-base text-slate-700 shadow-sm transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
                        >
                            ☰
                        </button>
                        {logoUrl ? (
                            <img src={logoUrl} alt={`${config.site_name || 'Digital Safaris'} logo`} className="h-10 w-10 rounded-xl object-contain" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-sm font-bold text-white">DS</div>
                        )}
                        <div>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{config.site_name || 'Digital Safaris'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Admin console</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onOpenCommandPalette}
                            aria-label="Search admin pages"
                            aria-keyshortcuts="Control+K Meta+K"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Search size={17} />
                            <span className="hidden text-sm font-medium sm:inline">Search</span>
                            <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 md:inline">Ctrl K</kbd>
                        </button>
                        <span className="hidden text-sm font-medium sm:block">{user?.firstName}</span>
                        <button onClick={logout} className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;