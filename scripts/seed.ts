import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import {
  articles,
  articleTags,
  categories,
  tags,
  users,
} from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  const seedCategories = [
    {
      slug: "commercial",
      name: "Commercial",
      description:
        "Office towers, retail, industrial and mixed-use construction.",
      order: 1,
    },
    {
      slug: "residential",
      name: "Residential",
      description:
        "Single-family, multifamily and housing market construction.",
      order: 2,
    },
    {
      slug: "infrastructure",
      name: "Infrastructure",
      description:
        "Roads, bridges, transit, utilities and public works projects.",
      order: 3,
    },
    {
      slug: "safety-regulation",
      name: "Safety & Regulation",
      description:
        "OSHA rules, codes, enforcement and worker safety news.",
      order: 4,
    },
    {
      slug: "materials-equipment",
      name: "Materials & Equipment",
      description:
        "Steel, concrete, lumber and heavy equipment markets.",
      order: 5,
    },
    {
      slug: "technology",
      name: "Technology",
      description:
        "Construction software, robotics, BIM, drones and digital tools.",
      order: 6,
    },
  ];

  const seedTags = [
    { slug: "osha", name: "OSHA" },
    { slug: "fall-protection", name: "Fall protection" },
    { slug: "concrete", name: "Concrete" },
    { slug: "steel", name: "Steel" },
    { slug: "bim", name: "BIM" },
    { slug: "drones", name: "Drones" },
    { slug: "workforce", name: "Workforce" },
    { slug: "prefabrication", name: "Prefabrication" },
    { slug: "sustainability", name: "Sustainability" },
    { slug: "modular", name: "Modular" },
    { slug: "permits", name: "Permits" },
    { slug: "federal-funding", name: "Federal funding" },
    { slug: "data-centers", name: "Data centers" },
    { slug: "multifamily", name: "Multifamily" },
    { slug: "high-speed-rail", name: "High-speed rail" },
    { slug: "crane-safety", name: "Crane safety" },
    { slug: "materials-prices", name: "Materials prices" },
    { slug: "ai", name: "AI" },
    { slug: "surveying", name: "Surveying" },
    { slug: "digital-twins", name: "Digital twins" },
  ];

  console.log("Inserting categories...");
  await db.insert(categories).values(seedCategories).onConflictDoNothing();

  console.log("Inserting tags...");
  await db.insert(tags).values(seedTags).onConflictDoNothing();

  const [author] = await db
    .insert(users)
    .values({
      clerkId: "seed-author",
      email: "editor@buildwire.news",
      name: "BuildWire Editorial",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  const authorId = author?.id ?? null;

  type SeedArticle = {
    title: string;
    excerpt: string;
    body: string;
    categorySlug: string;
    tagSlugs: string[];
    region?: string;
    featured?: boolean;
    leadStory?: boolean;
    daysAgo: number;
  };

  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");

  const seedArticles: SeedArticle[] = [
    {
      title:
        "States Commit Record Funding to Replace Aging Highway Bridges",
      excerpt:
        "A new wave of federal and state bridge-replacement programs is set to award $12 billion in contracts this year, reshaping the infrastructure pipeline for general contractors.",
      body: `The nation's oldest bridges are getting a long-awaited financial shot in the arm. State departments of transportation are now moving more than $12 billion in bridge-replacement and rehabilitation work to procurement this year, according to a BuildWire analysis of state letting schedules and federal grant awards.

## Where the money is going

Three programs are driving the surge: the federal Bridge Investment Program, state-level bonding measures approved in the last two election cycles, and a series of large design-build mega-projects that had been stalled in permitting.

Pennsylvania, New York and Ohio lead in total programmed dollars, with Texas not far behind on a per-mile basis. Much of the early work is concentrated in urban corridors where structurally deficient spans carry heavy commuter traffic.

## What contractors should know

Industry observers note that the funding wave comes with tightened federal requirements, including buy-America provisions and a push toward durable, low-maintenance designs such as accelerated bridge construction (ABC) using prefabricated elements.

\`\`\`text
State        Programmed bridge spend
Pennsylvania $2.1B
New York     $1.8B
Ohio         $1.4B
Texas        $1.2B
\`\`\`

## The workforce question

The expanded pipeline is colliding with an ongoing shortage of ironworkers and concrete finishers. Several state agencies are partnering with community colleges to pre-train crews in ABC techniques, hoping to avoid the schedule slippage that has plagued other large programs.

The window for bidding is open now, and firms that prequalify early are positioning to capture a multi-year stream of work.`,
      categorySlug: "infrastructure",
      tagSlugs: ["federal-funding"],
      region: "Northeast",
      featured: true,
      leadStory: true,
      daysAgo: 1,
    },
    {
      title: "OSHA Issues Final Rule Strengthening Crane Operator Certification",
      excerpt:
        "The updated standard tightens qualification requirements and adds new inspection documentation duties for contractors operating cranes on federal construction sites.",
      body: `After a two-year rulemaking process, OSHA has published a final rule updating the crane operator certification standard under Subpart CC. The changes take effect in phases over the next 18 months and will affect virtually every commercial construction site in the country.

## What changes

The revised standard requires operators to hold certification from a nationally accredited testing organization, with certificates now valid for five years instead of a rolling basis. It also adds a requirement that employers maintain a current log of operator qualifications that inspectors can review on demand.

## New inspection duties

Site supervisors will be responsible for verifying that load charts are legible, rated capacity stickers are intact, and that annual inspection records are signed by a competent person. Failure to document these checks is now a citable condition independent of any actual equipment defect.

## Compliance timeline

- 90 days: Employers must begin tracking qualification logs
- 12 months: All operators must hold accredited certification
- 18 months: Full documentation requirements in effect

## Industry reaction

Contractor associations welcomed the clearer certification path but flagged the documentation burden. Smaller firms without dedicated safety staff are expected to adopt digital inspection tools to stay compliant.

"This is the most significant change to crane rules in a decade," said one regional safety director. "The firms that treat documentation as a cost rather than a control will be the ones that get hit in inspections."`,
      categorySlug: "safety-regulation",
      tagSlugs: ["osha", "crane-safety"],
      region: "National",
      featured: true,
      daysAgo: 2,
    },
    {
      title: "Multifamily Starts Slide as Financing Costs Bite Developer Pipeline",
      excerpt:
        "Apartment construction permits fell 11% quarter-over-quarter as higher-for-longer rates push developers to shelve projects — but a tailwind is building for 2027 deliveries.",
      body: `The multifamily boom is losing steam at the start of this year, with new apartment construction starts down 11% from the previous quarter and permit activity at a two-year low, according to the latest Census data.

## Why projects are stalling

Developers point to a single culprit: the cost of capital. With construction loan rates remaining elevated, projects that penciled at 6% debt costs a year ago no longer deliver acceptable returns. Lenders, meanwhile, have tightened loan-to-cost ratios and are demanding stronger pre-leasing commitments.

## Regional divergence

The slide is not uniform. Sun Belt markets including Charlotte, Nashville and Tampa continue to see steady starts, driven by in-migration and favorable land economics. Coastal markets — particularly California and the Northeast — are seeing the deepest pullbacks as land, labor and entitlement costs compound.

## The bright spot

Concessions are rising and effective rents have flattened, which analysts say will begin to ease the affordability pressure that defined the last two years. Construction costs have also softened modestly, with framing lumber and metal studs off their peaks.

The consensus among developers is that 2026 remains a year of digestion, with the current slowdown setting up a healthier delivery pipeline in 2027.`,
      categorySlug: "residential",
      tagSlugs: ["multifamily", "permits"],
      region: "South",
      daysAgo: 3,
    },
    {
      title: "Concrete Prices Climb as Cement Capacity Constraint Bites",
      excerpt:
        "Ready-mix prices rose for the fifth straight quarter, driven by tight domestic cement supply and rising freight costs. Builders are hedging with alternate designs.",
      body: `Ready-mix concrete prices rose for the fifth consecutive quarter, according to the latest producer price data, with regional increases ranging from 3% to 9% depending on market tightness. The persistent climb is now feeding directly into bid pricing on commercial and infrastructure work.

## The cement bottleneck

Domestic cement plants are running near capacity, and import supply has been squeezed by freight rates and tariffs on foreign clinker. The result is a structural gap between demand and available supply that has been building since the last capacity expansion cycle.

## What it means for bids

General contractors are responding with two strategies: accelerating value-engineering of concrete mixes to reduce cement content, and locking in supplier prices earlier in the bid cycle. Some large firms are now purchasing concrete supply commitments up to 12 months ahead of pour dates.

## Regional pressure points

The tightest markets are in the Southeast and Mountain West, where data-center and industrial construction is competing with highway work for the same batch plants. In contrast, the Northeast has seen more moderate increases as private commercial demand has cooled.

## Outlook

Analysts expect prices to stabilize by mid-year as a new domestic cement line comes online and freight rates ease. But they caution that the days of flat, predictable concrete pricing are likely over for the foreseeable future.`,
      categorySlug: "materials-equipment",
      tagSlugs: ["concrete", "materials-prices"],
      region: "Southeast",
      daysAgo: 4,
    },
    {
      title: "Drones Now Mandated on Federal Infrastructure Sites",
      excerpt:
        "The Federal Highway Administration is requiring drone-based progress documentation on all new projects above $25 million, signaling the end of the pilot era for aerial construction technology.",
      body: `Drone-based site documentation is moving from pilot project to standard practice. The Federal Highway Administration has quietly updated its construction management guidance to require periodic aerial data collection on all new federally funded projects above $25 million.

## What the mandate covers

Contractors must capture orthomosaic imagery and elevation models at defined milestones — typically monthly and at key structural phases. The data must be submitted in an open GIS format that state inspectors can overlay with design models.

## Why it matters

The requirement effectively standardizes what many leading firms were already doing voluntarily. It also creates a compliance floor for the rest of the industry, accelerating adoption of mapping software and drone pilots who can process raw flights into deliverable datasets.

## Cost and equipment

A compliant setup now starts at under $15,000 for a surveying-grade drone plus processing subscription. Firms that already owned photogrammetry software report marginal costs as low as a few hundred dollars per flight.

## The bigger shift

Observers read the guidance as the first step toward a broader push for digital project delivery. Expect similar requirements for laser scanning and digital twins on the largest projects within the next few years.`,
      categorySlug: "technology",
      tagSlugs: ["drones", "surveying", "digital-twins"],
      region: "National",
      daysAgo: 5,
    },
    {
      title: "CLT Takes on Steel in Mid-Rise Office Construction",
      excerpt:
        "Mass timber is winning an expanding share of mid-rise office and education work as codes change and owners price in embodied-carbon goals.",
      body: `Cross-laminated timber (CLT) is no longer a niche material. Mass timber buildings have captured a meaningful share of mid-rise office, education and civic projects, and structural engineers say the pipeline keeps growing.

## Why owners are switching

Three forces are converging: updated building codes that permit taller mass timber construction, corporate net-zero commitments that price in embodied carbon, and a construction cost environment where CLT's prefabricated panels can actually shorten schedules enough to offset their premium.

## The design advantage

For buildings between four and twelve stories, CLT competes directly with steel and concrete. The material's high strength-to-weight ratio reduces foundation loads, and its inherent fire performance — charring creates an insulating layer — has passed the code hearings that once limited its height.

## Manufacturing capacity

Domestic CLT plants have expanded capacity dramatically, shortening lead times that used to push projects to import panels from Europe. Supply is now a scheduling advantage rather than a constraint.

## What's next

Engineers are watching the first wave of mass timber buildings for long-term performance data, particularly on moisture and connection durability. The early evidence suggests the material is here to stay — and expanding.`,
      categorySlug: "commercial",
      tagSlugs: ["sustainability", "prefabrication"],
      region: "West",
      daysAgo: 6,
    },
    {
      title: "Prefabrication and Modular Are Reshaping the Construction Workforce",
      excerpt:
        "As more work moves off-site, contractors are rethinking training, pay structures and crew composition — and the shift is attracting a new generation of workers.",
      body: `The construction industry is quietly undergoing a structural change in how work gets done. A growing share of building components — from mechanical racks to entire bathroom pods — is now fabricated off-site in controlled facilities, then shipped to projects for rapid assembly.

## The shift in numbers

Prefabrication and modular construction now account for a meaningful share of commercial building value, with forecasts pointing to continued growth as owners demand faster schedules and tighter quality control.

## Workforce implications

The off-site shift is reshaping the workforce in ways that are often missed. Factory-based fabrication offers predictable schedules and climate-controlled work environments, which is attracting workers who previously passed on traditional site careers. Trade associations report growing interest from younger entrants drawn to automation-assisted production.

## New skill demands

- CAD and BIM technicians for factory detailing
- Equipment operators for automated fabrication lines
- Logistics coordinators for just-in-time delivery to sites
- Site crews trained in rapid assembly and connections

## The catch

The transition is not frictionless. On-site trades report that misaligned factory tolerances still cause costly field rework, and the industry is still learning how to sequence off-site production with unpredictable site conditions.

The firms investing in cross-training their crews — teaching both factory and field skills — are positioning themselves best for the decade ahead.`,
      categorySlug: "commercial",
      tagSlugs: ["prefabrication", "modular", "workforce"],
      region: "National",
      daysAgo: 7,
    },
    {
      title: "How the Latest Fall-Protection Rules Change Residential Roofing Work",
      excerpt:
        "A narrow but important regulatory update is tightening fall-protection expectations for smaller residential crews that previously operated under exemptions.",
      body: `Fall protection remains the construction industry's most-cited safety violation, and the latest regulatory activity signals that enforcement is getting tighter on residential work specifically.

## The rule at a glance

New guidance clarifies that residential roofing crews — long exempt from some commercial fall-protection requirements — must now demonstrate active fall-protection systems on any roof with a fall distance exceeding six feet, matching the standard long applied to commercial work.

## What compliance looks like in practice

For a typical single-family roof, compliant systems include anchor points certified for the expected load, personal fall-arrest equipment sized to the crew, and a written rescue plan. The guidance also documents expectations for ladder use and perimeter edge protection.

## Cost of compliance

A starter kit for a small roofing crew — anchors, harnesses, lanyards and training — runs roughly $3,000 to $6,000. Safety consultants note this is trivial compared with the average cost of a serious fall claim.

## Enforcement outlook

OSHA has signaled a focus on residential roofing this year, with state-plan states expected to follow. Contractors who cannot show a written fall-protection plan during an inspection should expect citations, even for a first offense.`,
      categorySlug: "safety-regulation",
      tagSlugs: ["osha", "fall-protection"],
      region: "National",
      daysAgo: 8,
    },
    {
      title: "Data-Center Boom Drives Record Demand for Electrical Contractors",
      excerpt:
        "Hyperscale facilities are absorbing an unprecedented share of the electrical trade's capacity, reshaping regional labor markets and bid dynamics.",
      body: `The data-center construction boom is straining the electrical contracting sector in ways the industry has never seen. Hyperscale facilities consume electrical capacity measured in hundreds of megawatts, and each one requires thousands of electrician-hours over a multi-year build.

## The demand gap

Regional electrical contractor associations report that data-center work is absorbing a disproportionate share of journeyman and apprentice capacity. In high-activity markets, some projects are competing for the same crews, driving up prevailing-wage labor costs and lengthening bid timelines.

## Ripple effects

The concentration of work is having knock-on effects across the market. Commercial and residential electrical bids in boom regions are rising as crews migrate to data-center pay. Some general contractors are now pre-scheduling electrical subcontractors 18 months out to secure capacity.

## The response

- Expanded apprenticeship programs sponsored by contractor associations
- Prefabricated electrical racks built off-site to compress field time
- Greater reliance on prefabrication and modular power distribution

## A structural shift

Analysts say the data-center wave is not a cyclical bump but a structural shift in electrical demand. The trades that expand their training pipeline now will hold pricing power for the rest of the decade.`,
      categorySlug: "technology",
      tagSlugs: ["data-centers", "workforce"],
      region: "Midwest",
      daysAgo: 9,
    },
    {
      title: "Steel Prices Stabilize After Two Years of Volatility",
      excerpt:
        "After a whipsaw couple of years, structural steel pricing has entered a calmer range. Here's what it means for upcoming bids and budgets.",
      body: `Structural steel prices have settled into their calmest range in three years, providing relief for contractors who spent the past two years re-bidding projects as material costs swung quarter to quarter.

## The new equilibrium

Domestic mill prices for wide-flange and HSS sections have moved within a narrow band over the last six months. Import volumes have normalized, and fabricators report that quoted prices are holding for 90-day windows instead of expiring weekly.

## What's driving stability

- Mill capacity has adjusted to demand
- Scrap prices have flattened
- Freight rates on imported steel have eased
- The 232 tariff landscape has stabilized

## Impact on bidding

Contractors can now hold steel prices in estimates with reasonable confidence, allowing fixed-price bids that were risky during the volatile period. Fabricators report that buyers are locking in earlier, which further stabilizes the supply chain.

## Watch factors

The stability could be tested by the same forces that triggered the last spike: mill outages, a sudden surge in import duties, or a demand shock from a large federal infrastructure program all landing in the same quarter. For now, the market is watching steel — not worrying about it.`,
      categorySlug: "materials-equipment",
      tagSlugs: ["steel", "materials-prices"],
      region: "National",
      daysAgo: 10,
    },
    {
      title: "AI Estimating Tools Are Winning Real Work — and Real Skeptics",
      excerpt:
        "Machine-learning takeoff and estimating platforms are moving from demos to daily use on live projects. Adoption is uneven, and the early data is instructive.",
      body: `Artificial intelligence is finally showing up on live construction estimates. A new wave of estimating platforms uses computer vision to perform quantity takeoffs from drawings, and machine-learning models to price assemblies from historical bid data. The results are genuinely useful — and genuinely uneven.

## What the tools do well

The strongest use cases are repetitive elements: conduit runs, wall assemblies, and standard foundations. On clean, well-structured drawings, AI takeoff tools can produce quantities that experienced estimators confirm at an accuracy approaching manual methods, in a fraction of the time.

## Where they stumble

The failure modes are instructive. Unusual details, poor drawing quality, and nonstandard assemblies still trip up the models. Estimators report that the tools occasionally miss elements entirely — and that over-reliance without spot-checking has produced embarrassing bid errors.

## The emerging workflow

The firms getting value are treating AI as a first-pass tool: generate quantities, then route them through senior estimator review. The time savings land in the takeoff phase, where automation is most reliable, while human judgment stays in pricing and risk.

## The bottom line

No one is running the whole bid on AI yet. But the workflow is clearly shifting, and estimators who learn to direct these tools are extending their leverage rather than losing their jobs.`,
      categorySlug: "technology",
      tagSlugs: ["ai"],
      region: "National",
      daysAgo: 11,
    },
    {
      title: "High-Speed Rail Procurement Opens Doors for Civil Contractors",
      excerpt:
        "The first tranche of high-speed rail construction packages is moving to market, offering a multi-decade pipeline for earthwork, bridge and track specialists.",
      body: `The long-promised era of high-speed rail construction is finally translating into procurement. The first major construction packages are moving to market, and civil contractors are lining up for what could become the largest sustained transportation build in a generation.

## The package structure

Initial packages are being let as design-build, pairing heavy civil contractors with specialist track and systems firms. Scopes include massive earthwork, viaducts, river crossings and tunnel bores — work that plays directly to established highway and bridge contractors.

## Capacity constraints

The scale is testing the industry's capacity. The program will require thousands of craft workers across multiple states, and early bids are already factoring aggressive recruiting and training budgets. Joint ventures are forming to spread risk across tunneling, structures and systems work.

## Why contractors should pay attention

- Multi-decade, predictable revenue stream
- Federal cost-sharing reduces owner funding risk
- Repeatable scope across successive segments
- Opportunities for emerging firms in station and systems work

## The caution

Megaproject schedule risk is real. Earlier high-profile rail projects demonstrated how permitting, utility relocations and environmental review can stretch timelines. Bidders are pricing contingency accordingly — and the winning teams will be those that treat the first segment as a learning platform for the ones that follow.`,
      categorySlug: "infrastructure",
      tagSlugs: ["high-speed-rail", "federal-funding"],
      region: "West",
      daysAgo: 12,
    },
    {
      title: "The Modular Housing Push Finally Meets Financing Reality",
      excerpt:
        "Factory-built housing has attracted billions in investment and bold promises. The next phase depends on lenders and appraisers getting comfortable with the model.",
      body: `Modular construction has attracted serious capital and serious skepticism in equal measure. The latest wave of factory-built housing projects is testing whether the financing ecosystem — lenders, appraisers and insurers — can catch up to the manufacturing model.

## The production advantage

Modular's core argument is unchanged and strong: building in a climate-controlled factory cuts weather risk, improves quality control, and compresses on-site timelines dramatically. A six-unit apartment building can go from foundation to occupancy in months rather than a year.

## The financing bottleneck

The friction is in the lending stack. Construction lenders are comfortable financing site-built work with familiar draw schedules. Financing modules in a factory — where the bulk of value sits before anything is on the site — requires different risk analysis, and many lenders still default to what they know.

## Progress and friction points

- Appraisers are learning to value modular homes at parity with site-built
- Insurers are issuing coverage for modules in transit and storage
- But title and lien treatment varies state to state
- And draw schedules remain misaligned with factory production

## What would unlock the market

Standardized state approval, more completed projects in lender portfolios, and a few high-profile successes are the levers. Every completed modular development de-risks the next one. The industry's job now is simply to keep building.`,
      categorySlug: "residential",
      tagSlugs: ["modular", "multifamily"],
      region: "Northeast",
      daysAgo: 13,
    },
    {
      title: "BIM Maturity Is Splitting the Industry Into Two Tiers",
      excerpt:
        "Owners increasingly require model-based delivery on larger projects, creating a widening gap between firms with mature BIM pipelines and everyone else.",
      body: `Building information modeling (BIM) has passed an inflection point. On larger projects, owners now routinely require model-based delivery as a condition of award — and the gap between firms with mature BIM pipelines and those without is becoming the industry's defining competitive divide.

## What owners now ask for

Beyond the traditional clash detection, owners are requiring digital handover packages: as-built models tied to facility management systems, model-based quantity verification, and construction sequencing simulations that feed schedule review.

## The two-tier effect

- Tier one firms deliver models that drive procurement, fabrication and field verification
- Tier two firms still treat models as a documentation exercise produced to satisfy a contract clause
- Owners are learning to tell the difference at award time

## Where the value shows up

Firms that connect the model to fabrication are seeing the biggest returns. Steel detailers, mechanical prefabricators and concrete formwork suppliers all consume model geometry directly. The firms that close that loop cut waste, shorten schedules and win repeat work.

## The path forward

The barrier is no longer software — it's process and training. Medium-sized firms are closing the gap by investing in model managers rather than just licenses. The industry is being remade around the model, and the pace is accelerating.`,
      categorySlug: "technology",
      tagSlugs: ["bim", "digital-twins"],
      region: "National",
      daysAgo: 14,
    },
    {
      title: "Regional Construction Activity Outlook: Where the Work Is Heading",
      excerpt:
        "A region-by-region breakdown of construction activity, from data-center clusters in the Midwest to port expansions on the Gulf Coast.",
      body: `Construction activity is diverging sharply by region, and contractors that read the regional maps early are positioning themselves for the strongest pipelines. Here's where the work is heading over the next 18 months.

## Southeast: industrial and data-center boom

The Southeast continues to lead in industrial and data-center construction, with Atlanta, Charlotte and the Nashville corridor absorbing massive investment. Labor is the constraint, and firms are importing crews from the Midwest to keep pace.

## Midwest: manufacturing renaissance

The Midwest is seeing a manufacturing revival, with battery plants and semiconductor facilities driving big-ticket work. The region's deep pool of skilled trades is a competitive advantage, though it is starting to tighten in the most active corridors.

## Gulf Coast: energy and port investment

Gulf Coast ports are expanding to handle growing container volumes, and energy infrastructure continues to drive heavy civil work. The combination of marine and process construction is sustaining specialized contractors.

## West: infrastructure and transit

California's infrastructure and transit programs, alongside continued mass timber adoption in the Pacific Northwest, are sustaining demand — offset by the deepest housing pullback in the country.

## Northeast: cautious but steady

The Northeast is the most cautious market, with private commercial work flat but public bridge and transit investment keeping civil contractors busy. The message for contractors: the national market is not one market.`,
      categorySlug: "commercial",
      tagSlugs: ["data-centers", "workforce"],
      region: "National",
      featured: true,
      daysAgo: 15,
    },
    {
      title: "What the New Silica Enforcement Sweep Means for Site Managers",
      excerpt:
        "A coordinated inspection initiative is putting respirable silica on every site manager's radar. Here's what compliance looks like on the ground.",
      body: `A coordinated enforcement initiative focused on respirable crystalline silica has raised the stakes for site managers across the country. The inspections are checking not just whether dust controls exist, but whether they're being used and documented.

## The standard, briefly

The silica rule limits worker exposure to respirable crystalline silica and requires employers to use engineering controls, provide respiratory protection when needed, and conduct medical surveillance for workers exposed at the action level.

## What inspectors are checking

- Wet cutting and vacuum systems actually running on saws and grinders
- Housekeeping — no dry sweeping or compressed-air dust cleanup
- Exposure assessments documented and available for review
- Medical surveillance records for covered trades

## Common citations

The most frequent violations aren't exotic. Missing written exposure control plans, expired respirator fit testing, and housekeeping practices that reintroduce dust top the list. All three are straightforward to fix and easy to miss in the daily rush.

## The compliance checklist

1. Written exposure control plan updated and signed
2. Wet methods available at every cutting station
3. Respiratory protection program current
4. Training log current for covered workers

Sites that treat the sweep as a one-time event rather than a culture change will be the ones citing repeat violations a year from now.`,
      categorySlug: "safety-regulation",
      tagSlugs: ["osha"],
      region: "National",
      daysAgo: 16,
    },
    {
      title: "Fleet Electrification Comes for Construction Equipment",
      excerpt:
        "Battery-electric excavators and loaders are moving beyond demonstration sites into revenue work. Early adopters are publishing the operating-cost numbers.",
      body: `Electric construction equipment has crossed the line from demonstration to deployment. Battery-electric excavators, loaders and telehandlers are now running revenue work on real projects, and early adopters are publishing the numbers that decide whether the rest of the industry follows.

## The operating cost case

The economics are strongest where the duty cycle fits: short-haul loaders, urban excavators working fixed areas, and equipment that returns to a central charging point. In those applications, fuel and maintenance savings can offset the higher purchase price within the first few years.

## The charging question

Charging infrastructure remains the sticking point. Sites without adequate power need mobile charging units or generators — which undercut the emissions argument but still beat diesel on noise, a genuine advantage on urban and night work.

## What's working now

- Compact excavators on utility and street work
- Telehandlers in material yards and warehouses
- Loaders on recycling and short-haul duty

## What's next

Battery density improvements and declining cell costs are pushing the economic crossover point forward each year. Analysts expect the mid-size excavator market — the industry's workhorse — to hit commercial viability for fleet operators within the next few years.`,
      categorySlug: "materials-equipment",
      tagSlugs: ["sustainability"],
      region: "National",
      daysAgo: 17,
    },
    {
      title: "Permit Timelines Are Getting Faster — Here's the Playbook",
      excerpt:
        "A wave of municipal reforms is shortening approval cycles for housing and commercial projects. Developers who design for the new rules are ahead of the curve.",
      body: `Permit timelines — long a complaint and a source of project risk — are finally getting faster in many markets. Municipalities facing housing pressures have adopted administrative approvals, pre-approved plans and digital portals, and the developers who design for these new rules are capturing the advantage.

## What's changing

- Administrative (by-right) approval for qualifying residential projects
- Pre-approved accessory and small commercial building plans
- Online permit portals with automated completeness checks
- One-stop permitting for expedited residential review

## Designing for speed

The projects moving fastest are those designed to hit the new thresholds: conforming to zoning by right, using pre-approved plan sets where available, and submitting digital files in the format the portal accepts. Every deviation adds weeks or months.

## The playbook

1. Confirm the qualifying criteria before design starts
2. Use pre-approved plans where the scope fits
3. Submit complete, portal-native documentation
4. Budget contingency — but measure against the new baseline

## The signal

The trend reflects a political consensus that permitting speed matters for affordability and economic development. It is not universal — some markets remain slow — but the direction of travel is clear, and the firms that institutionalize speed will win the projects that follow.`,
      categorySlug: "residential",
      tagSlugs: ["permits"],
      region: "West",
      daysAgo: 18,
    },
    {
      title: "Why Thermal Imaging Is Becoming a Standard Site Safety Tool",
      excerpt:
        "Thermal cameras are catching overloaded circuits, overheating equipment and — crucially — signs of fatigue or medical distress in workers before incidents occur.",
      body: `Thermal imaging has moved off the niche shelf and into the standard safety toolkit on large sites. The technology, long used for electrical inspection, is finding a second life as a proactive safety and reliability tool.

## Electrical and equipment checks

On the reliability side, thermal cameras catch overloaded circuits, failing bearings and hot connections before they become fires or downtime events. Safety programs that run periodic thermal sweeps report fewer equipment-related near-misses and a measurable drop in electrical incidents.

## The human dimension

More controversially, thermal imaging is being studied as an early warning for worker fatigue and heat stress. Core-temperature proxies derived from skin temperature can flag workers approaching dangerous heat exposure before symptoms are visible — a genuine advance for summer work in hot climates.

## Implementation notes

- Entry-level thermal cameras now cost under $1,000
- Integrated with existing drone programs for roof and facade sweeps
- Requires trained interpreters to produce actionable findings

## The takeaway

Thermal data turns invisible risk into visible problems. The sites that adopt it early are building a safety record that pays off in insurance premiums, bids and — most importantly — in crews that go home healthy.`,
      categorySlug: "safety-regulation",
      tagSlugs: ["fall-protection"],
      region: "National",
      daysAgo: 19,
    },
    {
      title: "The Case for On-Site Waste-to-Value Programs",
      excerpt:
        "Forward-thinking GCs are turning demolition and construction waste into a cost center — not a cost line item. Here's how the math works.",
      body: `Construction and demolition waste is one of the industry's largest and least-touched cost lines. But a growing number of general contractors are rethinking waste as a resource, and the results are showing up on the profit side of the ledger.

## The scale of the problem

Building projects routinely waste 5-10% of materials, and demolition produces waste streams that are still trucked to landfills in most markets. Every yard hauled away is a cost multiplied by disposal fees, hauling and the environmental impact nobody wants to advertise.

## The value program

The most effective programs sort at the source rather than at the bin:

- Concrete crushed and reused as sub-base on the same site
- Steel and copper separated and sold to scrap markets
- Clean wood chipped for erosion control
- Drywall and cardboard segregated for recycling

## The math

Firms that run source-separated programs report disposal costs dropping by a third to a half, with recovered metal and aggregate sales further offsetting costs. On a $50 million project, that recovery is meaningful, and it's increasingly a requirement on sustainability-minded work.

## Getting started

Start with the big three — concrete, metal and clean wood — and measure before optimizing. The habit of measuring is the real unlock. Waste that's measured gets managed, and managed waste gets priced into bids as an advantage rather than a risk.`,
      categorySlug: "materials-equipment",
      tagSlugs: ["sustainability"],
      region: "National",
      daysAgo: 20,
    },
    {
      title: "Infrastructure Projects Race to Close Before Funding Deadlines",
      excerpt:
        "With federal funding deadlines approaching, agencies are accelerating project closeouts — and contractors are navigating compressed schedules and inspection queues.",
      body: `A quiet deadline-driven scramble is underway across state highway and transit programs. Federal funding windows tied to the last big infrastructure bill are expiring, and agencies are accelerating project closeouts to lock in reimbursement before deadlines lapse.

## What's happening

State DOTs are moving project completions forward, in some cases advancing punch-list work and final inspections. The push is squeezing regional construction schedules as contractors absorb compressed closeout timelines across multiple projects at once.

## The contractor impact

- Tightened deadlines for final quantities and change-order documentation
- Lengthening queues for final inspections in busy regions
- Pressure on commissioning and testing windows
- Earlier-than-expected need for closeout crews

## How to stay ahead

Firms that front-load documentation — tracking as-built changes, maintaining change-order files in real time and scheduling final testing early — are avoiding the end-of-project crunch. The agencies that manage the deadline pressure best are the ones that prioritize closeout readiness in their contractor evaluations.

## The takeaway

The funding window is a one-time opportunity, and the closing is now as important as the opening. The contractors who treat closeout as a disciplined process rather than an afterthought are the ones converting this infrastructure wave into a durable competitive position.`,
      categorySlug: "infrastructure",
      tagSlugs: ["federal-funding"],
      region: "National",
      daysAgo: 21,
    },
  ];

  console.log("Inserting articles...");
  for (const s of seedArticles) {
    const [inserted] = await db
      .insert(articles)
      .values({
        title: s.title,
        slug: slug(s.title),
        excerpt: s.excerpt,
        body: s.body,
        categorySlug: s.categorySlug,
        status: "published",
        featured: s.featured ?? false,
        leadStory: s.leadStory ?? false,
        region: s.region,
        authorId,
        authorName: "BuildWire Editorial",
        publishedAt: new Date(
          Date.now() - s.daysAgo * 24 * 60 * 60 * 1000,
        ),
      })
      .returning({ id: articles.id });

    if (inserted && s.tagSlugs.length) {
      await db
        .insert(articleTags)
        .values(s.tagSlugs.map((tagSlug) => ({ articleId: inserted.id, tagSlug })))
        .onConflictDoNothing();
    }
  }

  console.log(`Seeded ${seedArticles.length} articles.`);
  await client.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
