import Layout from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/advanced', {
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
              <Icon icon="mdi:chart-line" className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
            </div>
            <p className="mt-4 text-lg font-medium">Loading Advanced Analytics...</p>
            <p className="text-sm text-gray-500">Analyzing your coding patterns</p>
          </div>
        </div>
      </Layout>
    );
  }

  const performance = analytics?.performance || {};
  const successRate = performance.total_sessions > 0 ? 
    Math.round((performance.solved_count / performance.total_sessions) * 100) : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Icon icon="mdi:chart-box-multiple" className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Advanced Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Deep insights into your coding journey</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-white/50 dark:bg-gray-800/50 p-2 rounded-2xl backdrop-blur-sm">
              {[
                { id: 'overview', label: 'Overview', icon: 'mdi:view-dashboard' },
                { id: 'performance', label: 'Performance', icon: 'mdi:speedometer' },
                { id: 'patterns', label: 'Patterns', icon: 'mdi:brain' },
                { id: 'skills', label: 'Skills', icon: 'mdi:trophy-variant' },
                { id: 'problems', label: 'Problems', icon: 'mdi:puzzle' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-white/70 dark:hover:bg-gray-700/70'
                  }`}
                >
                  <Icon icon={tab.icon} className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Enhanced KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-2xl transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Icon icon="mdi:code-braces" className="w-10 h-10" />
                    <div className="text-right">
                      <div className="text-xs opacity-80">Sessions</div>
                      <div className="text-2xl font-bold">{performance.total_sessions || 0}</div>
                    </div>
                  </div>
                  <div className="text-sm opacity-90">Recent: {performance.recent_attempts || 0} attempts</div>
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{width: `${Math.min(100, (performance.total_sessions || 0) * 2)}%`}}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-green-700 p-6 rounded-2xl text-white shadow-2xl transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Icon icon="mdi:trophy" className="w-10 h-10" />
                    <div className="text-right">
                      <div className="text-xs opacity-80">Success Rate</div>
                      <div className="text-2xl font-bold">{successRate}%</div>
                    </div>
                  </div>
                  <div className="text-sm opacity-90">Recent: {performance.recent_success_rate || 0}%</div>
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{width: `${successRate}%`}}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-2xl transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Icon icon="mdi:lightning-bolt" className="w-10 h-10" />
                    <div className="text-right">
                      <div className="text-xs opacity-80">Avg Speed</div>
                      <div className="text-2xl font-bold">{Math.round(performance.avg_solve_time || 0)}s</div>
                    </div>
                  </div>
                  <div className="text-sm opacity-90">Range: {Math.round(performance.min_solve_time || 0)}-{Math.round(performance.max_solve_time || 0)}s</div>
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{width: `${Math.max(10, 100 - (performance.avg_solve_time || 0) / 10)}%`}}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-6 rounded-2xl text-white shadow-2xl transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Icon icon="mdi:fire" className="w-10 h-10" />
                    <div className="text-right">
                      <div className="text-xs opacity-80">Streak</div>
                      <div className="text-2xl font-bold">{analytics?.streakData?.[0]?.current_streak_days || 0}</div>
                    </div>
                  </div>
                  <div className="text-sm opacity-90">Active Days: {performance.active_days || 0}</div>
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{width: `${Math.min(100, (analytics?.streakData?.[0]?.current_streak_days || 0) * 10)}%`}}></div>
                  </div>
                </div>
              </div>

              {/* Skill Progress Bars */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Icon icon="mdi:chart-line-variant" className="text-indigo-600" />
                  Skill Progression
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(analytics?.skillLevels || []).map((skill: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{skill.skill_category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded-full">
                            Level {skill.current_level}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            skill.skill_rank === 'EXPERT' ? 'bg-purple-100 text-purple-800' :
                            skill.skill_rank === 'ADVANCED' ? 'bg-blue-100 text-blue-800' :
                            skill.skill_rank === 'INTERMEDIATE' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {skill.skill_rank}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-1000"
                            style={{width: `${(skill.current_xp / skill.xp_to_next_level) * 100}%`}}
                          >
                            <span className="text-xs text-white font-bold">
                              {Math.round((skill.current_xp / skill.xp_to_next_level) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <span>{skill.current_xp} XP</span>
                          <span>{skill.xp_to_next_level} XP to next level</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {skill.problems_solved} problems solved • {skill.accuracy_rate}% accuracy
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Streak Visualization */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Icon icon="mdi:fire" className="text-orange-600" />
                    Daily Streak Progress
                  </h3>
                  {analytics?.streakData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.streakData}>
                        <defs>
                          <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="activity_date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                          stroke="#64748b" 
                        />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none', 
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="current_streak_days" 
                          stroke="#f97316" 
                          fill="url(#streakGradient)"
                          strokeWidth={3}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="challenges_solved" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Icon icon="mdi:chart-line" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No streak data yet</p>
                        <p className="text-sm">Start solving challenges to see your progress!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Productivity Heatmap */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Icon icon="mdi:chart-heatmap" className="text-purple-600" />
                    Productivity Heatmap
                  </h3>
                  {analytics?.hourlyPattern?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.hourlyPattern}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="hour" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'activity_count' ? `${value} sessions` :
                            name === 'success_count' ? `${value} solved` :
                            name === 'avg_typing_speed' ? `${Math.round(Number(value))} chars/sec` : value,
                            name === 'activity_count' ? 'Sessions' :
                            name === 'success_count' ? 'Solved' :
                            name === 'avg_typing_speed' ? 'Typing Speed' : name
                          ]}
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none', 
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="activity_count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="success_count" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Icon icon="mdi:chart-heatmap" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No activity data yet</p>
                        <p className="text-sm">Your coding patterns will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Difficulty Mastery Radar */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Icon icon="mdi:radar" className="text-indigo-600" />
                    Difficulty Mastery
                  </h3>
                  {analytics?.difficultyStats?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={analytics.difficultyStats}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="difficulty" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Success Rate"
                          dataKey="success_rate"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Tooltip 
                          formatter={(value) => [`${Number(value)}%`, 'Success Rate']}
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none', 
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Icon icon="mdi:radar" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No difficulty data yet</p>
                        <p className="text-sm">Try challenges of different difficulties</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weekly Momentum */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Icon icon="mdi:trending-up" className="text-green-600" />
                    Weekly Momentum
                  </h3>
                  {analytics?.weeklyProgress?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.weeklyProgress}>
                        <defs>
                          <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year_week" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'solved' ? `${value} solved` :
                            name === 'week_improvement' ? `${Number(value) > 0 ? '+' : ''}${value} change` : value,
                            name === 'solved' ? 'Problems Solved' :
                            name === 'week_improvement' ? 'Weekly Change' : name
                          ]}
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none', 
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="solved" 
                          stroke="#10b981" 
                          fill="url(#momentumGradient)"
                          strokeWidth={3}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="week_improvement" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Icon icon="mdi:trending-up" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No weekly data yet</p>
                        <p className="text-sm">Keep coding to see your momentum!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Difficulty Analysis */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Icon icon="mdi:chart-donut" className="text-blue-600" />
                    Difficulty Breakdown
                  </h3>
                  {analytics?.difficultyStats?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.difficultyStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="attempts"
                          label={({difficulty, attempts}) => `${difficulty}: ${attempts}`}
                        >
                          {analytics.difficultyStats.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Icon icon="mdi:chart-donut" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No difficulty data yet</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Icon icon="mdi:speedometer" className="text-green-600" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Average Solve Time</div>
                        <div className="text-2xl font-bold text-blue-600">{Math.round(performance.avg_solve_time || 0)}s</div>
                      </div>
                      <Icon icon="mdi:clock-fast" className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                        <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                      </div>
                      <Icon icon="mdi:target" className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
                        <div className="text-2xl font-bold text-purple-600">{performance.total_sessions || 0}</div>
                      </div>
                      <Icon icon="mdi:play-circle" className="w-12 h-12 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patterns Tab */}
          {activeTab === 'patterns' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                {/* Coding Patterns */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Icon icon="mdi:brain" className="text-indigo-600" />
                    Learning Patterns
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                      <Icon icon="mdi:clock-outline" className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
                      <h4 className="text-lg font-semibold mb-2">Peak Hours</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Most active coding time</p>
                      <div className="text-2xl font-bold text-indigo-600 mt-2">
                        {analytics?.hourlyPattern?.length > 0 
                          ? `${analytics.hourlyPattern.reduce((max: any, curr: any) => 
                              curr.activity_count > max.activity_count ? curr : max
                            ).hour}:00`
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <Icon icon="mdi:trending-up" className="w-16 h-16 mx-auto mb-4 text-green-600" />
                      <h4 className="text-lg font-semibold mb-2">Learning Velocity</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Problems per session</p>
                      <div className="text-2xl font-bold text-green-600 mt-2">
                        {performance.total_sessions > 0 
                          ? Math.round(performance.unique_challenges / performance.total_sessions * 10) / 10
                          : 0
                        }
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                      <Icon icon="mdi:fire" className="w-16 h-16 mx-auto mb-4 text-orange-600" />
                      <h4 className="text-lg font-semibold mb-2">Consistency</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active days</p>
                      <div className="text-2xl font-bold text-orange-600 mt-2">{performance.active_days || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                {/* Skill Development */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Icon icon="mdi:trophy-variant" className="text-yellow-600" />
                    Skill Development
                  </h3>
                  {analytics?.skillLevels?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analytics.skillLevels.map((skill: any, index: number) => (
                        <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold">{skill.skill_category}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              skill.skill_rank === 'ADVANCED' ? 'bg-purple-100 text-purple-800' :
                              skill.skill_rank === 'INTERMEDIATE' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {skill.skill_rank}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Level {skill.current_level}</span>
                              <span>{skill.problems_solved} problems solved</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                                style={{width: `${Math.min(100, (skill.current_xp / skill.xp_to_next_level) * 100)}%`}}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                              <span>{skill.current_xp} XP</span>
                              <span>{skill.accuracy_rate}% accuracy</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Icon icon="mdi:trophy-variant" className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                      <h4 className="text-xl font-semibold mb-2">No Skills Developed Yet</h4>
                      <p className="text-gray-600 dark:text-gray-400">Start solving challenges to develop your programming skills!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Problems Tab */}
          {activeTab === 'problems' && (
            <div className="space-y-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Icon icon="mdi:puzzle" className="text-indigo-600" />
                  Challenge Performance
                </h3>
                {analytics?.challengeStats?.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.challengeStats.map((challenge: any, index: number) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              {challenge.challenge_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Last attempted: {new Date(challenge.last_attempted).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                challenge.success_rate >= 80 ? 'text-green-600' :
                                challenge.success_rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {challenge.success_rate}%
                              </div>
                              <div className="text-xs text-gray-500">Success Rate</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon icon="mdi:play-circle" className="text-blue-600 w-5 h-5" />
                              <span className="text-sm font-medium">Total Attempts</span>
                            </div>
                            <div className="text-xl font-bold text-blue-600">{challenge.total_attempts}</div>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon icon="mdi:check-circle" className="text-green-600 w-5 h-5" />
                              <span className="text-sm font-medium">Passed</span>
                            </div>
                            <div className="text-xl font-bold text-green-600">{challenge.passed_attempts}</div>
                          </div>
                          
                          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon icon="mdi:close-circle" className="text-red-600 w-5 h-5" />
                              <span className="text-sm font-medium">Failed</span>
                            </div>
                            <div className="text-xl font-bold text-red-600">{challenge.total_attempts - challenge.passed_attempts}</div>
                          </div>
                          
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon icon="mdi:test-tube" className="text-yellow-600 w-5 h-5" />
                              <span className="text-sm font-medium">Test Cases</span>
                            </div>
                            <div className="text-xl font-bold text-yellow-600">
                              {challenge.total_test_cases_passed || 0}/{challenge.total_test_cases_available || 0}
                            </div>
                          </div>
                          
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon icon="mdi:clock-fast" className="text-purple-600 w-5 h-5" />
                              <span className="text-sm font-medium">Avg Time</span>
                            </div>
                            <div className="text-xl font-bold text-purple-600">{Math.round(challenge.avg_solve_time || 0)}s</div>
                          </div>
                        </div>
                        
                        {/* Test Case Details */}
                        {challenge.total_test_cases_available > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Case Performance</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {Math.round((challenge.total_test_cases_passed / challenge.total_test_cases_available) * 100)}% passed
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-1000"
                                style={{width: `${(challenge.total_test_cases_passed / challenge.total_test_cases_available) * 100}%`}}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Success Progress</span>
                            <span>{challenge.passed_attempts}/{challenge.total_attempts}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ${
                                challenge.success_rate >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                challenge.success_rate >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-red-500 to-red-600'
                              }`}
                              style={{width: `${challenge.success_rate}%`}}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon icon="mdi:puzzle" className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                    <h4 className="text-xl font-semibold mb-2">No Problems Attempted Yet</h4>
                    <p className="text-gray-600 dark:text-gray-400">Start solving challenges to see detailed problem analytics!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}