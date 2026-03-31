/**
 * LearnHub — Course & Lesson Data
 * Seed data for built-in courses. Each course has modules → lessons → optional quiz.
 */

const SeedData = (() => {
  const courses = [
    // ─────────────────────────────────────────────────────────────
    // COURSE 1: Mathematics
    // ─────────────────────────────────────────────────────────────
    {
      id: 'math-grade7',
      title: 'Mathematics – Grade 7',
      category: 'Mathematics',
      emoji: '🔢',
      banner: 'banner-math',
      description: 'Covers integers, fractions, geometry basics, and algebra fundamentals.',
      totalLessons: 9,
      modules: [
        {
          id: 'math-m1',
          title: 'Module 1: Integers & Operations',
          lessons: [
            {
              id: 'math-l1',
              title: 'What Are Integers?',
              duration: '8 min',
              content: `
                <h3>Understanding Integers</h3>
                <p>Integers are whole numbers — they include <strong>positive numbers</strong>, <strong>negative numbers</strong>, and <strong>zero</strong>. We write them as: …−3, −2, −1, 0, 1, 2, 3…</p>
                <div class="highlight-box">💡 <strong>Key Point:</strong> Integers do NOT include fractions or decimals. For example, 2.5 and ½ are not integers.</div>
                <h3>The Number Line</h3>
                <p>Imagine a straight line with 0 in the center. Numbers to the right of 0 are positive; numbers to the left are negative.</p>
                <ul>
                  <li>The farther right, the greater the value (5 > 3).</li>
                  <li>The farther left, the smaller the value (−5 &lt; −3).</li>
                </ul>
                <h3>Absolute Value</h3>
                <p>The <strong>absolute value</strong> of a number is its distance from 0, always positive. We write it with pipes: |−7| = 7 and |7| = 7.</p>
                <blockquote>Think of absolute value as "how far from home?" — direction doesn't matter, only distance.</blockquote>
              `
            },
            {
              id: 'math-l2',
              title: 'Adding & Subtracting Integers',
              duration: '10 min',
              content: `
                <h3>Rules for Addition</h3>
                <p>When adding integers, remember these rules:</p>
                <ul>
                  <li><strong>Same sign:</strong> Add the values, keep the sign. (+3) + (+5) = +8 | (−3) + (−5) = −8</li>
                  <li><strong>Different signs:</strong> Subtract the smaller absolute value from the larger, keep the sign of the larger. (+8) + (−3) = +5</li>
                </ul>
                <div class="highlight-box">🧠 <strong>Memory Trick:</strong> "Same sign → sum. Different sign → difference."</div>
                <h3>Rules for Subtraction</h3>
                <p>Subtracting a number is the same as adding its opposite!</p>
                <p>Formula: <strong>a − b = a + (−b)</strong></p>
                <ul>
                  <li>5 − 3 = 5 + (−3) = 2</li>
                  <li>5 − (−3) = 5 + 3 = 8</li>
                  <li>−5 − 3 = −5 + (−3) = −8</li>
                </ul>
                <h3>Practice</h3>
                <p>Try these mentally: (−12) + 7 = ? | 4 − (−6) = ? | (−9) − (−3) = ?</p>
                <blockquote>Answers: −5, 10, −6</blockquote>
              `,
              quizId: 'math-q1',
            },
            {
              id: 'math-l3',
              title: 'Multiplying & Dividing Integers',
              duration: '8 min',
              content: `
                <h3>Sign Rules</h3>
                <p>The sign of a product or quotient depends on the signs of the numbers involved:</p>
                <ul>
                  <li><strong>Positive × Positive = Positive</strong> &nbsp; (+4) × (+3) = +12</li>
                  <li><strong>Negative × Negative = Positive</strong> &nbsp; (−4) × (−3) = +12</li>
                  <li><strong>Positive × Negative = Negative</strong> &nbsp; (+4) × (−3) = −12</li>
                  <li><strong>Negative × Positive = Negative</strong> &nbsp; (−4) × (+3) = −12</li>
                </ul>
                <div class="highlight-box">⚡ <strong>Shortcut:</strong> Same signs → positive result. Different signs → negative result. The same rule applies to division!</div>
                <h3>Division</h3>
                <p>(−20) ÷ (−4) = +5 &nbsp;|&nbsp; (+20) ÷ (−4) = −5 &nbsp;|&nbsp; (−20) ÷ (+4) = −5</p>
              `
            },
          ]
        },
        {
          id: 'math-m2',
          title: 'Module 2: Fractions & Decimals',
          lessons: [
            {
              id: 'math-l4',
              title: 'Types of Fractions',
              duration: '7 min',
              content: `
                <h3>Proper, Improper & Mixed Numbers</h3>
                <p>A <strong>fraction</strong> represents a part of a whole. It has a <em>numerator</em> (top) and a <em>denominator</em> (bottom).</p>
                <ul>
                  <li><strong>Proper fraction:</strong> numerator &lt; denominator → ¾, 2/5</li>
                  <li><strong>Improper fraction:</strong> numerator ≥ denominator → 7/4, 9/3</li>
                  <li><strong>Mixed number:</strong> whole number + proper fraction → 1¾</li>
                </ul>
                <div class="highlight-box">🔄 To convert 7/4 to a mixed number: 7 ÷ 4 = 1 remainder 3 → 1¾</div>
                <h3>Equivalent Fractions</h3>
                <p>Fractions that represent the same value. Multiply or divide both parts by the same number: ½ = 2/4 = 4/8 = 50/100</p>
              `
            },
            {
              id: 'math-l5',
              title: 'Adding & Subtracting Fractions',
              duration: '9 min',
              content: `
                <h3>Same Denominator</h3>
                <p>When denominators are the same, just add or subtract the numerators: 3/8 + 2/8 = 5/8</p>
                <h3>Different Denominators — Find LCD</h3>
                <p>LCD = Least Common Denominator. Convert each fraction so they share the same denominator.</p>
                <ul>
                  <li>1/3 + 1/4 → LCD = 12 → 4/12 + 3/12 = 7/12</li>
                </ul>
                <div class="highlight-box">📌 Steps: 1) Find LCD. 2) Convert fractions. 3) Add/subtract numerators. 4) Simplify if possible.</div>
                <h3>Simplifying Fractions</h3>
                <p>Divide numerator and denominator by their <strong>Greatest Common Factor (GCF)</strong>. Example: 6/8 → GCF is 2 → 3/4</p>
              `,
              quizId: 'math-q2',
            },
            {
              id: 'math-l6',
              title: 'Decimals & Conversions',
              duration: '8 min',
              content: `
                <h3>Understanding Decimal Places</h3>
                <p>Decimals are another way to write fractions with denominators of 10, 100, 1000, etc.</p>
                <ul>
                  <li>0.1 = 1/10 (tenths)</li>
                  <li>0.01 = 1/100 (hundredths)</li>
                  <li>0.001 = 1/1000 (thousandths)</li>
                </ul>
                <h3>Converting Fraction to Decimal</h3>
                <p>Divide numerator by denominator: 3/4 → 3 ÷ 4 = 0.75</p>
                <h3>Converting Decimal to Fraction</h3>
                <p>Write the decimal over its place value, then simplify: 0.6 = 6/10 = 3/5</p>
                <div class="highlight-box">🎯 0.25 = 25/100 = 1/4. Quick conversions to memorize: 0.5=½, 0.25=¼, 0.75=¾, 0.333…=⅓</div>
              `
            },
          ]
        },
        {
          id: 'math-m3',
          title: 'Module 3: Introduction to Algebra',
          lessons: [
            {
              id: 'math-l7',
              title: 'What Are Variables?',
              duration: '6 min',
              content: `
                <h3>Variables and Expressions</h3>
                <p>A <strong>variable</strong> is a letter (like x, y, n) that represents an unknown value.</p>
                <p>An <strong>algebraic expression</strong> combines variables and numbers: 2x + 3, 5y − 1, x² + 4x</p>
                <div class="highlight-box">💡 Think of x as a mystery box. The equation tells you what's inside.</div>
                <h3>Evaluating Expressions</h3>
                <p>To evaluate, substitute the variable with a given value: If x = 4, then 2x + 3 = 2(4) + 3 = 8 + 3 = 11</p>
              `
            },
            {
              id: 'math-l8',
              title: 'Equations & Solving for X',
              duration: '10 min',
              content: `
                <h3>What is an Equation?</h3>
                <p>An equation states that two expressions are equal: 2x + 5 = 13. Our goal is to isolate x.</p>
                <h3>Solving One-Step Equations</h3>
                <ul>
                  <li>x + 7 = 15 → subtract 7 from both sides → x = 8</li>
                  <li>x − 4 = 10 → add 4 to both sides → x = 14</li>
                  <li>3x = 21 → divide both sides by 3 → x = 7</li>
                  <li>x/5 = 6 → multiply both sides by 5 → x = 30</li>
                </ul>
                <div class="highlight-box">⚖️ <strong>Golden Rule:</strong> Whatever you do to one side, do the same to the other. Treat the equation like a balanced scale.</div>
                <h3>Solving Two-Step</h3>
                <p>2x + 5 = 13 → subtract 5 → 2x = 8 → divide by 2 → x = 4</p>
              `,
              quizId: 'math-q3',
            },
            {
              id: 'math-l9',
              title: 'Word Problems with Algebra',
              duration: '9 min',
              content: `
                <h3>Translating Words to Math</h3>
                <p>Many word problems can be solved using equations. Key translations:</p>
                <ul>
                  <li>"is/are/equals" → =</li>
                  <li>"more than / increased by" → +</li>
                  <li>"less than / decreased by" → −</li>
                  <li>"times / of" → ×</li>
                  <li>"divided equally / per" → ÷</li>
                </ul>
                <h3>Example</h3>
                <p>"Ana has 3 more candies than Ben. Together they have 15. How many does Ben have?"</p>
                <p>Let b = Ben's candies. Ana = b + 3. Total: b + (b + 3) = 15 → 2b + 3 = 15 → 2b = 12 → b = 6</p>
                <div class="highlight-box">📖 Steps: 1) Define the variable. 2) Write the equation. 3) Solve. 4) Check your answer.</div>
              `
            },
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    // COURSE 2: Science
    // ─────────────────────────────────────────────────────────────
    {
      id: 'science-grade7',
      title: 'Science – Grade 7',
      category: 'Science',
      emoji: '🔬',
      banner: 'banner-science',
      description: 'Introduction to matter, living things, ecosystems, and basic physics.',
      totalLessons: 9,
      modules: [
        {
          id: 'sci-m1',
          title: 'Module 1: Matter & Its Properties',
          lessons: [
            {
              id: 'sci-l1',
              title: 'What Is Matter?',
              duration: '7 min',
              content: `
                <h3>Defining Matter</h3>
                <p><strong>Matter</strong> is anything that has mass and takes up space. Every physical object around you — air, water, rocks, even you — is made of matter.</p>
                <h3>States of Matter</h3>
                <ul>
                  <li><strong>Solid:</strong> Definite shape and volume. Particles are tightly packed. (Ice, rock, metal)</li>
                  <li><strong>Liquid:</strong> Definite volume, no definite shape. Takes the shape of its container. (Water, juice)</li>
                  <li><strong>Gas:</strong> No definite shape or volume. Particles spread out. (Air, steam)</li>
                  <li><strong>Plasma:</strong> High-energy ionized gas. (Stars, lightning)</li>
                </ul>
                <div class="highlight-box">🌡️ Heating a solid → liquid (melting). Heating liquid → gas (evaporation). Cooling reverses these changes.</div>
              `
            },
            {
              id: 'sci-l2',
              title: 'Physical & Chemical Properties',
              duration: '8 min',
              content: `
                <h3>Physical Properties</h3>
                <p>Properties you can observe without changing the substance's composition: color, density, melting point, hardness, conductivity.</p>
                <h3>Chemical Properties</h3>
                <p>Properties that describe how a substance reacts: flammability, reactivity with acid, ability to rust (oxidation).</p>
                <div class="highlight-box">🔬 <strong>Key Difference:</strong> Physical change preserves the substance (cutting paper). Chemical change creates a new substance (burning paper).</div>
                <h3>Examples</h3>
                <ul>
                  <li>Physical: Water freezing into ice — still H₂O</li>
                  <li>Chemical: Iron rusting — iron + oxygen → iron oxide (new substance)</li>
                </ul>
              `,
              quizId: 'sci-q1',
            },
            {
              id: 'sci-l3',
              title: 'Mixtures & Pure Substances',
              duration: '9 min',
              content: `
                <h3>Pure Substances</h3>
                <p>Made of one type of matter: <strong>elements</strong> (only one type of atom, e.g. gold, oxygen) and <strong>compounds</strong> (atoms bonded together, e.g. H₂O, CO₂).</p>
                <h3>Mixtures</h3>
                <p>Two or more substances combined but not chemically joined. Can be separated by physical means.</p>
                <ul>
                  <li><strong>Homogeneous</strong> (uniform): Saltwater, air, vinegar. Same composition throughout.</li>
                  <li><strong>Heterogeneous</strong> (non-uniform): Salad, sand & water. Different parts visible.</li>
                </ul>
                <div class="highlight-box">🧂 Separating mixtures: filtering, evaporation, distillation, magnetism, sieving.</div>
              `
            },
          ]
        },
        {
          id: 'sci-m2',
          title: 'Module 2: Living Things & Cells',
          lessons: [
            {
              id: 'sci-l4',
              title: 'Characteristics of Living Things',
              duration: '7 min',
              content: `
                <h3>What Makes Something Alive?</h3>
                <p>All living organisms share 7 key characteristics (MRS GREN):</p>
                <ul>
                  <li><strong>M</strong>ovement — can move (even plants move slowly)</li>
                  <li><strong>R</strong>espiration — release energy from food</li>
                  <li><strong>S</strong>ensitivity — respond to environment</li>
                  <li><strong>G</strong>rowth — increase in size or complexity</li>
                  <li><strong>R</strong>eproduction — produce offspring</li>
                  <li><strong>E</strong>xcretion — remove waste products</li>
                  <li><strong>N</strong>utrition — take in food/energy</li>
                </ul>
                <div class="highlight-box">🌱 Viruses are NOT considered fully alive because they cannot reproduce on their own — they need a host cell.</div>
              `
            },
            {
              id: 'sci-l5',
              title: 'Cell Structure & Function',
              duration: '10 min',
              content: `
                <h3>The Cell — Basic Unit of Life</h3>
                <p>All living things are made of <strong>cells</strong>. Robert Hooke first observed cells in 1665 using a microscope.</p>
                <h3>Parts of a Typical Cell</h3>
                <ul>
                  <li><strong>Cell Membrane</strong> — controls what enters/exits</li>
                  <li><strong>Nucleus</strong> — "control center," contains DNA</li>
                  <li><strong>Cytoplasm</strong> — jelly-like fluid filling the cell</li>
                  <li><strong>Mitochondria</strong> — produces energy (ATP); "powerhouse of the cell"</li>
                  <li><strong>Ribosomes</strong> — make proteins</li>
                  <li><strong>Cell Wall</strong> — (plant cells only) provides extra support</li>
                  <li><strong>Chloroplasts</strong> — (plant cells only) for photosynthesis</li>
                </ul>
                <div class="highlight-box">🔬 Animal cells have no cell wall or chloroplasts. Plant cells have both, plus a large central vacuole.</div>
              `,
              quizId: 'sci-q2',
            },
            {
              id: 'sci-l6',
              title: 'Human Body Systems Overview',
              duration: '9 min',
              content: `
                <h3>Organ Systems Work Together</h3>
                <p>The human body has 11 organ systems, each with a specific role:</p>
                <ul>
                  <li><strong>Circulatory</strong> — pumps blood (heart, veins, arteries)</li>
                  <li><strong>Respiratory</strong> — breathing & gas exchange (lungs)</li>
                  <li><strong>Digestive</strong> — breaks down food for nutrients</li>
                  <li><strong>Nervous</strong> — brain, spinal cord, nerves; processes info</li>
                  <li><strong>Skeletal</strong> — bones, provides structure and protection</li>
                  <li><strong>Muscular</strong> — allows movement</li>
                  <li><strong>Immune</strong> — defends against disease</li>
                </ul>
                <div class="highlight-box">💓 The heart beats about 100,000 times per day, pumping 5 liters of blood per minute.</div>
              `
            },
          ]
        },
        {
          id: 'sci-m3',
          title: 'Module 3: Force, Motion & Energy',
          lessons: [
            {
              id: 'sci-l7',
              title: "Newton's Laws of Motion",
              duration: '9 min',
              content: `
                <h3>Newton's Three Laws</h3>
                <p><strong>1st Law (Inertia):</strong> An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.</p>
                <blockquote>Example: A book on a table won't move unless you push it. A rolling ball eventually stops due to friction.</blockquote>
                <p><strong>2nd Law (F = ma):</strong> Force equals mass times acceleration. More force = more acceleration; more mass = less acceleration for the same force.</p>
                <blockquote>Example: It's harder to push a heavy cart than a light one.</blockquote>
                <p><strong>3rd Law (Action-Reaction):</strong> For every action, there is an equal and opposite reaction.</p>
                <blockquote>Example: Jumping off a boat pushes the boat backward. A rocket's exhaust pushes it forward.</blockquote>
                <div class="highlight-box">🚀 Rockets work because of Newton's 3rd Law — burning gas shoots down, rocket goes up!</div>
              `
            },
            {
              id: 'sci-l8',
              title: 'Types of Energy',
              duration: '8 min',
              content: `
                <h3>What Is Energy?</h3>
                <p>Energy is the <strong>ability to do work</strong>. It cannot be created or destroyed, only converted from one form to another (Law of Conservation of Energy).</p>
                <h3>Forms of Energy</h3>
                <ul>
                  <li><strong>Kinetic</strong> — energy of motion (a moving car)</li>
                  <li><strong>Potential</strong> — stored energy (a ball held up high)</li>
                  <li><strong>Thermal</strong> — heat energy (fire)</li>
                  <li><strong>Chemical</strong> — stored in bonds (food, fuel)</li>
                  <li><strong>Electrical</strong> — from moving electrons</li>
                  <li><strong>Light (Radiant)</strong> — from electromagnetic waves</li>
                  <li><strong>Sound</strong> — vibrations traveling through matter</li>
                </ul>
                <div class="highlight-box">⚡ A falling rock converts potential energy → kinetic energy. A light bulb converts electrical → light + thermal energy.</div>
              `,
              quizId: 'sci-q3',
            },
            {
              id: 'sci-l9',
              title: 'Electricity Basics',
              duration: '8 min',
              content: `
                <h3>Electric Current</h3>
                <p><strong>Electricity</strong> is the flow of electrons through a conductor. We measure it in <strong>amperes (A)</strong>.</p>
                <h3>Voltage & Resistance</h3>
                <ul>
                  <li><strong>Voltage (V)</strong> — the "push" that drives current through a circuit</li>
                  <li><strong>Resistance (Ω)</strong> — opposition to current flow</li>
                </ul>
                <h3>Ohm's Law</h3>
                <p>V = I × R (Voltage = Current × Resistance)</p>
                <div class="highlight-box">🔌 A circuit must be complete (no breaks) for electricity to flow. Parallel circuits give each device its own path; series circuits share one path.</div>
              `
            },
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    // COURSE 3: Filipino
    // ─────────────────────────────────────────────────────────────
    {
      id: 'filipino-grade7',
      title: 'Filipino – Baitang 7',
      category: 'Filipino',
      emoji: '🇵🇭',
      banner: 'banner-filipino',
      description: 'Wastong pagbabasa, pagsulat, at pag-aralan ang wikang Filipino.',
      totalLessons: 9,
      modules: [
        {
          id: 'fil-m1',
          title: 'Modyul 1: Wika at Gramatika',
          lessons: [
            {
              id: 'fil-l1',
              title: 'Mga Bahagi ng Pangungusap',
              duration: '8 min',
              content: `
                <h3>Pangungusap</h3>
                <p>Ang <strong>pangungusap</strong> ay isang lipon ng mga salitang nagbibigay ng kumpletong diwa. Ito ay nagsisimula sa malaking titik at nagtatapos sa bantas.</p>
                <h3>Dalawang Pangunahing Bahagi</h3>
                <ul>
                  <li><strong>Paksa (Simuno)</strong> — ito ang pinag-uusapan sa pangungusap. Halimbawa: <em>Ang bata</em> ay naglaro.</li>
                  <li><strong>Panaguri (Predikat)</strong> — ito ang sinasabi tungkol sa paksa. Halimbawa: Ang bata ay <em>naglaro sa labas.</em></li>
                </ul>
                <div class="highlight-box">📖 Halimbawa: "Si Maria ay kumanta ng maganda." — Paksa: Si Maria | Panaguri: ay kumanta ng maganda</div>
                <h3>Uri ng Pangungusap ayon sa Pagbigkas</h3>
                <ul>
                  <li><strong>Pagsasalaysay</strong> — nagbibigay ng impormasyon. (Tumataas ang temperatura.)</li>
                  <li><strong>Patanong</strong> — nagtatanong. (Nasaan ka na?)</li>
                  <li><strong>Pautos</strong> — nag-uutos o humihiling. (Magsipag ka.)</li>
                  <li><strong>Padamdam</strong> — nagpapahayag ng damdamin. (Ang ganda-ganda niya!)</li>
                </ul>
              `
            },
            {
              id: 'fil-l2',
              title: 'Pangngalan at Panghalip',
              duration: '9 min',
              content: `
                <h3>Pangngalan</h3>
                <p>Ang <strong>pangngalan</strong> ay salitang nagbibigay-ngalan sa tao, lugar, bagay, hayop, o ideya.</p>
                <ul>
                  <li><strong>Pantangi</strong> — tiyak na pangalan. (Rizal, Maynila, Nile)</li>
                  <li><strong>Pambalana</strong> — pangkalahatang pangalan. (bata, lungsod, ilog)</li>
                  <li><strong>Konkreto</strong> — maarong mahawakan. (mesa, bahay)</li>
                  <li><strong>Abstrakto</strong> — hindi maarong mahawakan. (kalayaan, pagmamahal)</li>
                </ul>
                <h3>Panghalip</h3>
                <p>Pumapalit sa pangngalan upang hindi magtanghal. Halimbawa: "Si Ana ay kumain. <em>Siya</em> ay busog na."</p>
                <div class="highlight-box">👤 Panghalip sa unang panauhan: ako, ko, akin. Pangalawa: ikaw, mo, iyo. Pangatlo: siya, niya, kanya.</div>
              `,
              quizId: 'fil-q1',
            },
            {
              id: 'fil-l3',
              title: 'Pandiwa at Pang-uri',
              duration: '8 min',
              content: `
                <h3>Pandiwa</h3>
                <p>Ang <strong>pandiwa</strong> ay nagpapahayag ng kilos o estado ng paksa. Mahalaga ang <em>panlapi</em> sa pagbuo ng tamang pandiwa.</p>
                <ul>
                  <li>Nakaraan: <em>um</em>awit → umawit, k<em>in</em>ain → kinain</li>
                  <li>Kasalukuyan: <em>umaawit,</em> kumakain</li>
                  <li>Hinaharap: <em>aawit,</em> kakain</li>
                </ul>
                <h3>Pang-uri</h3>
                <p>Naglalarawan ng katangian ng pangngalan o panghalip.</p>
                <ul>
                  <li>Payak: matangkad, mabait, maganda</li>
                  <li>Pamilang: dalawa, marami, iilan</li>
                </ul>
                <div class="highlight-box">🖊️ Ginagamit ang <strong>napaka-/ubod ng</strong> para sa pinakamataas na antas: napakabait, ubod ng ganda.</div>
              `
            },
          ]
        },
        {
          id: 'fil-m2',
          title: 'Modyul 2: Pagbabasa at Pag-unawa',
          lessons: [
            {
              id: 'fil-l4',
              title: 'Mga Estratehiya sa Pagbabasa',
              duration: '7 min',
              content: `
                <h3>Bakit Mahalaga ang Pagbabasa?</h3>
                <p>Ang pagbabasa ay isa sa pinakamahalagang kasanayan. Sa pamamagitan nito, nakakakuha tayo ng kaalaman, kasiyahan, at pagpapaunlad ng sarili.</p>
                <h3>Mga Uri ng Pagbabasa</h3>
                <ul>
                  <li><strong>Scanning</strong> — mabilis na paghahanap ng tiyak na impormasyon</li>
                  <li><strong>Skimming</strong> — mabilis na pagbabasa para sa pangkalahatang ideya</li>
                  <li><strong>Extensive reading</strong> — maluwag at masayang pagbabasa (nobela, kuwento)</li>
                  <li><strong>Intensive reading</strong> — maingat na pagbabasa para sa malalim na pag-unawa</li>
                </ul>
                <div class="highlight-box">📚 Tip: Bago basahin ang isang teksto, tingnan muna ang pamagat, mga sub-pamagat, at mga larawan upang mahulaan ang nilalaman.</div>
              `
            },
            {
              id: 'fil-l5',
              title: 'Pangunahing Ideya at Detalye',
              duration: '9 min',
              content: `
                <h3>Pangunahing Ideya (Main Idea)</h3>
                <p>Ito ang pinakamahalagang punto ng isang talata o teksto. Madalas itong matatagpuan sa simula (topic sentence) o dulo ng talata.</p>
                <h3>Sumusuportang Detalye</h3>
                <p>Ang mga detalye ay nagbibigay ng karagdagang impormasyon para palawakin at patunayan ang pangunahing ideya.</p>
                <div class="highlight-box">🔍 Paraan ng paghahanap ng pangunahing ideya: Itanong, "Ano ang paksa? Ano ang sinasabi ng may-akda tungkol dito?"</div>
                <h3>Talataan</h3>
                <p>Ang bawat talata ay may iisang pangunahing ideya. Ang mga pangungusap na sumusuporta rito ay tinatawag na <strong>detalye</strong>.</p>
              `,
              quizId: 'fil-q2',
            },
            {
              id: 'fil-l6',
              title: 'Pagsusuri ng Tekstong Pampanitikan',
              duration: '10 min',
              content: `
                <h3>Mga Anyo ng Panitikang Filipino</h3>
                <ul>
                  <li><strong>Tulâ</strong> — may sukat at tugma; nagpapahayag ng damdamin</li>
                  <li><strong>Maikling Kuwento</strong> — may simula, gitna, at katapusan</li>
                  <li><strong>Dula</strong> — para itanghal; may dayalogo at mga tauhan</li>
                  <li><strong>Sanaysay</strong> — pormal o impormal na pagpapahayag ng opinyon</li>
                </ul>
                <h3>Mga Elemento ng Kuwento</h3>
                <ul>
                  <li><strong>Tauhan</strong> — mga tao o bagay na may papel</li>
                  <li><strong>Tagpuan</strong> — lugar at panahon ng pangyayari</li>
                  <li><strong>Banghay</strong> — pagkakasunod ng mga pangyayari</li>
                  <li><strong>Tunggalian</strong> — ang problema o hadlang</li>
                  <li><strong>Tema</strong> — aral o mensahe ng kuwento</li>
                </ul>
                <div class="highlight-box">📖 "Ibong Adarna" — isa sa pinakasikat na epikong Filipino. Kwento ito ng tatlong prinsipe at isang mahiwagang ibong may kapangyarihang magpagaling.</div>
              `
            },
          ]
        },
        {
          id: 'fil-m3',
          title: 'Modyul 3: Pagsulat at Komunikasyon',
          lessons: [
            {
              id: 'fil-l7',
              title: 'Wastong Pagsulat ng Talata',
              duration: '8 min',
              content: `
                <h3>Bahagi ng Magandang Talata</h3>
                <ul>
                  <li><strong>Topic Sentence</strong> — pangungusap na nagpapahayag ng pangunahing ideya</li>
                  <li><strong>Supporting Sentences</strong> — mga pangungusap na nagbibigay ng detalye at patunay</li>
                  <li><strong>Concluding Sentence</strong> — pangungusap na nagbubuod at nagtatapos sa talata</li>
                </ul>
                <h3>Mga Katangian ng Mabuting Talata</h3>
                <ul>
                  <li><strong>Kaisahan</strong> — lahat ng pangungusap ay tungkol sa iisang paksa</li>
                  <li><strong>Pagkakaugnay</strong> — maayos na daloy ng mga kaisipan</li>
                  <li><strong>Pagkakatumpak</strong> — malinaw at tumpak ang bawat pangungusap</li>
                </ul>
                <div class="highlight-box">✏️ Gamitin ang mga pangatnig (at, ngunit, dahil, kung, upang) para pagtambalin ang mga ideya at gawing maayos ang tunog ng talata.</div>
              `
            },
            {
              id: 'fil-l8',
              title: 'Pagsuulat ng Liham',
              duration: '8 min',
              content: `
                <h3>Uri ng Liham</h3>
                <ul>
                  <li><strong>Pormal</strong> — para sa opisyal na layunin (liham ng aplikasyon, reklamo)</li>
                  <li><strong>Impormal</strong> — para sa pamilya at magkakaibigan</li>
                </ul>
                <h3>Mga Bahagi ng Liham</h3>
                <ul>
                  <li><strong>Heading</strong> — address at petsa</li>
                  <li><strong>Salutation</strong> — pagbati (Mahal kong..., G./Gng...)</li>
                  <li><strong>Katawan</strong> — nilalaman ng liham</li>
                  <li><strong>Pagsasara</strong> — (Taos-pusong iyo, Lubos na gumagalang,)</li>
                  <li><strong>Lagda</strong> — pirma ng manunulat</li>
                </ul>
                <div class="highlight-box">📮 Sa pormal na liham, gumamit ng magalang na wika at malinaw na pagpapahayag. Iwasang gumamit ng kolokyal na salita.</div>
              `,
              quizId: 'fil-q3',
            },
            {
              id: 'fil-l9',
              title: 'Verbal at Non-Verbal na Komunikasyon',
              duration: '7 min',
              content: `
                <h3>Verbal na Komunikasyon</h3>
                <p>Gumagamit ng mga salita — pasalita (oral) o pasulat (written).</p>
                <h3>Non-Verbal na Komunikasyon</h3>
                <p>Komunikasyong hindi gumagamit ng salita:</p>
                <ul>
                  <li><strong>Kilos ng katawan</strong> (body language)</li>
                  <li><strong>Ekspresyon ng mukha</strong></li>
                  <li><strong>Eye contact</strong></li>
                  <li><strong>Tono ng boses</strong></li>
                  <li><strong>Kasuotan at itsura</strong></li>
                </ul>
                <div class="highlight-box">💬 Ayon sa pananaliksik, 55% ng komunikasyon ay body language, 38% ay tono ng boses, at 7% lamang ang mga salita.</div>
                <h3>Epektibong Pakikinig</h3>
                <p>Ang pakikinig ay aktibong proseso. Kabilang dito ang pagbibigay-atensyon, pagtatanong, at pagtugon sa nagsasalita.</p>
              `
            },
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    // COURSE 4: English Language Arts
    // ─────────────────────────────────────────────────────────────
    {
      id: 'english-grade7',
      title: 'English – Grade 7',
      category: 'English',
      emoji: '✍️',
      banner: 'banner-english',
      description: 'Reading comprehension, grammar, writing skills, and vocabulary building.',
      totalLessons: 9,
      modules: [
        {
          id: 'eng-m1',
          title: 'Module 1: Reading Comprehension',
          lessons: [
            {
              id: 'eng-l1',
              title: 'Finding the Main Idea',
              duration: '8 min',
              content: `
                <h3>What Is the Main Idea?</h3>
                <p>The <strong>main idea</strong> is the most important point of a paragraph or passage. It tells you what the whole text is about in one central thought.</p>
                <h3>How to Find the Main Idea</h3>
                <ul>
                  <li><strong>Step 1:</strong> Read the paragraph carefully.</li>
                  <li><strong>Step 2:</strong> Ask — "What is this mostly about?"</li>
                  <li><strong>Step 3:</strong> Look for the <em>topic sentence</em> — usually the first or last sentence.</li>
                  <li><strong>Step 4:</strong> Check that all other sentences support it.</li>
                </ul>
                <div class="highlight-box">💡 <strong>Tip:</strong> The main idea is a complete thought (a sentence), not just a topic word. "Dogs" = topic. "Dogs make loyal pets" = main idea.</div>
                <h3>Supporting Details</h3>
                <p>Supporting details are facts, examples, or reasons that explain or prove the main idea. They answer: Who? What? Where? When? Why? How?</p>
                <blockquote>Example: Main idea — "Exercise has many health benefits." Details — improves heart health, boosts mood, strengthens muscles.</blockquote>
              `
            },
            {
              id: 'eng-l2',
              title: 'Inference & Context Clues',
              duration: '9 min',
              content: `
                <h3>Making Inferences</h3>
                <p>An <strong>inference</strong> is a conclusion you draw based on evidence and reasoning — reading between the lines. Authors don't always state everything directly.</p>
                <blockquote>"She grabbed an umbrella before leaving." → You can <em>infer</em> it was raining or looked like rain.</blockquote>
                <div class="highlight-box">🔍 Formula: What I read + What I know = Inference</div>
                <h3>Context Clues</h3>
                <p>When you encounter an unfamiliar word, use <strong>context clues</strong> — information in the surrounding sentences — to figure out its meaning.</p>
                <ul>
                  <li><strong>Definition clue:</strong> The word is explained nearby. "The student was lethargic, meaning she had no energy."</li>
                  <li><strong>Example clue:</strong> Examples hint at meaning. "She loved citrus fruits such as oranges and lemons."</li>
                  <li><strong>Contrast clue:</strong> An opposite is given. "Unlike his talkative brother, Mario was reticent."</li>
                  <li><strong>Synonym clue:</strong> A similar word is nearby. "She was joyful — happy and content."</li>
                </ul>
              `,
              quizId: 'eng-q1',
            },
            {
              id: 'eng-l3',
              title: 'Fact vs. Opinion',
              duration: '7 min',
              content: `
                <h3>What Is a Fact?</h3>
                <p>A <strong>fact</strong> can be proven true or false. It is based on evidence, research, or observation.</p>
                <p>Example: "The Philippines is an archipelago with 7,641 islands."</p>
                <h3>What Is an Opinion?</h3>
                <p>An <strong>opinion</strong> expresses a personal belief, feeling, or judgment. It cannot be proven true or false.</p>
                <p>Example: "The Philippines is the most beautiful country in the world."</p>
                <div class="highlight-box">🗝️ <strong>Signal words for opinions:</strong> I think, I believe, in my opinion, should, best, worst, most, probably, seems.</div>
                <h3>Why Does It Matter?</h3>
                <p>Distinguishing facts from opinions helps you:</p>
                <ul>
                  <li>Evaluate the reliability of sources</li>
                  <li>Spot bias in news and media</li>
                  <li>Think critically about information</li>
                </ul>
              `
            },
          ]
        },
        {
          id: 'eng-m2',
          title: 'Module 2: Grammar Essentials',
          lessons: [
            {
              id: 'eng-l4',
              title: 'Parts of Speech Review',
              duration: '9 min',
              content: `
                <h3>The 8 Parts of Speech</h3>
                <ul>
                  <li><strong>Noun</strong> — names a person, place, thing, or idea. (teacher, Manila, book, freedom)</li>
                  <li><strong>Pronoun</strong> — replaces a noun. (he, she, they, it, we)</li>
                  <li><strong>Verb</strong> — shows action or state. (run, is, think, have)</li>
                  <li><strong>Adjective</strong> — describes a noun. (tall, red, three, beautiful)</li>
                  <li><strong>Adverb</strong> — modifies verb/adjective/adverb. (quickly, very, well)</li>
                  <li><strong>Preposition</strong> — shows relationship. (in, on, at, between, under)</li>
                  <li><strong>Conjunction</strong> — connects words/clauses. (and, but, or, because, although)</li>
                  <li><strong>Interjection</strong> — expresses emotion. (Wow! Oh! Ouch!)</li>
                </ul>
                <div class="highlight-box">🧠 Memory trick: <strong>NAVAPPCI</strong> — Noun, Article/Adjective, Verb, Adverb, Pronoun, Preposition, Conjunction, Interjection</div>
              `
            },
            {
              id: 'eng-l5',
              title: 'Subject-Verb Agreement',
              duration: '8 min',
              content: `
                <h3>The Rule</h3>
                <p>A verb must <strong>agree</strong> with its subject in number (singular or plural).</p>
                <ul>
                  <li><strong>Singular subject → singular verb:</strong> "She <em>runs</em> every morning."</li>
                  <li><strong>Plural subject → plural verb:</strong> "They <em>run</em> every morning."</li>
                </ul>
                <h3>Tricky Cases</h3>
                <ul>
                  <li><strong>Compound subjects with "and" → plural:</strong> "Ana and Ben <em>are</em> here."</li>
                  <li><strong>Compound with "or/nor" → verb agrees with nearest subject:</strong> "Neither the teacher nor the students <em>were</em> late."</li>
                  <li><strong>Collective nouns often singular:</strong> "The team <em>is</em> ready."</li>
                  <li><strong>Indefinite pronouns (each, everyone, nobody) → singular:</strong> "Everyone <em>has</em> a ticket."</li>
                </ul>
                <div class="highlight-box">⚠️ Don't be fooled by words between subject and verb: "The box of apples <em>is</em> heavy." (subject = box)</div>
              `,
              quizId: 'eng-q2',
            },
            {
              id: 'eng-l6',
              title: 'Tenses: Past, Present, Future',
              duration: '9 min',
              content: `
                <h3>Simple Tenses</h3>
                <ul>
                  <li><strong>Simple Past:</strong> action completed in the past. (He <em>played</em> basketball yesterday.)</li>
                  <li><strong>Simple Present:</strong> general truths, habits. (She <em>studies</em> every night.)</li>
                  <li><strong>Simple Future:</strong> action to happen. (They <em>will travel</em> tomorrow.)</li>
                </ul>
                <h3>Progressive Tenses</h3>
                <ul>
                  <li><strong>Past Progressive:</strong> was/were + -ing. (I <em>was reading</em> when the light went out.)</li>
                  <li><strong>Present Progressive:</strong> am/is/are + -ing. (She <em>is studying</em> right now.)</li>
                  <li><strong>Future Progressive:</strong> will be + -ing. (He <em>will be waiting</em> at the station.)</li>
                </ul>
                <div class="highlight-box">🕒 Signal words: <strong>yesterday, ago</strong> (past) | <strong>now, currently, always</strong> (present) | <strong>tomorrow, soon, will</strong> (future)</div>
              `
            },
          ]
        },
        {
          id: 'eng-m3',
          title: 'Module 3: Writing Skills',
          lessons: [
            {
              id: 'eng-l7',
              title: 'The Writing Process',
              duration: '8 min',
              content: `
                <h3>5 Stages of Writing</h3>
                <ul>
                  <li><strong>1. Prewriting</strong> — brainstorm ideas, make an outline, identify your audience and purpose</li>
                  <li><strong>2. Drafting</strong> — write your first draft freely; don't worry about perfection</li>
                  <li><strong>3. Revising</strong> — improve content, clarity, organization, and flow</li>
                  <li><strong>4. Editing</strong> — check for grammar, spelling, punctuation, and capitalization errors</li>
                  <li><strong>5. Publishing</strong> — share your final piece with your audience</li>
                </ul>
                <div class="highlight-box">✍️ Great writers revise multiple times. The first draft is just the beginning — professional writers call it the "rough draft."</div>
                <h3>Brainstorming Techniques</h3>
                <ul>
                  <li><strong>Mind mapping</strong> — draw ideas branching from a central topic</li>
                  <li><strong>Freewriting</strong> — write continuously for 5 minutes without stopping</li>
                  <li><strong>Listing</strong> — jot down related ideas rapidly</li>
                </ul>
              `
            },
            {
              id: 'eng-l8',
              title: 'Types of Writing',
              duration: '9 min',
              content: `
                <h3>Four Main Types</h3>
                <ul>
                  <li><strong>Narrative</strong> — tells a story with characters, plot, and setting. Goal: entertain or share experience. (Short stories, personal essays)</li>
                  <li><strong>Descriptive</strong> — uses sensory details to paint a vivid picture. Goal: help readers visualize. (Travel writing, poetry)</li>
                  <li><strong>Expository</strong> — explains or informs about a topic objectively. Goal: educate. (News articles, textbooks, how-to guides)</li>
                  <li><strong>Persuasive / Argumentative</strong> — argues a position using evidence and reasoning. Goal: convince. (Editorials, debate speeches)</li>
                </ul>
                <div class="highlight-box">🎯 Always ask: <strong>What is my purpose?</strong> To entertain → narrative. To explain → expository. To convince → persuasive.</div>
              `,
              quizId: 'eng-q3',
            },
            {
              id: 'eng-l9',
              title: 'Paragraph Writing Practice',
              duration: '8 min',
              content: `
                <h3>Structure of a Paragraph</h3>
                <ul>
                  <li><strong>Topic Sentence</strong> — states the main idea (first or last)</li>
                  <li><strong>Supporting Sentences</strong> — give details, examples, facts</li>
                  <li><strong>Concluding Sentence</strong> — wraps up and restates the idea</li>
                </ul>
                <h3>Transition Words</h3>
                <p>Use transitions to connect ideas smoothly:</p>
                <ul>
                  <li><strong>Adding:</strong> furthermore, in addition, also, moreover</li>
                  <li><strong>Contrasting:</strong> however, on the other hand, nevertheless</li>
                  <li><strong>Showing result:</strong> therefore, as a result, consequently</li>
                  <li><strong>Time order:</strong> first, then, next, finally, afterward</li>
                </ul>
                <div class="highlight-box">📝 Sample paragraph: "Regular exercise improves health. <em>First,</em> it strengthens the heart. <em>In addition,</em> it boosts mood. <em>Finally,</em> it builds stronger muscles. <em>For these reasons,</em> everyone should exercise daily."</div>
              `
            },
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    // COURSE 5: Araling Panlipunan (AP)
    // ─────────────────────────────────────────────────────────────
    {
      id: 'ap-grade7',
      title: 'Araling Panlipunan – Baitang 7',
      category: 'AP / Social Studies',
      emoji: '🌏',
      banner: 'banner-ap',
      description: 'Kasaysayan ng Pilipinas, mga karapatang pantao, at kultura ng lipunan.',
      totalLessons: 9,
      modules: [
        {
          id: 'ap-m1',
          title: 'Modyul 1: Kasaysayan ng Pilipinas',
          lessons: [
            {
              id: 'ap-l1',
              title: 'Sinaunang Kabihasnan ng Pilipinas',
              duration: '9 min',
              content: `
                <h3>Bago Dumating ang Espanyol</h3>
                <p>Matagal na may umiiral na kabihasnan sa Pilipinas bago pa man dumating ang mga Espanyol noong 1565. Ang mga sinaunang Pilipino ay may sariling kultura, pamahalaan, at wika.</p>
                <h3>Mga Sinaunang Pamayanan</h3>
                <ul>
                  <li><strong>Barangay</strong> — pangunahing yunit ng pamayanan, pinamumunuan ng Datu</li>
                  <li><strong>Datu</strong> — pinuno ng barangay, namamahala sa batas at kalakalan</li>
                  <li><strong>Maharlika</strong> — mga marangal o noble</li>
                  <li><strong>Alipin</strong> — pinakamababang antas, may dalawang uri: aliping namamahay at aliping sagigilid</li>
                </ul>
                <div class="highlight-box">🏝️ Ang Pilipinas ay binubuo ng tinatayang 7,641 pulo, pinaghahati sa tatlong pangunahing grupo: Luzon, Visayas, at Mindanao.</div>
                <h3>Kalakalan at Pagsulat</h3>
                <p>Ang mga sinaunang Pilipino ay may sariling sistema ng pagsulat na tinatawag na <strong>Baybayin</strong>. Nakikipagkalakalan sila sa China, Japan, India, at mga kalapit na bansa.</p>
              `
            },
            {
              id: 'ap-l2',
              title: 'Pananakop ng mga Espanyol',
              duration: '10 min',
              content: `
                <h3>Pagdating ng mga Espanyol</h3>
                <p>Si Ferdinand Magellan ang unang Europeo na nakarating sa Pilipinas noong <strong>Marso 16, 1521</strong>. Namatay siya sa <strong>Labanan sa Mactan</strong> noong Abril 27, 1521, sa pamamagitan ni Datu Lapulapu.</p>
                <div class="highlight-box">⚔️ Si Lapulapu ay itinuturing na <strong>unang bayaning Pilipino</strong> dahil nilabanan niya ang mga mananakop.</div>
                <h3>Kolonyalismo ng Espanya</h3>
                <p>Noong 1565, si Miguel López de Legazpi ang nagtatag ng permanenteng pamayanan ng Espanyol sa Cebu. Noong 1571, inilipat ang kabisera sa Maynila.</p>
                <ul>
                  <li>Ipinalawig ng Espanyol ang Kristiyanismo</li>
                  <li>Itinatag ang <em>encomienda</em> — pagbibigay ng lupain at manggagawa sa mga Espanyol</li>
                  <li>Itinayo ang mga simbahan at paaralan</li>
                  <li>Isinagawa ang <em>Galleon Trade</em> — kalakalan sa pagitan ng Maynila at Acapulco, Mexico</li>
                </ul>
              `,
              quizId: 'ap-q1',
            },
            {
              id: 'ap-l3',
              title: 'Rebolusyon at Kalayaan',
              duration: '9 min',
              content: `
                <h3>Kilusan Para sa Kalayaan</h3>
                <p>Sa loob ng 333 taon ng pananakop ng Espanya, lumitaw ang mga bayaning Pilipino na nagpaglaban ng kalayaan.</p>
                <ul>
                  <li><strong>Jose Rizal (1861–1896)</strong> — pambansang bayani, sumulat ng Noli Me Tangere at El Filibusterismo</li>
                  <li><strong>Andres Bonifacio (1863–1897)</strong> — nagtatag ng Katipunan, nagpasimula ng armadong rebolusyon noong Agosto 23, 1896</li>
                  <li><strong>Emilio Aguinaldo (1869–1964)</strong> — unang Presidente ng Pilipinas</li>
                </ul>
                <h3>Deklarasyon ng Kalayaan</h3>
                <p>Noong <strong>Hunyo 12, 1898</strong>, iprinoklamasyon ni Aguinaldo ang kalayaan ng Pilipinas sa Kawit, Cavite — ang unang republika sa Asya.</p>
                <div class="highlight-box">🇵🇭 Ang Hunyo 12 ay ipinagdiriwang bilang Araw ng Kalayaan ng Pilipinas.</div>
              `
            },
          ]
        },
        {
          id: 'ap-m2',
          title: 'Modyul 2: Heograpiya ng Pilipinas',
          lessons: [
            {
              id: 'ap-l4',
              title: 'Lokasyon at Katangiang Pisikal',
              duration: '8 min',
              content: `
                <h3>Lokasyon ng Pilipinas</h3>
                <p>Ang Pilipinas ay matatagpuan sa <strong>Timog-silangang Asya</strong>. Nasa pagitan ito ng South China Sea sa kanluran at Philippine Sea sa silangan.</p>
                <h3>Tatlong Pangunahing Isla-grupo</h3>
                <ul>
                  <li><strong>Luzon</strong> — pinakamalaking isla; kinabibilangan ng Metro Manila (kabisera)</li>
                  <li><strong>Visayas</strong> — grupo ng mga isla sa gitna; kasama ang Cebu, Bohol, Leyte</li>
                  <li><strong>Mindanao</strong> — pangalawang pinakamalaking isla; mayaman sa likas na yaman</li>
                </ul>
                <div class="highlight-box">🌋 Ang Pilipinas ay bahagi ng "Ring of Fire" — aktibong volcanic at seismic zone sa paligid ng Pacific Ocean. May higit sa 20 aktibong bulkan.</div>
                <h3>Klima</h3>
                <p>Ang Pilipinas ay may tropikal na klima: mainit at mahalumigmig buong taon. May dalawang pangunahing panahon: tag-araw (dry season) at tag-ulan (wet season).</p>
              `
            },
            {
              id: 'ap-l5',
              title: 'Kultura at Pagkakakilanlan ng Pilipino',
              duration: '9 min',
              content: `
                <h3>Mga Pangunahing Katangian ng Kulturang Pilipino</h3>
                <ul>
                  <li><strong>Bayanihan</strong> — pagtutulungan ng komunidad; pagtulong sa kapwa</li>
                  <li><strong>Utang na Loob</strong> — pasasalamat at pagbabayad ng utang na kabutihan</li>
                  <li><strong>Hiya</strong> — pagpapahalaga sa dangal at paggalang sa kapwa</li>
                  <li><strong>Pakikisama</strong> — pakikiisa sa grupo; pakikibagay sa kapwa</li>
                  <li><strong>Malasakit</strong> — pagmamalasakit at pag-aalaga sa kapwa</li>
                </ul>
                <div class="highlight-box">🎪 Kilala ang mga Pilipino sa kanilang masayang pagsasaya. Isa sa pinakasikat na pagdiriwang ay ang <strong>Sinulog Festival</strong> sa Cebu at <strong>Ati-Atihan</strong> sa Antique.</div>
                <h3>Mga Endangered na Wika</h3>
                <p>Ang Pilipinas ay may higit sa <strong>180 wika at diyalekto</strong>. Ang <strong>Filipino (Tagalog)</strong> at <strong>Ingles</strong> ang mga opisyal na wika.</p>
              `,
              quizId: 'ap-q2',
            },
            {
              id: 'ap-l6',
              title: 'Pamahalaan ng Pilipinas',
              duration: '8 min',
              content: `
                <h3>Anyo ng Pamahalaan</h3>
                <p>Ang Pilipinas ay isang <strong>demokratikong republika</strong> na may tatlong sangay ng pamahalaan.</p>
                <ul>
                  <li><strong>Ehekutibo</strong> — Pangulo, Bise-Pangulo, Gabinete; nagpapatupad ng batas</li>
                  <li><strong>Lehislatibo</strong> — Kongreso (Senado + Kapulungan ng mga Kinatawan); gumagawa ng batas</li>
                  <li><strong>Hudikatura</strong> — Korte Suprema at mas mababang hukuman; nagpapaliwanag ng batas</li>
                </ul>
                <div class="highlight-box">⚖️ Ang prinsipyo ng <strong>separation of powers</strong> at <strong>checks and balances</strong> ay nagpoprotekta laban sa sobrang kapangyarihan ng kahit sinong sangay.</div>
                <h3>Konstitusyon ng Pilipinas</h3>
                <p>Ang Konstitusyon ng 1987 ang <em>pinakamataas na batas ng bansa</em>. Binibigyan nito ng karapatang pantao ang lahat ng Pilipino at nagtatakda ng limitasyon ng kapangyarihan ng pamahalaan.</p>
              `
            },
          ]
        },
        {
          id: 'ap-m3',
          title: 'Modyul 3: Ekonomiya at Kalikasan',
          lessons: [
            {
              id: 'ap-l7',
              title: 'Pangunahing Industriya ng Pilipinas',
              duration: '8 min',
              content: `
                <h3>Tatlong Sektor ng Ekonomiya</h3>
                <ul>
                  <li><strong>Primarya</strong> — agrikultura, pangisdaan, pagmimina, kagubatan</li>
                  <li><strong>Sekundarya</strong> — industriya, pagmamanupaktura, konstruksyon</li>
                  <li><strong>Tersyarya</strong> — serbisyo: turismo, BPO, kalakalan, transportasyon</li>
                </ul>
                <h3>Mahahalagang Inaani at Produkto</h3>
                <ul>
                  <li>Palay at mais — pangunahing pagkain</li>
                  <li>Niyog — pinakamayamang pananim; coconut oil, copra</li>
                  <li>Saging (Cavendish) — isa sa pinakamataas na ini-export</li>
                  <li>Tuna at iba pang isda — malaking bahagi ng export</li>
                </ul>
                <div class="highlight-box">🌴 Ang Pilipinas ay isa sa mga pinaka-biodiversity-rich na bansa sa mundo — "megadiversity country."</div>
              `
            },
            {
              id: 'ap-l8',
              title: 'Kalikasan at Kapaligiran',
              duration: '9 min',
              content: `
                <h3>Likas na Yaman ng Pilipinas</h3>
                <p>Ang Pilipinas ay may mayamang likas na yaman: mga kagubatan, karagatan, bulkan, ginto, tanso, at iba pa.</p>
                <h3>Mga Problemang Pangkalikasan</h3>
                <ul>
                  <li><strong>Deforestation</strong> — pagbabago ng kagubatan sa bukid at tirahan</li>
                  <li><strong>Coral reef degradation</strong> — pagkasira ng mga korales dahil sa polusyon at dynamite fishing</li>
                  <li><strong>Polusyon ng tubig at hangin</strong> — dulot ng industriya at sasakyan</li>
                  <li><strong>Natural disasters</strong> — bagyo, lindol, baha, volcanic eruption</li>
                </ul>
                <div class="highlight-box">♻️ Ang bawat isa sa atin ay may responsibilidad sa kalikasan: tanim ng puno, wastong pagtatapon ng basura, at pagtitipid ng kuryente at tubig.</div>
              `,
              quizId: 'ap-q3',
            },
            {
              id: 'ap-l9',
              title: 'Globalisasyon at Pilipinas',
              duration: '7 min',
              content: `
                <h3>Ano ang Globalisasyon?</h3>
                <p><strong>Globalisasyon</strong> ang proseso ng pagiging mas magkakaugnay ng mga bansa sa buong mundo sa pamamagitan ng kalakalan, teknolohiya, kultura, at komunikasyon.</p>
                <h3>Epekto sa Pilipinas</h3>
                <ul>
                  <li><strong>Positibo:</strong> Mas maraming trabaho (BPO/call centers), pagpapalakas ng OFW remittances, access sa teknolohiya</li>
                  <li><strong>Negatibo:</strong> Brain drain (pag-alis ng mga propesyonal), cultural dilution, ekonomikong agwat</li>
                </ul>
                <div class="highlight-box">💼 Ang mga <strong>OFW (Overseas Filipino Workers)</strong> ay nagpapadala ng bilyon-bilyong dolyar sa Pilipinas bawat taon — malaking tulong sa ekonomiya ng bansa.</div>
              `
            },
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    // COURSE 6: Health Education
    // ─────────────────────────────────────────────────────────────
    {
      id: 'health-grade7',
      title: 'Health Education – Grade 7',
      category: 'Health',
      emoji: '💪',
      banner: 'banner-health',
      description: 'Personal health, nutrition, mental wellness, and disease prevention.',
      totalLessons: 9,
      modules: [
        {
          id: 'health-m1',
          title: 'Module 1: Personal Health & Hygiene',
          lessons: [
            {
              id: 'health-l1',
              title: 'Why Personal Hygiene Matters',
              duration: '7 min',
              content: `
                <h3>What Is Personal Hygiene?</h3>
                <p><strong>Personal hygiene</strong> refers to practices that maintain cleanliness and health to prevent illness and disease.</p>
                <h3>Key Hygiene Practices</h3>
                <ul>
                  <li><strong>Handwashing</strong> — most effective way to prevent spread of germs. Wash for at least 20 seconds with soap and water.</li>
                  <li><strong>Oral hygiene</strong> — brush 2x per day, floss daily, and visit a dentist every 6 months.</li>
                  <li><strong>Bathing</strong> — removes dirt, sweat, and bacteria from skin surface.</li>
                  <li><strong>Clean clothing</strong> — prevents skin infections and bad odor.</li>
                  <li><strong>Nail care</strong> — trim nails regularly; dirty nails harbor bacteria.</li>
                </ul>
                <div class="highlight-box">🧼 The WHO recommends washing hands at 5 critical times: before eating, after using toilet, after handling animals, after coughing/sneezing, before preparing food.</div>
              `
            },
            {
              id: 'health-l2',
              title: 'Nutrition and a Balanced Diet',
              duration: '10 min',
              content: `
                <h3>The 6 Essential Nutrients</h3>
                <ul>
                  <li><strong>Carbohydrates</strong> — main energy source (rice, bread, corn). 45–65% of daily calories.</li>
                  <li><strong>Proteins</strong> — builds and repairs tissue (fish, meat, eggs, beans). 10–35%.</li>
                  <li><strong>Fats</strong> — energy storage, hormone production (nuts, oil, avocado). 20–35%.</li>
                  <li><strong>Vitamins</strong> — regulate body processes (found in fruits and vegetables).</li>
                  <li><strong>Minerals</strong> — for bones, blood, and nerves (calcium, iron, potassium).</li>
                  <li><strong>Water</strong> — makes up 60% of the body; needed for all body functions. Drink 8+ glasses per day.</li>
                </ul>
                <div class="highlight-box">🍽️ The <strong>Pinggang Pinoy</strong> (Philippine Food Plate) recommends: ½ plate fruits & vegetables, ¼ carbohydrates, ¼ protein, + a glass of water every meal.</div>
              `,
              quizId: 'health-q1',
            },
            {
              id: 'health-l3',
              title: 'Sleep, Rest, and Recreation',
              duration: '7 min',
              content: `
                <h3>Why Sleep Is Essential</h3>
                <p>Sleep is when your body repairs itself, consolidates memories, and restores energy. Teenagers (13–18 years) need <strong>8–10 hours</strong> per night.</p>
                <h3>Effects of Sleep Deprivation</h3>
                <ul>
                  <li>Poor concentration and memory</li>
                  <li>Weakened immune system</li>
                  <li>Mood swings and irritability</li>
                  <li>Increased risk of obesity and disease</li>
                </ul>
                <h3>Benefits of Recreation</h3>
                <p>Recreation — sports, hobbies, creative activities — helps reduce stress, improve mood, and maintain physical fitness.</p>
                <div class="highlight-box">📵 Blue light from screens disrupts melatonin (sleep hormone). Try to stop screen time 30–60 minutes before bed.</div>
              `
            },
          ]
        },
        {
          id: 'health-m2',
          title: 'Module 2: Mental and Emotional Health',
          lessons: [
            {
              id: 'health-l4',
              title: 'Understanding Emotions',
              duration: '8 min',
              content: `
                <h3>What Are Emotions?</h3>
                <p>Emotions are <strong>feelings</strong> that affect how we think and behave. They are natural and normal — no emotion is "wrong."</p>
                <h3>Primary Emotions (Ekman's 6 Basic)</h3>
                <ul>
                  <li>😊 <strong>Joy/Happiness</strong> — feeling of pleasure and contentment</li>
                  <li>😢 <strong>Sadness</strong> — feeling of loss or disappointment</li>
                  <li>😠 <strong>Anger</strong> — feeling of frustration or injustice</li>
                  <li>😨 <strong>Fear</strong> — response to perceived danger or threat</li>
                  <li>🤢 <strong>Disgust</strong> — aversion to something unpleasant</li>
                  <li>😲 <strong>Surprise</strong> — reaction to unexpected events</li>
                </ul>
                <div class="highlight-box">🧘 Emotional intelligence (EQ) is the ability to understand, manage, and express emotions effectively. It is as important as academic intelligence (IQ)!</div>
              `
            },
            {
              id: 'health-l5',
              title: 'Stress Management',
              duration: '9 min',
              content: `
                <h3>What Is Stress?</h3>
                <p><strong>Stress</strong> is the body's natural response to challenges or demands. Short-term stress can be helpful (motivates action), but chronic stress is harmful to health.</p>
                <h3>Signs of Stress</h3>
                <ul>
                  <li>Headaches, stomach aches, or fatigue</li>
                  <li>Difficulty concentrating or sleeping</li>
                  <li>Feeling irritable, sad, or overwhelmed</li>
                </ul>
                <h3>Healthy Coping Strategies</h3>
                <ul>
                  <li>Deep breathing — 4-7-8 technique (inhale 4s, hold 7s, exhale 8s)</li>
                  <li>Exercise and physical activity</li>
                  <li>Talk to a trusted adult or friend</li>
                  <li>Journaling — write your feelings</li>
                  <li>Creative hobbies — art, music, reading</li>
                  <li>Time management — make a to-do list, break tasks into steps</li>
                </ul>
                <div class="highlight-box">🚫 Unhealthy coping: avoiding the problem, excessive screen time, emotional eating. These only delay dealing with stress.</div>
              `,
              quizId: 'health-q2',
            },
            {
              id: 'health-l6',
              title: 'Building Self-Esteem',
              duration: '8 min',
              content: `
                <h3>What Is Self-Esteem?</h3>
                <p><strong>Self-esteem</strong> is how you feel about yourself — your sense of value, worth, and confidence.</p>
                <h3>Signs of Healthy Self-Esteem</h3>
                <ul>
                  <li>You accept mistakes without feeling worthless</li>
                  <li>You set boundaries and say "no" when needed</li>
                  <li>You celebrate your successes (even small ones)</li>
                  <li>You don't rely on others' opinions to feel good</li>
                </ul>
                <h3>Building Self-Esteem</h3>
                <ul>
                  <li>Practice positive self-talk ("I can do this")</li>
                  <li>Identify your strengths and talents</li>
                  <li>Set and achieve small, realistic goals</li>
                  <li>Surround yourself with supportive people</li>
                  <li>Stop comparing yourself to others on social media</li>
                </ul>
                <div class="highlight-box">💬 Replace negative thoughts: "I'm so stupid" → "I'm still learning and growing." Self-talk shapes your reality.</div>
              `
            },
          ]
        },
        {
          id: 'health-m3',
          title: 'Module 3: Disease Prevention',
          lessons: [
            {
              id: 'health-l7',
              title: 'Communicable Diseases',
              duration: '8 min',
              content: `
                <h3>What Are Communicable Diseases?</h3>
                <p><strong>Communicable diseases</strong> (infectious diseases) can spread from person to person through various routes.</p>
                <h3>Common Modes of Transmission</h3>
                <ul>
                  <li><strong>Airborne:</strong> Coughing, sneezing (tuberculosis, measles, COVID-19)</li>
                  <li><strong>Direct contact:</strong> Touching infected skin (chickenpox, ringworm)</li>
                  <li><strong>Contaminated food/water:</strong> Cholera, typhoid, diarrhea</li>
                  <li><strong>Insect vectors:</strong> Mosquitoes (dengue, malaria)</li>
                </ul>
                <h3>Prevention</h3>
                <ul>
                  <li>Vaccination / immunization</li>
                  <li>Proper handwashing</li>
                  <li>Using mosquito repellents and nets</li>
                  <li>Eating properly cooked food and clean water</li>
                </ul>
                <div class="highlight-box">🦟 Dengue kills thousands in the Philippines yearly. Remove stagnant water (flower pots, old tires) where mosquitoes breed!</div>
              `
            },
            {
              id: 'health-l8',
              title: 'Non-Communicable Diseases',
              duration: '8 min',
              content: `
                <h3>What Are Non-Communicable Diseases (NCDs)?</h3>
                <p>NCDs cannot spread from person to person. They are often caused by <strong>lifestyle factors</strong>.</p>
                <h3>Major NCDs in the Philippines</h3>
                <ul>
                  <li><strong>Heart Disease</strong> — #1 killer; caused by high cholesterol, hypertension, smoking</li>
                  <li><strong>Cancer</strong> — uncontrolled cell growth; linked to smoking, diet, genetics</li>
                  <li><strong>Diabetes</strong> — high blood sugar; Type 2 is largely preventable through diet and exercise</li>
                  <li><strong>Stroke</strong> — blockage or bleeding in the brain; related to hypertension</li>
                </ul>
                <div class="highlight-box">🛡️ Up to 80% of NCDs are preventable through: no smoking, healthy diet, regular exercise, and regular check-ups.</div>
              `,
              quizId: 'health-q3',
            },
            {
              id: 'health-l9',
              title: 'First Aid Basics',
              duration: '9 min',
              content: `
                <h3>What Is First Aid?</h3>
                <p><strong>First aid</strong> is the immediate care given to someone injured or suddenly ill before professional medical help arrives.</p>
                <h3>DRSABC Protocol</h3>
                <ul>
                  <li><strong>D</strong> — Danger: Check the scene is safe for rescuers and victim</li>
                  <li><strong>R</strong> — Response: Check if the person is conscious (tap and shout)</li>
                  <li><strong>S</strong> — Send for help: Call emergency services (911)</li>
                  <li><strong>A</strong> — Airway: Open the airway (tilt head, lift chin)</li>
                  <li><strong>B</strong> — Breathing: Check for normal breathing</li>
                  <li><strong>C</strong> — CPR: Start chest compressions if not breathing (30 compressions : 2 breaths)</li>
                </ul>
                <h3>Common First Aid Situations</h3>
                <ul>
                  <li><strong>Bleeding:</strong> Apply direct pressure with clean cloth</li>
                  <li><strong>Burns:</strong> Cool with running water (not ice) for 10–20 min</li>
                  <li><strong>Choking:</strong> Encourage coughing; use Heimlich maneuver if needed</li>
                  <li><strong>Fainting:</strong> Lay person down, elevate legs</li>
                </ul>
                <div class="highlight-box">🚑 Know your local emergency number: Philippines 911. Every second counts in an emergency!</div>
              `
            },
          ]
        }
      ]
    }
  ];

  // Quizzes
  const quizzes = {
    'math-q1': {
      title: 'Quiz: Adding & Subtracting Integers',
      questions: [
        { q: 'What is (−8) + 5?', options: ['−13', '−3', '3', '13'], answer: 1 },
        { q: 'What is (−3) − (−7)?', options: ['−10', '−4', '4', '10'], answer: 2 },
        { q: 'Which is equal to 6 − (−4)?', options: ['2', '−10', '10', '−2'], answer: 2 },
        { q: 'What is (−12) + (−8)?', options: ['−20', '20', '−4', '4'], answer: 0 },
        { q: 'The absolute value of −15 is:', options: ['−15', '0', '15', '1/15'], answer: 2 },
      ]
    },
    'math-q2': {
      title: 'Quiz: Fractions',
      questions: [
        { q: 'What is 1/3 + 1/4?', options: ['2/7', '7/12', '5/12', '2/12'], answer: 1 },
        { q: 'Simplify 8/12:', options: ['4/6', '2/3', '3/4', '1/2'], answer: 1 },
        { q: 'Convert 0.75 to a fraction:', options: ['3/5', '7/10', '3/4', '7/8'], answer: 2 },
        { q: '3/4 − 1/6 = ?', options: ['5/12', '7/12', '2/10', '1/2'], answer: 1 },
        { q: 'Which fraction is equivalent to 2/5?', options: ['4/8', '4/10', '3/6', '6/12'], answer: 1 },
      ]
    },
    'math-q3': {
      title: 'Quiz: Equations',
      questions: [
        { q: 'Solve: x + 9 = 17', options: ['x = 8', 'x = 26', 'x = 7', 'x = 9'], answer: 0 },
        { q: 'Solve: 3x = 36', options: ['x = 12', 'x = 108', 'x = 9', 'x = 33'], answer: 0 },
        { q: 'Solve: 2x + 4 = 14', options: ['x = 9', 'x = 5', 'x = 4', 'x = 6'], answer: 1 },
        { q: 'Solve: x/4 = 7', options: ['x = 3', 'x = 28', 'x = 11', 'x = 1.75'], answer: 1 },
        { q: 'If y = 3, what is 4y − 6?', options: ['6', '18', '−2', '9'], answer: 0 },
      ]
    },
    'sci-q1': {
      title: 'Quiz: Physical & Chemical Properties',
      questions: [
        { q: 'Which is a physical change?', options: ['Burning wood', 'Rusting iron', 'Melting ice', 'Cooking an egg'], answer: 2 },
        { q: 'Density, color, and hardness are examples of:', options: ['Chemical properties', 'Physical properties', 'Atomic properties', 'Ionic properties'], answer: 1 },
        { q: 'Which is a chemical property?', options: ['Melting point', 'Color', 'Flammability', 'Density'], answer: 2 },
        { q: 'Iron rusting is a _____ change:', options: ['physical', 'chemical', 'nuclear', 'mechanical'], answer: 1 },
        { q: 'Cutting paper is a _____ change:', options: ['chemical', 'nuclear', 'physical', 'magnetic'], answer: 2 },
      ]
    },
    'sci-q2': {
      title: 'Quiz: Cell Structure',
      questions: [
        { q: 'Which organelle is the "powerhouse of the cell"?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Cell wall'], answer: 2 },
        { q: 'Which is found in plant cells but NOT animal cells?', options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'], answer: 2 },
        { q: 'What does the nucleus contain?', options: ['ATP', 'DNA', 'Chlorophyll', 'Starch'], answer: 1 },
        { q: 'Ribosomes are responsible for:', options: ['Energy production', 'Protein synthesis', 'Photosynthesis', 'Cell division'], answer: 1 },
        { q: 'Who first observed cells with a microscope?', options: ['Darwin', 'Pasteur', 'Newton', 'Robert Hooke'], answer: 3 },
      ]
    },
    'sci-q3': {
      title: 'Quiz: Types of Energy',
      questions: [
        { q: 'A moving car has which type of energy?', options: ['Potential', 'Chemical', 'Kinetic', 'Nuclear'], answer: 2 },
        { q: 'A ball held at the top of a hill has:', options: ['Kinetic energy', 'Electrical energy', 'Thermal energy', 'Potential energy'], answer: 3 },
        { q: 'Which law states energy cannot be created or destroyed?', options: ['Law of Motion', 'Law of Gravity', 'Law of Conservation of Energy', 'Ohm\'s Law'], answer: 2 },
        { q: 'Newton\'s 2nd Law is expressed as:', options: ['E = mc²', 'F = ma', 'V = IR', 'P = mv'], answer: 1 },
        { q: 'Which is NOT a form of energy?', options: ['Sound', 'Light', 'Velocity', 'Heat'], answer: 2 },
      ]
    },
    'fil-q1': {
      title: 'Pagsusulit: Pangngalan at Panghalip',
      questions: [
        { q: 'Ano ang uri ng pangngalan ang salitang "Pilipinas"?', options: ['Pambalana', 'Abstrakto', 'Pantangi', 'Konkreto'], answer: 2 },
        { q: 'Alin ang abstraktong pangngalan?', options: ['Paaralan', 'Kalayaan', 'Manok', 'Bahay'], answer: 1 },
        { q: 'Alin ang tamang panghalip para palitan ang "si Ana at si Ben"?', options: ['siya', 'sila', 'kami', 'kayo'], answer: 1 },
        { q: '"Ang bata" sa pangungusap na "Ang bata ay tumatakbo" ay ang:', options: ['Panaguri', 'Pandiwa', 'Paksa', 'Pang-uri'], answer: 2 },
        { q: 'Alin ang pambalana (common noun)?', options: ['Rizal', 'Maynila', 'Lungsod', 'Nile'], answer: 2 },
      ]
    },
    'fil-q2': {
      title: 'Pagsusulit: Pagbabasa at Pag-unawa',
      questions: [
        { q: 'Ang mabilis na paghahanap ng tiyak na impormasyon sa teksto ay tinatawag na:', options: ['Skimming', 'Scanning', 'Extensive reading', 'Intensive reading'], answer: 1 },
        { q: 'Nasaan madalas matatagpuan ang pangunahing ideya ng talata?', options: ['Sa gitna', 'Sa dulo lamang', 'Sa simula o dulo', 'Sa pagitan ng mga talata'], answer: 2 },
        { q: 'Ang "Ibong Adarna" ay isang uri ng:', options: ['Maikling kuwento', 'Sanaysay', 'Epiko', 'Tula'], answer: 2 },
        { q: 'Ano ang tawag sa mga pangungusap na nagpapalawak ng pangunahing ideya?', options: ['Topic sentence', 'Sumusuportang detalye', 'Tema', 'Banghay'], answer: 1 },
        { q: 'Alin ang uri ng pagbabasa para sa masayang pagbabasa ng nobela?', options: ['Scanning', 'Intensive reading', 'Extensive reading', 'Skimming'], answer: 2 },
      ]
    },
    'fil-q3': {
      title: 'Pagsusulit: Pagsulat at Komunikasyon',
      questions: [
        { q: 'Alin ang bahagi ng liham na nagtataglay ng nilalaman?', options: ['Heading', 'Salutation', 'Katawan', 'Pagsasara'], answer: 2 },
        { q: 'Ang "Lubos na gumagalang" ay bahagi ng:', options: ['Heading', 'Katawan', 'Pagsasara', 'Lagda'], answer: 2 },
        { q: 'Alin ang halimbawa ng non-verbal na komunikasyon?', options: ['Liham', 'Teksto', 'Ekspresyon ng mukha', 'Talumpati'], answer: 2 },
        { q: 'Ang pormang komunikasyon para sa opisyal na layunin ay:', options: ['Impormal', 'Oral', 'Pormal', 'Diyalogo'], answer: 2 },
        { q: 'Ilang porsyento ng komunikasyon ang body language ayon sa pananaliksik?', options: ['7%', '38%', '55%', '80%'], answer: 2 },
      ]
    },
    'eng-q1': {
      title: 'Quiz: Inference & Context Clues',
      questions: [
        { q: 'What is an inference?', options: ['A direct quote from the text', 'A conclusion drawn from evidence and reasoning', 'A type of context clue', 'A summary of the passage'], answer: 1 },
        { q: '"She was lethargic, meaning she had no energy." This context clue is a:', options: ['Contrast clue', 'Synonym clue', 'Definition clue', 'Example clue'], answer: 2 },
        { q: 'Which question does NOT help find the main idea?', options: ['What is this mostly about?', 'What does the author think?', 'What is the exact number of words?', 'What do all sentences have in common?'], answer: 2 },
        { q: 'A statement that CAN be proven true or false is a:', options: ['Opinion', 'Inference', 'Fact', 'Belief'], answer: 2 },
        { q: '"I think this is the best book ever" is an example of:', options: ['A fact', 'An inference', 'An opinion', 'A context clue'], answer: 2 },
      ]
    },
    'eng-q2': {
      title: 'Quiz: Subject-Verb Agreement',
      questions: [
        { q: 'Choose the correct verb: "She _____ every morning."', options: ['run', 'runs', 'running', 'ran'], answer: 1 },
        { q: '"Ana and Ben _____ here." Which verb is correct?', options: ['is', 'are', 'was', 'am'], answer: 1 },
        { q: '"Everyone _____ a ticket." Choose the correct verb.', options: ['have', 'has', 'having', 'had'], answer: 1 },
        { q: '"The box of apples _____ heavy." What is the subject?', options: ['apples', 'of', 'box', 'The box of apples'], answer: 2 },
        { q: '"The team _____ ready." Choose the correct verb.', options: ['are', 'were', 'is', 'be'], answer: 2 },
      ]
    },
    'eng-q3': {
      title: 'Quiz: Types of Writing',
      questions: [
        { q: 'A personal essay about your first day of school is which type of writing?', options: ['Expository', 'Persuasive', 'Narrative', 'Descriptive'], answer: 2 },
        { q: 'Which signal word suggests an OPINION?', options: ['The study shows', 'Research proves', 'I believe', 'Data indicates'], answer: 2 },
        { q: 'An editorial arguing for stricter environmental laws is what type?', options: ['Narrative', 'Descriptive', 'Expository', 'Persuasive'], answer: 3 },
        { q: 'What is the SECOND step of the writing process?', options: ['Editing', 'Revising', 'Drafting', 'Publishing'], answer: 2 },
        { q: 'Which transition word shows contrast?', options: ['Furthermore', 'Therefore', 'However', 'Also'], answer: 2 },
      ]
    },
    'ap-q1': {
      title: 'Pagsusulit: Pananakop ng Espanyol',
      questions: [
        { q: 'Sino ang unang Europeo na nakarating sa Pilipinas?', options: ['Miguel Lopez de Legazpi', 'Ferdinand Magellan', 'Andres Bonifacio', 'Jose Rizal'], answer: 1 },
        { q: 'Kailan nagsimula ang Labanan sa Mactan?', options: ['Marso 16, 1521', 'Hunyo 12, 1898', 'Abril 27, 1521', 'Agosto 23, 1896'], answer: 2 },
        { q: 'Ano ang itinuturing na unang bayaning Pilipino?', options: ['Jose Rizal', 'Emilio Aguinaldo', 'Lapulapu', 'Andres Bonifacio'], answer: 2 },
        { q: 'Saan inilipat ang kabisera ng Espanya noong 1571?', options: ['Cebu', 'Davao', 'Maynila', 'Kawit'], answer: 2 },
        { q: 'Sino ang nagtatag ng Katipunan?', options: ['Jose Rizal', 'Emilio Aguinaldo', 'Ferdinand Magellan', 'Andres Bonifacio'], answer: 3 },
      ]
    },
    'ap-q2': {
      title: 'Pagsusulit: Kultura at Heograpiya ng Pilipinas',
      questions: [
        { q: 'Ilang isla ang bumubuo sa Pilipinas?', options: ['3,107', '5,000', '7,641', '10,000'], answer: 2 },
        { q: 'Ano ang tawag sa tradisyon ng pagtutulungan sa komunidad?', options: ['Utang na Loob', 'Hiya', 'Bayanihan', 'Pakikisama'], answer: 2 },
        { q: 'Aling pangkat ng isla ang kinabibilangan ng kabisera (Metro Manila)?', options: ['Mindanao', 'Visayas', 'Luzon', 'Palawan'], answer: 2 },
        { q: 'Ang Pilipinas ay bahagi ng tinatawag na:', options: ['Pacific Rim', 'Ring of Fire', 'Bermuda Triangle', 'Indian Ocean Ring'], answer: 1 },
        { q: 'Aling festival ang kilala sa Cebu?', options: ['Ati-Atihan', 'Pahiyas', 'MassKara', 'Sinulog'], answer: 3 },
      ]
    },
    'ap-q3': {
      title: 'Pagsusulit: Ekonomiya at Kalikasan',
      questions: [
        { q: 'Alin ang halimbawa ng sekundaryang sektor?', options: ['Agrikultura', 'Pangisdaan', 'Pagmamanupaktura', 'Turismo'], answer: 2 },
        { q: 'Kailan iprinoklamasyon ang kalayaan ng Pilipinas?', options: ['Marso 16, 1521', 'Agosto 23, 1896', 'Hunyo 12, 1898', 'Abril 27, 1521'], answer: 2 },
        { q: 'Ang OFW ay nangangahulugang:', options: ['Official Filipino Worker', 'Overseas Filipino Worker', 'Overseas Foreign Worker', 'Official Foreign Worker'], answer: 1 },
        { q: 'Alin sa mga sumusunod ang problemang pangkalikasan?', options: ['Globalisasyon', 'Deforestation', 'BPO industry', 'Galleon Trade'], answer: 1 },
        { q: 'Ano ang pinakamalaking pananim ng Pilipinas (export)?', options: ['Palay', 'Mais', 'Saging', 'Sitrus'], answer: 2 },
      ]
    },
    'health-q1': {
      title: 'Quiz: Nutrition & Hygiene',
      questions: [
        { q: 'Which nutrient is the main energy source for the body?', options: ['Protein', 'Fat', 'Carbohydrates', 'Vitamins'], answer: 2 },
        { q: 'How long should you wash hands to effectively remove germs?', options: ['5 seconds', '10 seconds', '20 seconds', '60 seconds'], answer: 2 },
        { q: 'The "Pinggang Pinoy" recommends half the plate should be:', options: ['Carbohydrates', 'Proteins', 'Fruits and vegetables', 'Fats'], answer: 2 },
        { q: 'How many glasses of water should you drink daily?', options: ['2–3', '4–5', '6–7', '8+'], answer: 3 },
        { q: 'Which nutrient makes up about 60% of the body?', options: ['Protein', 'Fat', 'Water', 'Minerals'], answer: 2 },
      ]
    },
    'health-q2': {
      title: 'Quiz: Mental Health & Stress',
      questions: [
        { q: 'How many hours of sleep do teenagers need per night?', options: ['5–6 hours', '6–7 hours', '8–10 hours', '11–12 hours'], answer: 2 },
        { q: 'Which of these is a HEALTHY coping strategy for stress?', options: ['Avoiding the problem', 'Excessive screen time', 'Deep breathing exercises', 'Emotional eating'], answer: 2 },
        { q: 'Emotional intelligence (EQ) refers to:', options: ['Your IQ score', 'Academic ability', 'Ability to manage and understand emotions', 'Physical fitness level'], answer: 2 },
        { q: 'Which basic emotion is a response to perceived danger?', options: ['Joy', 'Disgust', 'Anger', 'Fear'], answer: 3 },
        { q: 'What disrupts the sleep hormone melatonin before bed?', options: ['Reading a book', 'Blue light from screens', 'Drinking warm milk', 'Light exercise'], answer: 1 },
      ]
    },
    'health-q3': {
      title: 'Quiz: Disease Prevention',
      questions: [
        { q: 'Which disease is spread by mosquitoes in the Philippines?', options: ['Tuberculosis', 'Dengue', 'Cholera', 'Ringworm'], answer: 1 },
        { q: 'Which is NOT a communicable disease?', options: ['COVID-19', 'Measles', 'Diabetes', 'Typhoid'], answer: 2 },
        { q: 'The first step in the DRSABC protocol is:', options: ['Response', 'Breathing', 'Danger', 'Airway'], answer: 2 },
        { q: 'What percentage of NCDs are estimated to be preventable?', options: ['30%', '50%', '80%', '100%'], answer: 2 },
        { q: 'For burns, what should you do FIRST?', options: ['Apply butter', 'Put ice directly on it', 'Cool with running water for 10–20 min', 'Cover with a dry cloth immediately'], answer: 2 },
      ]
    },
  };

  const getAllCourses = () => {
    const custom = Storage.getCustomCourses();
    return [...courses, ...custom];
  };

  const getCourse = (id) => getAllCourses().find((c) => c.id === id);

  const getLesson = (courseId, lessonId) => {
    const course = getCourse(courseId);
    if (!course) return null;
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return { lesson, module: mod, course };
    }
    return null;
  };

  const getQuiz = (quizId) => quizzes[quizId] || null;

  const getCategories = () => {
    const cats = [...new Set(getAllCourses().map((c) => c.category))];
    return ['All', ...cats];
  };

  return { getAllCourses, getCourse, getLesson, getQuiz, getCategories };
})();
