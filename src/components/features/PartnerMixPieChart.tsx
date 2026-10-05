import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PartnerMixPieChartProps {
    accommodation: number;
    restaurant: number;
    transport: number;
}

const colors = ['#0284c7', '#d97706', '#059669'];

const PartnerMixPieChart = ({ accommodation, restaurant, transport }: PartnerMixPieChartProps) => {
    const data = [
        { name: 'Accommodation', value: accommodation },
        { name: 'Restaurant', value: restaurant },
        { name: 'Transport', value: transport },
    ];
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.8fr)]">
            <div className="h-[230px] min-w-0" role="img" aria-label="Pie chart showing partner distribution">
                {total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3} stroke="none">
                                {data.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Partners']} contentStyle={{ borderRadius: 12, borderColor: '#cbd5e1' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No partner data yet</div>
                )}
            </div>
            <div className="space-y-4">
                {data.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index] }} />
                            <span className="truncate">{entry.name}</span>
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{entry.value.toLocaleString()}</span>
                    </div>
                ))}
                <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total partners</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{total.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default PartnerMixPieChart;