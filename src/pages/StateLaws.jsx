import React, { useState } from 'react'
import { MapPin, Book, Search, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { stateLaws } from '../data/stateLaws'
import { useApp } from '../context/AppContext'

const US_STATES = [
  'CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI',
  'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
  'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT',
  'IA', 'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'WV', 'ID', 'HI',
  'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'
]

export default function StateLaws() {
  const { user, setUserState } = useApp()
  const [selectedLaw, setSelectedLaw] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const currentStateLaws = stateLaws[user.state] || { state: user.state, laws: [] }
  
  const filteredLaws = currentStateLaws.laws.filter(law =>
    law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    law.summary.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const LawDetailView = ({ law, onClose }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading text-textPrimary">{law.title}</h2>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-textPrimary mb-2">Summary</h3>
          <p className="text-body text-textSecondary">{law.summary}</p>
        </div>

        <div>
          <h3 className="font-semibold text-textPrimary mb-2">Detailed Information</h3>
          <p className="text-body text-textSecondary leading-relaxed">{law.details}</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
            {law.category}
          </span>
          <span className="text-caption">
            {currentStateLaws.state} State Law
          </span>
        </div>
      </div>
    </div>
  )

  if (selectedLaw) {
    return (
      <div className="py-6">
        <LawDetailView law={selectedLaw} onClose={() => setSelectedLaw(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-display text-textPrimary">State Laws</h1>
        <p className="text-body text-textSecondary">
          Local legal information specific to your area
        </p>
      </div>

      {/* State Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Your State: {currentStateLaws.state}
          </CardTitle>
          <CardDescription>
            Laws may vary by state. Select your state for accurate information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {US_STATES.map(state => (
              <Button
                key={state}
                variant={user.state === state ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
                onClick={() => setUserState(state)}
              >
                {state}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textSecondary" />
        <input
          type="text"
          placeholder="Search laws..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Laws List */}
      {filteredLaws.length > 0 ? (
        <div className="space-y-4">
          <p className="text-caption">
            {filteredLaws.length} laws found for {currentStateLaws.state}
          </p>
          
          <div className="space-y-3">
            {filteredLaws.map((law) => (
              <Card 
                key={law.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedLaw(law)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Book className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-textPrimary">{law.title}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                          {law.category}
                        </span>
                      </div>
                      <p className="text-body text-textSecondary text-sm">
                        {law.summary}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-textSecondary ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Book className="h-12 w-12 text-textSecondary mx-auto mb-4" />
            <h3 className="text-heading text-textPrimary mb-2">
              {currentStateLaws.laws.length === 0 ? 'No laws available' : 'No laws found'}
            </h3>
            <p className="text-body text-textSecondary">
              {currentStateLaws.laws.length === 0 
                ? `Law information for ${currentStateLaws.state} is being updated.`
                : 'Try adjusting your search terms.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}