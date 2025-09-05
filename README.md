# Legal Shield - Know Your Rights, Get Instant Legal Guidance

A mobile-first web application providing immediate, state-specific legal rights information and interaction recording for individuals interacting with law enforcement.

## 🚀 Features

### Core Features
- **Mobile Rights Cards**: Concise, mobile-optimized guides for police interactions
- **State-Specific Law Summaries**: Simplified legal information by state
- **One-Tap Incident Recorder**: Audio/video recording with location tracking
- **AI-Powered Script Generator**: Contextual guidance for various scenarios
- **Shareable Interaction Summary**: Quick sharing of incident details

### Premium Features
- Unlimited recording time
- Video recording capability
- Advanced AI script generation
- Cloud backup and sync
- Priority customer support
- Offline access to all content

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **State Management**: React Context + useReducer
- **Storage**: LocalForage for offline functionality
- **APIs**: OpenAI GPT-3.5, Supabase, Stripe
- **Services**: Geolocation, Media Recording
- **UI Components**: Custom component library with shadcn/ui patterns

## 📱 Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser with MediaRecorder API support

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/vistara-apps/this-is-a-1876.git
cd this-is-a-1876
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# API Keys
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# App Configuration
VITE_APP_NAME=Legal Shield
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_GEOLOCATION=true
VITE_ENABLE_VIDEO_RECORDING=true
```

5. Start development server:
```bash
npm run dev
```

## 🏗 Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── Layout.jsx      # App layout wrapper
├── pages/              # Route components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # External service integrations
│   ├── openai.js      # OpenAI API service
│   ├── supabase.js    # Database service
│   ├── stripe.js      # Payment processing
│   ├── storage.js     # Local storage service
│   └── geolocation.js # Location services
├── data/              # Static data and mock content
├── config/            # App configuration
└── main.jsx          # App entry point
```

### Key Services

#### OpenAI Service (`src/services/openai.js`)
- Real-time script generation for legal scenarios
- State-specific legal guidance
- Multi-language support (English/Spanish)
- Fallback to mock data when API unavailable

#### Storage Service (`src/services/storage.js`)
- Offline-first data persistence
- Recording and script management
- Usage tracking for subscription limits
- Data export/import functionality

#### Geolocation Service (`src/services/geolocation.js`)
- Location-based rights information
- Emergency contact lookup
- Address geocoding
- Privacy-focused location handling

#### Stripe Service (`src/services/stripe.js`)
- Subscription management
- Payment processing
- Plan upgrades and cancellations

## 🔧 Configuration

### Subscription Plans

#### Free Tier
- 5-minute recording limit per session
- 3 AI scripts per month
- Basic rights cards access
- State law summaries
- Audio recording only

#### Premium Tier ($4.99/month)
- Unlimited recording time
- Unlimited AI scripts
- Video recording capability
- Cloud backup and sync
- Priority support
- Offline access

### Feature Flags
Control features via environment variables:
- `VITE_ENABLE_GEOLOCATION`: Location-based features
- `VITE_ENABLE_VIDEO_RECORDING`: Video recording capability
- `VITE_ENABLE_ANALYTICS`: Usage analytics

## 📊 Data Model

### User
```javascript
{
  userId: string,
  email: string,
  subscriptionStatus: 'free' | 'premium',
  preferredLanguage: 'en' | 'es',
  state: string
}
```

### Recording
```javascript
{
  recordId: string,
  userId: string,
  timestamp: string,
  duration: number,
  audioFilePath: string,
  videoFilePath: string,
  location: {
    latitude: number,
    longitude: number,
    address: string
  },
  notes: string,
  sharedStatus: boolean
}
```

### Generated Script
```javascript
{
  scriptId: string,
  userId: string,
  scenario: string,
  language: string,
  scriptContent: string,
  timestamp: string
}
```

## 🔒 Security & Privacy

- **Local-First Storage**: Sensitive data stored locally using IndexedDB
- **No Server-Side Recording Storage**: Audio/video files remain on device
- **Optional Location Services**: User controls location sharing
- **Encrypted API Communications**: All API calls use HTTPS
- **Privacy-Focused Design**: Minimal data collection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t legal-shield .
docker run -p 3000:3000 legal-shield
```

### Environment-Specific Builds
- Development: `npm run dev`
- Preview: `npm run preview`
- Production: `npm run build`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Audio recording functionality
- [ ] Video recording (premium users)
- [ ] AI script generation
- [ ] Geolocation services
- [ ] Offline functionality
- [ ] Subscription limits enforcement
- [ ] Data export/import
- [ ] Cross-browser compatibility

### Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 📱 Mobile Optimization

- **Progressive Web App (PWA)** ready
- **Touch-optimized interface**
- **Responsive design** for all screen sizes
- **Offline functionality** with service workers
- **Native app-like experience**

## 🔧 API Integration

### OpenAI Integration
```javascript
// Generate contextual legal scripts
const script = await aiService.generateScript('traffic-stop', 'en', 'CA')
```

### Supabase Integration
```javascript
// Save recording to database
await db.saveRecording(recordingData)
```

### Stripe Integration
```javascript
// Process subscription upgrade
await stripeService.upgradeSubscription(userId, 'premium')
```

## 📈 Usage Analytics

Track key metrics:
- Script generation usage
- Recording time limits
- Feature adoption rates
- Subscription conversions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Legal Disclaimer

This application provides general legal information and should not replace professional legal advice. Users should consult with qualified attorneys for specific legal situations. The app is designed to help users understand their constitutional rights but does not constitute legal representation.

## 🆘 Support

For technical support or questions:
- Create an issue in this repository
- Contact support at support@legalshield.app
- Visit our documentation at docs.legalshield.app

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete PRD implementation
- ✅ Real API integrations (OpenAI, Supabase, Stripe)
- ✅ Audio/video recording with geolocation
- ✅ Subscription management
- ✅ Offline functionality
- ✅ Multi-language support
- ✅ Mobile-first responsive design
- ✅ Production-ready deployment

---

**Legal Shield** - Empowering citizens with knowledge of their rights and tools for safe police interactions.
