import OpenAI from 'openai'
import config from '../config'

// Initialize OpenAI client
let openai = null

if (config.openai.apiKey) {
  openai = new OpenAI({
    apiKey: config.openai.apiKey,
    dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
  })
}

// OpenAI service for Legal Shield
export class OpenAIService {
  constructor() {
    this.client = openai
  }

  // Check if OpenAI is configured
  isConfigured() {
    return this.client !== null
  }

  // Generate legal scripts for different scenarios
  async generateScript(scenario, language = 'en', userState = 'CA') {
    if (!this.client) {
      throw new Error('OpenAI not configured - using fallback')
    }

    const prompts = {
      'traffic-stop': {
        en: `Generate a clear, concise script for someone who has been pulled over by police during a traffic stop in ${userState}. The script should:
        1. Emphasize staying calm and respectful
        2. Include specific phrases to assert constitutional rights
        3. Provide guidance on what to say and what NOT to say
        4. Be practical and easy to remember under stress
        5. Include state-specific considerations for ${userState}
        
        Format as a numbered list with clear, actionable statements. Keep it under 300 words.`,
        
        es: `Genera un guión claro y conciso para alguien que ha sido detenido por la policía durante una parada de tráfico en ${userState}. El guión debe:
        1. Enfatizar mantenerse calmado y respetuoso
        2. Incluir frases específicas para hacer valer los derechos constitucionales
        3. Proporcionar orientación sobre qué decir y qué NO decir
        4. Ser práctico y fácil de recordar bajo estrés
        5. Incluir consideraciones específicas del estado para ${userState}
        
        Formatear como una lista numerada con declaraciones claras y procesables. Mantenerlo bajo 300 palabras.`
      },
      
      'questioning': {
        en: `Generate a script for someone being questioned by police in ${userState}. Focus on:
        1. Asserting the right to remain silent
        2. Requesting a lawyer
        3. Not consenting to searches
        4. Staying calm and respectful
        5. State-specific rights in ${userState}
        
        Provide exact phrases to use. Keep under 250 words.`,
        
        es: `Genera un guión para alguien que está siendo interrogado por la policía en ${userState}. Enfócate en:
        1. Hacer valer el derecho a permanecer en silencio
        2. Solicitar un abogado
        3. No consentir a registros
        4. Mantenerse calmado y respetuoso
        5. Derechos específicos del estado en ${userState}
        
        Proporciona frases exactas para usar. Mantener bajo 250 palabras.`
      },
      
      'search-request': {
        en: `Generate a script for when police request to search a person or property in ${userState}. Include:
        1. How to clearly refuse consent
        2. What rights apply during searches
        3. How to document the interaction
        4. State-specific search laws for ${userState}
        5. Staying safe while asserting rights
        
        Provide clear, direct language. Under 250 words.`,
        
        es: `Genera un guión para cuando la policía solicita registrar a una persona o propiedad en ${userState}. Incluye:
        1. Cómo rechazar claramente el consentimiento
        2. Qué derechos se aplican durante los registros
        3. Cómo documentar la interacción
        4. Leyes de registro específicas del estado para ${userState}
        5. Mantenerse seguro mientras se hacen valer los derechos
        
        Proporciona lenguaje claro y directo. Bajo 250 palabras.`
      },
      
      'arrest': {
        en: `Generate a script for someone being arrested in ${userState}. Cover:
        1. How to comply safely while preserving rights
        2. What to say and what NOT to say
        3. Requesting a lawyer immediately
        4. Miranda rights and their importance
        5. State-specific arrest procedures in ${userState}
        
        Focus on safety and legal protection. Under 300 words.`,
        
        es: `Genera un guión para alguien que está siendo arrestado en ${userState}. Cubre:
        1. Cómo cumplir de manera segura mientras se preservan los derechos
        2. Qué decir y qué NO decir
        3. Solicitar un abogado inmediatamente
        4. Derechos Miranda y su importancia
        5. Procedimientos de arresto específicos del estado en ${userState}
        
        Enfócate en la seguridad y protección legal. Bajo 300 palabras.`
      }
    }

    const prompt = prompts[scenario]?.[language] || prompts[scenario]?.['en']
    
    if (!prompt) {
      throw new Error(`No prompt available for scenario: ${scenario}`)
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal rights advisor helping people understand their constitutional rights during police interactions. Provide clear, accurate, and practical guidance. Always emphasize safety and compliance with lawful orders while protecting constitutional rights. Include disclaimers about seeking professional legal advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      const scriptContent = completion.choices[0]?.message?.content
      
      if (!scriptContent) {
        throw new Error('No content generated')
      }

      // Add disclaimer
      const disclaimer = language === 'es' 
        ? '\n\n⚠️ IMPORTANTE: Esta información es general y no constituye asesoramiento legal profesional. En situaciones complejas, busque asesoramiento legal calificado.'
        : '\n\n⚠️ IMPORTANT: This information is general and does not constitute professional legal advice. In complex situations, seek qualified legal counsel.'

      return scriptContent + disclaimer

    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate script. Please try again.')
    }
  }

  // Generate contextual advice based on user input
  async generateContextualAdvice(situation, userInput, language = 'en') {
    if (!this.client) {
      throw new Error('OpenAI not configured')
    }

    const systemPrompt = language === 'es'
      ? "Eres un asesor de derechos legales que ayuda a las personas a entender sus derechos constitucionales. Proporciona consejos claros, precisos y prácticos basados en la situación descrita."
      : "You are a legal rights advisor helping people understand their constitutional rights. Provide clear, accurate, and practical advice based on the described situation."

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Situation: ${situation}\nUser description: ${userInput}\n\nProvide specific advice for this situation.`
          }
        ],
        max_tokens: 300,
        temperature: 0.6,
      })

      return completion.choices[0]?.message?.content || 'Unable to generate advice'

    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate advice')
    }
  }

  // Analyze recording transcript for legal insights
  async analyzeTranscript(transcript, language = 'en') {
    if (!this.client) {
      throw new Error('OpenAI not configured')
    }

    const prompt = language === 'es'
      ? `Analiza esta transcripción de una interacción policial e identifica:
        1. Posibles violaciones de derechos
        2. Momentos clave en la interacción
        3. Recomendaciones para acciones futuras
        4. Elementos que podrían ser importantes legalmente
        
        Transcripción: ${transcript}`
      : `Analyze this police interaction transcript and identify:
        1. Potential rights violations
        2. Key moments in the interaction
        3. Recommendations for future actions
        4. Elements that might be legally significant
        
        Transcript: ${transcript}`

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal analyst reviewing police interactions for potential rights issues. Provide objective analysis while emphasizing the need for professional legal review."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.5,
      })

      return completion.choices[0]?.message?.content || 'Unable to analyze transcript'

    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to analyze transcript')
    }
  }
}

// Create singleton instance
export const aiService = new OpenAIService()

export default aiService
