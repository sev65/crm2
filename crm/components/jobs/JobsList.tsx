'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Job {
  id: string
  job_number: string
  scheduled_date: string
  scheduled_time_start: string
  status: string
  priority: string
  customers: {
    first_name: string
    last_name: string
    phone: string
  }
}

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadJobs()
  }, [filterDate])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          customers (first_name, last_name, phone)
        `)
        .eq('scheduled_date', filterDate)
        .order('scheduled_time_start', { ascending: true })

      if (error) throw error
      setJobs(data || [])
    } catch (error: any) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'normal':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage job scheduling and assignments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/jobs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Schedule Job
          </Link>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <label htmlFor="filter-date" className="text-sm font-medium text-gray-700">
            Filter by Date:
          </label>
          <input
            type="date"
            id="filter-date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No jobs scheduled for {format(new Date(filterDate), 'MMMM d, yyyy')}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {job.job_number}
                            </p>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                job.status
                              )}`}
                            >
                              {job.status}
                            </span>
                            <span className={`ml-2 text-xs font-medium ${getPriorityColor(job.priority)}`}>
                              {job.priority}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {job.customers.first_name} {job.customers.last_name} • {job.customers.phone}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {format(new Date(job.scheduled_time_start), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(job.scheduled_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

