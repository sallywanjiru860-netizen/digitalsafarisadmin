import { lazy, Suspense } from 'react';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import SectionHeader from '../components/ui/SectionHeader';
import MetricCard from '../components/ui/MetricCard';
import DisputeList from '../components/features/DisputeList';
import PlatformHealth from '../components/features/PlatformHealth';
import { formatCurrency } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

const Revenue3DChart = lazy(() => import('../components/features/Revenue3DChart'));
const PartnerMixPieChart = lazy(() => import('../components/features/PartnerMixPieChart'));

const DashboardContent = () => {
    const { stats, loading, refresh } = useDashboard();
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeader title="Dashboard" subtitle="Platform overview and key metrics" />
                <button
                    type="button"
                    onClick={refresh}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total Partners" value={stats.totalPartners} trend="All types" icon="🏨" />
                <MetricCard label="Total Customers" value={stats.totalCustomers} trend="Active users" icon="👥" />
                <MetricCard label="Total Bookings" value={stats.totalBookings} trend="All time" icon="📋" />
                <MetricCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} trend="Completed payments" icon="💰" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Partner mix</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Distribution across partner categories</p>
                        </div>
                        <Link to="/partners" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">View partners</Link>
                    </div>
                    <div className="mt-3">
                        <Suspense fallback={<div className="flex h-[230px] items-center justify-center text-sm text-slate-400">Loading partner chart...</div>}>
                            <PartnerMixPieChart accommodation={stats.accPartners} restaurant={stats.restPartners} transport={stats.transPartners} />
                        </Suspense>
                    </div>
                </section>
                <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">Needs attention</h2>
                            <p className="mt-1 text-sm text-slate-400">Current support and dispute workload</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">Operations</span>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Link to="/disputes" className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                            <p className="text-sm text-slate-400">Disputes</p>
                            <p className="mt-2 text-2xl font-semibold">{stats.totalDisputes}</p>
                            <span className="mt-3 inline-block text-xs font-semibold text-rose-300">Review queue</span>
                        </Link>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm text-slate-400">Support tickets</p>
                            <p className="mt-2 text-2xl font-semibold">{stats.totalTickets}</p>
                            <span className="mt-3 inline-block text-xs font-semibold text-amber-300">Open workload</span>
                        </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                        <span className="text-slate-400">Bookings to date</span>
                        <span className="font-semibold">{stats.totalBookings.toLocaleString()}</span>
                    </div>
                </section>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trend</h2>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">Live</span>
                    </div>
                    <div className="mt-6">
                        <Suspense fallback={<div className="flex h-[300px] items-center justify-center text-sm text-slate-400">Loading 3D analytics...</div>}>
                            <Revenue3DChart />
                        </Suspense>
                    </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Disputes</h2>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">Latest</span>
                    </div>
                    <div className="mt-6">
                        <DisputeList />
                    </div>
                </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Platform Health</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">Status</span>
                </div>
                <div className="mt-6">
                    <PlatformHealth />
                </div>
            </div>
        </div>
    );
};

const DashboardPage = () => (
    <DashboardProvider>
        <DashboardContent />
    </DashboardProvider>
);

export default DashboardPage;