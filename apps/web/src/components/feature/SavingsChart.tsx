import { useId } from 'react';
import type React from 'react';
import { CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type TChartDataItem = { month: string; value: number };
type TChartData = TChartDataItem[];

export default function SavingsChart({ chartData }: { chartData: TChartData }): React.JSX.Element {
  const uuid = useId();

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray='3 3' className='opacity-20' />
        <XAxis dataKey='month' axisLine={false} tickLine={false} className='text-foreground/60' />
        <YAxis
          axisLine={false}
          tickLine={false}
          className='text-foreground/60'
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, 'Portfolio Value']}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            color: 'hsl(var(--foreground))',
          }}
        />
        <Line
          type='monotone'
          dataKey='value'
          stroke={`url(#${uuid})`}
          strokeWidth={3}
          dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2, fill: '#f97316' }}
        />
        <defs>
          <linearGradient id={uuid} x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor='#f97316' />
            <stop offset='100%' stopColor='#ea580c' />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  );
}
