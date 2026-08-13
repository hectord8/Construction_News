import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import {
  articles,
  articleTags,
  categories,
  followedCategories,
  savedArticles,
  tags,
  users,
} from "../src/lib/db/schema";
import { REGIONS } from "../src/lib/regions";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const shouldReset = process.argv.includes("--reset");

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  if (shouldReset) {
    console.log("Resetting existing content...");
    await db.delete(articleTags);
    await db.delete(savedArticles);
    await db.delete(followedCategories);
    await db.delete(articles);
    await db.delete(tags);
    await db.delete(categories);
  }

  const seedCategories = [
    {
      slug: "commercial",
      name: "Commercial",
      description:
        "Office, retail, industrial and mixed-use construction.",
      order: 1,
    },
    {
      slug: "residential",
      name: "Residential",
      description:
        "Housebuilding, flats, build-to-rent and housing market construction.",
      order: 2,
    },
    {
      slug: "infrastructure",
      name: "Infrastructure",
      description:
        "Roads, rail, HS2, utilities and public works projects.",
      order: 3,
    },
    {
      slug: "safety-regulation",
      name: "Safety & Regulation",
      description:
        "HSE rules, Building Regulations, the Building Safety Act and worker safety news.",
      order: 4,
    },
    {
      slug: "materials-equipment",
      name: "Materials & Equipment",
      description:
        "Steel, concrete, timber and plant and equipment markets.",
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
    { slug: "hse", name: "HSE" },
    { slug: "fall-protection", name: "Fall protection" },
    { slug: "concrete", name: "Concrete" },
    { slug: "steel", name: "Steel" },
    { slug: "bim", name: "BIM" },
    { slug: "drones", name: "Drones" },
    { slug: "workforce", name: "Workforce" },
    { slug: "prefabrication", name: "Prefabrication" },
    { slug: "sustainability", name: "Sustainability" },
    { slug: "modular", name: "Modular" },
    { slug: "planning", name: "Planning" },
    { slug: "public-funding", name: "Public funding" },
    { slug: "data-centers", name: "Data centres" },
    { slug: "housebuilding", name: "Housebuilding" },
    { slug: "high-speed-rail", name: "High-speed rail" },
    { slug: "crane-safety", name: "Crane safety" },
    { slug: "materials-prices", name: "Materials prices" },
    { slug: "ai", name: "AI" },
    { slug: "surveying", name: "Surveying" },
    { slug: "digital-twins", name: "Digital twins" },
    { slug: "building-safety-act", name: "Building Safety Act" },
    { slug: "net-zero", name: "Net zero" },
    { slug: "hs2", name: "HS2" },
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
        "Councils and National Highways Commit Record Funding to Replace Ageing Bridges",
      excerpt:
        "A new wave of funding from the road investment strategy and council capital programmes is set to release £3.2 billion in bridge-replacement contracts this year, reshaping the infrastructure pipeline for civil contractors.",
      body: `Some of the country's oldest bridge assets are getting a long-awaited financial shot in the arm. National Highways and local authorities are now moving more than £3.2 billion in bridge-replacement and rehabilitation work into procurement this year, according to a BuildWire analysis of capital programmes and government grant awards.

## Where the money is going

Three streams are driving the surge: the third Road Investment Strategy (RIS3) settlement for the strategic road network, the local roads fund distributed through combined authorities, and a wave of maintenance-driven schemes that had been stalled by a decade of underinvestment.

The backlog is substantial — an estimated 3,000-plus bridge structures across the network have reached the end of their designed life. Much of the early work is concentrated in the North West, the Midlands and the South West, where ageing concrete spans carry heavy traffic.

## What contractors should know

The funding wave comes with tightened requirements: modern methods of construction (MMC), carbon reporting on materials, and a push towards durable, low-maintenance designs such as accelerated bridge construction (ABC) using prefabricated deck units.

\`\`\`text
Region       Programmed bridge spend
North West   £640M
Midlands     £510M
South West   £380M
Scotland     £290M
\`\`\`

## The workforce question

The expanded pipeline is colliding with an ongoing shortage of steel fixers and concrete workers. Several contractors are partnering with colleges and CITB to pre-train crews in ABC techniques, hoping to avoid the schedule slippage that has plagued other large programmes.

The window for bidding is open now, and firms that prequalify early are positioning to capture a multi-year stream of work.`,
      categorySlug: "infrastructure",
      tagSlugs: ["public-funding"],
      region: "National",
      featured: true,
      leadStory: true,
      daysAgo: 1,
    },
    {
      title: "HSE Tightens Rules on Crane and Lifting Operations",
      excerpt:
        "Updated guidance under the Lifting Operations and Lifting Equipment Regulations adds tougher competence checks and record-keeping duties for firms running cranes on UK sites.",
      body: `After a period of sustained enforcement pressure, the Health and Safety Executive (HSE) has published updated guidance on crane and lifting operations. The changes tighten expectations around competence, thorough examination and lift planning under LOLER 1998 and PUWER 1998.

## What changes

The revised guidance requires operators to hold recognised, current competence certification — typically an NVQ or equivalent accredited scheme — with training records now expected to be verified on a rolling basis. It also clarifies that every lift must be planned by a competent appointed person, with written lift plans retained on site.

## New documentation duties

Site supervisors will be responsible for confirming that load charts are legible, rated-capacity stickers are intact, and that thorough examination records are signed by a competent person. Failure to document these checks is now treated as a citable condition independent of any actual equipment defect.

## Compliance timeline

- Immediate: Appointed persons must be identified for every lift
- 6 months: All operators must hold recognised competence certification
- 12 months: Full documentation and record-keeping requirements in effect

## Industry reaction

Contractor associations welcomed the clearer competence path but flagged the paperwork burden. Smaller firms without dedicated safety staff are expected to adopt digital inspection tools to stay compliant.

"This is the most significant change to lifting rules in a decade," said one regional safety director. "The firms that treat documentation as a cost rather than a control will be the ones that get hit in inspections."`,
      categorySlug: "safety-regulation",
      tagSlugs: ["hse", "crane-safety"],
      region: "National",
      featured: true,
      daysAgo: 2,
    },
    {
      title: "Build-to-Rent Starts Slide as Financing Costs Bite Developer Pipeline",
      excerpt:
        "Apartment and build-to-rent starts fell 9% quarter-on-quarter as higher borrowing costs push developers to shelve schemes — but a tailwind is building for 2028 completions.",
      body: `The build-to-rent boom is losing steam at the start of this year, with new apartment starts down 9% from the previous quarter and site-starts at a two-year low, according to the latest ONS and industry housebuilding data.

## Why projects are stalling

Developers point to a single culprit: the cost of capital. With construction finance rates remaining elevated, schemes that pencilled at 4.5% debt costs a year ago no longer deliver acceptable returns. Lenders, meanwhile, have tightened loan-to-cost ratios and are demanding stronger pre-leasing commitments before advancing funds.

## Regional divergence

The slide is not uniform. Manchester, Leeds and Birmingham continue to see steady starts, driven by city-centre rental demand and favourable land economics. London — particularly the inner boroughs — is seeing the deepest pullbacks as land, s106 obligations and construction costs compound.

## The bright spot

Rents are flattening and incentives are rising, which analysts say will begin to ease the affordability pressure that defined the last two years. Construction costs have also softened modestly, with timber, steel and concrete blocks off their peaks.

The consensus among developers is that this year remains one of digestion, with the current slowdown setting up a healthier delivery pipeline for 2028.`,
      categorySlug: "residential",
      tagSlugs: ["housebuilding", "planning"],
      region: "London",
      daysAgo: 3,
    },
    {
      title: "Concrete Prices Climb as Cement Capacity Constraint Bites",
      excerpt:
        "Ready-mix prices rose for the fifth straight quarter, driven by tight UK cement supply and rising energy and freight costs. Contractors are hedging with alternate mix designs.",
      body: `Ready-mix concrete prices rose for the fifth consecutive quarter, according to the latest producer price data, with regional increases ranging from 3% to 9% depending on market tightness. The persistent climb is now feeding directly into bid pricing on commercial and infrastructure work.

## The cement bottleneck

Domestic cement plants are running near capacity, and import supply has been squeezed by freight rates and carbon-accounting costs on foreign clinker. The result is a structural gap between demand and available supply that has been building since the last capacity expansion cycle in the mid-2010s.

## What it means for bids

General contractors are responding with two strategies: accelerating value-engineering of concrete mixes to reduce cement content, and locking in supplier prices earlier in the bid cycle. Some large firms are now purchasing concrete supply commitments up to 12 months ahead of pour dates.

## Regional pressure points

The tightest markets are in the South East and the Midlands, where data-centre and industrial construction is competing with highways work for the same batching plants. In contrast, Scotland has seen more moderate increases as private commercial demand has cooled.

## Outlook

Analysts expect prices to stabilise by mid-year as a new domestic cement line comes online and freight rates ease. But they caution that the days of flat, predictable concrete pricing are likely over for the foreseeable future.`,
      categorySlug: "materials-equipment",
      tagSlugs: ["concrete", "materials-prices"],
      region: "England",
      daysAgo: 4,
    },
    {
      title: "Drone Monitoring Becomes Standard on Major Infrastructure Schemes",
      excerpt:
        "National Highways and major scheme clients are now requiring drone-based progress surveys on all projects above £50 million, ending the pilot era for aerial construction technology.",
      body: `Drone-based site documentation is moving from pilot project to standard practice. National Highways has updated its construction management requirements to mandate periodic aerial data collection on all major schemes above £50 million.

## What the requirement covers

Contractors must capture orthomosaic imagery and elevation models at defined milestones — typically monthly and at key structural phases. The data must be submitted in an open GIS format that inspectors can overlay with design models and digital-twin environments.

## Why it matters

The requirement effectively standardises what many leading firms were already doing voluntarily. It also creates a compliance floor for the rest of the industry, accelerating adoption of mapping software and of drone pilots who can process raw flights into deliverable datasets.

## Cost and equipment

A compliant setup now starts at under £12,000 for a surveying-grade drone plus processing subscription. Firms that already owned photogrammetry software report marginal costs as low as a few hundred pounds per flight.

## The bigger shift

Observers read the guidance as the first step towards a broader push for digital project delivery. Expect similar requirements for laser scanning and digital twins on the largest projects within the next few years.`,
      categorySlug: "technology",
      tagSlugs: ["drones", "surveying", "digital-twins"],
      region: "National",
      daysAgo: 5,
    },
    {
      title: "Mass Timber Takes on Steel in UK Mid-Rise Office Construction",
      excerpt:
        "Cross-laminated timber is winning an expanding share of mid-rise office and education work as Approved Document B changes and net-zero targets drive owners towards engineered timber.",
      body: `Cross-laminated timber (CLT) is no longer a niche material. Mass timber buildings have captured a meaningful share of mid-rise office, education and civic projects, and structural engineers say the pipeline keeps growing.

## Why owners are switching

Three forces are converging: updated fire-safety provisions under Approved Document B that permit taller engineered timber construction, corporate net-zero commitments that price in embodied carbon, and a construction cost environment where CLT's prefabricated panels can shorten programmes enough to offset their premium.

## The design advantage

For buildings between four and twelve storeys, CLT competes directly with steel and concrete. The material's high strength-to-weight ratio reduces foundation loads, and its inherent fire performance — charring creates an insulating layer — has passed the regulatory reviews that once limited its height.

## Manufacturing capacity

UK and Scottish CLT plants have expanded capacity dramatically, shortening lead times that used to push projects to import panels from Europe. Supply is now a scheduling advantage rather than a constraint.

## What's next

Engineers are watching the first wave of mass timber buildings for long-term performance data, particularly on moisture and connection durability. The early evidence suggests the material is here to stay — and expanding.`,
      categorySlug: "commercial",
      tagSlugs: ["sustainability", "prefabrication", "net-zero"],
      region: "England",
      daysAgo: 6,
    },
    {
      title: "Prefabrication and Modern Methods of Construction Are Reshaping the UK Workforce",
      excerpt:
        "As more work moves off-site, contractors are rethinking training, pay structures and crew composition — and the shift is attracting a new generation of workers.",
      body: `The construction industry is quietly undergoing a structural change in how work gets done. A growing share of building components — from mechanical racks to entire bathroom pods — is now fabricated off-site in controlled facilities, then shipped to projects for rapid assembly.

## The shift in numbers

Modern methods of construction (MMC) now account for a meaningful share of commercial and residential building value, with government policy and client mandates pointing to continued growth as owners demand faster programmes and tighter quality control.

## Workforce implications

The off-site shift is reshaping the workforce in ways that are often missed. Factory-based fabrication offers predictable hours and climate-controlled environments, which is attracting workers who previously passed on traditional site careers. Trade bodies report growing interest from younger entrants drawn to automation-assisted production.

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
      title: "HSE Clamps Down on Falls from Height on Residential Sites",
      excerpt:
        "Falls from height remain the biggest single cause of fatal construction accidents in the UK. New enforcement focus is tightening expectations for housebuilding crews.",
      body: `Falls from height remain the construction industry's most-cited cause of fatal injury, and the latest enforcement activity signals that HSE is taking a harder line on housebuilding work specifically.

## The rules at a glance

The Work at Height Regulations 2005 apply wherever a person could fall a distance liable to cause personal injury — there is no arbitrary six-foot cut-off. New guidance makes clear that roofing crews on smaller residential schemes must demonstrate active fall-protection systems, matching the standard long applied to commercial work.

## What compliance looks like in practice

For a typical new-build roof, compliant systems include certified anchor points, personal fall-arrest equipment sized to the crew, and a written rescue plan. The guidance also documents expectations for ladder use, scaffold edge protection and fragile roof materials.

## Cost of compliance

A starter kit for a small roofing crew — anchors, harnesses, lanyards and training — runs roughly £2,500 to £5,000. Safety consultants note this is trivial compared with the average cost of a serious fall claim.

## Enforcement outlook

HSE has signalled a focus on housebuilding this year, and duty holders who cannot show a written fall-protection plan during an inspection should expect enforcement action, even for a first offence.`,
      categorySlug: "safety-regulation",
      tagSlugs: ["hse", "fall-protection"],
      region: "National",
      daysAgo: 8,
    },
    {
      title: "Data-Centre Boom Drives Record Demand for Electrical Contractors",
      excerpt:
        "Hyperscale facilities are absorbing an unprecedented share of the UK electrical trade's capacity, reshaping regional labour markets and bid dynamics.",
      body: `The UK data-centre construction boom is straining the electrical contracting sector in ways the industry has never seen. Hyperscale facilities consume electrical capacity measured in tens of megawatts, and each one requires thousands of electrician-hours over a multi-year build.

## The demand gap

Regional electrical contractors report that data-centre work is absorbing a disproportionate share of apprentice and skilled-electrician capacity. In high-activity markets — the M25 corridor, Hertfordshire, Slough and Greater Manchester — some projects are competing for the same crews, driving up labour costs and lengthening bid timelines.

## Ripple effects

The concentration of work is having knock-on effects across the market. Commercial and residential electrical bids in boom regions are rising as crews migrate to data-centre pay. Some general contractors are now pre-scheduling electrical subcontractors 18 months out to secure capacity.

## The response

- Expanded apprenticeship programmes sponsored by contractor federations
- Prefabricated electrical racks built off-site to compress site time
- Greater reliance on modular power distribution

## A structural shift

Analysts say the data-centre wave is not a cyclical bump but a structural shift in electrical demand. The trades that expand their training pipeline now will hold pricing power for the rest of the decade.`,
      categorySlug: "technology",
      tagSlugs: ["data-centers", "workforce"],
      region: "England",
      daysAgo: 9,
    },
    {
      title: "Steel Prices Stabilise After Two Years of Volatility",
      excerpt:
        "After a whipsaw couple of years, structural steel pricing has entered a calmer range. Here's what it means for upcoming bids and budgets.",
      body: `Structural steel prices have settled into their calmest range in three years, providing relief for contractors who spent the past two years re-bidding projects as material costs swung quarter to quarter.

## The new equilibrium

UK mill prices for wide-flange and HSS sections have moved within a narrow band over the last six months. Import volumes have normalised, and fabricators report that quoted prices are holding for 90-day windows instead of expiring weekly.

## What's driving stability

- Mill capacity has adjusted to demand
- Scrap prices have flattened
- Freight rates on imported steel have eased
- Carbon-border pricing uncertainty has, for now, been priced in

## Impact on bidding

Contractors can now hold steel prices in estimates with reasonable confidence, allowing fixed-price bids that were risky during the volatile period. Fabricators report that buyers are locking in earlier, which further stabilises the supply chain.

## Watch factors

The stability could be tested by the same forces that triggered the last spike: mill outages, a sudden surge in import duties, or a demand shock from a large public infrastructure programme all landing in the same quarter. For now, the market is watching steel — not worrying about it.`,
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

The firms getting value are treating AI as a first-pass tool: generate quantities, then route them through senior estimator review. The time savings land in the takeoff phase, where automation is most reliable, while human judgement stays in pricing and risk.

## The bottom line

No one is running the whole bid on AI yet. But the workflow is clearly shifting, and estimators who learn to direct these tools are extending their leverage rather than losing their jobs.`,
      categorySlug: "technology",
      tagSlugs: ["ai"],
      region: "National",
      daysAgo: 11,
    },
    {
      title: "HS2 and Northern Powerhouse Rail Open Procurement for Civil Contractors",
      excerpt:
        "The next tranche of high-speed rail construction packages is moving to market, offering a multi-decade pipeline for earthwork, bridge and track specialists.",
      body: `The era of high-speed rail construction in the UK is finally translating into procurement. The next major construction packages are moving to market, and civil contractors are lining up for what could become the largest sustained transport build in a generation.

## The package structure

The latest packages are being let as design-build, pairing heavy civil contractors with specialist track and systems firms. Scopes include massive earthworks, viaducts, river crossings and tunnel bores — work that plays directly to established highways and rail contractors.

## Capacity constraints

The scale is testing the industry's capacity. The programme will require thousands of craft workers across multiple regions, and early bids are already factoring aggressive recruiting and training budgets. Joint ventures are forming to spread risk across tunnelling, structures and systems work.

## Why contractors should pay attention

- Multi-decade, predictable revenue stream
- Public cost-sharing reduces client funding risk
- Repeatable scope across successive contract packages
- Opportunities for emerging firms in stations and systems work

## The caution

Megaproject schedule risk is real. Earlier high-profile rail projects demonstrated how consenting, utility diversions and archaeology can stretch timelines. Bidders are pricing contingency accordingly — and the winning teams will be those that treat the first packages as a learning platform for the ones that follow.`,
      categorySlug: "infrastructure",
      tagSlugs: ["hs2", "high-speed-rail", "public-funding"],
      region: "Midlands",
      daysAgo: 12,
    },
    {
      title: "The Modular Housing Push Finally Meets Financing Reality",
      excerpt:
        "Factory-built housing has attracted billions in investment and bold promises. The next phase depends on lenders, valuers and insurers getting comfortable with the model.",
      body: `Modular construction has attracted serious capital and serious scepticism in equal measure. The latest wave of factory-built housing projects is testing whether the financing ecosystem — lenders, valuers and insurers — can catch up to the manufacturing model.

## The production advantage

Modular's core argument is unchanged and strong: building in a climate-controlled factory cuts weather risk, improves quality control, and compresses on-site programmes dramatically. A six-unit apartment building can go from foundation to occupation in months rather than a year.

## The financing bottleneck

The friction is in the lending stack. Development lenders are comfortable financing site-built work with familiar draw schedules. Financing modules in a factory — where the bulk of value sits before anything is on the site — requires different risk analysis, and many lenders still default to what they know.

## Progress and friction points

- Valuers are learning to value modular homes at parity with site-built
- Insurers are issuing cover for modules in transit and storage
- But title and collateral treatment still varies scheme by scheme
- And draw schedules remain misaligned with factory production

## What would unlock the market

Standardised product acceptance through the Building Safety Regime, more completed projects in lender portfolios, and a few high-profile successes are the levers. Every completed modular development de-risks the next one. The industry's job now is simply to keep building.`,
      categorySlug: "residential",
      tagSlugs: ["modular", "housebuilding"],
      region: "National",
      daysAgo: 13,
    },
    {
      title: "BIM Maturity Is Splitting the Industry Into Two Tiers",
      excerpt:
        "Clients increasingly require model-based delivery on larger projects, creating a widening gap between firms with mature BIM pipelines and everyone else.",
      body: `Building information modelling (BIM) has passed an inflection point. On larger projects, clients now routinely require model-based delivery as a condition of award — and the gap between firms with mature BIM pipelines and those without is becoming the industry's defining competitive divide.

## What clients now ask for

Beyond the traditional clash detection, clients are requiring digital handover packages: as-built models tied to facility management systems, model-based quantity verification, and construction sequencing simulations that feed programme review. Standards like ISO 19650 are now written into most public-sector contracts.

## The two-tier effect

- Tier one firms deliver models that drive procurement, fabrication and site verification
- Tier two firms still treat models as a documentation exercise produced to satisfy a contract clause
- Clients are learning to tell the difference at award time

## Where the value shows up

Firms that connect the model to fabrication are seeing the biggest returns. Steel detailers, mechanical prefabricators and concrete formwork suppliers all consume model geometry directly. The firms that close that loop cut waste, shorten programmes and win repeat work.

## The path forward

The barrier is no longer software — it's process and training. Medium-sized firms are closing the gap by investing in information managers rather than just licences. The industry is being remade around the model, and the pace is accelerating.`,
      categorySlug: "technology",
      tagSlugs: ["bim", "digital-twins"],
      region: "National",
      daysAgo: 14,
    },
    {
      title: "UK Construction Activity Outlook: Where the Work Is Heading",
      excerpt:
        "A region-by-region breakdown of UK construction activity, from data-centre clusters in the South East to infrastructure programmes in Scotland and the North.",
      body: `Construction activity is diverging sharply across the UK, and contractors that read the regional maps early are positioning themselves for the strongest pipelines. Here's where the work is heading over the next 18 months.

## London and the South East: data centres and commercial

London and its M25 corridor continue to lead in data-centre and commercial refurbishment work. The region remains the country's biggest market, though it is also the most sensitive to financing costs and planning delays.

## The North West: regeneration and levelling-up

The North West is seeing a regeneration revival, with Manchester and Liverpool driving big-ticket residential and office schemes. The region's deep pool of skilled trades is a competitive advantage, though it is starting to tighten in the most active corridors.

## Scotland: infrastructure and net zero

Scotland's infrastructure programmes — including roads, energy transition and water — continue to sustain heavy civil work, alongside a strong pipeline of net-zero and offshore-related onshore facilities.

## Wales and Northern Ireland: public sector-led

Wales is one of the few markets where public sector-led education and health schemes are sustaining specialised contractors, while Northern Ireland continues to see steady civil and housing work supported by the devolved settlement.

## The message

The UK market is not one market. The strongest pipelines sit where public funding, planning reform and structural demand align — and the firms that read those local signals early are the ones winning the work.`,
      categorySlug: "commercial",
      tagSlugs: ["data-centers", "workforce"],
      region: "National",
      featured: true,
      daysAgo: 15,
    },
    {
      title: "HSE Silica Enforcement Sweep Raises the Bar for Site Managers",
      excerpt:
        "A coordinated inspection initiative focused on respirable crystalline silica has raised the stakes for site managers across the UK. Here's what compliance looks like on the ground.",
      body: `A coordinated enforcement initiative focused on respirable crystalline silica (RCS) has raised the stakes for site managers across the country. The inspections are checking not just whether dust controls exist, but whether they're being used and documented under COSHH.

## The rules, briefly

The Control of Substances Hazardous to Health Regulations require employers to prevent or control worker exposure to RCS, provide respiratory protection where needed, and carry out health surveillance for workers exposed at the action level.

## What inspectors are checking

- Wet cutting and vacuum systems actually running on saws and grinders
- Housekeeping — no dry sweeping or compressed-air dust cleanup
- Exposure assessments documented and available for review
- Health surveillance records for covered trades

## Common enforcement findings

The most frequent issues aren't exotic. Missing written exposure control plans, expired face-fit testing, and housekeeping practices that reintroduce dust top the list. All three are straightforward to fix and easy to miss in the daily rush.

## The compliance checklist

1. Written exposure control plan updated and signed
2. Wet methods available at every cutting station
3. RPE programme current, including face-fit testing
4. Training log current for covered workers

Sites that treat the sweep as a one-time event rather than a culture change will be the ones facing repeat enforcement a year from now.`,
      categorySlug: "safety-regulation",
      tagSlugs: ["hse"],
      region: "National",
      daysAgo: 16,
    },
    {
      title: "Fleet Electrification Comes for UK Construction Plant",
      excerpt:
        "Battery-electric excavators and loaders are moving beyond demonstration sites into revenue work. Early adopters are publishing the operating-cost numbers.",
      body: `Electric construction plant has crossed the line from demonstration to deployment. Battery-electric excavators, loaders and telehandlers are now running revenue work on real projects, and early adopters are publishing the numbers that decide whether the rest of the industry follows.

## The operating cost case

The economics are strongest where the duty cycle fits: short-haul loaders, urban excavators working fixed areas, and machines that return to a central charging point. In those applications, fuel and maintenance savings can offset the higher purchase price within the first few years.

## The charging question

Charging infrastructure remains the sticking point. Sites without adequate power need mobile charging units or generators — which undercut the emissions argument but still beat diesel on noise, a genuine advantage on urban and night work.

## What's working now

- Compact excavators on utility and highway work
- Telehandlers in material yards and warehouses
- Loaders on recycling and short-haul duty

## What's next

Battery density improvements and declining cell costs are pushing the economic crossover point forward each year. Analysts expect the mid-size excavator market — the industry's workhorse — to hit commercial viability for fleet owners within the next few years.`,
      categorySlug: "materials-equipment",
      tagSlugs: ["sustainability", "net-zero"],
      region: "National",
      daysAgo: 17,
    },
    {
      title: "Planning Approval Timelines Are Getting Faster — Here's the Playbook",
      excerpt:
        "A wave of planning reform — from permitted development rights to new national policy — is shortening approval cycles for housing and commercial projects.",
      body: `Planning timelines — long a source of complaint and project risk — are finally getting faster in many parts of the UK. Authorities facing housing pressures have adopted more efficient determination routes, and the developers who design for these new rules are capturing the advantage.

## What's changing

- Broadened permitted development rights for qualifying residential conversions
- "Brownfield passports" fast-tracking development on previously used land
- Digital planning portals with automated completeness checks
- Performance targets on local authorities for major applications

## Designing for speed

The projects moving fastest are those designed to hit the new thresholds: conforming to local plan policy, using pre-application advice, and submitting complete digital files in the format the portal accepts. Every deviation adds weeks or months.

## The playbook

1. Confirm the qualifying criteria before design starts
2. Use pre-application engagement to resolve issues early
3. Submit complete, portal-native documentation
4. Budget contingency — but measure against the new baseline

## The signal

The trend reflects a political consensus that planning speed matters for housing supply and economic growth. It is not universal — some authorities remain slow — but the direction of travel is clear, and the firms that institutionalise speed will win the projects that follow.`,
      categorySlug: "residential",
      tagSlugs: ["planning", "housebuilding"],
      region: "England",
      daysAgo: 18,
    },
    {
      title: "Why Thermal Imaging Is Becoming a Standard Site Safety Tool",
      excerpt:
        "Thermal cameras are catching overloaded circuits, overheating equipment and — crucially — signs of fatigue or medical distress in workers before incidents occur.",
      body: `Thermal imaging has moved off the niche shelf and into the standard safety toolkit on large sites. The technology, long used for electrical inspection, is finding a second life as a proactive safety and reliability tool.

## Electrical and equipment checks

On the reliability side, thermal cameras catch overloaded circuits, failing bearings and hot connections before they become fires or downtime events. Safety programmes that run periodic thermal sweeps report fewer equipment-related near-misses and a measurable drop in electrical incidents.

## The human dimension

More controversially, thermal imaging is being studied as an early warning for worker fatigue and heat stress. Core-temperature proxies derived from skin temperature can flag workers approaching dangerous heat exposure before symptoms are visible — a genuine advance for summer work in hot weather.

## Implementation notes

- Entry-level thermal cameras now cost under £800
- Integrates with existing drone programmes for roof and facade sweeps
- Requires trained interpreters to produce actionable findings

## The takeaway

Thermal data turns invisible risk into visible problems. The sites that adopt it early are building a safety record that pays off in insurance premiums, bids and — most importantly — in crews that go home healthy.`,
      categorySlug: "safety-regulation",
      tagSlugs: ["hse", "fall-protection"],
      region: "National",
      daysAgo: 19,
    },
    {
      title: "The Case for On-Site Waste-to-Value Programmes",
      excerpt:
        "Forward-thinking contractors are turning demolition and construction waste into a cost centre — not a cost line item. Here's how the maths works.",
      body: `Construction and demolition waste is one of the industry's largest and least-touched cost lines. But a growing number of contractors are rethinking waste as a resource, and the results are showing up on the profit side of the ledger.

## The scale of the problem

Building projects routinely waste 5-10% of materials, and demolition produces waste streams that are still sent to landfill in most markets. Every load hauled away is a cost multiplied by disposal fees, landfill tax and the environmental impact nobody wants to advertise.

## The value programme

The most effective programmes sort at source rather than at the bin:

- Concrete crushed and reused as sub-base on the same site
- Steel and copper separated and sold to scrap markets
- Clean wood chipped for erosion control
- Plasterboard and cardboard segregated for recycling

## The maths

Firms that run source-separated programmes report disposal costs dropping by a third to a half, with recovered metal and aggregate sales further offsetting costs. On a £50 million project, that recovery is meaningful, and it's increasingly a requirement on sustainability-minded work.

## Getting started

Start with the big three — concrete, metal and clean wood — and measure before optimising. The habit of measuring is the real unlock. Waste that's measured gets managed, and managed waste gets priced into bids as an advantage rather than a risk.`,
      categorySlug: "materials-equipment",
      tagSlugs: ["sustainability"],
      region: "National",
      daysAgo: 20,
    },
    {
      title: "Infrastructure Projects Race to Close Before Funding Deadlines",
      excerpt:
        "With funding windows tied to local roads and levelling-up programmes expiring, agencies are accelerating project closeouts — and contractors are navigating compressed schedules.",
      body: `A quiet deadline-driven scramble is underway across highways and local transport programmes. Funding windows tied to the latest road-investment and levelling-up settlements are expiring, and agencies are accelerating project closeouts to lock in grant drawdown before deadlines lapse.

## What's happening

Local authorities and National Highways are moving project completions forward, in some cases advancing snagging work and final inspections. The push is squeezing regional construction schedules as contractors absorb compressed closeout timelines across multiple projects at once.

## The contractor impact

- Tightened deadlines for final quantities and change-order documentation
- Lengthening queues for final inspections in busy regions
- Pressure on commissioning and testing windows
- Earlier-than-expected need for closeout crews

## How to stay ahead

Firms that front-load documentation — tracking as-built changes, maintaining change-order files in real time and scheduling final testing early — are avoiding the end-of-project crunch. The agencies that manage the deadline pressure best are the ones that prioritise closeout readiness in their contractor evaluations.

## The takeaway

The funding window is a one-time opportunity, and the closing is now as important as the opening. The contractors who treat closeout as a disciplined process rather than an afterthought are the ones converting this infrastructure wave into a durable competitive position.`,
      categorySlug: "infrastructure",
      tagSlugs: ["public-funding"],
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
      .onConflictDoNothing()
      .returning({ id: articles.id });

    if (inserted && s.tagSlugs.length) {
      await db
        .insert(articleTags)
        .values(s.tagSlugs.map((tagSlug) => ({ articleId: inserted.id, tagSlug })))
        .onConflictDoNothing();
    }
  }

  console.log(`Seeded ${seedArticles.length} articles.`);

  const usedRegions = [...new Set(seedArticles.map((a) => a.region))].sort();
  const unlisted = usedRegions.filter((r) => r && !REGIONS.includes(r as typeof REGIONS[number]));
  if (unlisted.length) {
    console.warn(
      `Warning: regions used in articles but not in REGIONS list: ${unlisted.join(", ")}`,
    );
  }

  await client.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
