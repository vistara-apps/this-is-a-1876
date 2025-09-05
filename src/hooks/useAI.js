import { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { aiService } from '../services/openai'
import { storageService } from '../services/storage'
import config from '../config'

export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const { addScript, user } = useApp()

  const generateScript = useCallback(async (scenario, language = 'en') => {
    setIsGenerating(true)
    setError(null)

    try {
      // Check subscription limits for free users
      if (user.subscriptionStatus === 'free') {
        const usage = await storageService.getCurrentUsage()
        const limit = config.plans.free.features.scriptsPerMonth
        
        if (usage.scriptsGenerated >= limit) {
          throw new Error(`Free tier limit reached. You can generate ${limit} scripts per month. Upgrade to Premium for unlimited scripts.`)
        }
      }

      let scriptContent
      
      // Try to use OpenAI service first, fallback to mock data
      if (aiService.isConfigured()) {
        try {
          scriptContent = await aiService.generateScript(scenario, language, user.state)
        } catch (aiError) {
          console.warn('OpenAI service failed, using fallback:', aiError)
          scriptContent = await getFallbackScript(scenario, language)
        }
      } else {
        scriptContent = await getFallbackScript(scenario, language)
      }

      const generatedScript = {
        scriptId: `script-${Date.now()}`,
        userId: user.userId,
        scenario,
        language,
        scriptContent,
        timestamp: new Date().toISOString()
      }

      // Save to local storage
      await storageService.saveScript(generatedScript)
      
      // Track usage
      await storageService.trackUsage('script')
      
      // Add to app context
      addScript(generatedScript)
      
      setIsGenerating(false)
      return generatedScript

    } catch (err) {
      console.error('Error generating script:', err)
      setError(err.message || 'Failed to generate script. Please try again.')
      setIsGenerating(false)
      throw err
    }
  }, [addScript, user])

  // Fallback script generation for when OpenAI is not available
  const getFallbackScript = async (scenario, language) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockScripts = {
      'traffic-stop': {
        en: `Here's what to say during a traffic stop:

1. "Officer, I'm keeping my hands visible and will only reach for documents when you ask."

2. "I understand you pulled me over. May I ask why?"

3. "I'm providing my license, registration, and insurance as required."

4. "I am exercising my right to remain silent beyond providing this identification."

5. "I do not consent to any searches of my vehicle or person."

If asked to step out: "I will comply with your lawful order, but I want to be clear that I do not consent to any searches."

Remember: Stay calm, be polite, keep hands visible, and don't argue. You can address any issues in court later.

⚠️ IMPORTANT: This information is general and does not constitute professional legal advice. In complex situations, seek qualified legal counsel.`,
        es: `Esto es lo que debe decir durante una parada de tráfico:

1. "Oficial, mantengo mis manos visibles y solo alcanzaré documentos cuando me lo pida."

2. "Entiendo que me detuvo. ¿Puedo preguntar por qué?"

3. "Estoy proporcionando mi licencia, registro y seguro según se requiere."

4. "Estoy ejerciendo mi derecho a permanecer en silencio más allá de proporcionar esta identificación."

5. "No consiento a ningún registro de mi vehículo o persona."

Recuerde: Manténgase calmado, sea cortés, mantenga las manos visibles y no discuta.

⚠️ IMPORTANTE: Esta información es general y no constituye asesoramiento legal profesional. En situaciones complejas, busque asesoramiento legal calificado.`
      },
      'questioning': {
        en: `If questioned by police:

1. "Am I being detained or am I free to leave?"

2. "I am exercising my right to remain silent."

3. "I want to speak to a lawyer before answering any questions."

4. "I do not consent to any searches."

5. "I will not sign anything without speaking to a lawyer first."

If they continue questioning: "I have invoked my right to remain silent and requested a lawyer. I will not answer any questions until my attorney is present."

Remember: You have the absolute right to remain silent. Anything you say can and will be used against you.

⚠️ IMPORTANT: This information is general and does not constitute professional legal advice. In complex situations, seek qualified legal counsel.`,
        es: `Si la policía lo interroga:

1. "¿Estoy detenido o soy libre de irme?"

2. "Estoy ejerciendo mi derecho a permanecer en silencio."

3. "Quiero hablar con un abogado antes de responder cualquier pregunta."

4. "No consiento a ningún registro."

5. "No firmaré nada sin hablar primero con un abogado."

Recuerde: Tiene el derecho absoluto de permanecer en silencio.

⚠️ IMPORTANTE: Esta información es general y no constituye asesoramiento legal profesional. En situaciones complejas, busque asesoramiento legal calificado.`
      },
      'search-request': {
        en: `When police request to search:

1. "I do not consent to any searches of my person, belongings, or property."

2. "Am I being detained or am I free to leave?"

3. "I am exercising my right to remain silent."

4. "I want to speak to a lawyer before answering any questions."

5. If they search anyway: "I am not resisting, but I do not consent to this search."

Remember: Clearly state your refusal to consent. Do not physically resist. Document everything if possible.

⚠️ IMPORTANT: This information is general and does not constitute professional legal advice. In complex situations, seek qualified legal counsel.`,
        es: `Cuando la policía solicita registrar:

1. "No consiento a ningún registro de mi persona, pertenencias o propiedad."

2. "¿Estoy detenido o soy libre de irme?"

3. "Estoy ejerciendo mi derecho a permanecer en silencio."

4. "Quiero hablar con un abogado antes de responder cualquier pregunta."

5. Si registran de todos modos: "No me estoy resistiendo, pero no consiento a este registro."

Recuerde: Declare claramente su negativa a consentir. No se resista físicamente. Documente todo si es posible.

⚠️ IMPORTANTE: Esta información es general y no constituye asesoramiento legal profesional. En situaciones complejas, busque asesoramiento legal calificado.`
      },
      'arrest': {
        en: `If being arrested:

1. "I am exercising my right to remain silent."

2. "I want to speak to a lawyer immediately."

3. "I do not consent to any searches."

4. Do not resist physically, even if you believe the arrest is unlawful.

5. Remember: Anything you say can and will be used against you in court.

6. Ask for a lawyer repeatedly and clearly.

7. Do not sign anything without a lawyer present.

Remember: Stay calm, comply physically, but assert your rights verbally. Challenge the arrest in court, not on the street.

⚠️ IMPORTANT: This information is general and does not constitute professional legal advice. In complex situations, seek qualified legal counsel.`,
        es: `Si está siendo arrestado:

1. "Estoy ejerciendo mi derecho a permanecer en silencio."

2. "Quiero hablar con un abogado inmediatamente."

3. "No consiento a ningún registro."

4. No se resista físicamente, incluso si cree que el arresto es ilegal.

5. Recuerde: Todo lo que diga puede y será usado en su contra en la corte.

6. Pida un abogado repetidamente y claramente.

7. No firme nada sin un abogado presente.

Recuerde: Manténgase calmado, cumpla físicamente, pero haga valer sus derechos verbalmente. Desafíe el arresto en la corte, no en la calle.

⚠️ IMPORTANTE: Esta información es general y no constituye asesoramiento legal profesional. En situaciones complejas, busque asesoramiento legal calificado.`
      }
    }

    return mockScripts[scenario]?.[language] || mockScripts[scenario]?.['en'] || 'Script not available for this scenario.'
  }

  return {
    generateScript,
    isGenerating,
    error
  }
}
