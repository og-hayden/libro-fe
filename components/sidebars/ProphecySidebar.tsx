'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Sidebar, SidebarContent, SidebarSection } from './shared/Sidebar';
import { ShareButton } from '../features/sharing/ShareButton';

interface ProphecyDetails {
  id: number;
  claim: string;
  category: string;
  prophecy_reference: {
    book: string;
    chapter: number;
    verse_start: number;
    verse_end: number;
    text: string;
  };
  fulfillment_references: Array<{
    book: string;
    chapter: number;
    verse_start: number;
    verse_end: number;
    fulfillment_type: string;
    text: string;
  }>;
  fulfillment_explanation: string;
  generated_from_book: string;
}

interface ProphecySidebarProps {
  prophecyId: number | null;
  isVisible: boolean;
  onClose: () => void;
  onNavigateToVerse: (bookId: number, chapterNumber: number, verseId: number) => void;
}

const formatCategoryName = (category: string) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatFulfillmentType = (type: string) => {
  return `Type: ${type.replace(/\b\w/g, l => l.toUpperCase())}`;
};

export function ProphecySidebar({ prophecyId, isVisible, onClose, onNavigateToVerse }: ProphecySidebarProps) {
  const [prophecyDetails, setProphecyDetails] = useState<ProphecyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFulfillment, setSelectedFulfillment] = useState<number>(0);

  const loadProphecyDetails = useCallback(async () => {
    if (!prophecyId) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/prophecy/prophecy/${prophecyId}`);
      console.log('Prophecy API response:', response);
      console.log('Setting prophecy details to:', response);
      setProphecyDetails(response);
      setSelectedFulfillment(0);
    } catch (error) {
      console.error('Error loading prophecy details:', error);
      setProphecyDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [prophecyId]);

  useEffect(() => {
    if (prophecyId && isVisible) {
      loadProphecyDetails();
    }
  }, [prophecyId, isVisible, loadProphecyDetails]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNavigateToFulfillment = (fulfillmentRef: any) => {
    // Book name to ID mapping
    const bookNameToId: Record<string, number> = {
      'Genesis': 5, 'Exodus': 6, 'Leviticus': 7, 'Numbers': 8, 'Deuteronomy': 9,
      'Joshua': 10, 'Judges': 11, 'Ruth': 12, '1 Samuel': 13, '2 Samuel': 14,
      '1 Kings': 15, '2 Kings': 16, '1 Chronicles': 17, '2 Chronicles': 18,
      'Ezra': 19, 'Nehemiah': 20, 'Esther': 21, 'Job': 22, 'Psalms': 23,
      'Proverbs': 24, 'Ecclesiastes': 25, 'Song of Solomon': 26, 'Isaiah': 27,
      'Jeremiah': 28, 'Lamentations': 29, 'Ezekiel': 30, 'Daniel': 31,
      'Hosea': 32, 'Joel': 33, 'Amos': 34, 'Obadiah': 35, 'Jonah': 36,
      'Micah': 37, 'Nahum': 38, 'Habakkuk': 39, 'Zephaniah': 40, 'Haggai': 41,
      'Zechariah': 42, 'Malachi': 43, 'Matthew': 44, 'Mark': 45, 'Luke': 46,
      'John': 47, 'Acts': 48, 'Romans': 49, '1 Corinthians': 50, '2 Corinthians': 51,
      'Galatians': 52, 'Ephesians': 53, 'Philippians': 54, 'Colossians': 55,
      '1 Thessalonians': 56, '2 Thessalonians': 57, '1 Timothy': 58, '2 Timothy': 59,
      'Titus': 60, 'Philemon': 61, 'Hebrews': 62, 'James': 63, '1 Peter': 64,
      '2 Peter': 65, '1 John': 66, '2 John': 67, '3 John': 68, 'Jude': 69, 'Revelation': 70
    };
    
    const bookId = bookNameToId[fulfillmentRef.book];
    if (bookId) {
      onNavigateToVerse(bookId, fulfillmentRef.chapter, fulfillmentRef.verse_start);
    } else {
      console.error('Book not found:', fulfillmentRef.book);
    }
  };

  if (!isVisible) return null;

  return (
    <Sidebar 
      isVisible={isVisible} 
      title="Messianic Prophecy" 
      onClose={onClose}
      headerAction={<ShareButton size="sm" />}
    >
      <SidebarContent>
        {isLoading ? (
          <SidebarSection>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-stone-200 dark:bg-stone-700 rounded mb-4"></div>
              </div>
            </div>
          </SidebarSection>
        ) : !prophecyDetails ? (
          <div className="text-sm text-stone-600 dark:text-stone-400 py-8 text-center">
            Click on a prophecy verse to see details
          </div>
        ) : (
          <>
            {/* Prophecy (with category) */}
            <SidebarSection>
              <div className="space-y-4">
                <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                  {formatCategoryName(prophecyDetails.category)}
                </div>
                <p className="text-lg text-stone-900 dark:text-stone-100 leading-relaxed">
                  {prophecyDetails.claim}
                </p>
              </div>
            </SidebarSection>

            {/* Fulfillment Explanation (with fulfillment type) */}
            <SidebarSection>
              <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                      How This Prophecy is Fulfilled
                    </div>
                    {prophecyDetails.fulfillment_references[selectedFulfillment] && (
                      <div className="text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full">
                        {formatFulfillmentType(prophecyDetails.fulfillment_references[selectedFulfillment].fulfillment_type)}
                      </div>
                    )}
                  </div>
                  <p className="text-lg text-stone-900 dark:text-stone-100 leading-relaxed">
                    {prophecyDetails.fulfillment_explanation}
                  </p>
                </div>
              </div>
            </SidebarSection>

            {/* Horizontal line separator */}
            <div className="border-t border-stone-200/50 dark:border-stone-700/50"></div>

            {/* Fulfillment Navigation - only show if multiple references */}
            {prophecyDetails.fulfillment_references.length > 1 && (
              <SidebarSection>
                <div className="pt-8">
                  <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-3">
                    Fulfillment References ({prophecyDetails.fulfillment_references.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prophecyDetails.fulfillment_references.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedFulfillment(index)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                          selectedFulfillment === index
                            ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </SidebarSection>
            )}

            {/* Fulfillment verses with go to verse button */}
            {prophecyDetails.fulfillment_references[selectedFulfillment] && (
              <SidebarSection>
                <div className={prophecyDetails.fulfillment_references.length > 1 ? "border-t border-stone-200/50 dark:border-stone-700/50 pt-8" : "pt-8"}>
                  <div className="space-y-4">
                    <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                      New Testament Fulfillment
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">
                      {prophecyDetails.fulfillment_references[selectedFulfillment].book} {prophecyDetails.fulfillment_references[selectedFulfillment].chapter}:{prophecyDetails.fulfillment_references[selectedFulfillment].verse_start}
                      {prophecyDetails.fulfillment_references[selectedFulfillment].verse_end !== prophecyDetails.fulfillment_references[selectedFulfillment].verse_start && 
                        `-${prophecyDetails.fulfillment_references[selectedFulfillment].verse_end}`}
                    </div>
                    <blockquote className="text-lg text-stone-900 dark:text-stone-100 leading-relaxed font-serif border-l-2 border-stone-200/50 dark:border-stone-700/50 pl-4">
                      &quot;{prophecyDetails.fulfillment_references[selectedFulfillment].text}&quot;
                    </blockquote>
                    <button
                      onClick={() => handleNavigateToFulfillment(prophecyDetails.fulfillment_references[selectedFulfillment])}
                      className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all"
                    >
                      <span className="text-stone-700 dark:text-stone-300 font-medium">Go to verse</span>
                    </button>
                  </div>
                </div>
              </SidebarSection>
            )}

          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
