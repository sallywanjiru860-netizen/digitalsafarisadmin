import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, UsersRound } from 'lucide-react';
import { api } from '../api/axios';
import SectionHeader from '../components/ui/SectionHeader';
import type { Admin } from '../types';

type AdminRoleFilter = 'all' | Admin['role'];

const roleLabels: Record<Admin['role'], string> = {
    super_admin: 'Super admin',
    admin: 'Admin',
    support: 'Support',
};

const formatLastLogin = (date: string) => {
    if (!date) return 'Never';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? 'Unknown' : parsed.toLocaleString();
};

const AdminsPage = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<AdminRoleFilter>('all');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let current = true;
        setLoading(true);
        setError('');

        api.get('/admin/admins')
            .then((response) => {
                const payload = response.data;
                const records = Array.isArray(payload)
                    ? payload
                    : payload.admins ?? payload.users ?? payload.data;
                if (!Array.isArray(records)) throw new Error('The admin list response was not an array.');
                if (current) setAdmins(records);
            })
            .catch((requestError: any) => {
                if (current) setError(requestError?.response?.data?.message || requestError.message || 'Could not load administrators.');
            })
            .finally(() => {
                if (current) setLoading(false);
            });

        return () => { current = false; };
    }, [reloadKey]);

    const filteredAdmins = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return admins.filter((admin) => {
            const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
            const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
            return matchesRole && (!normalizedQuery || fullName.includes(normalizedQuery) || admin.email.toLowerCase().includes(normalizedQuery));
        });
    }, [admins, query, roleFilter]);

    return (
        <div className="space-y-6">
            <SectionHeader title="Administrators" subtitle="Admin accounts and assigned roles" />

            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><UsersRound size={20} /></span>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total administrators</p>
                        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{loading ? '...' : admins.length}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="relative block sm:w-64">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search name or email"
                            aria-label="Search administrators by name or email"
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                        disabled={loading}
                        aria-label="Refresh administrators"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </section>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter administrators by role">
                {([
                    ['all', 'All roles'],
                    ['super_admin', 'Super admin'],
                    ['admin', 'Admin'],
                    ['support', 'Support'],
                ] as const).map(([role, label]) => (
                    <button
                        key={role}
                        type="button"
                        aria-pressed={roleFilter === role}
                        onClick={() => setRoleFilter(role)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${roleFilter === role ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {error ? (
                    <div className="p-8 text-center">
                        <p className="font-medium text-rose-700 dark:text-rose-300">Unable to load administrators</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error}</p>
                        <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white">Try again</button>
                    </div>
                ) : loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">Loading administrators...</div>
                ) : filteredAdmins.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Administrator</th>
                                    <th className="px-5 py-4 font-semibold">Email</th>
                                    <th className="px-5 py-4 font-semibold">Role</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                    <th className="px-5 py-4 font-semibold">Last login</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredAdmins.map((admin) => (
                                    <tr key={admin._id} className="text-slate-700 dark:text-slate-200">
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{admin.firstName} {admin.lastName}</td>
                                        <td className="px-5 py-4">{admin.email}</td>
                                        <td className="px-5 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{roleLabels[admin.role] || admin.role}</span></td>
                                        <td className="px-5 py-4"><span className={`inline-flex items-center gap-2 text-xs font-medium ${admin.isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}><span className={`h-2 w-2 rounded-full ${admin.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />{admin.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{formatLastLogin(admin.lastLogin)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-sm text-slate-500">No administrators match these filters.</div>
                )}
            </div>
            {!loading && !error && <p className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredAdmins.length} of {admins.length} administrators</p>}
        </div>
    );
};

export default AdminsPage;