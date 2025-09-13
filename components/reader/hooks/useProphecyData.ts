import { ProphecyData, ProphecyVerse, FulfillmentVerse, Verse } from '../types';

interface UseProphecyDataProps {
  prophecyData: ProphecyData | null;
  verses: Verse[];
}

export function useProphecyData({ prophecyData, verses }: UseProphecyDataProps) {
  const isProphecyVerse = (verseNumber: number): ProphecyVerse | null => {
    if (!prophecyData?.prophecy_verses) return null;
    return prophecyData.prophecy_verses.find(pv => 
      pv.verse_numbers.includes(verseNumber)
    ) || null;
  };

  const isFulfillmentVerse = (verseNumber: number): FulfillmentVerse | null => {
    if (!prophecyData?.fulfillment_verses) return null;
    return prophecyData.fulfillment_verses.find(fv => 
      fv.verse_numbers.includes(verseNumber)
    ) || null;
  };

  const getFulfillmentGroupInfo = (verse: Verse, verseIndex: number) => {
    const fulfillmentVerse = isFulfillmentVerse(verse.verse_number);
    if (!fulfillmentVerse) return { isFirstInGroup: false, groupSize: 1 };

    // Check if this verse is part of a consecutive fulfillment group
    const prevVerse = verseIndex > 0 ? verses[verseIndex - 1] : null;
    const prevFulfillmentVerse = prevVerse ? isFulfillmentVerse(prevVerse.verse_number) : null;
    
    // For fulfillment verses, check if this is the first verse of a group
    const isFirstInGroup = fulfillmentVerse && (
      !prevFulfillmentVerse ||
      prevFulfillmentVerse.prophecy_id !== fulfillmentVerse.prophecy_id ||
      (prevVerse && prevVerse.verse_number !== verse.verse_number - 1)
    );
    
    // Count consecutive verses in the same fulfillment group
    let groupSize = 1;
    if (fulfillmentVerse && isFirstInGroup) {
      let checkIndex = verseIndex + 1;
      while (checkIndex < verses.length) {
        const checkVerse = verses[checkIndex];
        const checkFulfillmentVerse = isFulfillmentVerse(checkVerse.verse_number);
        if (checkFulfillmentVerse &&
            checkFulfillmentVerse.prophecy_id === fulfillmentVerse.prophecy_id &&
            checkVerse.verse_number === verses[checkIndex - 1].verse_number + 1) {
          groupSize++;
          checkIndex++;
        } else {
          break;
        }
      }
    }

    return { isFirstInGroup, groupSize };
  };

  return {
    isProphecyVerse,
    isFulfillmentVerse,
    getFulfillmentGroupInfo,
  };
}
