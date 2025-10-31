import Layout from '@/components/Layout'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import CustomersList from '@/components/customers/CustomersList'

export default async function CustomersPage() {
  const supabase = createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <Layout>
      <CustomersList />
    </Layout>
  )
}

