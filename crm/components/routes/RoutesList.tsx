'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Route {
  id: string
  route_date: string
  route_name: string | null
  status: string
  estimated_start_time: string | null
  assigned_staff_ids: string[]
}

export default function RoutesList() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadRoutes()
  }, [filterDate])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('route_date', filterDate)
        .order('estimated_start_time', { ascending: true })

      if (error) throw error
      setRoutes(data || [])
    } catch (error: any) {
      console.error('Error loading routes:', error)
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
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Plan and manage daily routes
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/routes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Route
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

      {/* Routes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading routes...</div>
        ) : routes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No routes for {format(new Date(filterDate), 'MMMM d, yyyy')}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {routes.map((route) => (
              <li key={route.id}>
                <Link
                  href={`/routes/${route.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {route.route_name || 'Unnamed Route'}
                          </p>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              route.status
                            )}`}
                          >
                            {route.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Staff: {route.assigned_staff_ids.length} assigned
                        </div>
                        {route.estimated_start_time && (
                          <div className="mt-1 text-sm text-gray-500">
                            Start: {format(new Date(`2000-01-01T${route.estimated_start_time}`), 'h:mm a')}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(route.route_date), 'MMM d, yyyy')}
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

