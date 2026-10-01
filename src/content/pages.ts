/**
 * Copy for the secondary pages, verbatim from the current STARS website.
 * Unconfirmed items are tracked in docs/CONTENT-CHECKLIST.md.
 */

export type Step = { title: string; body: string };

/* ── Our approach ─────────────────────────────────────────── */

export type ApproachPillar = {
  id: string;
  name: string;
  title: string;
  body: string;
  looksLike: string[];
  link?: { label: string; href: string };
};

export const approachPillars: ApproachPillar[] = [
  {
    id: "relationships",
    name: "Relationships & connection",
    title: "Children learn from people they trust.",
    body: "Before a child can work on a new skill, they need to feel safe with the adult beside them. We invest in relationships first — learning each child’s cues, comforts and interests — because connection is what makes learning possible.",
    looksLike: [
      "Greeting each child by name at eye level.",
      "Staying with a child through a hard moment instead of sending them away.",
    ],
  },
  {
    id: "regulation",
    name: "Regulation",
    title: "A calm body and brain are ready to learn.",
    body: "“Regulation” means being able to return to calm after stress, excitement or frustration. Young children can’t do this alone yet — they borrow calm from the adults around them. We help children build that skill step by step.",
    looksLike: [
      "Calm-down spaces in classrooms.",
      "Breathing and movement routines.",
      "Adults who stay steady when a child is upset.",
    ],
  },
  {
    id: "conscious-discipline",
    name: "Conscious Discipline",
    title: "A shared approach to feelings, behavior and belonging.",
    body: "Conscious Discipline is a widely used social-emotional learning approach for schools and early childhood programs. It gives adults and children a common set of skills for staying calm, solving problems and caring for one another — and treats everyday conflicts as chances to teach, not punish.",
    looksLike: [
      "Classroom routines that build a sense of family.",
      "Helping children name feelings.",
      "Teaching what to do instead of only saying “stop.”",
    ],
    link: { label: "Learn more at consciousdiscipline.com", href: "https://consciousdiscipline.com/" },
  },
  {
    id: "adult-first",
    name: "Adult First",
    title: "Adults manage their own emotions first.",
    body: "Children mirror the adults around them. An “Adult First” mindset means our staff practice noticing and managing their own stress, so they can respond to children with patience instead of reacting. It shapes how we support our team, too.",
    looksLike: [
      "A teacher taking a breath before responding.",
      "Leaders who make space for staff to reset.",
      "A calmer building for everyone.",
    ],
  },
  {
    id: "sensory-informed",
    name: "Sensory-informed",
    title: "Every sense matters.",
    body: "Some children experience sound, light, touch, taste or movement more intensely than others — or seek out more of it. What can look like “misbehavior” is often a child’s body asking for help. We notice those needs and plan for them.",
    looksLike: [
      "Sensory play built into each day.",
      "Movement breaks.",
      "Adjusting lighting, noise or seating for a child who needs it.",
    ],
  },
  {
    id: "neuroaffirming",
    name: "Neuroaffirming",
    title: "Different, not less.",
    body: "Children’s brains work in many different ways. A neuroaffirming approach respects those differences — including autistic children and children with other developmental differences — and builds on each child’s strengths, rather than trying to make them appear “typical.”",
    looksLike: [
      "Honoring a child’s way of communicating, whether that’s words, pictures or a device.",
      "Building goals around independence and joy, not conformity.",
    ],
  },
];

export const approachForFamilies = [
  "Your child is known as a whole person — not a list of goals.",
  "Hard moments are met with patience and teaching, not punishment.",
  "Sensory and communication differences are understood and supported.",
  "Progress is measured by what matters in your family’s daily life.",
] as const;

/* ── About ────────────────────────────────────────────────── */

export const aboutStory = [
  "STARS Academy was established in 2009 as a locally owned and operated therapy clinic and developmental preschool. Today we have two family-friendly facilities in Batesville and a highly educated, experienced team with diverse backgrounds.",
  "Teamwork is central to who we are. We celebrate our culture with the people we serve and the people who serve alongside us — and we believe that, together, we can meet and exceed the needs and expectations of every child.",
  "Over the years, our work has been shaped by what we’ve learned from children themselves: that they thrive when they feel safe, connected and understood. That belief now guides everything from our classrooms to how we support our own team.",
] as const;

export const aboutVision =
  "STARS Academy embraces the belief that there is something good in every day. We provide a superior therapeutic environment that fosters individual treatment for each child and family, building the foundation for their future success story.";

/* ── Services overview ────────────────────────────────────── */

export const togetherReasons: Step[] = [
  {
    title: "One plan, shared goals",
    body: "Teachers, therapists and nurses work from the same understanding of your child — so everyone is pulling in the same direction.",
  },
  {
    title: "Skills practiced all day",
    body: "A new word from speech therapy gets used at snack time. A calming strategy from OT gets used during a hard transition. Practice happens in real moments.",
  },
  {
    title: "Less running around",
    body: "Instead of driving between a preschool and separate therapy appointments, your child’s care happens here, during the day.",
  },
];

/* ── Getting started ──────────────────────────────────────── */

export const goodFitSignals = [
  "Your child is between birth and age six.",
  "Your child is behind in talking, understanding, moving, playing or self-care.",
  "Your child has a diagnosis such as autism, Down syndrome or cerebral palsy, or was born prematurely.",
  "Your child has medical needs — like tube feedings, breathing treatments or seizures — that make a typical preschool or daycare hard.",
  "A doctor, therapist, school or early intervention program has suggested developmental services.",
] as const;

export const eligibilityFactors: Step[] = [
  {
    title: "Active health insurance",
    body: "Day treatment is paid for through Medicaid funding, including ARKids First-A, SSI and TEFRA. We can check your child’s coverage.",
  },
  {
    title: "A qualifying evaluation",
    body: "Your child qualifies for developmental services and at least one of: speech therapy, occupational therapy, physical therapy or nursing services.",
  },
  {
    title: "A prescription from your child’s doctor",
    body: "Treatment must be prescribed by your child’s primary care physician.",
  },
];

export const firstCallToFirstDay: Step[] = [
  { title: "Reach out", body: "Call us or send an inquiry below. Tell us a little about your child — we’ll listen and answer your questions." },
  { title: "Visit STARS", body: "Tour the classrooms and therapy spaces and meet the people who would work with your child." },
  { title: "Evaluation", body: "Your child’s development is evaluated to see where support would help." },
  { title: "Prescription", body: "Your child’s primary care physician reviews the results and prescribes treatment at STARS." },
  { title: "Welcome to STARS", body: "We check your child’s coverage, build an individual plan with you and set a first day." },
];

/* ── Referrals ────────────────────────────────────────────── */

export const referralSteps: Step[] = [
  { title: "Talk with the family", body: "Share STARS as an option. Families can call us directly or request a tour — we’ll take it from there." },
  { title: "Send the referral", body: "Contact our team by phone or with the form below." },
  { title: "We connect with the family", body: "STARS contacts the family, arranges evaluation and a tour, and verifies coverage." },
  { title: "Coordinated care", body: "Our therapists and nurses communicate with the child’s physicians and other professionals as needed." },
];

export const referralSpeechApproaches =
  "Assistive technology and devices, Beckman Oral Motor Protocol, Picture Exchange Communication System (PECS), Kaufman Speech Praxis, Oral-Placement Therapy (TalkTools), DIR/Floortime, the Social Thinking curriculum and Zones of Regulation";

export const schoolTransition =
  "The move from preschool to public school is a big one. Our team works with parents and local school districts to make that transition as smooth as possible.";

/* ── Careers ──────────────────────────────────────────────── */

export const whyStars: Step[] = [
  {
    title: "A true interdisciplinary team",
    body: "Speech, occupational and physical therapists, nurses and classroom teams work under one roof, around the same children — every day, not just at a quarterly meeting.",
  },
  {
    title: "Time to really know each child",
    body: "Children spend the whole day at STARS. You see how they play, eat, move and communicate across the day — and your work carries over into real moments.",
  },
  {
    title: "A culture that takes care of adults, too",
    body: "Our Adult First mindset recognizes that caring well for children starts with the adults who do it. Regulated, supported adults are the foundation of the work.",
  },
  {
    title: "An approach you can believe in",
    body: "Relationship-based, sensory-informed and neuroaffirming. If you’ve wanted to practice this way, you’ll be among colleagues who share it.",
  },
];

export type Role = {
  id: "ecds" | "ecdt" | "van-rider" | "van-driver" | "clinical";
  team: string;
  title: string;
  body: string;
  requirements: string[];
};

export const openRoles: Role[] = [
  {
    id: "ecds",
    team: "Classroom",
    title: "Early Childhood Developmental Specialist (ECDS)",
    body: "Lead a classroom team — carrying out daily routines, targeting developmentally appropriate goals and objectives, and keeping the room safe and loving — while working with therapists and nurses across STARS to help children achieve real success.",
    requirements: ["Four-year degree with an emphasis in early childhood education"],
  },
  {
    id: "ecdt",
    team: "Classroom",
    title: "Early Childhood Developmental Technician (ECDT)",
    body: "Work alongside an Early Childhood Developmental Specialist in an infant, toddler or preschool classroom, helping maintain a safe, positive and loving environment where children can grow.",
    requirements: ["High school diploma or GED", "Pre-employment drug screen"],
  },
  {
    id: "van-rider",
    team: "Transportation",
    title: "Van Rider",
    body: "Help the van driver get children safely to and from STARS in clinic-owned vehicles. After morning routes, van riders join a classroom to support the teaching team.",
    requirements: ["High school diploma or GED", "Pre-employment drug screen"],
  },
  {
    id: "van-driver",
    team: "Transportation",
    title: "Van Driver",
    body: "Safely transport children to and from STARS in clinic-owned vehicles.",
    requirements: ["High school diploma or GED", "At least 25 years of age", "Pre-employment drug screen"],
  },
  {
    id: "clinical",
    team: "Therapy",
    title: "Therapists & Nurses",
    body: "Speech-language pathologists, occupational therapists, physical therapists, therapy assistants and licensed nurses who want to work as part of a true interdisciplinary team.",
    requirements: ["Current Arkansas licensure for your discipline"],
  },
];

export const hiringSteps: Step[] = [
  { title: "Tell us about you", body: "Send your details using our short online form." },
  { title: "Complete the application", body: "Fill out the official STARS employment application online." },
  { title: "Meet the team", body: "Interview, tour the building and ask us anything." },
  {
    title: "Welcome aboard",
    body: "Complete any pre-employment requirements for your role, such as a drug screen, and start orientation.",
  },
];

/* ── Current families ─────────────────────────────────────── */

export const familyTopics = [
  {
    id: "hours",
    title: "Hours & closures",
    body: ["STARS is open Monday – Friday, 7:00 a.m. – 3:00 p.m."],
  },
  {
    id: "absences",
    title: "Absences",
    body: ["If your child will be absent, please let us know as early as possible by calling 870-793-3200."],
  },
  {
    id: "transportation",
    title: "Transportation",
    body: [
      "STARS operates clinic-owned vans to bring children to and from the clinic. Van drivers and van riders work together to keep children safe along the way.",
    ],
  },
  {
    id: "health",
    title: "Health & medications",
    body: [
      "Our licensed nurses coordinate your child’s care with you and your child’s health care provider.",
      "If your child’s medications, diet or health needs change, please tell the nursing team as soon as possible so they can update the care plan.",
    ],
  },
  {
    id: "kindergarten",
    title: "Kindergarten transition",
    body: [
      "We want every child to leave STARS ready for kindergarten. Our team works with parents and local school districts to make the move to public school as smooth as possible.",
    ],
  },
] as const;

/* ── Contact ──────────────────────────────────────────────── */

export const whoHandlesWhat = [
  { team: "New families & enrollment", body: "Questions about eligibility, tours and getting started.", key: "gettingStarted" },
  { team: "Physicians & referral partners", body: "Referrals, prescriptions and care coordination.", key: "referrals" },
  { team: "Current families", body: "Attendance, transportation and day-to-day questions.", key: "families" },
  { team: "Careers & human resources", body: "Open positions, applications and interviews.", key: "careers" },
] as const;
