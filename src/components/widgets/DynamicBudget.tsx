'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Project } from '@/types';
import { DollarSign, Edit2 } from 'lucide-react';
import EditBudgetModal from '../modals/EditBudgetModal';

interface DynamicBudgetProps {
    project: Project;
}

export default function DynamicBudget({ project }: DynamicBudgetProps) {
    const [showEditModal, setShowEditModal] = useState(false);

    // Calculate totals
    const totalAllocated = project.budget?.reduce((sum, seg) => sum + seg.allocated, 0) || 0;
    const totalSpent = project.budget?.reduce((sum, seg) => sum + seg.spent, 0) || 0;
    const remaining = totalAllocated - totalSpent;
    const percentageSpent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    // Prepare data for pie chart
    const chartData = project.budget?.map(segment => ({
        name: segment.name,
        value: segment.allocated,
        spent: segment.spent,
        remaining: segment.allocated - segment.spent,
        color: segment.color || '#D2691E',
    })) || [];

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass p-3 rounded-lg">
                    <p className="font-semibold text-bronze mb-1">{data.name}</p>
                    <p className="text-sm">Allocated: ${data.value.toLocaleString()}</p>
                    <p className="text-sm">Spent: ${data.spent.toLocaleString()}</p>
                    <p className="text-sm">Remaining: ${data.remaining.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <div className="glass p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-bronze" />
                        Budget Overview
                    </h2>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="p-2 hover:bg-bronze/20 rounded-lg transition-colors group"
                    >
                        <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-bronze" />
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-basalt/50 p-4 rounded-lg border border-bronze/20">
                        <p className="text-sm text-gray-400 mb-1">Total Budget</p>
                        <p className="text-2xl font-bold text-bronze">
                            ${totalAllocated.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-basalt/50 p-4 rounded-lg border border-bronze/20">
                        <p className="text-sm text-gray-400 mb-1">Spent</p>
                        <p className="text-2xl font-bold text-red-400">
                            ${totalSpent.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-basalt/50 p-4 rounded-lg border border-bronze/20">
                        <p className="text-sm text-gray-400 mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-green-400">
                            ${remaining.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Budget Progress</span>
                        <span className="text-bronze font-semibold">{percentageSpent.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-basalt rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, percentageSpent)}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${percentageSpent > 90 ? 'bg-red-500' : percentageSpent > 70 ? 'bg-yellow-500' : 'bg-bronze'
                                }`}
                        />
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value, entry: any) => (
                                    <span className="text-sm">
                                        {value}: ${entry.payload.value.toLocaleString()}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Budget Breakdown */}
                <div className="mt-6 space-y-2">
                    {project.budget?.map(segment => {
                        const segmentPercent = segment.allocated > 0
                            ? (segment.spent / segment.allocated) * 100
                            : 0;

                        return (
                            <div key={segment.id} className="bg-basalt/30 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: segment.color || '#D2691E' }}
                                        />
                                        <span className="font-semibold">{segment.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {segmentPercent.toFixed(0)}% used
                                    </span>
                                </div>
                                <div className="h-2 bg-basalt rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, segmentPercent)}%`,
                                            backgroundColor: segment.color || '#D2691E',
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-gray-500">
                                    <span>${segment.spent.toLocaleString()} spent</span>
                                    <span>${segment.allocated.toLocaleString()} allocated</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit Budget Modal */}
            {showEditModal && (
                <EditBudgetModal
                    project={project}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}
