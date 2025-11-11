import { PrismaClient, EpisodeType, EpisodeStatus, NodeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================================================
  // SAMPLE INTERVIEW: Albert Einstein on Relativity
  // ============================================================================
  console.log('📚 Creating sample interview: Albert Einstein...');

  const einsteinEpisode = await prisma.episode.create({
    data: {
      title: 'Einstein on Relativity: A Mind-Bending Conversation',
      subtitle: 'The genius physicist explains spacetime, E=mc², and the nature of reality',
      description: 'Step into the mind of one of history\'s greatest scientists as we discuss the revolutionary theory that changed our understanding of the universe.',
      topic: 'Theory of Relativity',
      era: 'Early 20th Century',
      type: EpisodeType.INTERVIEW,
      status: EpisodeStatus.PUBLISHED,
      duration: 1800,
      keywords: ['physics', 'relativity', 'einstein', 'science', 'spacetime'],
      audioUrl: 'https://placeholder-audio.com/einstein-interview.mp3',
      publishedAt: new Date(),
      sources: [
        { title: 'Einstein\'s 1905 Papers', url: 'https://example.com/1905-papers', type: 'primary' },
        { title: 'Relativity: The Special and General Theory', url: 'https://example.com/relativity', type: 'book' }
      ],
      interview: {
        create: {
          hostName: 'The Epoch Host',
          hostVoice: 'onyx',
          guestName: 'Albert Einstein',
          guestRole: 'Theoretical Physicist',
          guestEra: 'Early 20th Century (1879-1955)',
          guestVoice: 'echo',
          topic: 'Theory of Relativity and the Nature of Space-Time',
          questions: [
            {
              question: 'Can you explain the theory of relativity in simple terms?',
              context: 'Help our listeners understand this revolutionary concept',
              followUp: 'What inspired you to question Newtonian physics?'
            },
            {
              question: 'What does E=mc² really mean?',
              context: 'This is perhaps the most famous equation in history',
              followUp: 'How did you arrive at this equation?'
            },
            {
              question: 'How does time dilation work?',
              context: 'The idea that time moves differently for different observers',
              followUp: 'Could you give a practical example?'
            }
          ],
          dialogue: {
            intro: {
              speaker: 'HOST',
              text: 'Welcome to Epoch Pod. Today, we have an extraordinary guest - a man who revolutionized our understanding of space, time, and the very fabric of reality. Please welcome Albert Einstein.'
            },
            segments: [
              { speaker: 'GUEST', text: 'Thank you for having me. It is always a pleasure to discuss the wonders of the universe.' },
              { speaker: 'HOST', text: 'Dr. Einstein, let\'s start with the basics. Can you explain the theory of relativity in a way that everyone can understand?' },
              { speaker: 'GUEST', text: 'Certainly. Imagine you are on a train moving at constant speed. Inside the train, you cannot tell if you are moving or if the world outside is moving past you. This is the principle of relativity - the laws of physics are the same in all uniformly moving frames of reference.' },
              { speaker: 'HOST', text: 'That\'s fascinating. But what about time itself? You\'ve said that time is not absolute.' },
              { speaker: 'GUEST', text: 'Yes, precisely! Time is relative to the observer. If you were traveling close to the speed of light, time would pass more slowly for you than for someone standing still. This is what we call time dilation.' }
            ],
            outro: {
              speaker: 'HOST',
              text: 'Dr. Einstein, thank you for this mind-expanding conversation. You\'ve given us much to ponder about the nature of reality itself.'
            }
          }
        }
      }
    }
  });

  console.log(`✅ Created Einstein interview: ${einsteinEpisode.id}\n`);

  // ============================================================================
  // SAMPLE INTERVIEW: Cleopatra on Egypt and Power
  // ============================================================================
  console.log('📚 Creating sample interview: Cleopatra...');

  const cleopatraEpisode = await prisma.episode.create({
    data: {
      title: 'Cleopatra: Power, Politics, and the Fall of Egypt',
      subtitle: 'The last Pharaoh reveals the truth behind the legends',
      description: 'Join us for an intimate conversation with Cleopatra VII, the legendary queen who captivated Julius Caesar and Mark Antony while defending Egypt\'s independence.',
      topic: 'Ancient Egyptian Politics and Diplomacy',
      era: 'Ancient Egypt (51-30 BCE)',
      type: EpisodeType.INTERVIEW,
      status: EpisodeStatus.PUBLISHED,
      duration: 1650,
      keywords: ['egypt', 'cleopatra', 'rome', 'ancient history', 'pharaoh'],
      audioUrl: 'https://placeholder-audio.com/cleopatra-interview.mp3',
      publishedAt: new Date(),
      sources: [
        { title: 'Plutarch\'s Lives', url: 'https://example.com/plutarch', type: 'primary' },
        { title: 'Cleopatra: A Life by Stacy Schiff', url: 'https://example.com/cleopatra-life', type: 'book' }
      ],
      interview: {
        create: {
          hostName: 'The Epoch Host',
          hostVoice: 'onyx',
          guestName: 'Cleopatra VII',
          guestRole: 'Pharaoh of Egypt',
          guestEra: 'Ancient Egypt (51-30 BCE)',
          guestVoice: 'shimmer',
          topic: 'Leadership, Diplomacy, and the Defense of Egypt',
          questions: [
            {
              question: 'How did you navigate the complex relationship between Egypt and Rome?',
              context: 'Managing two superpowers while maintaining independence',
              followUp: 'What was your strategy with Caesar and Antony?'
            },
            {
              question: 'What role did your intellect and education play in your reign?',
              context: 'Beyond the myths of beauty and seduction',
              followUp: 'How many languages did you speak?'
            }
          ],
          dialogue: {
            intro: {
              speaker: 'HOST',
              text: 'Today we\'re honored to speak with one of history\'s most legendary rulers - Cleopatra VII, the last Pharaoh of Egypt. Welcome, Your Majesty.'
            },
            segments: [
              { speaker: 'GUEST', text: 'The honor is mine. I am pleased to set the record straight about my reign and my beloved Egypt.' },
              { speaker: 'HOST', text: 'Let\'s address the elephant in the room - history has often reduced your legacy to your relationships with Caesar and Antony. How do you respond to that?' },
              { speaker: 'GUEST', text: 'A frustrating oversimplification. I was fluent in nine languages, a skilled diplomat, and a capable administrator. My alliances were strategic decisions to protect Egypt from Roman conquest. That I used every tool at my disposal, including personal relationships, shows political acumen, not weakness.' }
            ],
            outro: {
              speaker: 'HOST',
              text: 'Cleopatra, thank you for sharing your perspective. Your legacy as a scholar, diplomat, and defender of Egypt is truly remarkable.'
            }
          }
        }
      }
    }
  });

  console.log(`✅ Created Cleopatra interview: ${cleopatraEpisode.id}\n`);

  // ============================================================================
  // SAMPLE DEBATE: Napoleon - Tyrant or Reformer?
  // ============================================================================
  console.log('⚖️ Creating sample debate: Napoleon...');

  const napoleonDebate = await prisma.episode.create({
    data: {
      title: 'Napoleon Bonaparte: Tyrant or Reformer?',
      subtitle: 'Two historians debate the legacy of France\'s most controversial emperor',
      description: 'Was Napoleon a power-hungry dictator who plunged Europe into war, or a visionary reformer who modernized France and spread revolutionary ideals? Listen and vote!',
      topic: 'Napoleon Bonaparte',
      era: 'Napoleonic Era (1799-1815)',
      type: EpisodeType.DEBATE,
      status: EpisodeStatus.PUBLISHED,
      duration: 2100,
      keywords: ['napoleon', 'france', 'debate', 'french revolution', 'empire'],
      audioUrl: 'https://placeholder-audio.com/napoleon-debate.mp3',
      publishedAt: new Date(),
      sources: [
        { title: 'Napoleon: A Life by Andrew Roberts', url: 'https://example.com/napoleon', type: 'book' },
        { title: 'The Napoleonic Code', url: 'https://example.com/code', type: 'primary' }
      ],
      debate: {
        create: {
          topic: 'Napoleon Bonaparte\'s Legacy',
          question: 'Was Napoleon Bonaparte a tyrant who betrayed the French Revolution, or a reformer who modernized Europe?',
          position1: 'Napoleon was a tyrant who betrayed revolutionary ideals',
          position2: 'Napoleon was a reformer who modernized France and Europe',
          argument1: {
            openingStatement: 'Napoleon Bonaparte crowned himself emperor, established a police state, censored the press, and waged wars that killed millions. He betrayed the very principles of liberty and equality that the French Revolution fought for.',
            mainPoints: [
              {
                point: 'Betrayed Republican Values',
                evidence: 'After the Revolution overthrew monarchy, Napoleon crowned himself Emperor in 1804, establishing a new dynasty and betraying republican ideals.',
                impact: 'Reversed democratic progress and concentrated absolute power in one man'
              },
              {
                point: 'Warmongering Cost Millions of Lives',
                evidence: 'The Napoleonic Wars resulted in an estimated 3-6 million deaths across Europe between 1803-1815.',
                impact: 'Devastated entire generations and economies across the continent'
              },
              {
                point: 'Established Police State',
                evidence: 'Created extensive secret police network, censored press, and suppressed political opposition ruthlessly.',
                impact: 'Eliminated freedom of speech and political dissent'
              }
            ],
            conclusion: 'While Napoleon implemented some reforms, his autocratic rule, endless wars, and betrayal of revolutionary principles mark him as a tyrant who prioritized personal ambition over liberty.'
          },
          argument2: {
            openingStatement: 'Napoleon Bonaparte created the Napoleonic Code, established meritocracy, reformed education, modernized infrastructure, and spread Enlightenment values across Europe. His legal and administrative reforms still influence the world today.',
            mainPoints: [
              {
                point: 'Revolutionary Legal Reforms',
                evidence: 'The Napoleonic Code established equality before the law, property rights, and secular legal principles. It still forms the basis of legal systems in over 40 countries.',
                impact: 'Created framework for modern civil law that endures two centuries later'
              },
              {
                point: 'Meritocracy and Educational Reform',
                evidence: 'Abolished aristocratic privilege, promoted based on talent, created lycées and the University of France to provide education to all classes.',
                impact: 'Broke down feudal barriers and created opportunities based on merit'
              },
              {
                point: 'Infrastructure and Economic Modernization',
                evidence: 'Built roads, canals, bridges; reformed banking system; stabilized currency; created the Bank of France.',
                impact: 'Laid foundation for France\'s industrial development and economic prosperity'
              }
            ],
            conclusion: 'Napoleon was a pragmatic reformer who modernized France and spread Enlightenment values. His administrative genius created institutions that outlasted his empire and shaped the modern world.'
          }
        }
      }
    }
  });

  console.log(`✅ Created Napoleon debate: ${napoleonDebate.id}\n`);

  // ============================================================================
  // SAMPLE DEBATE: Columbus - Explorer or Colonizer?
  // ============================================================================
  console.log('⚖️ Creating sample debate: Columbus...');

  const columbusDebate = await prisma.episode.create({
    data: {
      title: 'Christopher Columbus: Explorer or Colonizer?',
      subtitle: 'Examining the controversial legacy of 1492',
      description: 'Should we celebrate Columbus as a brave explorer who connected worlds, or condemn him as a colonizer who initiated centuries of oppression? A nuanced debate.',
      topic: 'Christopher Columbus and Colonial Legacy',
      era: 'Age of Exploration (1492-1506)',
      type: EpisodeType.DEBATE,
      status: EpisodeStatus.PUBLISHED,
      duration: 1950,
      keywords: ['columbus', 'exploration', 'colonization', 'indigenous peoples', 'americas'],
      audioUrl: 'https://placeholder-audio.com/columbus-debate.mp3',
      publishedAt: new Date(),
      sources: [
        { title: 'Columbus\'s Journal (1492)', url: 'https://example.com/journal', type: 'primary' },
        { title: 'An Indigenous Peoples\' History of the United States', url: 'https://example.com/indigenous', type: 'book' }
      ],
      debate: {
        create: {
          topic: 'Christopher Columbus\' Historical Legacy',
          question: 'Should Christopher Columbus be remembered primarily as a brave explorer or as a colonizer whose voyage initiated genocide?',
          position1: 'Columbus should be condemned as a colonizer, not celebrated',
          position2: 'Columbus should be recognized as a transformative explorer',
          argument1: {
            openingStatement: 'Columbus\'s voyages initiated the genocide of indigenous peoples, the transatlantic slave trade, and centuries of colonial oppression. His brutal governorship and treatment of native populations are well-documented historical facts.',
            mainPoints: [
              {
                point: 'Direct Brutality and Enslavement',
                evidence: 'Columbus enslaved indigenous people, forced them to mine gold, and punished those who resisted by cutting off their hands. His own journals document these atrocities.',
                impact: 'Indigenous population of Hispaniola declined from ~300,000 to nearly extinct within 50 years'
              },
              {
                point: 'Initiated Systematic Colonialism',
                evidence: 'Columbus\'s voyages began European colonization that resulted in the death of an estimated 55 million indigenous people over the next century.',
                impact: 'Nearly 90% of indigenous populations were wiped out by disease, warfare, and enslavement'
              },
              {
                point: 'Motivated by Greed, Not Science',
                evidence: 'Columbus\'s primary goal was gold and slaves for Spanish crown, as evidenced by his own writings and the encomienda system he established.',
                impact: 'Set template for extractive colonialism that devastated the Americas'
              }
            ],
            conclusion: 'We cannot celebrate Columbus without reckoning with the genocide and suffering his voyages initiated. The "discovery" narrative erases the humanity of millions of people who already lived in the Americas.'
          },
          argument2: {
            openingStatement: 'Columbus\'s voyage was one of history\'s most consequential events, permanently connecting two hemispheres and reshaping world history. While we must acknowledge the terrible consequences, his achievement as a navigator represents human curiosity and courage.',
            mainPoints: [
              {
                point: 'Remarkable Achievement in Navigation',
                evidence: 'Columbus successfully navigated across the Atlantic using dead reckoning and celestial navigation, proving the voyage was feasible and opening new routes.',
                impact: 'Revolutionized European understanding of geography and made trans-oceanic travel routine'
              },
              {
                point: 'Facilitated Exchange of Knowledge and Crops',
                evidence: 'The Columbian Exchange introduced potatoes, tomatoes, corn to Europe and wheat, horses, cattle to Americas, fundamentally changing global agriculture.',
                impact: 'Fed population growth on both continents and transformed economies worldwide'
              },
              {
                point: 'Product of His Time, Not Unique Villain',
                evidence: 'While Columbus\'s actions were brutal, they were consistent with 15th-century European norms. Focusing solely on Columbus obscures systemic colonialism.',
                impact: 'Understanding requires historical context, not just moral judgment'
              }
            ],
            conclusion: 'Columbus\'s voyage was a pivotal moment in human history. We can acknowledge his navigational achievement and historical significance while also teaching the devastating consequences of colonization.'
          }
        }
      }
    }
  });

  console.log(`✅ Created Columbus debate: ${columbusDebate.id}\n`);

  // ============================================================================
  // SAMPLE ADVENTURE: The Roman Senator's Dilemma
  // ============================================================================
  console.log('🎮 Creating sample adventure: Roman Senator...');

  // First, create all episode placeholders
  const startEpisode = await prisma.episode.create({
    data: {
      title: 'The Ides of March Approach',
      subtitle: 'Rome, March 44 BCE - A Decision Awaits',
      description: 'As a Roman Senator, you must navigate the dangerous politics of the late Republic.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic (44 BCE)',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 600,
      keywords: ['rome', 'caesar', 'senate', 'republic'],
      audioUrl: 'https://placeholder-audio.com/roman-start.mp3',
      publishedAt: new Date()
    }
  });

  const conspiracyEpisode = await prisma.episode.create({
    data: {
      title: 'The Secret Meeting',
      subtitle: 'Cassius approaches you in the shadows',
      description: 'You\'ve joined the conspiracy against Caesar. The die is cast.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic (44 BCE)',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 720,
      keywords: ['rome', 'caesar', 'conspiracy', 'brutus'],
      audioUrl: 'https://placeholder-audio.com/roman-conspiracy.mp3',
      publishedAt: new Date()
    }
  });

  const loyaltyEpisode = await prisma.episode.create({
    data: {
      title: 'Standing with Caesar',
      subtitle: 'You reject the conspirators',
      description: 'You\'ve chosen to remain loyal to Caesar, but danger looms.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic (44 BCE)',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 690,
      keywords: ['rome', 'caesar', 'loyalty'],
      audioUrl: 'https://placeholder-audio.com/roman-loyalty.mp3',
      publishedAt: new Date()
    }
  });

  const assassinationEpisode = await prisma.episode.create({
    data: {
      title: 'The Ides of March',
      subtitle: 'Caesar falls at the Theatre of Pompey',
      description: 'You participate in the assassination, changing Rome forever.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic (44 BCE)',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 900,
      keywords: ['rome', 'caesar', 'assassination', 'brutus'],
      audioUrl: 'https://placeholder-audio.com/roman-assassination.mp3',
      publishedAt: new Date()
    }
  });

  const fleeEpisode = await prisma.episode.create({
    data: {
      title: 'Flight from Rome',
      subtitle: 'You flee the conspiracy',
      description: 'You\'ve revealed the plot to Caesar and must escape.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic (44 BCE)',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 750,
      keywords: ['rome', 'caesar', 'escape'],
      audioUrl: 'https://placeholder-audio.com/roman-flee.mp3',
      publishedAt: new Date()
    }
  });

  const civilWarEpisode = await prisma.episode.create({
    data: {
      title: 'Civil War Erupts',
      subtitle: 'Antony and Octavian seek vengeance',
      description: 'Rome descends into civil war as the Second Triumvirate forms.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic (44-43 BCE)',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 840,
      keywords: ['rome', 'civil war', 'triumvirate', 'antony'],
      audioUrl: 'https://placeholder-audio.com/roman-civilwar.mp3',
      publishedAt: new Date()
    }
  });

  const dictatorshipEpisode = await prisma.episode.create({
    data: {
      title: 'The Empire Begins',
      subtitle: 'Caesar becomes dictator perpetuo',
      description: 'With the conspiracy crushed, Caesar becomes dictator for life.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic (44 BCE)',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 780,
      keywords: ['rome', 'caesar', 'dictatorship', 'empire'],
      audioUrl: 'https://placeholder-audio.com/roman-dictatorship.mp3',
      publishedAt: new Date()
    }
  });

  const proscriptionEpisode = await prisma.episode.create({
    data: {
      title: 'The Proscription Lists',
      subtitle: 'Your name appears on the death lists',
      description: 'The Triumvirate declares you an enemy of Rome. This is the end.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic (43 BCE)',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 600,
      keywords: ['rome', 'proscription', 'death'],
      audioUrl: 'https://placeholder-audio.com/roman-proscription.mp3',
      publishedAt: new Date()
    }
  });

  const liberatorEpisode = await prisma.episode.create({
    data: {
      title: 'Liberator of Rome',
      subtitle: 'History remembers you as a hero',
      description: 'You helped save the Republic. Your name lives forever.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 660,
      keywords: ['rome', 'republic', 'victory'],
      audioUrl: 'https://placeholder-audio.com/roman-liberator.mp3',
      publishedAt: new Date()
    }
  });

  const exileEpisode = await prisma.episode.create({
    data: {
      title: 'Exile in Athens',
      subtitle: 'You escaped Rome but lost everything',
      description: 'You live in exile, watching Rome transform from afar.',
      topic: 'Roman Politics',
      era: 'Late Roman Republic',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 630,
      keywords: ['rome', 'exile', 'greece'],
      audioUrl: 'https://placeholder-audio.com/roman-exile.mp3',
      publishedAt: new Date()
    }
  });

  const imperialEpisode = await prisma.episode.create({
    data: {
      title: 'Senator of the Empire',
      subtitle: 'You serve the new imperial order',
      description: 'The Republic is dead, but you survived. You serve Caesar\'s Rome.',
      topic: 'Roman Politics',
      era: 'Roman Empire',
      type: EpisodeType.ADVENTURE,
      status: EpisodeStatus.PUBLISHED,
      duration: 720,
      keywords: ['rome', 'empire', 'survival'],
      audioUrl: 'https://placeholder-audio.com/roman-imperial.mp3',
      publishedAt: new Date()
    }
  });

  // Now create the adventure with all nodes
  const adventure = await prisma.adventure.create({
    data: {
      title: 'The Roman Senator\'s Dilemma',
      description: 'Rome, March 44 BCE. As a respected Senator, you must navigate the treacherous politics surrounding Julius Caesar\'s growing power. Your choices will shape the fate of the Republic.',
      era: 'Late Roman Republic (44 BCE)',
      isPublished: true,
      startNodeId: 'temp-id', // Will update after creating nodes
    }
  });

  // Create all nodes
  const startNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: startEpisode.id,
      title: 'The Ides of March Approach',
      description: 'You are a Roman Senator in March 44 BCE. Cassius approaches you with whispers of conspiracy against Julius Caesar.',
      nodeType: NodeType.START,
      decisionPrompt: 'Will you listen to what Cassius has to say?'
    }
  });

  const conspiracyNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: conspiracyEpisode.id,
      title: 'The Secret Meeting',
      description: 'Cassius reveals the plot to assassinate Caesar and restore the Republic. He asks for your support.',
      nodeType: NodeType.DECISION,
      decisionPrompt: 'How will you respond to the conspiracy?'
    }
  });

  const loyaltyNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: loyaltyEpisode.id,
      title: 'Standing with Caesar',
      description: 'You\'ve rejected the conspirators and must decide whether to warn Caesar.',
      nodeType: NodeType.DECISION,
      decisionPrompt: 'What will you do with this knowledge?'
    }
  });

  const assassinationNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: assassinationEpisode.id,
      title: 'The Ides of March',
      description: 'You participate in the assassination. Caesar falls, but Rome\'s future is uncertain.',
      nodeType: NodeType.STORY,
    }
  });

  const fleeNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: fleeEpisode.id,
      title: 'Flight from Rome',
      description: 'You\'ve warned Caesar and must flee before the conspirators discover your betrayal.',
      nodeType: NodeType.STORY,
    }
  });

  const civilWarNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: civilWarEpisode.id,
      title: 'Civil War Erupts',
      description: 'The Second Triumvirate forms to avenge Caesar. You must choose a side.',
      nodeType: NodeType.DECISION,
      decisionPrompt: 'Will you support the Triumvirate or the Liberators?'
    }
  });

  const dictatorshipNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: dictatorshipEpisode.id,
      title: 'The Empire Begins',
      description: 'With your help, Caesar has crushed the conspiracy and declared himself dictator for life.',
      nodeType: NodeType.STORY,
    }
  });

  const proscriptionNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: proscriptionEpisode.id,
      title: 'The Proscription Lists',
      description: 'The Triumvirate has declared you an enemy of Rome. Soldiers are coming.',
      nodeType: NodeType.ENDING,
      endingType: 'defeat'
    }
  });

  const liberatorNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: liberatorEpisode.id,
      title: 'Liberator of Rome',
      description: 'The conspiracy succeeded. You are hailed as a liberator who saved the Republic.',
      nodeType: NodeType.ENDING,
      endingType: 'victory'
    }
  });

  const exileNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: exileEpisode.id,
      title: 'Exile in Athens',
      description: 'You escaped Rome with your life but lost everything else.',
      nodeType: NodeType.ENDING,
      endingType: 'bittersweet'
    }
  });

  const imperialNode = await prisma.adventureNode.create({
    data: {
      adventureId: adventure.id,
      episodeId: imperialEpisode.id,
      title: 'Senator of the Empire',
      description: 'You serve the new imperial order. The Republic is dead, but you survived.',
      nodeType: NodeType.ENDING,
      endingType: 'neutral'
    }
  });

  // Create all choices to connect the nodes
  await prisma.choice.createMany({
    data: [
      // From START
      {
        nodeId: startNode.id,
        text: 'Listen to Cassius',
        description: 'Hear what the conspirators have to say',
        nextNodeId: conspiracyNode.id,
        consequences: 'You will learn the details of the plot against Caesar'
      },
      {
        nodeId: startNode.id,
        text: 'Remain loyal to Caesar',
        description: 'Reject any talk of conspiracy',
        nextNodeId: loyaltyNode.id,
        consequences: 'You will stand with Caesar against the conspirators'
      },

      // From CONSPIRACY
      {
        nodeId: conspiracyNode.id,
        text: 'Join the conspiracy',
        description: 'Take up the dagger for the Republic',
        nextNodeId: assassinationNode.id,
        consequences: 'You will participate in Caesar\'s assassination'
      },
      {
        nodeId: conspiracyNode.id,
        text: 'Warn Caesar',
        description: 'Reveal the plot and flee',
        nextNodeId: fleeNode.id,
        consequences: 'You will become a traitor to the conspirators'
      },

      // From LOYALTY
      {
        nodeId: loyaltyNode.id,
        text: 'Warn Caesar privately',
        description: 'Inform Caesar of the conspiracy in secret',
        nextNodeId: dictatorshipNode.id,
        consequences: 'Caesar will crush the conspiracy and reward your loyalty'
      },
      {
        nodeId: loyaltyNode.id,
        text: 'Say nothing',
        description: 'Let events unfold as they will',
        nextNodeId: fleeNode.id,
        consequences: 'You will try to stay neutral, but can you?'
      },

      // From ASSASSINATION (story node) → to decision
      {
        nodeId: assassinationNode.id,
        text: 'Continue',
        description: 'See what happens next',
        nextNodeId: civilWarNode.id,
        consequences: 'The aftermath of the assassination'
      },

      // From FLEE (story node) → to ending
      {
        nodeId: fleeNode.id,
        text: 'Continue',
        description: 'Complete your escape',
        nextNodeId: exileNode.id,
        consequences: 'Your journey ends in exile'
      },

      // From CIVIL WAR
      {
        nodeId: civilWarNode.id,
        text: 'Support the Liberators',
        description: 'Stand with Brutus and Cassius',
        nextNodeId: liberatorNode.id,
        consequences: 'Fight for the Republic at Philippi'
      },
      {
        nodeId: civilWarNode.id,
        text: 'Support the Triumvirate',
        description: 'Ally with Antony and Octavian',
        nextNodeId: proscriptionNode.id,
        consequences: 'Join those who seek vengeance for Caesar'
      },

      // From DICTATORSHIP (story node) → to ending
      {
        nodeId: dictatorshipNode.id,
        text: 'Continue',
        description: 'See Caesar\'s Rome',
        nextNodeId: imperialNode.id,
        consequences: 'Serve the new imperial order'
      }
    ]
  });

  // Update adventure with correct start node
  await prisma.adventure.update({
    where: { id: adventure.id },
    data: { startNodeId: startNode.id }
  });

  console.log(`✅ Created Roman Senator adventure: ${adventure.id}`);
  console.log(`   - 11 nodes created`);
  console.log(`   - 4 possible endings\n`);

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('🎉 Seed complete!\n');
  console.log('📊 Created:');
  console.log('   - 2 Interviews (Einstein, Cleopatra)');
  console.log('   - 2 Debates (Napoleon, Columbus)');
  console.log('   - 1 Adventure (Roman Senator with 11 episodes)');
  console.log('   - 15 total episodes\n');
  console.log('✨ You can now:');
  console.log('   - View interviews at /episodes');
  console.log('   - Vote on debates at /episodes');
  console.log('   - Start adventures at /adventures');
  console.log('   - Generate more content at /dashboard\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
