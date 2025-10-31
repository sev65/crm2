import Layout from '@/components/Layout'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import ReportsDashboard from '@/components/reports/ReportsDashboard'

export default async function ReportsPage() {
  const supabase = createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <Layout>
      <ReportsDashboard />
    </Layout>
  )
}

