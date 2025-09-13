'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

interface Theme {
  id: number
  name: string
  description?: string
  parent_theme_id?: number
}

interface Character {
  id: number
  name: string
  description?: string
}

interface Location {
  id: number
  name: string
  description?: string
}

interface BookMetadata {
  author: string
  genre: string
  primary_audience: string
  start_year: number
  end_year: number
  date_range_display: string
}

interface ChapterMetadata {
  summary: string
}

interface MetadataResponse {
  book: {
    id: number
    name: string
    metadata?: BookMetadata
    themes?: Theme[]
  }
  chapter: {
    id: number
    number: number
    metadata?: ChapterMetadata
    themes?: Theme[]
    characters?: Character[]
    locations?: Location[]
  }
}

interface ChapterMetadataProps {
  chapterId: number
  className?: string
}

export default function ChapterMetadata({ chapterId, className = '' }: ChapterMetadataProps) {
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`https://libro-be-761839557433.europe-west1.run.app/api/metadata/chapter/${chapterId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            const errorData = await response.json()
            if (errorData.error?.includes('metadata not available')) {
              setError('Metadata not yet generated for this chapter')
            } else {
              setError('Chapter not found')
            }
          } else {
            throw new Error(`HTTP ${response.status}`)
          }
          return
        }
        
        const data = await response.json()
        setMetadata(data)
      } catch (err) {
        console.error('Error fetching metadata:', err)
        setError('Failed to load chapter metadata')
      } finally {
        setLoading(false)
      }
    }

    if (chapterId) {
      fetchMetadata()
    }
  }, [chapterId])

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-4 border-amber-200 bg-amber-50 ${className}`}>
        <div className="flex items-center gap-2 text-amber-700">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      </Card>
    )
  }

  if (!metadata) {
    return null
  }

  const { book, chapter } = metadata

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chapter Summary */}
      {chapter.metadata?.summary && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Chapter Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {chapter.metadata.summary}
          </p>
        </Card>
      )}

      {/* Book Context */}
      {book.metadata && (
        <Card className="p-4 bg-slate-50">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Book: {book.name}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Author:</span>
              <span className="ml-2 text-gray-800">{book.metadata.author}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Genre:</span>
              <span className="ml-2 text-gray-800">{book.metadata.genre}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-600">Date:</span>
              <span className="ml-2 text-gray-800">{book.metadata.date_range_display}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-600">Audience:</span>
              <span className="ml-2 text-gray-800">{book.metadata.primary_audience}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Themes */}
      {(chapter.themes && chapter.themes.length > 0) && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Themes ({chapter.themes.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {chapter.themes.map((theme) => (
              <span
                key={theme.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors cursor-pointer"
                title={theme.description}
              >
                {theme.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Characters and Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Characters */}
        {(chapter.characters && chapter.characters.length > 0) && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Characters ({chapter.characters.length})
            </h3>
            <div className="space-y-1">
              {chapter.characters.map((character) => (
                <div
                  key={character.id}
                  className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
                  title={character.description}
                >
                  {character.name}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Locations */}
        {(chapter.locations && chapter.locations.length > 0) && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Locations ({chapter.locations.length})
            </h3>
            <div className="space-y-1">
              {chapter.locations.map((location) => (
                <div
                  key={location.id}
                  className="text-sm text-gray-700 hover:text-red-600 cursor-pointer transition-colors"
                  title={location.description}
                >
                  {location.name}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Book-level Themes */}
      {(book.themes && book.themes.length > 0) && (
        <Card className="p-4 bg-green-50">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Book Themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {book.themes.map((theme) => (
              <span
                key={theme.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
                title={theme.description}
              >
                {theme.name}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
