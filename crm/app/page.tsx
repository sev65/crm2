import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

export default async function Home() {
  const supabase = createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  redirect('/dashboard')
}

