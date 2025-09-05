export const stateLaws = {
  CA: {
    state: 'California',
    laws: [
      {
        id: 'ca-stop-identify',
        title: 'Stop and Identify Law',
        summary: 'California does not have a "stop and identify" statute. You are not required to provide identification unless you are driving, detained for a specific crime, or under arrest.',
        details: 'Police must have reasonable suspicion of criminal activity to detain you. During a detention, you may be required to identify yourself in some circumstances, but California law does not generally require carrying ID.',
        category: 'identification'
      },
      {
        id: 'ca-recording',
        title: 'Recording Police',
        summary: 'You have the right to record police officers performing their duties in public spaces, as long as you do not interfere with their work.',
        details: 'California is a two-party consent state for private conversations, but recording police in public is protected under the First Amendment. Officers cannot confiscate your device without a warrant.',
        category: 'recording'
      },
      {
        id: 'ca-vehicle-search',
        title: 'Vehicle Search Laws',
        summary: 'Police can search your vehicle without a warrant if they have probable cause to believe it contains evidence of a crime.',
        details: 'The "automobile exception" allows warrantless searches of vehicles due to their mobility. However, police still need probable cause or your consent to search.',
        category: 'search'
      }
    ]
  },
  NY: {
    state: 'New York',
    laws: [
      {
        id: 'ny-stop-frisk',
        title: 'Stop and Frisk',
        summary: 'Police can stop and frisk you if they have reasonable suspicion that you are armed and dangerous.',
        details: 'Under Terry v. Ohio, police can conduct a limited pat-down for weapons. However, they need reasonable suspicion that you are armed, not just that you committed a crime.',
        category: 'detention'
      },
      {
        id: 'ny-marijuana',
        title: 'Marijuana Laws',
        summary: 'Possession of small amounts of marijuana is decriminalized in New York. Adult use is legal.',
        details: 'Adults 21+ can possess up to 3 ounces of cannabis. Public consumption is restricted to designated areas. Driving under the influence remains illegal.',
        category: 'substances'
      }
    ]
  },
  TX: {
    state: 'Texas',
    laws: [
      {
        id: 'tx-identify',
        title: 'Failure to Identify',
        summary: 'Texas has a "failure to identify" law requiring you to provide your name if lawfully arrested.',
        details: 'You must provide your name, residence address, and date of birth if arrested. Refusing to identify yourself is a Class C misdemeanor.',
        category: 'identification'
      },
      {
        id: 'tx-open-carry',
        title: 'Open Carry Laws',
        summary: 'Texas allows open carry of firearms with proper licensing.',
        details: 'Licensed individuals can openly carry handguns. Constitutional carry allows carrying without a license in many situations for eligible adults.',
        category: 'weapons'
      }
    ]
  }
}