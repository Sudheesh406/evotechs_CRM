import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Percent } from 'lucide-react';

// -------------------- 1. DATA GENERATOR --------------------
const generateFakeProfitData = (shop) => {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  let baseProfit = shop === "Thiruvananthapuram" ? 60000 : 48000;

  return months.map((month, index) => {
    const fluctuation = Math.random() * 0.15 - 0.05;
    baseProfit *= (1 + fluctuation + 0.005);

    const marginPct = (0.15 + Math.random() * 0.1);
    const margin = Math.round(baseProfit * marginPct);

    return {
      month,
      Profit: Math.round(baseProfit),
      Margin: margin,
      MarginPct: (marginPct * 100).toFixed(1),
      Target: Math.round(
        (shop === "Thiruvananthapuram" ? 55000 : 45000) + index * 4000
      )
    };
  });
};

// -------------------- 2. CUSTOM TOOLTIP --------------------
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 border rounded-xl shadow-2xl bg-white/95 text-sm border-indigo-200">
        <p className="font-bold text-indigo-700 mb-1">{`${label} Performance`}</p>
        {payload.map((item, index) => {
          const isCurrency = item.dataKey !== 'MarginPct';
          const value = isCurrency 
            ? `$${item.value.toLocaleString()}` 
            : `${item.value}%`;

          return (
            <p 
              key={index} 
              className="font-semibold"
              style={{ color: item.color }}
            >
              {`${item.name}: ${value}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

// -------------------- 3. AREA CHART (PROFIT + TARGET) --------------------
const ProfitTargetChart = ({ data }) => (
  <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex-1 min-w-[300px]">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <TrendingUp className="w-5 h-5 text-indigo-500 mr-2"/> Monthly Revenue & Target
    </h3>

    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

          <XAxis dataKey="month" stroke="#4b5563" axisLine={false} tickLine={false} />
          <YAxis 
            orientation="left" 
            stroke="#4b5563"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            axisLine={false} 
            tickLine={false} 
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle"/>

          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <Area 
            type="monotone" 
            dataKey="Profit" 
            stroke="#4f46e5"
            fillOpacity={1} 
            fill="url(#colorProfit)"
            strokeWidth={2}
            name="Profit"
          />

          <Line 
            type="monotone"
            dataKey="Target"
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            name="Target Goal"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// -------------------- 4. MARGIN BAR CHART --------------------
const MarginBarChart = ({ data }) => (
  <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex-1 min-w-[300px]">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <Percent className="w-5 h-5 text-teal-500 mr-2"/> Operational Margin
    </h3>

    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

          <XAxis dataKey="month" stroke="#4b5563" axisLine={false} tickLine={false} />
          <YAxis 
            stroke="#4b5563"
            tickFormatter={(value) => `${value}%`}
            axisLine={false} 
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle"/>

          <Bar 
            dataKey="MarginPct"
            fill="#14b8a6"
            barSize={20}
            radius={[4, 4, 0, 0]}
            name="Margin %"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// -------------------- 5. MAIN COMPONENT --------------------
export default function MonthlyProfitDashboard() {
  
  const [selectedShop, setSelectedShop] = useState("Thiruvananthapuram");

  const profitData = generateFakeProfitData(selectedShop);

  const initialProfit = profitData[0].Profit;
  const finalProfit = profitData[profitData.length - 1].Profit;
  const growthRate = (((finalProfit / initialProfit) - 1) * 100).toFixed(1);
  const totalAnnualProfit = profitData.reduce((sum, item) => sum + item.Profit, 0);

  const isPositive = growthRate >= 0;

  return (
    <div className="p-8 font-sans bg-gray-50 rounded-2xl shadow-3xl w-full max-w-7xl mx-auto">

      {/* ---------- SHOP SELECTOR ---------- */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-white shadow-lg rounded-full p-2 border border-indigo-200">
          {["Thiruvananthapuram", "Pathanamthitta"].map((shop) => (
            <button
              key={shop}
              onClick={() => setSelectedShop(shop)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all
                ${selectedShop === shop 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-indigo-100"}`}
            >
              {shop}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- SUMMARY CARDS ---------- */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex-1 min-w-[200px] p-5 bg-white rounded-xl shadow-xl border border-indigo-100">
          <p className="text-sm font-medium text-indigo-600">Total Annual Profit</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ${totalAnnualProfit.toLocaleString()}
          </p>
        </div>

        <div className="flex-1 min-w-[200px] p-5 bg-white rounded-xl shadow-xl border border-indigo-100">
          <p className="text-sm font-medium text-indigo-600">Year-over-Year Growth</p>
          <div className="flex items-center mt-1">
            <p className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate}%
            </p>
            <TrendingUp className={`w-6 h-6 ml-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>
      </div>

      {/* ---------- CHARTS LAYOUT ---------- */}
      <div className="flex flex-wrap lg:flex-nowrap gap-6">
        <ProfitTargetChart data={profitData} /> 
        <MarginBarChart data={profitData} /> 
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center">
        *Data is simulated for demo purposes. Revenue and margin vary per shop.
      </p>

    </div>
  );
}
