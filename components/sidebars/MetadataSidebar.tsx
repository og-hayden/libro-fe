'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar, SidebarContent, SidebarSection } from './shared/Sidebar'
import { ChevronRight } from 'lucide-react'
import { ShareButton } from '../features/sharing/ShareButton'

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

interface MetadataSidebarProps {
  bookId: number | null
  chapterNumber: number | null
  bookName: string | null
  isVisible: boolean
  onClose: () => void
}

export function MetadataSidebar({ 
  bookId, 
  chapterNumber, 
  bookName, 
  isVisible, 
  onClose 
}: MetadataSidebarProps) {
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Removed expandedSections state - no longer needed

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!bookId || !chapterNumber) return
      
      try {
        setLoading(true)
        setError(null)
        
        // First get the chapter ID from book ID and chapter number
        console.log(`Fetching chapter data for book ${bookId}, chapter ${chapterNumber}`)
        const chapterResponse = await fetch(`https://libro-be-761839557433.europe-west1.run.app/api/bible/books/${bookId}/chapters/${chapterNumber}`)
        if (!chapterResponse.ok) {
          throw new Error(`Failed to fetch chapter: HTTP ${chapterResponse.status}`)
        }
        const chapterData = await chapterResponse.json()
        console.log('Chapter data:', chapterData)
        
        // Then fetch metadata using the chapter ID
        const chapterId = chapterData.chapter?.id || chapterData.id
        console.log(`Fetching metadata for chapter ID: ${chapterId}`)
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
        setError(`Failed to load chapter metadata: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    if (bookId && chapterNumber && isVisible) {
      fetchMetadata()
    }
  }, [bookId, chapterNumber, isVisible])

  // Removed toggleSection function - no longer needed

  const sidebarTitle = `About ${bookName} ${chapterNumber}`

  const loadingOverlay = loading ? {
    isLoading: true,
    text: 'Loading chapter metadata...'
  } : undefined

  return (
    <Sidebar
      isVisible={isVisible}
      title={sidebarTitle}
      onClose={onClose}
      loadingOverlay={loadingOverlay}
      headerAction={<ShareButton size="sm" />}
    >
      <SidebarContent>
        {error && (
          <SidebarSection>
            <div className="text-sm text-stone-600 dark:text-stone-400 py-8 text-center">
              {error}
            </div>
          </SidebarSection>
        )}

        {metadata && (
          <>
            {/* Chapter Summary */}
            {metadata.chapter.metadata?.summary && (
              <SidebarSection>
                <div className="space-y-4">
                  <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                    Chapter Summary
                  </div>
                  <p className="text-lg text-stone-900 dark:text-stone-100 leading-relaxed">
                    {metadata.chapter.metadata.summary}
                  </p>
                </div>
              </SidebarSection>
            )}

            {/* Book Information */}
            {metadata.book.metadata && (
              <SidebarSection>
                <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                  <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-4">
                    Book Information
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-stone-600 dark:text-stone-400">Author: </span>
                      <span className="text-stone-900 dark:text-stone-100">{metadata.book.metadata.author}</span>
                    </div>
                    <div>
                      <span className="text-stone-600 dark:text-stone-400">Genre: </span>
                      <span className="text-stone-900 dark:text-stone-100">{metadata.book.metadata.genre}</span>
                    </div>
                    <div>
                      <span className="text-stone-600 dark:text-stone-400">Date: </span>
                      <span className="text-stone-900 dark:text-stone-100">{metadata.book.metadata.date_range_display}</span>
                    </div>
                    <div>
                      <span className="text-stone-600 dark:text-stone-400">Audience: </span>
                      <span className="text-stone-900 dark:text-stone-100">{metadata.book.metadata.primary_audience}</span>
                    </div>
                  </div>
                </div>
              </SidebarSection>
            )}

            {/* Chapter Themes */}
            {metadata.chapter.themes && metadata.chapter.themes.length > 0 && (
              <SidebarSection>
                <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wide">
                    Chapter Themes ({metadata.chapter.themes.length})
                  </h4>
                  <div className="space-y-2">
                    {metadata.chapter.themes.map((theme) => (
                      <div
                        key={theme.id}
                        className="text-sm text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-400 cursor-pointer transition-colors p-2 rounded hover:bg-stone-100 dark:hover:bg-stone-800/50"
                        title={theme.description}
                      >
                        {theme.name}
                      </div>
                    ))}
                  </div>
                </div>
              </SidebarSection>
            )}

            {/* Characters */}
            {metadata.chapter.characters && metadata.chapter.characters.length > 0 && (
              <SidebarSection>
                <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wide">
                    Characters ({metadata.chapter.characters.length})
                  </h4>
                  <div className="space-y-2">
                    {metadata.chapter.characters.map((character) => (
                      <div
                        key={character.id}
                        className="text-sm text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-400 cursor-pointer transition-colors p-2 rounded hover:bg-stone-100 dark:hover:bg-stone-800/50"
                        title={character.description}
                      >
                        {character.name}
                      </div>
                    ))}
                  </div>
                </div>
              </SidebarSection>
            )}

            {/* Locations */}
            {metadata.chapter.locations && metadata.chapter.locations.length > 0 && (
              <SidebarSection>
                <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wide">
                    Locations ({metadata.chapter.locations.length})
                  </h4>
                  <div className="space-y-2">
                    {metadata.chapter.locations.map((location) => (
                      <div
                        key={location.id}
                        className="text-sm text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-400 cursor-pointer transition-colors p-2 rounded hover:bg-stone-100 dark:hover:bg-stone-800/50"
                        title={location.description}
                      >
                        {location.name}
                      </div>
                    ))}
                  </div>
                </div>
              </SidebarSection>
            )}

            {/* Book Themes */}
            {metadata.book.themes && metadata.book.themes.length > 0 && (
              <SidebarSection>
                <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wide">
                    Book Themes ({metadata.book.themes.length})
                  </h4>
                  <div className="space-y-2">
                    {metadata.book.themes.map((theme) => (
                      <div
                        key={theme.id}
                        className="text-sm text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-400 cursor-pointer transition-colors p-2 rounded hover:bg-stone-100 dark:hover:bg-stone-800/50"
                        title={theme.description}
                      >
                        {theme.name}
                      </div>
                    ))}
                  </div>
                </div>
              </SidebarSection>
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
