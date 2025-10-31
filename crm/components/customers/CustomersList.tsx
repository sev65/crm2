'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string
  city: string
  state: string
  status: string
  created_at: string
}

export default function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadCustomers()
  }, [searchTerm])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      let query = supabase.from('customers').select('*').order('last_name', { ascending: true })

      if (searchTerm) {
        // Use RPC search function for better results
        const { data, error } = await supabase.rpc('search_customers', {
          search_term: searchTerm,
        })
        if (error) throw error
        setCustomers(data || [])
      } else {
        const { data, error } = await query
        if (error) throw error
        setCustomers(data || [])
      }
    } catch (error: any) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your customer database
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/customers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No customers found' : 'No customers yet. Add your first customer!'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <li key={customer.id}>
                <Link
                  href={`/customers/${customer.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {customer.first_name[0]}{customer.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                customer.status
                              )}`}
                            >
                              {customer.status}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {customer.phone}
                            {customer.email && ` • ${customer.email}`}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {customer.city}, {customer.state}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Added {format(new Date(customer.created_at), 'MMM d, yyyy')}
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

