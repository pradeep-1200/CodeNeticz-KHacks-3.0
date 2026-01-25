import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';

const ProgressChart = ({ type = 'bar', data, xKey, dataKey, color = '#2563eb' }) => {
  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
             contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
             itemStyle={{ color: 'var(--text-primary)' }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
     return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
             contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
             itemStyle={{ color: 'var(--text-primary)' }}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
     );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
        <XAxis dataKey={xKey} stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
             cursor={{ fill: 'var(--bg-secondary)', opacity: 0.5 }}
             contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
             itemStyle={{ color: 'var(--text-primary)' }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
