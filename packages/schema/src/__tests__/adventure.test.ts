import {
  AdventureChoiceSchema,
  AdventureNodeSchema,
  AdventureOutlineSchema,
  AdventureScriptSchema,
  type AdventureChoice,
  type AdventureNode,
  type AdventureOutline,
  type AdventureScript,
} from '../adventure';

describe('AdventureChoiceSchema', () => {
  const validChoice: AdventureChoice = {
    text: 'Enter the ancient temple',
    description: 'You decide to explore the mysterious temple that has stood for centuries.',
    nextNodeId: 'node_2',
    consequences: 'You will discover ancient secrets, but also face unknown dangers.',
  };

  it('validates a complete choice', () => {
    const result = AdventureChoiceSchema.safeParse(validChoice);
    expect(result.success).toBe(true);
  });

  it('rejects text shorter than 10 characters', () => {
    const invalidChoice = {
      ...validChoice,
      text: 'Too short',
    };
    const result = AdventureChoiceSchema.safeParse(invalidChoice);
    expect(result.success).toBe(false);
  });

  it('rejects text longer than 100 characters', () => {
    const invalidChoice = {
      ...validChoice,
      text: 'A'.repeat(101),
    };
    const result = AdventureChoiceSchema.safeParse(invalidChoice);
    expect(result.success).toBe(false);
  });

  it('rejects description shorter than 20 characters', () => {
    const invalidChoice = {
      ...validChoice,
      description: 'Too short.',
    };
    const result = AdventureChoiceSchema.safeParse(invalidChoice);
    expect(result.success).toBe(false);
  });

  it('rejects description longer than 200 characters', () => {
    const invalidChoice = {
      ...validChoice,
      description: 'A'.repeat(201),
    };
    const result = AdventureChoiceSchema.safeParse(invalidChoice);
    expect(result.success).toBe(false);
  });

  it('rejects consequences shorter than 20 characters', () => {
    const invalidChoice = {
      ...validChoice,
      consequences: 'Too short.',
    };
    const result = AdventureChoiceSchema.safeParse(invalidChoice);
    expect(result.success).toBe(false);
  });

  it('rejects consequences longer than 150 characters', () => {
    const invalidChoice = {
      ...validChoice,
      consequences: 'A'.repeat(151),
    };
    const result = AdventureChoiceSchema.safeParse(invalidChoice);
    expect(result.success).toBe(false);
  });

  it('rejects missing nextNodeId', () => {
    const { nextNodeId, ...choiceWithoutNextNode } = validChoice;
    const result = AdventureChoiceSchema.safeParse(choiceWithoutNextNode);
    expect(result.success).toBe(false);
  });
});

describe('AdventureNodeSchema', () => {
  const createValidChoices = (count: number): AdventureChoice[] => {
    return Array(count).fill(null).map((_, i) => ({
      text: `Choice ${i + 1}: Take this path`,
      description: `You decide to follow path ${i + 1}, uncertain of what lies ahead.`,
      nextNodeId: `node_${i + 2}`,
      consequences: `This choice will lead you to a new area of the adventure.`,
    }));
  };

  const validDecisionNode: AdventureNode = {
    id: 'node_1',
    title: 'The Crossroads',
    nodeType: 'DECISION',
    narrative: 'You stand at an ancient crossroads. To the north, a dark forest looms with twisted branches and eerie shadows. To the east, mountains rise against the horizon, their peaks lost in the clouds. The choice you make here will determine your fate and the fate of those who depend on you. The wind whispers through the trees, carrying secrets from ages past, hints of adventures yet to come and dangers that lurk in every shadow. You must decide which path to follow, knowing that there is no turning back once you begin your journey into the unknown.',
    choices: createValidChoices(2),
  };

  const validEndingNode: AdventureNode = {
    id: 'node_end',
    title: 'Victory',
    nodeType: 'ENDING',
    narrative: 'You have achieved the impossible. Against all odds, you have triumphed over every obstacle that stood in your way. The kingdom is saved, the treasure is found, and your name will be remembered for generations to come. As the sun sets on this momentous day, you reflect on all the choices that led you here. Every decision, every risk, every sacrifice has brought you to this glorious moment of victory. The people celebrate around you, their cheers echoing through the streets. You have become a legend, a hero whose story will be told for ages.',
    endingType: 'victory',
  };

  it('validates a complete decision node', () => {
    const result = AdventureNodeSchema.safeParse(validDecisionNode);
    expect(result.success).toBe(true);
  });

  it('validates a complete ending node', () => {
    const result = AdventureNodeSchema.safeParse(validEndingNode);
    expect(result.success).toBe(true);
  });

  it('validates all node types', () => {
    const nodeTypes = ['START', 'DECISION', 'STORY', 'ENDING'] as const;
    nodeTypes.forEach((nodeType) => {
      const node = { ...validDecisionNode, nodeType, choices: nodeType === 'ENDING' ? undefined : createValidChoices(2) };
      const result = AdventureNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  it('validates all ending types', () => {
    const endingTypes = ['victory', 'defeat', 'neutral', 'bittersweet'] as const;
    endingTypes.forEach((endingType) => {
      const node = { ...validEndingNode, endingType };
      const result = AdventureNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid node type', () => {
    const invalidNode = {
      ...validDecisionNode,
      nodeType: 'INVALID',
    };
    const result = AdventureNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });

  it('rejects invalid ending type', () => {
    const invalidNode = {
      ...validEndingNode,
      endingType: 'invalid',
    };
    const result = AdventureNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });

  it('rejects narrative shorter than 400 characters', () => {
    const invalidNode = {
      ...validDecisionNode,
      narrative: 'A'.repeat(399),
    };
    const result = AdventureNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });

  it('rejects narrative longer than 800 characters', () => {
    const invalidNode = {
      ...validDecisionNode,
      narrative: 'A'.repeat(801),
    };
    const result = AdventureNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });

  it('accepts narrative at minimum length (400 characters)', () => {
    const node = {
      ...validDecisionNode,
      narrative: 'A'.repeat(400),
    };
    const result = AdventureNodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });

  it('accepts narrative at maximum length (800 characters)', () => {
    const node = {
      ...validDecisionNode,
      narrative: 'A'.repeat(800),
    };
    const result = AdventureNodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 2 choices for decision nodes', () => {
    const invalidNode = {
      ...validDecisionNode,
      choices: createValidChoices(1),
    };
    const result = AdventureNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 choices for decision nodes', () => {
    const invalidNode = {
      ...validDecisionNode,
      choices: createValidChoices(4),
    };
    const result = AdventureNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 2 choices (minimum)', () => {
    const node = {
      ...validDecisionNode,
      choices: createValidChoices(2),
    };
    const result = AdventureNodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });

  it('accepts exactly 3 choices (maximum)', () => {
    const node = {
      ...validDecisionNode,
      choices: createValidChoices(3),
    };
    const result = AdventureNodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });

  it('validates node without choices (for ENDING type)', () => {
    const node = {
      id: 'end_node',
      title: 'The End',
      nodeType: 'ENDING' as const,
      narrative: 'A'.repeat(400),
      endingType: 'victory' as const,
    };
    const result = AdventureNodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });
});

describe('AdventureOutlineSchema', () => {
  const createValidNode = (id: string, nodeType: 'START' | 'DECISION' | 'STORY' | 'ENDING'): AdventureNode => ({
    id,
    title: `Node ${id}`,
    nodeType,
    narrative: 'A'.repeat(400),
    ...(nodeType !== 'ENDING' && {
      choices: [
        {
          text: 'Choice 1 text here',
          description: 'Description for choice 1 that meets requirements.',
          nextNodeId: `${id}_next`,
          consequences: 'The consequences of making this choice.',
        },
        {
          text: 'Choice 2 text here',
          description: 'Description for choice 2 that meets requirements.',
          nextNodeId: `${id}_alt`,
          consequences: 'The consequences of making this choice.',
        },
      ],
    }),
    ...(nodeType === 'ENDING' && { endingType: 'victory' as const }),
  });

  const validOutline: AdventureOutline = {
    title: 'The Quest for the Golden Crown',
    description: 'Embark on an epic journey through medieval Europe as a young knight seeking the legendary Golden Crown. Your choices will determine whether you become a hero or fall into obscurity. Navigate political intrigue, battle fierce enemies, and uncover ancient secrets.',
    historicalSetting: {
      era: '12th Century',
      location: 'Medieval England',
      context: 'The realm is in turmoil. King Richard has departed for the Crusades, leaving his brother John to rule. Nobles plot against each other, bandits roam the countryside, and rumors of a legendary artifact have drawn adventurers from across Europe. You are one such adventurer, a young knight seeking glory and fortune.',
      keyFigures: ['King Richard I', 'Prince John', 'Robin of Loxley'],
    },
    storyline: {
      premise: 'You are a young knight who has heard tales of the Golden Crown, an artifact said to grant its wearer the wisdom of ancient kings.',
      protagonist: 'A young knight from a minor noble family, seeking to prove their worth',
      stakes: 'The fate of the kingdom hangs in the balance. The Crown could unite the realm or plunge it into chaos.',
    },
    nodes: Array(8).fill(null).map((_, i) => createValidNode(`node_${i}`, i === 0 ? 'START' : i === 7 ? 'ENDING' : 'DECISION')),
    flowMap: {
      'node_0': ['node_1', 'node_2'],
      'node_1': ['node_3', 'node_4'],
      'node_2': ['node_4', 'node_5'],
      'node_3': ['node_6'],
      'node_4': ['node_6', 'node_7'],
      'node_5': ['node_7'],
      'node_6': ['node_7'],
    },
  };

  it('validates a complete outline', () => {
    const result = AdventureOutlineSchema.safeParse(validOutline);
    expect(result.success).toBe(true);
  });

  it('rejects description shorter than 200 characters', () => {
    const invalidOutline = {
      ...validOutline,
      description: 'A'.repeat(199),
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects description longer than 500 characters', () => {
    const invalidOutline = {
      ...validOutline,
      description: 'A'.repeat(501),
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects context shorter than 300 characters', () => {
    const invalidOutline = {
      ...validOutline,
      historicalSetting: {
        ...validOutline.historicalSetting,
        context: 'A'.repeat(299),
      },
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects context longer than 600 characters', () => {
    const invalidOutline = {
      ...validOutline,
      historicalSetting: {
        ...validOutline.historicalSetting,
        context: 'A'.repeat(601),
      },
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 2 key figures', () => {
    const invalidOutline = {
      ...validOutline,
      historicalSetting: {
        ...validOutline.historicalSetting,
        keyFigures: ['Only one'],
      },
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 key figures', () => {
    const invalidOutline = {
      ...validOutline,
      historicalSetting: {
        ...validOutline.historicalSetting,
        keyFigures: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'],
      },
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 8 nodes', () => {
    const invalidOutline = {
      ...validOutline,
      nodes: Array(7).fill(null).map((_, i) => createValidNode(`node_${i}`, i === 0 ? 'START' : i === 6 ? 'ENDING' : 'DECISION')),
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects more than 12 nodes', () => {
    const invalidOutline = {
      ...validOutline,
      nodes: Array(13).fill(null).map((_, i) => createValidNode(`node_${i}`, i === 0 ? 'START' : i === 12 ? 'ENDING' : 'DECISION')),
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 8 nodes (minimum)', () => {
    const outline = {
      ...validOutline,
      nodes: Array(8).fill(null).map((_, i) => createValidNode(`node_${i}`, i === 0 ? 'START' : i === 7 ? 'ENDING' : 'DECISION')),
    };
    const result = AdventureOutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });

  it('accepts exactly 12 nodes (maximum)', () => {
    const outline = {
      ...validOutline,
      nodes: Array(12).fill(null).map((_, i) => createValidNode(`node_${i}`, i === 0 ? 'START' : i === 11 ? 'ENDING' : 'DECISION')),
    };
    const result = AdventureOutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });

  it('rejects premise shorter than 100 characters', () => {
    const invalidOutline = {
      ...validOutline,
      storyline: {
        ...validOutline.storyline,
        premise: 'A'.repeat(99),
      },
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects premise longer than 300 characters', () => {
    const invalidOutline = {
      ...validOutline,
      storyline: {
        ...validOutline.storyline,
        premise: 'A'.repeat(301),
      },
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects stakes shorter than 50 characters', () => {
    const invalidOutline = {
      ...validOutline,
      storyline: {
        ...validOutline.storyline,
        stakes: 'A'.repeat(49),
      },
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects stakes longer than 200 characters', () => {
    const invalidOutline = {
      ...validOutline,
      storyline: {
        ...validOutline.storyline,
        stakes: 'A'.repeat(201),
      },
    };
    const result = AdventureOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });
});

describe('AdventureScriptSchema', () => {
  const validScript: AdventureScript = {
    nodeId: 'node_1',
    intro: 'You find yourself standing at the entrance of an ancient temple. The air is thick with mystery and anticipation. What secrets lie within these weathered stone walls?',
    narrative: 'The temple before you is unlike anything you have ever seen. Massive stone pillars, covered in vines and moss, stretch toward the sky like the fingers of ancient gods reaching for the heavens. Ancient carvings adorn every surface, telling stories of civilizations long forgotten, of kings and queens, of wars and peace, of love and betrayal. As you step through the entrance, your footsteps echo through empty halls that have not heard human sounds for centuries. Torches on the walls flicker to life, as if awakened by your presence, casting dancing shadows across the worn stone floors. The deeper you venture into this sacred place, the more you sense that it holds secrets that have remained hidden for millennia, waiting for someone brave enough to uncover them. Strange symbols line the walls, glowing faintly with an otherworldly light. You must proceed with caution, for the temple has many guardians, both seen and unseen, who protect its treasures from those deemed unworthy.',
    decisionPrompt: 'Before you lie two passages. The left path descends into darkness. The right path leads to a faintly glowing chamber. Which do you choose?',
    choices: [
      { text: 'Take the left path', description: 'Descend into the unknown darkness below.' },
      { text: 'Take the right path', description: 'Investigate the mysterious glowing light.' },
    ],
    outro: 'Your choice made, you steel yourself and proceed forward, knowing that there is no turning back now.',
    totalWords: 250,
  };

  it('validates a complete script', () => {
    const result = AdventureScriptSchema.safeParse(validScript);
    expect(result.success).toBe(true);
  });

  it('validates script without decisionPrompt and choices', () => {
    const { decisionPrompt, choices, ...scriptWithoutDecision } = validScript;
    const result = AdventureScriptSchema.safeParse(scriptWithoutDecision);
    expect(result.success).toBe(true);
  });

  it('rejects intro shorter than 100 characters', () => {
    const invalidScript = {
      ...validScript,
      intro: 'A'.repeat(99),
    };
    const result = AdventureScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects intro longer than 200 characters', () => {
    const invalidScript = {
      ...validScript,
      intro: 'A'.repeat(201),
    };
    const result = AdventureScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects narrative shorter than 800 characters', () => {
    const invalidScript = {
      ...validScript,
      narrative: 'A'.repeat(799),
    };
    const result = AdventureScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects narrative longer than 1500 characters', () => {
    const invalidScript = {
      ...validScript,
      narrative: 'A'.repeat(1501),
    };
    const result = AdventureScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects decisionPrompt shorter than 50 characters', () => {
    const invalidScript = {
      ...validScript,
      decisionPrompt: 'A'.repeat(49),
    };
    const result = AdventureScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects decisionPrompt longer than 150 characters', () => {
    const invalidScript = {
      ...validScript,
      decisionPrompt: 'A'.repeat(151),
    };
    const result = AdventureScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects outro shorter than 50 characters', () => {
    const invalidScript = {
      ...validScript,
      outro: 'A'.repeat(49),
    };
    const result = AdventureScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects outro longer than 150 characters', () => {
    const invalidScript = {
      ...validScript,
      outro: 'A'.repeat(151),
    };
    const result = AdventureScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects missing nodeId', () => {
    const { nodeId, ...scriptWithoutNodeId } = validScript;
    const result = AdventureScriptSchema.safeParse(scriptWithoutNodeId);
    expect(result.success).toBe(false);
  });

  it('rejects missing totalWords', () => {
    const { totalWords, ...scriptWithoutWords } = validScript;
    const result = AdventureScriptSchema.safeParse(scriptWithoutWords);
    expect(result.success).toBe(false);
  });
});
