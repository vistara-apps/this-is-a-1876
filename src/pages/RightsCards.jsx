import React, { useState } from 'react'
import { Search, Filter, BookOpen, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { rightsCards, spanishRightsCards } from '../data/rightsCards'
import { useApp } from '../context/AppContext'

export default function RightsCards() {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)
  
  const allCards = user.preferredLanguage === 'es' 
    ? [...spanishRightsCards, ...rightsCards]
    : rightsCards

  const filteredCards = allCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.content.summary.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const CardDetailView = ({ card, onClose }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading text-textPrimary">{card.title}</h2>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-textPrimary mb-2 flex items-center">
            <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
            DO
          </h3>
          <ul className="space-y-1">
            {card.content.dosList.map((item, index) => (
              <li key={index} className="text-body text-textSecondary flex items-start">
                <span className="text-success mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-textPrimary mb-2 flex items-center">
            <span className="w-2 h-2 bg-destructive rounded-full mr-2"></span>
            DON'T
          </h3>
          <ul className="space-y-1">
            {card.content.dontsList.map((item, index) => (
              <li key={index} className="text-body text-textSecondary flex items-start">
                <span className="text-destructive mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-textPrimary mb-2">Key Phrases</h3>
          <div className="space-y-2">
            {card.content.keyPhrases.map((phrase, index) => (
              <div key={index} className="bg-blue-50 p-3 rounded-lg border-l-4 border-primary">
                <p className="text-body font-medium text-textPrimary">{phrase}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-textPrimary mb-2">Summary</h3>
          <p className="text-body text-textSecondary">{card.content.summary}</p>
        </div>
      </div>
    </div>
  )

  if (selectedCard) {
    return (
      <div className="py-6">
        <CardDetailView card={selectedCard} onClose={() => setSelectedCard(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-display text-textPrimary">Know Your Rights</h1>
        <p className="text-body text-textSecondary">
          Essential information for police interactions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textSecondary" />
          <input
            type="text"
            placeholder="Search rights cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-caption">
            {filteredCards.length} cards available
          </p>
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-textSecondary" />
            <span className="text-caption">
              {user.preferredLanguage === 'es' ? 'Español' : 'English'}
            </span>
          </div>
        </div>
      </div>

      {/* Rights Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCards.map((card) => (
          <Card 
            key={card.cardId} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCard(card)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {card.content.summary.substring(0, 100)}...
                    </CardDescription>
                  </div>
                </div>
                <div className="text-textSecondary">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {card.state}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-textSecondary mx-auto mb-4" />
          <h3 className="text-heading text-textPrimary mb-2">No cards found</h3>
          <p className="text-body text-textSecondary">
            Try adjusting your search terms
          </p>
        </div>
      )}
    </div>
  )
}