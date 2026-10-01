/**
 * The five STARS disciplines. Copy is taken from the current site's service
 * pages. `color` drives the matching point of the 3D service star.
 */
export type ServiceSlug =
  | "developmental-classrooms"
  | "speech-therapy"
  | "occupational-therapy"
  | "physical-therapy"
  | "nursing-care";

export type Service = {
  slug: ServiceSlug;
  name: string;
  short: string;
  /** Hex color used in UI accents and the 3D star point. */
  color: string;
  eyebrow: string;
  headline: string;
  intro: string;
  what: string;
  whoFor: string;
  signals: string[];
  provides: string[];
  steps: { title: string; body: string }[];
  expectations: string[];
  connects: { with: ServiceSlug; body: string }[];
  /** Clinical scope for physicians & referral partners. */
  scope?: string[];
};

export const services: Service[] = [
  {
    slug: "developmental-classrooms",
    name: "Developmental Classrooms",
    short: "Learning, play, routines, kindergarten readiness",
    color: "#f28fe0",
    eyebrow: "Developmental classrooms",
    headline: "A preschool day, designed around how children grow.",
    intro:
      "STARS classrooms look and feel like a warm, well-run preschool. The difference is that every part of the day — play, meals, routines, even the walk down the hall — is planned around each child’s developmental goals, with therapists and nurses as part of the team.",
    what:
      "Our classrooms are developmentally appropriate learning spaces for infants, toddlers and preschoolers. Each room is set up so children can learn and play at their own pace — with active play, quiet play and sensory play woven through the day.",
    whoFor:
      "Children from birth to age six who qualify for developmental services and benefit from learning in a group, with extra support close at hand.",
    signals: [
      "Your child is behind other children their age in talking, moving, playing or self-care.",
      "Group settings like daycare or church nursery have been hard for your child.",
      "A doctor, therapist or specialist has recommended developmental services.",
      "You want your child to start kindergarten with confidence — and with support already in place.",
    ],
    provides: [
      "Infant, toddler and preschool classrooms",
      "Each classroom team led by an Early Childhood Developmental Specialist with a four-year degree in early childhood education",
      "Developmental technicians who support children throughout the day",
      "Active, quiet and sensory play designed to build motor, language, social and self-help skills",
      "Therapy and nursing care that happen alongside the classroom day, not in a separate building",
      "Kindergarten transition planning with your family and your local school district",
    ],
    steps: [
      {
        title: "Arrival and connection",
        body: "Children are greeted by familiar adults and ease into the day. A calm, predictable start helps every child feel safe enough to learn.",
      },
      {
        title: "Play with a purpose",
        body: "Centers, circle time and outdoor play are set up so each child is practicing the skills in their plan — whether that’s climbing, stacking, asking for a turn or trying a new food.",
      },
      {
        title: "Therapy woven in",
        body: "Speech, occupational and physical therapists work with children individually and in the classroom, so new skills carry over into real moments.",
      },
      {
        title: "Care throughout the day",
        body: "Our licensed nurses handle medications, feedings and health needs on site, so children with medical needs can take part fully.",
      },
    ],
    expectations: [
      "A predictable daily rhythm that helps children feel secure.",
      "Adults who notice what your child is communicating — with or without words.",
      "Regular updates about your child’s day and progress.",
      "Support preparing for kindergarten, including coordination with your school district.",
    ],
    connects: [
      { with: "speech-therapy", body: "Speech therapists help children use new words and communication tools during real classroom moments." },
      { with: "occupational-therapy", body: "Occupational therapists help shape sensory-friendly routines and self-care skills like eating and dressing." },
      { with: "physical-therapy", body: "Physical therapists help children access classroom and playground activities safely and independently." },
    ],
  },
  {
    slug: "speech-therapy",
    name: "Speech Therapy",
    short: "Talking, understanding, social connection, eating & swallowing",
    color: "#b67cf5",
    eyebrow: "Speech & language therapy",
    headline: "Helping children be understood — and understand the world around them.",
    intro:
      "Communication is how children ask for what they need, make friends and learn. Our pediatric speech-language therapists help children from infancy through age six with talking, understanding, social connection, and eating and swallowing.",
    what:
      "Speech-language therapy supports every part of communication — understanding words, using words, speech sounds, social communication, and the mouth skills needed for eating and swallowing. For children who aren’t yet using words, it can also mean picture systems or assistive technology that give them a voice.",
    whoFor:
      "Infants, toddlers and preschoolers up to age six with speech, language, social communication or feeding challenges — including children with developmental delays, autism, hearing loss, Down syndrome and other diagnoses.",
    signals: [
      "Your child isn’t saying as many words as other children their age, or isn’t combining words yet.",
      "People outside your family have a hard time understanding your child.",
      "Your child gets frustrated because they can’t tell you what they want.",
      "Your child has trouble with eating, drinking or swallowing.",
      "Your child finds it hard to play or take turns with other children.",
    ],
    provides: [
      "Individual therapy in private treatment rooms, so children can focus",
      "Evaluations and therapy offered in Spanish",
      "An individual treatment plan built with your family and your child’s whole STARS team",
      "Assistive technology supports and devices, and picture-based communication such as PECS",
      "Therapists with extensive pediatric training and experience with a wide range of needs",
    ],
    steps: [
      {
        title: "Evaluation",
        body: "A speech-language therapist gets to know your child through play and standardized testing to understand their strengths and where support would help.",
      },
      {
        title: "A plan built together",
        body: "Your child’s therapist works with you and the rest of the STARS team — teachers, occupational and physical therapists, and nurses — to set goals that matter in daily life.",
      },
      {
        title: "Therapy sessions",
        body: "Children work one-on-one with their therapist in a private room during the STARS day.",
      },
      {
        title: "Carry-over into the day",
        body: "Because therapists and teachers work side by side, the words and tools your child learns in therapy get practiced in the classroom, at lunch and on the playground.",
      },
    ],
    expectations: [
      "Sessions that feel like play — because play is how young children learn best.",
      "A therapist who explains what they’re working on and how you can help at home.",
      "Progress reviews and updated goals as your child grows.",
    ],
    connects: [
      { with: "developmental-classrooms", body: "Teachers use the same communication tools in the classroom that your child practices in therapy." },
      { with: "occupational-therapy", body: "Occupational therapists partner on feeding, sensory and play skills that affect communication." },
      { with: "nursing-care", body: "Nurses coordinate on feeding and swallowing plans." },
    ],
    scope: [
      "Developmental delays",
      "Autism spectrum disorder",
      "Receptive and expressive language disorders",
      "Social-pragmatic language disorders and social-emotional development",
      "Childhood apraxia of speech",
      "Fluency disorders",
      "Hearing impairment",
      "Feeding and swallowing disorders",
      "Down syndrome",
      "Cognitive impairments and learning disabilities",
    ],
  },
  {
    slug: "occupational-therapy",
    name: "Occupational Therapy",
    short: "Sensory needs, big feelings, self-care, using hands",
    color: "#6f7df5",
    eyebrow: "Occupational therapy",
    headline: "Play is the work of childhood. We help children do it well.",
    intro:
      "Occupational therapy helps children with the everyday skills that let them take part in life — handling big feelings and busy environments, feeding and dressing themselves, using their hands, and playing with others.",
    what:
      "For young children, “occupation” means the things they do all day — play, eat, get dressed, explore and get along with others. Occupational therapists help children build the skills behind those activities, with special attention to how a child’s body and senses respond to the world.",
    whoFor:
      "Children from birth to age six who have difficulty with sensory processing, self-care, fine-motor or coordination skills, or with managing emotions and transitions.",
    signals: [
      "Everyday sounds, textures, clothing or crowds seem to overwhelm your child — or your child constantly seeks movement and touch.",
      "Meltdowns, transitions or calming down are especially hard.",
      "Using hands for things like grasping, stacking or scribbling is difficult.",
      "Your child needs a lot of help with dressing, eating or other self-care skills for their age.",
    ],
    provides: [
      "Individual occupational therapy built around your child’s strengths and needs",
      "Support for sensory processing, using sensory integration techniques and neurological approaches",
      "Help with self-care skills such as eating and dressing",
      "Fine-motor and visual-motor skill building for grasping, playing and early drawing",
      "Social-emotional support that helps children recognize and manage big feelings",
      "Close collaboration with your family, teachers, other therapists and your child’s doctors",
    ],
    steps: [
      {
        title: "Evaluation",
        body: "An occupational therapist observes your child in play and daily routines and uses standardized tools to understand how they process sensory information and use their bodies.",
      },
      {
        title: "An individual plan",
        body: "Goals are built around what matters to your family — a calmer morning, getting dressed with less help, playing alongside other children.",
      },
      {
        title: "Therapy through play",
        body: "Sessions use movement, textures, games and play to build skills in ways that feel natural and motivating.",
      },
      {
        title: "Support across the day",
        body: "Therapists share strategies with classroom teams so sensory supports and calming routines are part of your child’s whole day.",
      },
    ],
    expectations: [
      "A therapist who sees behavior as communication and helps you understand what your child’s body is telling you.",
      "Practical ideas you can use at home.",
      "Progress you can see in daily life — not just in the therapy room.",
    ],
    connects: [
      { with: "developmental-classrooms", body: "Therapists help shape sensory-friendly classroom routines and calm-down spaces." },
      { with: "speech-therapy", body: "Speech therapists partner on the social-emotional and regulation skills that make communication possible." },
      { with: "physical-therapy", body: "Physical therapists work on the strength and coordination that support fine-motor skills." },
    ],
    scope: [
      "Sensory processing",
      "Social-emotional skills and self-regulation",
      "Self-care skills",
      "Fine-motor and visual-motor skills",
      "Motor coordination",
    ],
  },
  {
    slug: "physical-therapy",
    name: "Physical Therapy",
    short: "Crawling, walking, balance, strength, equipment",
    color: "#3aa6e0",
    eyebrow: "Physical therapy",
    headline: "Helping children move, explore and reach for more.",
    intro:
      "Our physical therapists help children build the strength, balance and coordination to explore their world as independently as possible — from rolling and crawling to walking, climbing and keeping up with friends.",
    what:
      "Pediatric physical therapy supports how children move — developmental milestones like sitting, crawling and walking, as well as balance, coordination, strength and motor planning. It also includes helping families find the right adaptive equipment.",
    whoFor:
      "Children from birth to age six who are behind in motor milestones or have conditions that affect movement, such as cerebral palsy, low muscle tone or prematurity.",
    signals: [
      "Your child is late to sit, crawl, stand or walk.",
      "Your child seems stiff or floppy, or favors one side of the body.",
      "Your child falls often or has trouble with balance and coordination.",
      "Your child needs equipment like orthotics, a stander or a wheelchair — or you’re not sure what would help.",
    ],
    provides: [
      "Individual physical therapy from licensed physical therapists",
      "A dedicated therapy gym for building strength, movement and daily-life skills",
      "Work on developmental skills, motor planning, balance, coordination and manipulation skills",
      "Assessment for orthotics and adaptive equipment, including wheelchairs, gait trainers and standers",
      "Coordination with your family, physicians, nurses, teachers and other therapists",
    ],
    steps: [
      {
        title: "Evaluation",
        body: "A physical therapist assesses how your child moves, plays and gets around, and talks with you about your goals.",
      },
      {
        title: "An individual plan",
        body: "Your child’s plan focuses on the movement skills that will make the biggest difference in their daily life.",
      },
      {
        title: "Therapy in the gym — and beyond",
        body: "Children work on crawling, walking, balance and coordination in the therapy gym, and therapists help carry those skills into the classroom and playground.",
      },
      {
        title: "Equipment and follow-through",
        body: "When a child needs orthotics or adaptive equipment, therapists evaluate the need and coordinate with families and physicians.",
      },
    ],
    expectations: [
      "Sessions built on play and movement your child enjoys.",
      "A therapist who communicates with you and, when needed, with your child’s physicians.",
      "Guidance on positioning, equipment and activities you can use at home.",
    ],
    connects: [
      { with: "developmental-classrooms", body: "Therapists help children access classroom and playground activities safely and independently." },
      { with: "occupational-therapy", body: "Occupational therapists build on physical strength and coordination for fine-motor and self-care skills." },
      { with: "nursing-care", body: "Nurses coordinate care for children with medical conditions that affect movement." },
    ],
    scope: [
      "Developmental motor skills — rolling, sitting, crawling, standing and walking",
      "Motor planning, balance, coordination and manipulation skills",
      "Strength and functional mobility for daily activities",
      "Evaluation for orthotics and adaptive equipment such as wheelchairs, gait trainers and standers",
    ],
  },
  {
    slug: "nursing-care",
    name: "Nursing Care",
    short: "Medications, feedings, respiratory & complex medical needs",
    color: "#d6418f",
    eyebrow: "On-site nursing care",
    headline: "Medical needs shouldn’t keep a child from learning and play.",
    intro:
      "STARS has full-time licensed nurses on staff at our facilities. They care for everything from a skinned knee to children with complex medical needs, so every child can take part in the full STARS day.",
    what:
      "Our nursing team supports each child’s health throughout the day, working with families, therapists, teachers and each child’s own health care provider. We believe children with developmental delays or chronic conditions are healthy as they learn to thrive with their unique needs.",
    whoFor:
      "Every child at STARS — and especially children who need medications, feedings, respiratory support or other medical care during the day.",
    signals: [
      "Your child needs medication, breathing treatments or other care during the day.",
      "Your child has feeding needs such as tube feedings, thickened liquids or food allergies.",
      "Your child has a chronic or complex medical condition, and you’ve worried that a typical preschool or daycare couldn’t care for them safely.",
    ],
    provides: [
      "Full-time licensed nurses on staff at our facilities",
      "Medication administration and breathing treatments",
      "Care for complex needs including tube feedings, trach care, supplemental oxygen, catheterization and ostomy care",
      "Coordination with your child’s physicians and specialists",
      "Frequent communication with families about health and well-being",
    ],
    steps: [
      {
        title: "Health intake",
        body: "When your child enrolls, our nurses review health history, medications and care plans with you and your child’s providers.",
      },
      {
        title: "A coordinated care plan",
        body: "Nurses share what teachers and therapists need to know, so your child’s health needs are understood by everyone who works with them.",
      },
      {
        title: "Care throughout the day",
        body: "Nurses provide scheduled and as-needed care on site, and communicate with you about anything important.",
      },
    ],
    expectations: [
      "Nurses who know your child — not just their chart.",
      "Clear, frequent communication, especially for children with chronic or acute conditions.",
      "A team that coordinates with your child’s whole health care team.",
    ],
    connects: [
      { with: "developmental-classrooms", body: "Nursing care means children with medical needs can join classroom life fully." },
      { with: "speech-therapy", body: "Nurses and speech therapists coordinate on feeding and swallowing plans." },
      { with: "physical-therapy", body: "Nurses and physical therapists coordinate care for children with conditions that affect movement." },
    ],
    scope: [
      "Nutritional needs, including tube feedings, thickened liquids and food allergies",
      "Respiratory conditions, including chronic respiratory disease",
      "Breathing treatments and supplemental oxygen",
      "Tracheostomy care",
      "Medication administration",
      "Catheterization",
      "Ostomy care",
      "Epilepsy",
      "Cerebral palsy",
      "Infants and toddlers born prematurely",
      "Immunization verification",
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
