import Layout from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'guest' })
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Icon icon="mdi:loading" className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  const practiceSuccessRate = analytics?.practice?.total_attempts > 0 
    ? Math.round((analytics.practice.passed_count / analytics.practice.total_attempts) * 100)
    : 0;
    
  const challengeSuccessRate = analytics?.challenge?.total_attempts > 0 
    ? Math.round((analytics.challenge.passed_count / analytics.challenge.total_attempts) * 100)
    : 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Icon icon="mdi:chart-box" className="text-blue-600" />
          Analytics Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Practice Mode Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <Icon icon="mdi:code" className="text-blue-600 w-8 h-8" />
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Practice</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {analytics?.practice?.unique_challenges || 0}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Challenges Solved</div>
              <div className="text-xs text-muted-foreground">
                {analytics?.practice?.total_attempts || 0} total attempts
              </div>
            </div>
          </div>

          {/* Challenge Mode Stats */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <Icon icon="mdi:trophy" className="text-green-600 w-8 h-8" />
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Challenge</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {analytics?.challenge?.unique_challenges || 0}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Challenges Solved</div>
              <div className="text-xs text-muted-foreground">
                {analytics?.challenge?.total_attempts || 0} total attempts
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <Icon icon="mdi:target" className="text-purple-600 w-8 h-8" />
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Success</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {practiceSuccessRate}%
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Practice Success</div>
              <div className="text-xs text-muted-foreground">
                Challenge: {challengeSuccessRate}%
              </div>
            </div>
          </div>

          {/* Average Time */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-4">
              <Icon icon="mdi:clock" className="text-orange-600 w-8 h-8" />
              <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">Time</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {Math.round(analytics?.practice?.avg_time || 0)}s
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Avg. Solve Time</div>
              <div className="text-xs text-muted-foreground">
                {Math.round(analytics?.practice?.avg_code_length || 0)} chars avg
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Activity Line Chart */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border shadow-lg">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Icon icon="mdi:chart-line" className="text-blue-600 w-6 h-6" />
              </div>
              Daily Progress
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics?.dailyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attempts" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#1d4ed8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="passed" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Success Rate Pie Chart */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border shadow-lg">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Icon icon="mdi:chart-donut" className="text-green-600 w-6 h-6" />
              </div>
              Success Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Passed', value: analytics?.practice?.passed_count || 0, color: '#10b981' },
                    { name: 'Failed', value: (analytics?.practice?.total_attempts || 0) - (analytics?.practice?.passed_count || 0), color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Passed ({analytics?.practice?.passed_count || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Failed ({(analytics?.practice?.total_attempts || 0) - (analytics?.practice?.passed_count || 0)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1 rounded-2xl mb-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🏆 Performance Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Icon icon="mdi:lightning-bolt" className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                <div className="text-2xl font-bold text-blue-600">{Math.round(analytics?.practice?.avg_time || 0)}s</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Solve Time</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <Icon icon="mdi:code-braces" className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <div className="text-2xl font-bold text-green-600">{Math.round(analytics?.practice?.avg_code_length || 0)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Code Length</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                <Icon icon="mdi:trophy" className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                <div className="text-2xl font-bold text-purple-600">{practiceSuccessRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}