import Layout from '@/components/Layout'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import RoutesList from '@/components/routes/RoutesList'

export default async function RoutesPage() {
  const supabase = createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <Layout>
      <RoutesList />
    </Layout>
  )
}

