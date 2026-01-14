import pg from 'pg';

const antiBullyingDesignSpec = {
  metadata: {
    title: "Anti-Bullying",
    curriculum: "Embark Onboarding",
    prerequisite: null,
    duration: 15,
    audience: "Employees, managers",
    assessmentFormat: "Multiple Choice In-Course Assessment",
    client: "HR Compliance",
    designer: "Aric Davis"
  },
  performanceStatement: "Employees and managers will understand how to recognize and prevent bullying in the workplace.",
  topics: [
    {
      id: "topic-1",
      title: "Defining Bullying",
      objectives: [
        { id: "obj-1", text: "Define bullying", bloomLevel: "remember" },
        { id: "obj-2", text: "Recognize the differences between bullying, aggression, and passive aggression", bloomLevel: "understand" },
        { id: "obj-3", text: "Recall why bullying occurs", bloomLevel: "remember" },
        { id: "obj-4", text: "Recognize types of bullying", bloomLevel: "understand" },
        { id: "obj-5", text: "Recognize who is most likely to be bullied", bloomLevel: "understand" }
      ],
      sources: [
        "https://www.healthline.com/health/workplace-bullying",
        "https://www.themuse.com/advice/how-to-deal-with-workplace-bullies",
        "https://www.thebalancecareers.com/types-of-bullying-2164322"
      ]
    },
    {
      id: "topic-2",
      title: "Preventing Bullying",
      objectives: [
        { id: "obj-6", text: "Recall the negative effects of bullying", bloomLevel: "remember" },
        { id: "obj-7", text: "Recall basic bullying prevention techniques for employees", bloomLevel: "remember" },
        { id: "obj-8", text: "Recall basic bullying prevention techniques for managers/HR", bloomLevel: "remember" },
        { id: "obj-9", text: "Recognize strategies to prevent escalation", bloomLevel: "understand" }
      ],
      sources: [
        "https://www.crisisprevention.com/Blog/Strategies-to-Stop-Workplace-Bullying",
        "https://www.worksafe.vic.gov.au/preventing-workplace-bullying",
        "https://hrdailyadvisor.blr.com/2019/10/10/strategies-to-reduce-workplace-bullying/"
      ]
    }
  ],
  keyTerms: ["bullying", "harassment", "workplace toxicity", "bystander"],
  misconceptions: [
    "Bullying only happens in schools",
    "Victims should just toughen up",
    "Bullying is just a personality conflict",
    "HR can always resolve bullying issues"
  ]
};

const componentExamples = {
  ImgSingle2col: {
    useCase: "Course introduction with background image",
    example: {
      component: "ImgSingle2col",
      bgImage: "../xy/AssetLibrary/anti-bully_intro_a.jpg",
      content: "<h1><strong style=\"color: rgb(255, 196, 0);\">Anti-Bullying</strong></h1><p>Bullying in the workforce is toxic behavior...</p>",
      allowButton: true,
      buttonText: "Begin",
      minHeight: "r-1-10"
    }
  },
  CR3A: {
    useCase: "4 related concepts with click-reveal",
    example: {
      component: "CR3ABuilder",
      componentBlocks: [
        {
          clickTxt: { value: "<h3><strong>Bullying</strong></h3>" },
          revealTxt: { value: "<h3><strong>Bullying</strong></h3><p>Bullying is a repeated act meant to intimidate...</p>" },
          clickBgImg: { value: "../xy/AssetLibrary/click_2.jpg" },
          revealBgImg: { value: "../xy/AssetLibrary/click2a.jpg" }
        }
      ]
    }
  },
  SS2ACarousel: {
    useCase: "Sequential slides for 'Why Bullying Happens'",
    example: {
      component: "SS2ACarousel",
      componentBlocks: [
        {
          content: "<h3><strong>Skill Disparities</strong></h3><p>Sometimes, employees will exhibit a skillset...</p>",
          desktopImage: { value: "../xy/AssetLibrary/ss1c.jpg" }
        }
      ]
    }
  },
  ClickRevealGrid: {
    useCase: "12 types of bullying in grid format",
    example: {
      component: "ClickRevealGrid",
      componentBlocks: [
        {
          header: { value: "<h3><strong>Threatening</strong></h3>" },
          description: { value: "<p>Making threats or behaving in an intimidating manner.</p>" },
          img: "../xy/AssetLibrary/cr_down_7.png",
          columns: { value: "3" }
        }
      ]
    }
  },
  KcCheckboxAnswerableBuilder: {
    useCase: "Final quiz question",
    example: {
      component: "KcCheckboxAnswerableBuilder",
      idQuiz: "finalQuiz",
      idQuestion: "q1",
      QuestionText: "<p>Question 1 of 5</p><h3>Marlo was tired of dealing with HR issues...</h3>",
      answers: [
        { label: "Set a good example", correctAnswer: true },
        { label: "Take complaints seriously", correctAnswer: true },
        { label: "Engage with a third party", correctAnswer: true },
        { label: "Fire any employee who is bullying others", correctAnswer: false }
      ],
      selectOne: false,
      CorrectResponse: "<h1><span style=\"color: rgb(50, 239, 145);\">That's correct!</span></h1>",
      InCorrectResponse: "<h1><span style=\"color: rgb(255, 26, 79);\">Not quite.</span></h1>"
    }
  }
};

async function seedExamples() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if example already exists
    const existing = await client.query(
      'SELECT id FROM example_courses WHERE title = $1',
      ['Anti-Bullying']
    );

    if (existing.rows.length > 0) {
      console.log('Anti-Bullying example already exists, updating...');
      await client.query(
        `UPDATE example_courses SET
          design_spec = $1,
          sample_pages = $2,
          topics = $3,
          industries = $4,
          components_used = $5,
          quality_score = $6,
          updated_at = NOW()
        WHERE title = $7`,
        [
          JSON.stringify(antiBullyingDesignSpec),
          JSON.stringify(componentExamples),
          ['workplace safety', 'hr compliance', 'soft skills'],
          ['corporate', 'all industries'],
          ['ImgSingle2col', 'CR3A', 'SS2ACarousel', 'ClickRevealGrid', 'KcCheckboxAnswerableBuilder'],
          5.0,
          'Anti-Bullying'
        ]
      );
    } else {
      console.log('Inserting Anti-Bullying example...');
      await client.query(
        `INSERT INTO example_courses (
          title, format, topics, industries, components_used,
          design_spec, sample_pages, quality_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'Anti-Bullying',
          'elearning',
          ['workplace safety', 'hr compliance', 'soft skills'],
          ['corporate', 'all industries'],
          ['ImgSingle2col', 'CR3A', 'SS2ACarousel', 'ClickRevealGrid', 'KcCheckboxAnswerableBuilder'],
          JSON.stringify(antiBullyingDesignSpec),
          JSON.stringify(componentExamples),
          5.0
        ]
      );
    }

    console.log('Anti-Bullying example seeded successfully');

    // Verify
    const result = await client.query(
      'SELECT id, title, quality_score FROM example_courses WHERE title = $1',
      ['Anti-Bullying']
    );
    console.log('Verification:', result.rows[0]);

  } catch (error) {
    console.error('Failed to seed examples:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedExamples();
