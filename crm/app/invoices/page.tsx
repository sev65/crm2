import Layout from '@/components/Layout'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import InvoicesList from '@/components/invoices/InvoicesList'

export default async function InvoicesPage() {
  const supabase = createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <Layout>
      <InvoicesList />
    </Layout>
  )
}

