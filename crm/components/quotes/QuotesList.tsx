'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { PlusIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Quote {
  id: string
  quote_number: string
  status: string
  estimated_amount: number
  valid_until: string | null
  customers: {
    first_name: string
    last_name: string
  }
}

export default function QuotesList() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customers (first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotes(data || [])
    } catch (error: any) {
      console.error('Error loading quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage pricing and estimates
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/quotes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Quote
          </Link>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading quotes...</div>
        ) : quotes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No quotes yet. Create your first quote!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {quotes.map((quote: Quote) => (
              <li key={quote.id}>
                <Link
                  href={`/quotes/${quote.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {quote.quote_number}
                            </p>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                quote.status
                              )}`}
                            >
                              {quote.status}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {quote.customers.first_name} {quote.customers.last_name}
                          </div>
                          {quote.valid_until && (
                            <div className="mt-1 text-sm text-gray-500">
                              Valid until: {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ${Number(quote.estimated_amount).toLocaleString()}
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

