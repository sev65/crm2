import Layout from '@/components/Layout'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import CustomerForm from '@/components/customers/CustomerForm'

export default async function NewCustomerPage() {
  const supabase = createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <Layout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Customer</h1>
        <CustomerForm />
      </div>
    </Layout>
  )
}

