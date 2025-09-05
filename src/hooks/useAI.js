import { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'

// Mock OpenAI integration - in production, you would use the actual OpenAI API
export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const { addScript, user } = useApp()

  const generateScript = useCallback(async (scenario, language = 'en') => {
    setIsGenerating(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock responses based on scenario
      const mockScripts = {
        'traffic-stop': {
          en: `Here's what to say during a traffic stop:

1. "Officer, I'm keeping my hands visible and will only reach for documents when you ask."

2. "I understand you pulled me over. May I ask why?"

3. "I'm providing my license, registration, and insurance as required."

4. "I am exercising my right to remain silent beyond providing this identification."

5. "I do not consent to any searches of my vehicle or person."

If asked to step out: "I will comply with your lawful order, but I want to be clear that I do not consent to any searches."

Remember: Stay calm, be polite, keep hands visible, and don't argue. You can address any issues in court later.`,
          es: `Esto es lo que debe decir durante una parada de tráfico:

1. "Oficial, mantengo mis manos visibles y solo alcanzaré documentos cuando me lo pida."

2. "Entiendo que me detuvo. ¿Puedo preguntar por qué?"

3. "Estoy proporcionando mi licencia, registro y seguro según se requiere."

4. "Estoy ejerciendo mi derecho a permanecer en silencio más allá de proporcionar esta identificación."

5. "No consiento a ningún registro de mi vehículo o persona."

Recuerde: Manténgase calmado, sea cortés, mantenga las manos visibles y no discuta.`
        },
        'questioning': {
          en: `If questioned by police:

1. "Am I being detained or am I free to leave?"

2. "I am exercising my right to remain silent."

3. "I want to speak to a lawyer before answering any questions."

4. "I do not consent to any searches."

5. "I will not sign anything without speaking to a lawyer first."

If they continue questioning: "I have invoked my right to remain silent and requested a lawyer. I will not answer any questions until my attorney is present."

Remember: You have the absolute right to remain silent. Anything you say can and will be used against you.`,
          es: `Si la policía lo interroga:

1. "¿Estoy detenido o soy libre de irme?"

2. "Estoy ejerciendo mi derecho a permanecer en silencio."

3. "Quiero hablar con un abogado antes de responder cualquier pregunta."

4. "No consiento a ningún registro."

5. "No firmaré nada sin hablar primero con un abogado."

Recuerde: Tiene el derecho absoluto de permanecer en silencio.`
        }
      }

      const script = mockScripts[scenario]?.[language] || mockScripts[scenario]?.['en'] || 'Script not available for this scenario.'

      const generatedScript = {
        scriptId: `script-${Date.now()}`,
        scenario,
        language,
        scriptContent: script,
        timestamp: new Date().toISOString()
      }

      addScript(generatedScript)
      setIsGenerating(false)
      return generatedScript

    } catch (err) {
      console.error('Error generating script:', err)
      setError('Failed to generate script. Please try again.')
      setIsGenerating(false)
      throw err
    }
  }, [addScript])

  return {
    generateScript,
    isGenerating,
    error
  }
}