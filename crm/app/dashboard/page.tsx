import Layout from '@/components/Layout'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import {
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default async function DashboardPage() {
  const supabase = createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get stats
  const today = new Date()
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)

  const [customersResult, jobsTodayResult, jobsWeekResult, revenueResult] = await Promise.all([
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('scheduled_date', format(today, 'yyyy-MM-dd')),
    supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .gte('scheduled_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('scheduled_date', format(weekEnd, 'yyyy-MM-dd')),
    supabase
      .rpc('get_revenue_summary', {
        start_date: format(weekStart, 'yyyy-MM-dd'),
        end_date: format(weekEnd, 'yyyy-MM-dd'),
      })
      .single(),
  ])

  const totalCustomers = customersResult.count || 0
  const jobsToday = jobsTodayResult.count || 0
  const jobsThisWeek = jobsWeekResult.count || 0
  const revenue = revenueResult.data || {
    total_invoiced: 0,
    total_paid: 0,
    outstanding_balance: 0,
    job_count: 0,
    completed_job_count: 0,
  }

  // Get recent jobs
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select(`
      *,
      customers (first_name, last_name, phone)
    `)
    .order('scheduled_date', { ascending: false })
    .limit(5)

  const stats = [
    {
      name: 'Total Customers',
      value: totalCustomers.toString(),
      icon: UsersIcon,
      change: '+4.75%',
      changeType: 'positive',
    },
    {
      name: 'Jobs Today',
      value: jobsToday.toString(),
      icon: CalendarIcon,
      change: `${revenue.completed_job_count} completed`,
      changeType: 'positive',
    },
    {
      name: 'Jobs This Week',
      value: jobsThisWeek.toString(),
      icon: CheckCircleIcon,
      change: 'Scheduled',
      changeType: 'neutral',
    },
    {
      name: 'Week Revenue',
      value: `$${Number(revenue.total_paid).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: `$${Number(revenue.outstanding_balance).toLocaleString()} outstanding`,
      changeType: 'neutral',
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon
                      className="h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Recent Jobs
            </h3>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentJobs?.map((job: any) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.job_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.customers?.first_name} {job.customers?.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(job.scheduled_date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!recentJobs || recentJobs.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent jobs
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

