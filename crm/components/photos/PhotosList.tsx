'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Photo {
  id: string
  job_id: string
  storage_path: string
  photo_type: string
  caption: string | null
  created_at: string
  jobs: {
    job_number: string
  }
}

export default function PhotosList() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          jobs (job_number)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error: any) {
      console.error('Error loading photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPhotoUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('job-photos')
      .getPublicUrl(storagePath)
    return data.publicUrl
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Photos</h1>
        <p className="mt-2 text-sm text-gray-700">
          View and manage job photos
        </p>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading photos...</div>
      ) : photos.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No photos uploaded yet
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={getPhotoUrl(photo.storage_path)}
                  alt={photo.caption || 'Job photo'}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png'
                  }}
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-900">
                  {photo.jobs?.job_number || 'Unknown Job'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{photo.photo_type}</p>
                {photo.caption && (
                  <p className="mt-1 text-sm text-gray-600">{photo.caption}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {format(new Date(photo.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

