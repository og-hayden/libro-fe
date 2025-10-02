'use client';

import React from 'react';
import { RiArrowGoBackFill } from 'react-icons/ri';

interface DimensionAnalysis {
  dimension_name: string;
  consensus_score: number;
  agreement_summary: string;
  disagreement_summary: string;
  denominational_positions: string[];
}

interface CreedConnection {
  creed_name: string;
  relevant_doctrine: string;
  denominational_adherence: string[];
  interpretive_influence: string;
}

interface ScholarlyAnalysisData {
  overall_consensus_score: number;
  consensus_classification: string;
  summary: string;
  theological_dimensions: DimensionAnalysis[];
  interpretive_approach_alignment: number;
  literal_vs_figurative: string[];
  historical_context_emphasis: string[];
  application_focus: string[];
  cross_reference_overlap: number;
  early_church_alignment: string[];
  reformation_era_impact: string[];
  modern_theological_development: string[];
  historical_trajectory: string;
  creedal_connections: CreedConnection[];
}

interface ScholarlyAnalysisViewProps {
  verseRangeStart: number;
  verseRangeEnd: number;
  reference: string;
  verseText: string;
  perspectives: string[];
  scholarlyData?: ScholarlyAnalysisData | null;
  onBackToReading: () => void;
}

export function ScholarlyAnalysisView({
  scholarlyData,
  onBackToReading
}: ScholarlyAnalysisViewProps) {
  const parseDenominationalPositions = (positions: string[]) => {
    return positions.map(pos => {
      const [perspective, description] = pos.split(':');
      return { perspective: perspective?.trim(), description: description?.trim() };
    }).filter(item => item.perspective && item.description);
  };

  const formatMarkdownText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  const formatDenominationName = (name: string) => {
    const denominationMap: { [key: string]: string } = {
      'catholic': 'Catholic',
      'eastern_orthodox': 'Eastern Orthodox',
      'oriental_orthodox': 'Oriental Orthodox',
      'church_of_the_east': 'Church of the East',
      'baptist': 'Baptist',
      'anglican': 'Anglican',
      'methodist': 'Methodist',
      'pentecostal': 'Pentecostal',
      'lutheran': 'Lutheran',
      'presbyterian': 'Presbyterian',
      'puritan': 'Puritan',
      'dutch_reformed': 'Dutch Reformed',
      'moravian': 'Moravian'
    };
    return denominationMap[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (!scholarlyData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-normal text-stone-900 dark:text-stone-100 mb-2">No Scholarly Analysis Available</h2>
          <p className="text-stone-600 dark:text-stone-400 font-normal">Generate analysis to view results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-2 text-sm">
                <button 
                  onClick={onBackToReading}
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  Home
                </button>
                <span className="text-stone-300 dark:text-stone-600">›</span>
                <span className="text-stone-900 dark:text-stone-100 font-medium">
                  Scholarly Analysis
                </span>
              </nav>
              
              {/* Return to Reading Button */}
              <button
                onClick={onBackToReading}
                className="px-2 py-1 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-xs border border-stone-200 dark:border-stone-700 transition-all flex items-center space-x-1.5"
                title="Return to Reading"
              >
                <RiArrowGoBackFill className="w-3 h-3 text-stone-700 dark:text-stone-300" />
                <span className="text-stone-700 dark:text-stone-300 font-medium">Return to Reading</span>
              </button>
            </div>
            
            <div>
              <h1 className="text-2xl font-medium text-stone-900 dark:text-stone-100">
                Scholarly Analysis
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                Multi-denominational theological consensus
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-12 py-8">
        <div className="max-w-4xl mx-auto font-sans">
          <div className="space-y-8 pb-8">

            {/* Consensus Score */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">Denominational Consensus</h3>
              <div className="text-5xl font-medium text-stone-900 dark:text-stone-100 mb-8">
                {Math.round(scholarlyData.overall_consensus_score * 100)}%
              </div>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: formatMarkdownText(scholarlyData.summary) }}></p>
            </div>

            {/* Divider */}
            <div className="border-t border-stone-200 dark:border-stone-700"></div>

            {/* Theological Dimensions */}
            {scholarlyData.theological_dimensions && scholarlyData.theological_dimensions.length > 0 && (
              <div className="space-y-8">
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">Theological Dimensions</h3>
                <div className="space-y-4 pb-4">
                  {scholarlyData.theological_dimensions.map((dimension, index) => (
                    <div key={index} className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-stone-900 dark:text-stone-100 text-xl">{dimension.dimension_name}</h4>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-stone-200/70 dark:bg-stone-900 text-stone-700 dark:text-stone-300">
                          {Math.round(dimension.consensus_score * 100)}%
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-stone-900 dark:text-stone-100 text-base block mb-1">Agreement:</span>
                          <p className="text-stone-700 dark:text-stone-300 text-base leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formatMarkdownText(dimension.agreement_summary) }}></p>
                        </div>
                        {dimension.disagreement_summary && (
                          <div>
                            <span className="font-medium text-stone-900 dark:text-stone-100 text-base block mb-1">Disagreement:</span>
                            <p className="text-stone-700 dark:text-stone-300 text-base leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formatMarkdownText(dimension.disagreement_summary) }}></p>
                          </div>
                        )}
                        {dimension.denominational_positions && dimension.denominational_positions.length > 0 && (
                          <div>
                            <span className="font-medium text-stone-900 dark:text-stone-100 text-base block mb-2">Denominational Positions:</span>
                            <div className="space-y-2">
                              {parseDenominationalPositions(dimension.denominational_positions).map((pos, idx) => (
                                <div key={idx} className="bg-white dark:bg-stone-900 p-3 rounded-lg border-l-2 border-stone-300 dark:border-stone-500">
                                  <span className="font-medium text-stone-900 dark:text-stone-100 text-sm">{formatDenominationName(pos.perspective)}</span>
                                  <p className="text-stone-600 dark:text-stone-400 text-sm mt-1" dangerouslySetInnerHTML={{ __html: formatMarkdownText(pos.description) }}></p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-stone-200 dark:border-stone-700"></div>

            {/* Historical Analysis */}
            {scholarlyData.historical_trajectory && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mt-4">Historical Development</h3>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-lg mb-8" dangerouslySetInnerHTML={{ __html: formatMarkdownText(scholarlyData.historical_trajectory) }}></p>
                
                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-stone-200 dark:from-stone-700 via-stone-200 dark:via-stone-700 to-transparent"></div>
                  
                  <div className="space-y-8">
                    {/* Early Church */}
                    {scholarlyData.early_church_alignment && scholarlyData.early_church_alignment.length > 0 && (
                      <div className="relative">
                        {/* Timeline circle */}
                        <div className="absolute left-2 top-0 w-4 h-4 bg-stone-200 dark:bg-stone-700 rounded-full"></div>
                        
                        {/* Content */}
                        <div className="ml-12">
                          <h4 className="font-medium text-stone-900 dark:text-stone-100 text-lg mb-4">Early Church</h4>
                          <div className="space-y-3">
                            {scholarlyData.early_church_alignment.map((item, idx) => {
                              const [perspective, description] = item.split(':');
                              return (
                                <div key={idx} className="bg-stone-50 dark:bg-stone-950/20 p-4 rounded-xl border-l-3 border-stone-300 dark:border-stone-600">
                                  <div className="font-medium text-stone-900 dark:text-stone-100 text-base mb-2">{formatDenominationName(perspective?.trim() || '')}</div>
                                  <p className="text-stone-700 dark:text-stone-300 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdownText(description?.trim() || '') }}></p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Reformation Era */}
                    {scholarlyData.reformation_era_impact && scholarlyData.reformation_era_impact.length > 0 && (
                      <div className="relative">
                        {/* Timeline circle */}
                        <div className="absolute left-2 top-1.5 w-4 h-4 bg-stone-200 dark:bg-stone-700 rounded-full"></div>
                        
                        {/* Content */}
                        <div className="ml-12">
                          <h4 className="font-medium text-stone-900 dark:text-stone-100 text-lg mb-4">Reformation Era</h4>
                          <div className="space-y-3">
                            {scholarlyData.reformation_era_impact.map((item, idx) => {
                              const [perspective, description] = item.split(':');
                              return (
                                <div key={idx} className="bg-stone-50 dark:bg-stone-950/20 p-4 rounded-xl border-l-3 border-stone-300 dark:border-stone-600">
                                  <div className="font-medium text-stone-900 dark:text-stone-100 text-base mb-2">{formatDenominationName(perspective?.trim() || '')}</div>
                                  <p className="text-stone-700 dark:text-stone-300 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdownText(description?.trim() || '') }}></p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Modern Development */}
                    {scholarlyData.modern_theological_development && scholarlyData.modern_theological_development.length > 0 && (
                      <div className="relative">
                        {/* Timeline circle */}
                        <div className="absolute left-2 top-1.5 w-4 h-4 bg-stone-200 dark:bg-stone-700 rounded-full"></div>
                        
                        {/* Content */}
                        <div className="ml-12">
                          <h4 className="font-medium text-stone-900 dark:text-stone-100 text-lg mb-4">Modern Development</h4>
                          <div className="space-y-3">
                            {scholarlyData.modern_theological_development.map((item, idx) => {
                              const [perspective, description] = item.split(':');
                              return (
                                <div key={idx} className="bg-stone-50 dark:bg-stone-950/20 p-4 rounded-xl border-l-3 border-stone-300 dark:border-stone-600">
                                  <div className="font-medium text-stone-900 dark:text-stone-100 text-base mb-2">{formatDenominationName(perspective?.trim() || '')}</div>
                                  <p className="text-stone-700 dark:text-stone-300 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdownText(description?.trim() || '') }}></p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-stone-200 dark:border-stone-700"></div>

            {/* Creedal Connections */}
            {scholarlyData.creedal_connections && scholarlyData.creedal_connections.length > 0 && (
              <div className="space-y-4 mt-4">
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">Creedal Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scholarlyData.creedal_connections.map((connection, idx) => (
                    <div key={idx} className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl">
                      <h4 className="font-medium text-stone-900 dark:text-stone-100">{connection.creed_name}</h4>
                      <p className="text-stone-500 dark:text-stone-500 text-base mb-4" dangerouslySetInnerHTML={{ __html: formatMarkdownText(connection.relevant_doctrine) }}></p>
                      <p className="text-stone-600 dark:text-stone-300 text-md" dangerouslySetInnerHTML={{ __html: formatMarkdownText(connection.interpretive_influence) }}></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
