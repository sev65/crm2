'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default function ReportsDashboard() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [revenueData, setRevenueData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadRevenueData()
  }, [startDate, endDate])

  const loadRevenueData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_revenue_summary', {
        start_date: startDate,
        end_date: endDate,
      })

      if (error) throw error
      setRevenueData(data)
    } catch (error: any) {
      console.error('Error loading revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-700">
          View business analytics and reports
        </p>
      </div>

      {/* Date Range */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading reports...</div>
      ) : revenueData ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Total Invoiced</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                ${Number(revenueData.total_invoiced || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Total Paid</div>
              <div className="mt-2 text-2xl font-semibold text-green-600">
                ${Number(revenueData.total_paid || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Outstanding Balance</div>
              <div className="mt-2 text-2xl font-semibold text-red-600">
                ${Number(revenueData.outstanding_balance || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Completed Jobs</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {revenueData.completed_job_count || 0} / {revenueData.job_count || 0}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

