/**
 * MachineryStore Database Seed Script
 *
 * Seeds:
 *  - 1 admin user + 3 customer users
 *  - 8 product categories
 *  - 24 products (3 per category, several featured)
 *  - 10 reviews across products
 *  - 6 inquiries
 *  - 8 FAQs
 *  - 1 company details record
 *  - 3 contact messages
 *
 * Run:  npx tsx prisma/seed.ts
 *   or: npx ts-node prisma/seed.ts
 */

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@/generated/prisma/client'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL as string })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

// ─── helpers ─────────────────────────────────────────────────────────────────

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Placeholder Cloudinary-style image URLs (unsplash, publicly accessible)
const IMAGES = {
  generator: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  ],
  solar: [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80',
  ],
  marine: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    'https://images.unsplash.com/photo-1504376379689-8d54347b26c6?w=800&q=80',
  ],
  pump: [
    'https://images.unsplash.com/photo-1581578021450-fbd19fad6e93?w=800&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
  ],
  construction: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80',
  ],
  agricultural: [
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
  ],
  industrial: [
    'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  ],
  compressor: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&q=80',
  ],
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...\n')

  // ── 1. Company Details ─────────────────────────────────────────────────────
  console.log('📋 Seeding company details...')
  const company = await prisma.companyDetails.upsert({
    where: { id: 'seed-company' },
    update: {},
    create: {
      id: 'seed-company',
      name: 'Global Machineries & Services',
      email: 'globalmachineriesandservices@gmail.com',
      phone: '+232 99 777771',
      address: '3 Sir Samuel Lewis Road, Freetown, Sierra Leone',
      description:
        'MachineryStore Ltd. is a leading supplier of industrial machinery, power generation equipment, and agricultural machines. We connect businesses across West Africa with certified, high-quality equipment backed by expert technical support.',
      website: 'https://www.globalmachineriesandservices.com',
      facebook: 'https://www.facebook.com/share/1AoFKUNYJH/?mibextid=wwXIfr',
      instagram: 'https://www.instagram.com/globalmachinerys.services/',
      tiktok: 'https://www.tiktok.com/@global.machinerys',
      whatsApp: 'https://wa.me/c/23299777771',
      twitter: null,
    },
  })
  console.log(`   ✓ Company: ${company.name}`)

  // ── 2. Users ───────────────────────────────────────────────────────────────
  console.log('\n👤 Seeding users...')
  const hashedAdminPass = await bcrypt.hash('Admin@123', 12)
  const hashedUserPass = await bcrypt.hash('User@1234', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@machinerystore.com' },
    update: {},
    create: {
      email: 'admin@machinerystore.com',
      name: 'Site Administrator',
      password: hashedAdminPass,
      role: Role.ADMIN,
      phone: '+232 76 000 0001',
      address: '14 Industrial Avenue, Freetown',
    },
  })

  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'kwame.asante@example.com' },
      update: {},
      create: {
        email: 'kwame.asante@example.com',
        name: 'Kwame Asante',
        password: hashedUserPass,
        role: Role.CUSTOMER,
        phone: '+233 20 123 4567',
        address: 'Accra, Ghana',
      },
    }),
    prisma.user.upsert({
      where: { email: 'fatima.hassan@example.com' },
      update: {},
      create: {
        email: 'fatima.hassan@example.com',
        name: 'Fatima Al-Hassan',
        password: hashedUserPass,
        role: Role.CUSTOMER,
        phone: '+234 80 234 5678',
        address: 'Lagos, Nigeria',
      },
    }),
    prisma.user.upsert({
      where: { email: 'james.okafor@example.com' },
      update: {},
      create: {
        email: 'james.okafor@example.com',
        name: 'James Okafor',
        password: hashedUserPass,
        role: Role.CUSTOMER,
        phone: '+232 77 345 6789',
        address: 'Bo, Sierra Leone',
      },
    }),
  ])

  console.log(`   ✓ Admin: ${admin.email}  (password: Admin@123)`)
  customers.forEach((c: { email: string; name: string | null }) =>
    console.log(`   ✓ Customer: ${c.email}  (password: User@1234)`),
  )

  // ── 3. Categories ──────────────────────────────────────────────────────────
  console.log('\n🗂️  Seeding categories...')
  const categoryData = [
    {
      name: 'Generators',
      description:
        'Diesel, petrol, and gas generators for residential, commercial, and industrial applications.',
      image: IMAGES.generator[0],
    },
    {
      name: 'Solar Panels & Systems',
      description:
        'Complete solar panel systems, inverters, charge controllers, and accessories for off-grid and grid-tied setups.',
      image: IMAGES.solar[0],
    },
    {
      name: 'Marine Engines',
      description:
        'Inboard and outboard marine engines for fishing vessels, cargo boats, and recreational watercraft.',
      image: IMAGES.marine[0],
    },
    {
      name: 'Water Pumps',
      description:
        'Centrifugal, submersible, and booster pumps for irrigation, drainage, and industrial use.',
      image: IMAGES.pump[0],
    },
    {
      name: 'Construction Equipment',
      description:
        'Excavators, loaders, compactors, and concrete equipment for large and small construction projects.',
      image: IMAGES.construction[0],
    },
    {
      name: 'Agricultural Machines',
      description:
        'Tractors, tillers, harvesters, and irrigation systems for modern farming operations.',
      image: IMAGES.agricultural[0],
    },
    {
      name: 'Industrial Machines',
      description:
        'Heavy-duty lathes, milling machines, welding equipment, and factory automation systems.',
      image: IMAGES.industrial[0],
    },
    {
      name: 'Air Compressors',
      description:
        'Piston, rotary screw, and portable air compressors for workshops, factories, and construction sites.',
      image: IMAGES.compressor[0],
    },
  ]

  const categories: Record<string, { id: string; name: string }> = {}
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: slug(cat.name) },
      update: { description: cat.description, image: cat.image },
      create: {
        name: cat.name,
        slug: slug(cat.name),
        description: cat.description,
        image: cat.image,
        active: true,
      },
    })
    categories[cat.name] = created
    console.log(`   ✓ ${created.name}`)
  }

  // ── 4. Products ────────────────────────────────────────────────────────────
  console.log('\n📦 Seeding products...')

  const productData = [
    // ── GENERATORS ─────────────────────────────────────────────────────────────
    {
      name: 'Cummins 20kVA Silent Diesel Generator',
      categoryKey: 'Generators',
      brand: 'Cummins',
      featured: true,
      inStock: true,
      images: IMAGES.generator,
      keyFeatures: [
        {
          title: 'Ease of Maintenance',
          points: [
            'Mechanical fuel injection gives ease of maintenance with 500-hour service intervals.',
            'Wide-open architecture allows easy access to all service points without specialist tools.',
          ],
        },
        {
          title: 'Silent Operation',
          points: [
            'Soundproof canopy reduces noise to just 68 dB(A) at 7 metres — fully suitable for office and hospital environments.',
            'Anti-vibration mounts isolate the engine from the base frame for smoother, quieter running.',
          ],
        },
        {
          title: 'Reliable Power Quality',
          points: [
            'Brushless alternator with Automatic Voltage Regulation (AVR) ensures clean, stable power for sensitive electronics.',
            'Handles both resistive and inductive loads with consistent voltage output.',
          ],
        },
        {
          title: 'Advanced Control Panel',
          points: [
            'Deep Sea DSE controller provides digital display of all engine parameters including oil pressure, temperature, and run hours.',
            'Supports remote start/stop and AMF (Automatic Mains Failure) auto-start functionality.',
          ],
        },
      ],
      description:
        'The Cummins 20kVA silent diesel generator is engineered for continuous operation in demanding environments. Featuring a soundproof canopy, automatic voltage regulation (AVR), and a deep-sea controller panel, this unit is ideal for offices, hospitals, and commercial facilities.\n\nEquipped with a 4-stroke liquid-cooled diesel engine, it delivers consistent power output with minimal fuel consumption. The brushless alternator ensures clean power for sensitive electronic equipment.',
      specifications: {
        'Rated Power': '20 kVA / 16 kW',
        'Engine Type': '4-Stroke Diesel, Liquid Cooled',
        'Fuel Tank': '40 Litres',
        'Run Time': '8 hours at 75% load',
        'Noise Level': '68 dB(A) at 7m',
        'Voltage Output': '230V / 400V',
        Frequency: '50 Hz',
        'Starting System': 'Electric Start',
        Dimensions: '1,600 × 750 × 1,050 mm',
        Weight: '580 kg',
      },
    },

    {
      name: 'Honda 5kVA Petrol Generator',
      categoryKey: 'Generators',
      brand: 'Honda',
      featured: false,
      inStock: true,
      images: [IMAGES.generator[1], IMAGES.generator[0]],
      keyFeatures: [
        {
          title: 'Fuel Efficiency',
          points: [
            'Eco-throttle system automatically adjusts engine speed to match the connected load, reducing fuel consumption by up to 20%.',
            '18.9-litre tank provides up to 12 hours of runtime at 50% load on a single fill.',
          ],
        },
        {
          title: 'Quiet Operation',
          points: [
            'Operates at just 60 dB(A) — one of the quietest petrol generators in its power class.',
            'Compact, low-profile design with integrated muffler reduces sound dispersion.',
          ],
        },
        {
          title: 'Honda GX Engine Reliability',
          points: [
            "Built on Honda's legendary GX270 OHV engine — renowned for long service life and trouble-free starting.",
            'Automatic low-oil shutdown protects the engine from damage during operation.',
          ],
        },
        {
          title: 'Clean Power Output',
          points: [
            'Less than 3% Total Harmonic Distortion (THD) ensures safe operation of computers, televisions, and power tools.',
            'Available with both recoil and electric start options.',
          ],
        },
      ],
      description:
        "The Honda 5kVA portable petrol generator is a compact, reliable power solution for homes, small businesses, and outdoor applications. Built on Honda's legendary GX engine technology, it delivers stable power output suitable for sensitive electronics, power tools, and appliances.\n\nFeaturing an eco-throttle system that automatically adjusts engine speed to match load demands, fuel efficiency is significantly improved over conventional generators.",
      specifications: {
        'Rated Power': '5 kVA / 4 kW',
        Engine: 'Honda GX270, OHV',
        'Fuel Type': 'Petrol (Gasoline)',
        'Fuel Tank': '18.9 Litres',
        'Run Time': '12 hours at 50% load',
        'Noise Level': '60 dB(A) at 7m',
        'Output Voltage': '230V',
        Frequency: '50 Hz',
        Starting: 'Recoil / Electric Start',
        Weight: '75 kg',
      },
    },

    {
      name: 'Perkins 100kVA Industrial Generator',
      categoryKey: 'Generators',
      brand: 'Perkins',
      featured: true,
      inStock: true,
      images: IMAGES.generator,
      keyFeatures: [
        {
          title: 'Automatic Mains Failure (AMF)',
          points: [
            'Deep Sea DSE7320 AMF panel detects mains power failure and initiates automatic engine start within 10 seconds.',
            'Seamlessly transfers load back to mains supply once power is restored, with zero manual intervention required.',
          ],
        },
        {
          title: 'Extended Runtime',
          points: [
            '500-litre integrated base fuel tank provides 24+ hours of continuous operation without refuelling.',
            'Low-fuel alarm and automatic shutdown protect the engine from running dry.',
          ],
        },
        {
          title: 'Perkins Turbocharged Engine',
          points: [
            'Perkins 1104A-44TG1 turbocharged engine delivers class-leading power density and efficiency at continuous load.',
            'Engineered for 3,000+ hours of service between major overhauls under normal operating conditions.',
          ],
        },
        {
          title: 'Weather-Resistant Enclosure',
          points: [
            'Heavy-gauge steel weatherproof canopy with IP23-rated ventilation suitable for permanent outdoor installation.',
            'Stainless steel exhaust system and hot-dip galvanised base frame resist corrosion in tropical climates.',
          ],
        },
      ],
      description:
        'A heavy-duty 100kVA industrial generator powered by a Perkins diesel engine, designed for continuous duty cycles in manufacturing plants, mining operations, and large commercial facilities. Features an AMF panel, deep-sea controller, and 500-litre base fuel tank.\n\nStainless steel exhaust, anti-vibration mounts, and a weatherproof enclosure make this generator suitable for outdoor installation in harsh climates.',
      specifications: {
        'Rated Power': '100 kVA / 80 kW',
        Engine: 'Perkins 1104A-44TG1',
        Aspiration: 'Turbocharged',
        'Fuel Tank': '500 Litres (base tank)',
        'Run Time': '24+ hours continuous',
        Alternator: 'Brushless, Single Bearing',
        'Control Panel': 'Deep Sea DSE7320 AMF',
        Voltage: '400V, 3-Phase',
        Enclosure: 'Weatherproof Canopy',
        Weight: '2,100 kg',
      },
    },

    // ── SOLAR ──────────────────────────────────────────────────────────────────
    {
      name: '500W Monocrystalline Solar Panel',
      categoryKey: 'Solar Panels & Systems',
      brand: 'Generic',
      featured: true,
      inStock: true,
      images: IMAGES.solar,
      keyFeatures: [
        {
          title: 'High-Efficiency PERC Cell Technology',
          points: [
            'Monocrystalline PERC cells achieve 21.3% conversion efficiency — significantly above standard polycrystalline panels.',
            'Performs well in low-light and diffuse irradiance conditions, maximising energy yield on cloudy days.',
          ],
        },
        {
          title: 'Durable Construction',
          points: [
            '3.2mm tempered anti-reflective glass withstands hailstones up to 35mm diameter at 97 km/h impact.',
            'IP68-rated junction box and UV-resistant backsheet ensure long-term outdoor durability in tropical climates.',
          ],
        },
        {
          title: '25-Year Power Output Warranty',
          points: [
            'Linear power output warranty guarantees minimum 80% rated output after 25 years.',
            '10-year product warranty covers defects in materials and workmanship.',
          ],
        },
        {
          title: 'Versatile Installation',
          points: [
            'Compatible with standard aluminium rail mounting systems for rooftop, ground-mount, and carport installations.',
            'Pre-installed MC4-compatible connectors for fast, tool-free string wiring.',
          ],
        },
      ],
      description:
        'A high-efficiency 500W monocrystalline solar panel featuring PERC cell technology for superior performance in both high and low-light conditions. The tempered anti-reflective glass and IP68-rated junction box ensure durability in harsh weather environments.\n\nSuitable for rooftop, ground-mounted, and carport solar installations. Each panel comes with a 25-year linear power output warranty.',
      specifications: {
        'Peak Power (Pmax)': '500 W',
        'Cell Type': 'Monocrystalline PERC',
        Efficiency: '21.3%',
        'Open Circuit Voltage (Voc)': '49.8 V',
        'Short Circuit Current (Isc)': '13.01 A',
        Frame: 'Anodised Aluminium Alloy',
        Glass: '3.2mm Tempered Anti-Reflective',
        'Junction Box': 'IP68 Rated',
        Dimensions: '2,094 × 1,038 × 35 mm',
        Weight: '25.6 kg',
        Warranty: '25 Years Power Output',
      },
    },

    {
      name: '5kW Off-Grid Solar Inverter System',
      categoryKey: 'Solar Panels & Systems',
      brand: 'Generic',
      featured: false,
      inStock: true,
      images: [IMAGES.solar[1], IMAGES.solar[0]],
      keyFeatures: [
        {
          title: 'Complete Off-Grid Solution',
          points: [
            'All-in-one hybrid inverter, LiFePO4 battery bank, MPPT charge controller, and cabling supplied as a ready-to-install package.',
            'Eliminates dependency on the grid — ideal for areas with unreliable utility power.',
          ],
        },
        {
          title: 'LiFePO4 Lithium Battery Bank',
          points: [
            '4 × 100Ah LiFePO4 cells provide 20kWh of usable storage with over 3,000 charge cycles at 80% depth of discharge.',
            'Built-in Battery Management System (BMS) protects against overcharge, over-discharge, and short circuit.',
          ],
        },
        {
          title: 'Fast Transfer Time',
          points: [
            'Less than 20ms load transfer from grid/solar to battery ensures uninterruptible operation of sensitive equipment.',
            'Pure sine wave output compatible with all appliances including variable-speed motors and medical equipment.',
          ],
        },
        {
          title: 'Smart Wi-Fi Monitoring',
          points: [
            'Built-in Wi-Fi module connects to free iOS/Android app showing real-time solar yield, battery state, and load consumption.',
            'Historical data logging and alert notifications keep you informed from anywhere.',
          ],
        },
      ],
      description:
        'A complete 5kW off-grid solar inverter system including a hybrid inverter, 48V lithium battery bank, MPPT charge controller, and all necessary cabling. Designed for homes and small businesses that require independence from the grid.\n\nThe built-in Wi-Fi monitoring module allows real-time system monitoring via smartphone app.',
      specifications: {
        'Inverter Output': '5,000 W / 5 kVA',
        'Input Voltage': '48V DC',
        'Battery Type': 'LiFePO4 Lithium',
        'Battery Capacity': '100Ah × 4 units = 20kWh',
        'MPPT Voltage Range': '120–450 V',
        'Max PV Input': '6,500 W',
        'Output Voltage': '230V AC',
        'Transfer Time': '<20ms',
        Monitoring: 'Wi-Fi App (iOS & Android)',
        Protection: 'Short Circuit, Overload, Over-Temperature',
      },
    },

    {
      name: '10kW Grid-Tied Solar System Package',
      categoryKey: 'Solar Panels & Systems',
      brand: 'Generic',
      featured: false,
      inStock: false,
      images: IMAGES.solar,
      keyFeatures: [
        {
          title: 'Turnkey Commercial Solution',
          points: [
            'Includes 20 × 500W panels, grid-tied inverter, mounting rails, DC combiners, and monitoring portal — everything needed for installation.',
            'Professional installation service included in the package price.',
          ],
        },
        {
          title: 'Reduce Electricity Bills by up to 70%',
          points: [
            'Estimated annual generation of 14,000 kWh offsets a significant portion of commercial electricity consumption.',
            'Excess energy is fed back into the grid under net-metering agreements where applicable.',
          ],
        },
        {
          title: 'IEC & CE Certified Components',
          points: [
            'All components carry IEC 62116, IEC 61727, CE, and TUV certifications for grid compliance and insurance eligibility.',
            'Designed to meet national grid connection standards and utility interconnection requirements.',
          ],
        },
        {
          title: 'Remote Cloud Monitoring',
          points: [
            'Cloud-based monitoring portal provides real-time performance data, fault alerts, and energy yield reports.',
            'Multi-site management dashboard available for businesses with multiple installations.',
          ],
        },
      ],
      description:
        'A turnkey 10kW grid-tied solar system package for medium commercial buildings, warehouses, and schools. Includes 20 × 500W solar panels, a 10kW grid-tied inverter with anti-islanding protection, mounting rails, DC combiners, and a comprehensive monitoring portal.\n\nAll components are IEC-certified and the system reduces electricity bills by up to 70%.',
      specifications: {
        'System Capacity': '10 kW',
        'Solar Panels': '20 × 500W Monocrystalline',
        Inverter: '10kW Single Phase / Three Phase',
        'Grid Standard': 'IEC 62116, IEC 61727',
        'Annual Generation': '~14,000 kWh',
        Monitoring: 'Cloud-Based Portal',
        Mounting: 'Rooftop Aluminum Rail System',
        Warranty: '10 Years Inverter, 25 Years Panels',
        Certifications: 'IEC, CE, TUV',
        Installation: 'Professional Installation Included',
      },
    },

    // ── MARINE ENGINES ─────────────────────────────────────────────────────────
    {
      name: 'Yamaha 40HP 4-Stroke Outboard Engine',
      categoryKey: 'Marine Engines',
      brand: 'Yamaha',
      featured: true,
      inStock: true,
      images: IMAGES.marine,
      keyFeatures: [
        {
          title: 'Electronic Fuel Injection (EFI)',
          points: [
            'EFI system delivers precise, computer-controlled fuel metering at every throttle position for optimum power and economy.',
            'Improved cold-start reliability and smooth throttle response compared to carburettor engines.',
          ],
        },
        {
          title: 'Saltwater & Corrosion Resistance',
          points: [
            'All external engine components use corrosion-resistant materials specifically designed for sustained coastal and offshore use.',
            'Sealed lower unit and sacrificial zinc anodes extend service life in saltwater environments.',
          ],
        },
        {
          title: 'Lightweight Design',
          points: [
            'At just 88 kg, this is one of the lightest 40HP 4-stroke outboards available — ideal for smaller hull transom ratings.',
            'Low centre of gravity improves boat stability and handling at all speeds.',
          ],
        },
        {
          title: '3-Year Manufacturer Warranty',
          points: [
            "Backed by Yamaha's 3-year warranty and a global network of certified service dealers.",
            'Yamaha Marine diagnostic system (Y-COP) provides engine monitoring and anti-theft protection.',
          ],
        },
      ],
      description:
        "The Yamaha F40 is a lightweight, fuel-efficient 4-stroke outboard motor renowned for its reliability and smooth performance. Featuring Yamaha's advanced fuel injection system, it delivers excellent throttle response and fuel economy across a wide range of applications.\n\nThe corrosion-resistant saltwater components make it an excellent choice for coastal and offshore operations.",
      specifications: {
        'Engine Type': '4-Stroke, SOHC, 3 Cylinder',
        Displacement: '747 cc',
        'Rated Output': '40 HP (29.4 kW)',
        'Full Throttle RPM': '5,000 – 6,000',
        'Fuel Delivery': 'Electronic Fuel Injection (EFI)',
        'Fuel Type': 'Petrol (Gasoline)',
        'Shaft Length': 'Long / Extra Long',
        'Gear Ratio': '2.00:1',
        'Alternator Output': '12A / 144W',
        Weight: '88 kg',
        Warranty: '3 Years',
      },
    },

    {
      name: 'Volvo Penta D4 Marine Diesel Engine',
      categoryKey: 'Marine Engines',
      brand: 'Volvo Penta',
      featured: false,
      inStock: true,
      images: [IMAGES.marine[1], IMAGES.marine[0]],
      keyFeatures: [
        {
          title: 'Common Rail Direct Injection',
          points: [
            'Common rail system maintains constant high fuel pressure, enabling precise multi-point injection for clean, efficient combustion.',
            'Produces class-leading torque of 620 Nm from as low as 1,750 RPM — excellent for heavy commercial vessel applications.',
          ],
        },
        {
          title: 'Closed Cooling System',
          points: [
            'Freshwater closed cooling loop with seawater-cooled heat exchanger prevents internal corrosion and extends engine life.',
            'Maintains consistent operating temperature regardless of ambient water temperature.',
          ],
        },
        {
          title: 'IMO Tier II Emissions Compliant',
          points: [
            'Meets International Maritime Organization Tier II exhaust emission standards for commercial vessel certification.',
            'Reduced particulate and NOx output compared to older engine generations.',
          ],
        },
        {
          title: 'Long Service Intervals',
          points: [
            "500-hour service intervals reduce vessel downtime and total cost of ownership over the engine's working life.",
            "Volvo Penta's global dealer network ensures spare parts availability in all major ports.",
          ],
        },
      ],
      description:
        'The Volvo Penta D4-260 is a 4-cylinder turbocharged marine diesel engine delivering 260HP. Engineered for commercial fishing vessels, ferries, and patrol boats. The common-rail fuel injection system ensures precise fuel delivery for optimum power and efficiency at all speeds.\n\nThe closed cooling system with seawater-cooled heat exchanger protects the engine from corrosion and extends service life significantly.',
      specifications: {
        Configuration: '4-Cylinder Inline, Turbocharged',
        Displacement: '3.7 Litres',
        'Power Output': '260 HP (191 kW) at 3,500 RPM',
        Torque: '620 Nm at 1,750 RPM',
        'Fuel System': 'Common Rail Direct Injection',
        Cooling: 'Closed Cooling + Heat Exchanger',
        Transmission: 'IPS Pod / Straight Shaft',
        Emissions: 'IMO Tier II Compliant',
        'Dry Weight': '430 kg',
        'Service Interval': '500 hours',
      },
    },

    {
      name: 'Mercury 15HP 2-Stroke Outboard Motor',
      categoryKey: 'Marine Engines',
      brand: 'Mercury',
      featured: false,
      inStock: true,
      images: IMAGES.marine,
      keyFeatures: [
        {
          title: 'Simple Field Maintenance',
          points: [
            'Carburettor-based fuel system requires no specialist diagnostic equipment — can be serviced by local mechanics.',
            'Minimal number of moving parts reduces failure points and simplifies troubleshooting at sea.',
          ],
        },
        {
          title: 'Proven Tropical Performance',
          points: [
            'Widely used by artisanal fishing communities across West Africa in warm, high-humidity coastal conditions.',
            'Designed to run reliably on locally available 2-stroke petrol/oil premix (50:1 ratio).',
          ],
        },
        {
          title: 'Lightweight & Portable',
          points: [
            'At just 36 kg, the Mercury 15HP can be transported between vessels and stored securely.',
            'Short shaft (381mm) matches standard small canoe and aluminium dinghy transom heights.',
          ],
        },
        {
          title: 'Strong Thrust-to-Weight Ratio',
          points: [
            'Delivers 15HP from a compact 323cc single-cylinder engine, providing excellent acceleration for lightweight craft.',
            'Robust gear ratio of 2.15:1 delivers strong low-speed thrust for laden fishing vessels.',
          ],
        },
      ],
      description:
        'The Mercury 15HP 2-stroke outboard is a rugged, dependable engine designed for small fishing boats, canoes, and aluminium dinghies. Known for its simple maintenance requirements and robust performance in tropical waters.\n\nThe manual recoil start system and simple carburettor design make it easy to service in the field without specialist tools.',
      specifications: {
        'Engine Type': '2-Stroke, Single Cylinder',
        Displacement: '323 cc',
        'Rated Output': '15 HP (11 kW)',
        'Full Throttle RPM': '4,500 – 5,500',
        'Fuel System': 'Carburettor',
        'Fuel Mix': '50:1 Petrol/Oil',
        'Shaft Length': 'Short (381mm)',
        Starting: 'Manual Recoil',
        'Gear Ratio': '2.15:1',
        Weight: '36 kg',
      },
    },

    // ── WATER PUMPS ────────────────────────────────────────────────────────────
    {
      name: 'Grundfos CM5 Centrifugal Water Pump',
      categoryKey: 'Water Pumps',
      brand: 'Grundfos',
      featured: false,
      inStock: true,
      images: IMAGES.pump,
      keyFeatures: [
        {
          title: 'Stainless Steel Construction',
          points: [
            'Pump body, impellers, and shaft are manufactured from AISI 304 stainless steel for excellent corrosion resistance.',
            'Suitable for clean water, mildly contaminated water, and thin, non-explosive, non-aggressive liquids.',
          ],
        },
        {
          title: 'Compact In-Line Design',
          points: [
            'Compact horizontal in-line design allows installation directly into pipework with no need for a special pump chamber.',
            'Available in multiple shaft seal configurations to match specific installation requirements.',
          ],
        },
        {
          title: 'Integrated Non-Return Valve',
          points: [
            'Built-in non-return valve prevents backflow when the pump is stopped, protecting the system and water quality.',
            'Eliminates the need for a separate check valve in most pressure boosting applications.',
          ],
        },
        {
          title: 'Low Noise & Energy Efficient',
          points: [
            'Multi-stage impeller design achieves high head at low motor power input — IP44-rated for indoor and sheltered outdoor use.',
            'Runs quietly at 50Hz with minimal vibration, suitable for residential pressure booster applications.',
          ],
        },
      ],
      description:
        "The Grundfos CM5 is a multistage centrifugal pump designed for water supply, pressure boosting, and irrigation applications. Constructed from AISI 304 stainless steel, it offers excellent corrosion resistance and is suitable for handling clean water and thin liquids.\n\nThe pump's compact in-line design facilitates easy installation in confined spaces.",
      specifications: {
        'Flow Rate': 'Up to 3.2 m³/h',
        'Max Head': '54 metres',
        'Power Input': '0.9 kW',
        Voltage: '1 × 220–240 V, 50 Hz',
        Material: 'AISI 304 Stainless Steel',
        'Max Liquid Temp': '60 °C',
        'Inlet / Outlet': '1¼" / 1"',
        'Shaft Seal': 'Mechanical',
        'IP Rating': 'IP44',
        Weight: '8.5 kg',
      },
    },

    {
      name: 'Pedrollo 4" Submersible Borehole Pump',
      categoryKey: 'Water Pumps',
      brand: 'Pedrollo',
      featured: true,
      inStock: true,
      images: [IMAGES.pump[1], IMAGES.pump[0]],
      keyFeatures: [
        {
          title: 'Deep Borehole Capability',
          points: [
            'Designed for installation in 4-inch (100mm) diameter boreholes with submersion depths up to 200 metres.',
            'Delivers consistent flow and pressure at depths where surface pumps cannot operate.',
          ],
        },
        {
          title: 'Stainless Steel Body & Impellers',
          points: [
            'AISI 304 stainless steel construction resists corrosion from iron-rich or slightly aggressive groundwater.',
            'Hydraulically balanced impellers minimise axial thrust for extended bearing life.',
          ],
        },
        {
          title: 'Thermal Motor Protection',
          points: [
            'Integrated thermal overload protector automatically shuts down the motor if it overheats due to dry running or voltage fluctuation.',
            'Automatic reset once the motor cools, minimising manual intervention requirements.',
          ],
        },
        {
          title: 'Agricultural & Municipal Applications',
          points: [
            'Ideal for farm irrigation, livestock watering, municipal water supply, and residential borehole systems.',
            'Compatible with solar pumping systems when used with an appropriate MPPT solar pump controller.',
          ],
        },
      ],
      description:
        'The Pedrollo 4SR submersible pump series is designed for deep borehole and well water extraction. Built with a stainless steel body and impellers, it withstands harsh submerged conditions while delivering consistent flow at depths up to 200 metres.\n\nThe integrated thermal overload protector safeguards the motor against damage from dry running and voltage fluctuations.',
      specifications: {
        'Borehole Diameter': '4" (100mm)',
        'Flow Rate': 'Up to 6 m³/h',
        'Max Head': '160 metres',
        Power: '1.5 kW / 2 HP',
        Voltage: '230V or 400V, 50 Hz',
        'Body Material': 'AISI 304 Stainless Steel',
        'Max Submersion': '200 metres',
        'Discharge Pipe': '1¼" BSP',
        'Motor Protection': 'Thermal Overload',
        'Cable Length': '10 metres (standard)',
      },
    },

    {
      name: 'Honda WB30 3-Inch Water Transfer Pump',
      categoryKey: 'Water Pumps',
      brand: 'Honda',
      featured: false,
      inStock: true,
      images: IMAGES.pump,
      keyFeatures: [
        {
          title: 'High-Volume Water Transfer',
          points: [
            'Delivers up to 1,100 litres per minute through a 3-inch discharge port — ideal for rapidly draining flooded sites.',
            'Maximum head of 28 metres enables pumping to elevated storage tanks or over long horizontal distances.',
          ],
        },
        {
          title: 'Honda GX160 Engine',
          points: [
            "Powered by Honda's reliable GX160 OHV engine — one of the most widely serviced small engines in the world.",
            'Recoil start system provides dependable starting even after extended storage.',
          ],
        },
        {
          title: 'Corrosion-Resistant Casing',
          points: [
            'Cast iron volute casing with anti-corrosion treatment handles abrasive and mildly contaminated water without degradation.',
            'Wear-resistant mechanical seal extends pump service life in harsh working conditions.',
          ],
        },
        {
          title: 'Site-Ready Portability',
          points: [
            'Dry weight of just 27.5 kg allows two-person carry and rapid deployment across construction sites.',
            'Fold-down handle and low centre of gravity make it stable and easy to position near water sources.',
          ],
        },
      ],
      description:
        "The Honda WB30 3-inch petrol-powered water transfer pump is built for rapid, high-volume water movement in construction sites, flooded areas, and agricultural irrigation. Powered by Honda's reliable GX160 engine, it delivers up to 1,100 litres per minute.\n\nThe corrosion-resistant volute casing and wear-resistant mechanical seal ensure long service life in abrasive water conditions.",
      specifications: {
        'Suction / Discharge': '3" / 3" (75mm)',
        'Max Flow': '1,100 L/min',
        'Max Head': '28 metres',
        Engine: 'Honda GX160, 4-Stroke OHV',
        'Fuel Type': 'Petrol',
        'Fuel Tank': '3.6 Litres',
        'Run Time': '~3 hours at full load',
        Starting: 'Recoil',
        'Dry Weight': '27.5 kg',
        Casing: 'Cast Iron Anti-Corrosion',
      },
    },

    // ── CONSTRUCTION EQUIPMENT ─────────────────────────────────────────────────
    {
      name: 'CAT 320 20-Tonne Hydraulic Excavator',
      categoryKey: 'Construction Equipment',
      brand: 'Caterpillar',
      featured: true,
      inStock: true,
      images: IMAGES.construction,
      keyFeatures: [
        {
          title: 'Cat Grade Integrated Technology',
          points: [
            'Built-in Cat Grade with 2D provides real-time blade and bucket guidance to help operators achieve target grade faster and with fewer passes.',
            'Reduces surveying costs and rework on earthmoving and grading operations.',
          ],
        },
        {
          title: 'Fuel Efficiency',
          points: [
            'Next-generation C4.4 ACERT engine delivers 164HP with up to 10% lower fuel consumption than the previous generation.',
            'Intelligent power management system automatically matches engine output to load demand.',
          ],
        },
        {
          title: 'Operator Comfort & Visibility',
          points: [
            'Fully pressurised, air-conditioned cab with low-effort joystick controls reduces operator fatigue on long shifts.',
            'Large front and side glass panels plus rear-view camera system provide excellent all-round visibility.',
          ],
        },
        {
          title: 'Stage IV / Tier 4 Final Compliant',
          points: [
            'Meets the most stringent exhaust emission standards, making this machine acceptable on regulated construction sites and export markets.',
            'After-treatment system requires only standard DEF (diesel exhaust fluid) maintenance.',
          ],
        },
      ],
      description:
        'The Caterpillar 320 hydraulic excavator is a 20-tonne machine built for medium to large-scale earthmoving, trenching, and demolition projects. The C4.4 ACERT engine delivers exceptional power efficiency.\n\nThe integrated Cat Grade technology provides real-time 2D grading guidance. The fully enclosed pressurised cab ensures operator comfort in dusty and noisy environments.',
      specifications: {
        'Operating Weight': '20,600 kg',
        Engine: 'Cat C4.4 ACERT',
        'Engine Power': '122 kW (164 HP)',
        'Max Digging Depth': '6,710 mm',
        'Max Reach': '9,520 mm',
        'Bucket Capacity': '0.77 – 1.30 m³',
        'Swing Speed': '11.6 RPM',
        'Ground Clearance': '440 mm',
        'Fuel Tank': '400 Litres',
        Emissions: 'Stage IV / Tier 4 Final',
      },
    },

    {
      name: 'Hamm HD+ 90 Single Drum Compactor',
      categoryKey: 'Construction Equipment',
      brand: 'Hamm',
      featured: false,
      inStock: true,
      images: [IMAGES.construction[1], IMAGES.construction[0]],
      keyFeatures: [
        {
          title: 'HAMMTRONIC Machine Management',
          points: [
            'Automated system continuously monitors soil stiffness and adjusts compaction energy to achieve optimal density with the fewest passes.',
            'Prevents over-compaction and structural damage to subgrade layers.',
          ],
        },
        {
          title: 'Dual Compaction Mode',
          points: [
            'Switches between vibration (for granular soils and granular base layers) and oscillation (for asphalt and sensitive surfaces near structures).',
            'Oscillation mode eliminates vertical impact forces, enabling compaction directly adjacent to buildings and utilities.',
          ],
        },
        {
          title: '40% Gradeability',
          points: [
            'Powerful hydrostatic drive delivers strong hill-climbing capability for uneven terrain and embankment compaction.',
            'All-wheel braking system with auto-hold prevents rollback on steep grades.',
          ],
        },
        {
          title: 'Ergonomic Operator Station',
          points: [
            'Fully adjustable suspension seat, tiltable steering column, and all-round visibility reduce operator fatigue on long compaction runs.',
            'Intuitive HAMMTRONIC display provides real-time compaction data and machine diagnostics.',
          ],
        },
      ],
      description:
        'The Hamm HD+ 90 soil compactor is a 9-tonne single-drum machine equipped with oscillation and vibration compaction technology. Designed for compacting subgrades, granular soils, and asphalt layers on road construction and site preparation projects.\n\nThe HAMMTRONIC system automatically adapts compaction parameters to soil conditions.',
      specifications: {
        'Operating Weight': '9,100 kg',
        'Drum Width': '2,140 mm',
        Engine: 'Deutz TCD 2.9 L4',
        'Engine Power': '55.4 kW (74.3 HP)',
        'Vibration Frequency': '30 / 35 Hz',
        'Max Amplitude': '0.9 / 0.45 mm',
        'Travel Speed': '0 – 12 km/h',
        Gradeability: '40%',
        'Fuel Tank': '180 Litres',
        'Compaction System': 'Vibration + Oscillation',
      },
    },

    {
      name: 'Schwing Stetter S 34 SX Concrete Pump',
      categoryKey: 'Construction Equipment',
      brand: 'Schwing Stetter',
      featured: false,
      inStock: false,
      images: IMAGES.construction,
      keyFeatures: [
        {
          title: '34-Metre Placing Boom',
          points: [
            'Five-section R-fold boom reaches 34 metres vertically and up to 30 metres horizontally, accessing most multi-storey building pours.',
            'Compact folded dimensions allow the truck to navigate narrow urban access roads.',
          ],
        },
        {
          title: 'HPValve Technology',
          points: [
            "Schwing's proprietary HPValve rock valve minimises pressure loss during pumping, enabling high concrete output at lower pump pressures.",
            'Handles difficult mixes including pumping concrete with aggregate sizes up to 50mm.',
          ],
        },
        {
          title: 'Electronic Boom Control (EBC)',
          points: [
            'All boom movements are controlled by proportional electronics for smooth, precise positioning at high reach.',
            'Wireless remote control unit gives the operator full control from anywhere on the poured slab.',
          ],
        },
        {
          title: 'EN 12001 Certified',
          points: [
            'Fully compliant with European EN 12001 safety standard for truck-mounted concrete pumps.',
            'Outrigger stability monitoring system prevents pump operation if ground support is inadequate.',
          ],
        },
      ],
      description:
        'The Schwing Stetter S 34 SX truck-mounted concrete pump boasts a 34-metre placing boom for difficult pour locations on multi-storey buildings and infrastructure projects. The 5-section folding boom provides exceptional versatility in restricted urban construction sites.\n\nEquipped with HPValve system for minimal pressure loss and EBC electronic boom control.',
      specifications: {
        'Boom Reach': '34 metres',
        'Boom Sections': '5 (R-fold)',
        'Max Output': '160 m³/h',
        'Max Pressure': '85 bar',
        'Cylinder Diameter': '230 mm',
        'Stroke Length': '2,100 mm',
        'Hopper Volume': '600 Litres',
        'Control System': 'Electronic EBC',
        Drive: 'Truck-Mounted (Mercedes-Benz)',
        Certification: 'EN 12001',
      },
    },

    // ── AGRICULTURAL MACHINES ─────────────────────────────────────────────────
    {
      name: 'Mahindra 575 DI 47HP 2WD Tractor',
      categoryKey: 'Agricultural Machines',
      brand: 'Mahindra',
      featured: true,
      inStock: true,
      images: IMAGES.agricultural,
      keyFeatures: [
        {
          title: 'High Torque at Low RPM',
          points: [
            'Direct injection 3-cylinder diesel engine delivers peak torque at low RPM, reducing fuel consumption during heavy draft work such as deep tillage.',
            'Maintains consistent pull force even as engine speed drops under heavy load.',
          ],
        },
        {
          title: 'Versatile 8F + 2R Gearbox',
          points: [
            '8 forward and 2 reverse gears provide the right speed for every field operation from slow transplanting to faster transport.',
            'Adjustable rear wheel track width adapts the tractor to row-crop, paddy, and orchard configurations.',
          ],
        },
        {
          title: '1,500 kg Hydraulic Lift',
          points: [
            'Category I/II three-point linkage lifts up to 1,500 kg, compatible with a full range of tillage, planting, and harvesting implements.',
            'Position and draft control provides consistent implement depth across varying soil conditions.',
          ],
        },
        {
          title: 'Low Cost of Ownership',
          points: [
            "Mahindra's wide dealer and parts network across West Africa ensures fast, affordable servicing and genuine spare parts.",
            'Simple mechanical systems are familiar to local mechanics, minimising specialist repair costs.',
          ],
        },
      ],
      description:
        'The Mahindra 575 DI is a 47HP 2-wheel drive tractor ideal for tillage, planting, harvesting, and transport operations on small to medium farms. Its direct injection diesel engine delivers high torque at low RPM.\n\nThe 8-forward and 2-reverse gearbox, combined with an adjustable rear-wheel track width, makes it adaptable to row-crop farming, orchards, and paddy fields.',
      specifications: {
        Engine: '3-Cylinder DI Diesel',
        Power: '47 HP (34.5 kW)',
        Drive: '2WD',
        Gearbox: '8F + 2R',
        'PTO Power': '540 / 1,000 RPM',
        'Hydraulic Lift Capacity': '1,500 kg',
        'Fuel Tank': '60 Litres',
        'Ground Clearance': '430 mm',
        'Turning Radius': '3,200 mm',
        Weight: '2,195 kg',
      },
    },

    {
      name: 'Kubota L3408 34HP 4WD Compact Tractor',
      categoryKey: 'Agricultural Machines',
      brand: 'Kubota',
      featured: false,
      inStock: true,
      images: [IMAGES.agricultural[1], IMAGES.agricultural[0]],
      keyFeatures: [
        {
          title: '4WD with Front Differential Lock',
          points: [
            'Selectable 4WD engages instantly from the operator seat for improved traction on wet, sloped, or loose terrain.',
            'Front differential lock prevents wheel spin during precision implement work in uneven fields.',
          ],
        },
        {
          title: 'Synchro Shuttle Transmission',
          points: [
            '8 forward and 8 reverse gears with synchromesh clutchless direction reversal for rapid headland turns.',
            'Mid-mount PTO at 2,000 RPM supports mid-mount mowers and front-mount implements simultaneously with rear attachments.',
          ],
        },
        {
          title: 'Super UDT Hydraulic System',
          points: [
            "Kubota's Super Universal Dynamic Traction fluid provides smooth, responsive hydraulic loader and 3-point linkage control in all temperatures.",
            'Category I three-point linkage with up to 1,000 kg lift capacity compatible with most compact implement brands.',
          ],
        },
        {
          title: 'Ergonomic Operator Station',
          points: [
            'Low-profile bonnet provides excellent forward visibility for precision loader and row-crop work.',
            'Deluxe suspension seat with armrests and easy-reach controls reduce fatigue during full-day operations.',
          ],
        },
      ],
      description:
        'The Kubota L3408 is a 34HP 4-wheel drive compact tractor designed for smallholder farms, market gardens, and rural landholders. The Super UDT hydraulic system provides smooth loader and implement control.\n\nCompatible with a wide range of front-end loaders, mid-mount mowers, and rear-mounted implements.',
      specifications: {
        Engine: 'Kubota E-TVCS 3-Cylinder Diesel',
        Power: '34 HP (25 kW)',
        Drive: '4WD with Front Diff Lock',
        Transmission: 'Synchro Shuttle 8F + 8R',
        PTO: '540 RPM (Rear) / 2,000 RPM (Mid)',
        'Max Lift Capacity': '1,000 kg',
        'Fuel Tank': '43 Litres',
        'Hydraulic Flow': '22.5 L/min',
        'Overall Width': '1,380 mm',
        Weight: '1,575 kg',
      },
    },

    {
      name: 'Knapsack Power Sprayer 767A',
      categoryKey: 'Agricultural Machines',
      brand: 'Generic',
      featured: false,
      inStock: true,
      images: IMAGES.agricultural,
      keyFeatures: [
        {
          title: 'High-Pressure Diaphragm Pump',
          points: [
            'Delivers 16 litres per minute at 15–20 bar working pressure for effective coverage of dense canopy crops.',
            'Adjustable pressure regulator allows fine control of spray output for different chemical applications.',
          ],
        },
        {
          title: 'Anti-Corrosion Tank',
          points: [
            '16-litre HDPE tank is resistant to all common agricultural chemicals including herbicides, fungicides, and foliar fertilisers.',
            'Wide mouth opening allows easy filling and thorough internal cleaning between chemical changes.',
          ],
        },
        {
          title: 'Operator Comfort',
          points: [
            'Contoured padded back straps and waist belt distribute the load evenly, reducing back strain during extended spraying sessions.',
            'Anti-vibration engine mounts isolate the operator from engine vibration for all-day comfort.',
          ],
        },
        {
          title: 'Versatile Spray Range',
          points: [
            'Reaches up to 10 metres horizontally with the adjustable lance nozzle — suitable for tall tree crops and cocoa canopy.',
            'Interchangeable cone and fan nozzles allow switching between foliar spraying and directed soil treatment.',
          ],
        },
      ],
      description:
        'The 767A knapsack power sprayer is a versatile agricultural sprayer for applying pesticides, herbicides, and fertilisers on crops, orchards, and plantations. The 1.2HP 2-stroke engine drives a high-pressure diaphragm pump delivering a fine, adjustable spray pattern.\n\nThe 16-litre anti-corrosion tank, padded back straps, and anti-vibration mounts ensure comfortable operation.',
      specifications: {
        Engine: '1.2HP 2-Stroke Petrol',
        'Tank Volume': '16 Litres',
        'Pump Type': 'Diaphragm High-Pressure',
        'Flow Rate': '16 L/min',
        'Working Pressure': '15 – 20 bar',
        'Spray Range': 'Up to 10 metres horizontal',
        Nozzle: 'Adjustable Cone / Fan',
        'Fuel Mix': '25:1',
        'Weight (Empty)': '8.5 kg',
        'Suitable Crops': 'Rice, Cocoa, Coffee, Vegetables',
      },
    },

    // ── INDUSTRIAL MACHINES ───────────────────────────────────────────────────
    {
      name: 'Bosch Rexroth Hydraulic Power Unit 30kW',
      categoryKey: 'Industrial Machines',
      brand: 'Bosch Rexroth',
      featured: false,
      inStock: true,
      images: IMAGES.industrial,
      keyFeatures: [
        {
          title: 'Variable Displacement Axial Piston Pump',
          points: [
            'Automatically adjusts displacement to match system demand, reducing energy consumption by up to 40% compared to fixed-displacement units during low-load cycles.',
            'Maintains constant system pressure regardless of flow demand variations.',
          ],
        },
        {
          title: 'Integrated Filtration System',
          points: [
            'Dual-stage 10μm high-pressure and return filtration removes particulates before they can damage precision hydraulic components.',
            'Filter condition indicators provide visual warning when element replacement is due.',
          ],
        },
        {
          title: 'Water-to-Oil Heat Exchanger',
          points: [
            'Maintains hydraulic oil within the optimal operating temperature range, extending fluid and seal service life.',
            'Prevents thermal runaway in continuous duty press and injection moulding applications.',
          ],
        },
        {
          title: 'CE & ISO 4413 Certified',
          points: [
            'Designed and built to ISO 4413 hydraulic safety standard — mandatory for factory installation in regulated manufacturing facilities.',
            'Full documentation pack including hydraulic schematic, component data sheets, and CE declaration of conformity supplied.',
          ],
        },
      ],
      description:
        'The Bosch Rexroth HPU-30 hydraulic power unit provides centralised hydraulic power for presses, injection moulding machines, and industrial automation systems. The variable displacement axial piston pump adjusts flow on demand, significantly reducing energy consumption.\n\nMounted on a 200-litre oil reservoir with an integrated water-to-oil heat exchanger and filtration system.',
      specifications: {
        'Motor Power': '30 kW / 40 HP',
        'System Pressure': 'Up to 350 bar',
        'Max Flow Rate': '63 L/min',
        'Pump Type': 'Variable Axial Piston',
        'Reservoir Volume': '200 Litres',
        Filtration: '10μm High Pressure + Return Filter',
        Cooling: 'Water-to-Oil Heat Exchanger',
        Voltage: '400V / 3-Phase / 50Hz',
        'ISO Fluid Grade': 'ISO VG 46',
        Certification: 'CE, ISO 4413',
      },
    },

    {
      name: 'Lincoln Electric Aspect 375 TIG Welder',
      categoryKey: 'Industrial Machines',
      brand: 'Lincoln Electric',
      featured: true,
      inStock: true,
      images: [IMAGES.industrial[1], IMAGES.industrial[0]],
      keyFeatures: [
        {
          title: 'Advanced AC Wave Control',
          points: [
            'Independent adjustment of AC frequency (20–400 Hz), cleaning width, and waveform shape gives unmatched arc control for aluminium TIG welding.',
            'Square wave output provides maximum arc force for thick aluminium; soft start reduces tungsten erosion on thin sheet.',
          ],
        },
        {
          title: 'AC/DC TIG & Stick in One Unit',
          points: [
            'AC TIG for aluminium and magnesium; DC TIG for stainless steel, titanium, and exotic alloys; DC Stick for site repair work.',
            'A single machine replaces multiple welding power sources, reducing capital cost and workshop footprint.',
          ],
        },
        {
          title: 'High Frequency Arc Start',
          points: [
            'Touchless HF arc start prevents tungsten contamination of the weld pool — critical for aerospace, food processing, and pharmaceutical fabrication.',
            'Lift arc start also available as an alternative in HF-sensitive environments.',
          ],
        },
        {
          title: 'Heavy Duty Cycle',
          points: [
            '100% duty cycle at 290 Amps ensures continuous production welding without enforced rest periods.',
            '60% duty cycle at full 375-amp output handles the most demanding single-pass structural welds.',
          ],
        },
      ],
      description:
        'The Lincoln Electric Aspect 375 is a professional AC/DC TIG welder designed for precision welding of aluminium, stainless steel, titanium, and exotic alloys. Its advanced wave control technology allows independent adjustment of AC frequency, cleaning width, and output waveform.\n\nThe built-in high-frequency arc start and foot pedal amperage control enable smooth starts and precise heat input management.',
      specifications: {
        Process: 'AC/DC TIG (GTAW) + Stick (SMAW)',
        'Input Power': '230V / 460V, 3-Phase',
        'Output Range': '5 – 375 Amps',
        'Duty Cycle': '60% @ 375A / 100% @ 290A',
        'AC Frequency': '20 – 400 Hz Adjustable',
        'Arc Start': 'High Frequency + Lift Arc',
        Control: 'Digital LCD Panel + Foot Pedal',
        'Wire Feeder': 'Not Included',
        Dimensions: '680 × 270 × 490 mm',
        Weight: '27 kg',
      },
    },

    {
      name: 'Lathe Machine CNC 1500mm Bed',
      categoryKey: 'Industrial Machines',
      brand: 'Generic',
      featured: false,
      inStock: true,
      images: IMAGES.industrial,
      keyFeatures: [
        {
          title: 'Fanuc 0iT-F CNC Controller',
          points: [
            'Industry-standard Fanuc controller with conversational programming and full G-code support reduces setup time for new jobs.',
            'Macro programming capability enables automated turning cycles for high-volume production runs.',
          ],
        },
        {
          title: 'Hardened & Ground Guideways',
          points: [
            'Induction-hardened and precision-ground box guideways maintain dimensional accuracy over years of continuous production.',
            'Automatic centralised lubrication system ensures consistent film coverage across all sliding surfaces.',
          ],
        },
        {
          title: '1,500mm Bed for Large Workpieces',
          points: [
            'Accommodates shafts, rolls, and components up to 1,400mm between centres — suitable for heavy engineering and pump shaft machining.',
            '1,400mm Z-axis travel and 200mm X-axis travel handle a broad range of turning, boring, and threading operations.',
          ],
        },
        {
          title: '7.5kW Spindle Drive',
          points: [
            'Spindle speed range of 40–2,000 RPM with constant torque at low speeds for heavy interrupted cuts on large-diameter workpieces.',
            'MT6/A2-6 spindle nose accepts standard face plates, chucks, and drive centres.',
          ],
        },
      ],
      description:
        'A heavy-duty CNC lathe machine with a 1,500mm bed length suitable for turning, threading, boring, and facing of large workpieces. The Fanuc 0iT-F CNC control system supports G-code programming with a conversational interface.\n\nHardened and ground guideways ensure precision and longevity under continuous production conditions.',
      specifications: {
        'Bed Length': '1,500 mm',
        'Swing Over Bed': '400 mm',
        'Spindle Speed': '40 – 2,000 RPM',
        'Spindle Taper': 'MT6 / A2-6',
        'X-Axis Travel': '200 mm',
        'Z-Axis Travel': '1,400 mm',
        'Tailstock Taper': 'MT4',
        'Main Motor': '7.5 kW',
        'CNC Controller': 'Fanuc 0iT-F',
        Weight: '3,200 kg',
      },
    },

    // ── AIR COMPRESSORS ───────────────────────────────────────────────────────
    {
      name: 'Atlas Copco GA 15 VSD Rotary Screw Compressor',
      categoryKey: 'Air Compressors',
      brand: 'Atlas Copco',
      featured: true,
      inStock: true,
      images: IMAGES.compressor,
      keyFeatures: [
        {
          title: 'Variable Speed Drive (VSD) Energy Savings',
          points: [
            'The VSD motor automatically matches compressor output to actual air demand, reducing energy consumption by up to 35% versus fixed-speed units.',
            'Eliminates the energy-wasting unloaded running cycle that wastes power in conventional compressors.',
          ],
        },
        {
          title: 'Elektronikon® Mk5 Controller',
          points: [
            'Smart controller continuously monitors 16 machine parameters and automatically optimises performance for energy efficiency.',
            'Ethernet and Modbus connectivity enables remote monitoring and integration with factory energy management systems.',
          ],
        },
        {
          title: 'Oil-Injected Screw Element',
          points: [
            "Atlas Copco's robust screw element delivers continuous-duty compressed air at pressures from 4 to 13 bar with no planned downtime.",
            'Oil injection provides cooling, lubrication, and sealing — eliminating the need for water cooling in most workshop environments.',
          ],
        },
        {
          title: 'Ultra-Low Noise at 66 dB(A)',
          points: [
            'Acoustic enclosure and vibration-isolated compressor block reduce noise output to just 66 dB(A) — suitable for installation near workstations.',
            'No separate compressor room required, reducing installation civil works cost.',
          ],
        },
      ],
      description:
        'The Atlas Copco GA 15 VSD rotary screw compressor delivers energy savings of up to 35% compared to fixed-speed compressors by automatically matching output to actual air demand. The Elektronikon® Mk5 controller continuously monitors system parameters.\n\nThe oil-injected screw element is engineered for continuous duty operation at pressures up to 13 bar.',
      specifications: {
        'Motor Power': '15 kW',
        'Free Air Delivery': '26 – 47 m³/h',
        'Working Pressure': '4 – 13 bar',
        'Drive Type': 'Variable Speed Drive (VSD)',
        'Air Cooling': 'Fan-Cooled',
        'Noise Level': '66 dB(A)',
        Voltage: '400V / 3-Phase / 50 Hz',
        Controller: 'Elektronikon® Mk5',
        Dimensions: '1,020 × 650 × 1,000 mm',
        Weight: '350 kg',
      },
    },

    {
      name: 'California Air Tools 60-Gallon Belt Drive Compressor',
      categoryKey: 'Air Compressors',
      brand: 'California Air Tools',
      featured: false,
      inStock: true,
      images: [IMAGES.compressor[1], IMAGES.compressor[0]],
      keyFeatures: [
        {
          title: 'Ultra-Quiet 70 dB(A) Operation',
          points: [
            'At 70 dB(A) this is one of the quietest large-tank piston compressors available — suitable for body shops, woodworking studios, and noise-sensitive workshops.',
            'Belt-drive design runs the pump at lower RPM than direct-drive units, significantly reducing mechanical noise.',
          ],
        },
        {
          title: 'Large 227-Litre Tank',
          points: [
            '60-gallon (227-litre) vertical tank stores a large air reserve, reducing motor cycling frequency and extending compressor life.',
            'Continuous air supply for spray painting, sandblasting, and other high-consumption tools without pressure drops.',
          ],
        },
        {
          title: 'Two-Stage Oil-Lubricated Pump',
          points: [
            'Two-stage compression achieves 155 PSI maximum pressure with better efficiency than single-stage designs.',
            'Oil-lubricated pump runs cooler and lasts significantly longer than oil-free alternatives under daily use.',
          ],
        },
        {
          title: 'Fast Tank Recovery',
          points: [
            '~150-second tank recovery time from 90 PSI to 155 PSI ensures minimal wait time between demanding tool operations.',
            'Thermal overload protection automatically shuts the motor down if it overheats, preventing burn-out.',
          ],
        },
      ],
      description:
        'The California Air Tools 60-gallon belt-drive air compressor is engineered for ultra-quiet operation at just 70 dB(A), making it suitable for workshops, body shops, and woodworking studios. The oil-lubricated two-stage pump delivers fast recovery times.\n\nThe large 60-gallon vertical tank provides ample air storage to minimise motor cycling.',
      specifications: {
        'Tank Capacity': '60 Gallons / 227 Litres',
        Motor: '3.0 HP, 120V Single Phase',
        'Max Pressure': '155 PSI (10.7 bar)',
        'Free Air Delivery': '5.30 CFM @ 90 PSI',
        'Pump Type': '2-Stage Oil-Lubricated',
        Drive: 'Belt Drive',
        'Noise Level': '70 dB(A)',
        'Recovery Time': '~150 seconds',
        'Tank Orientation': 'Vertical',
        Weight: '115 kg',
      },
    },

    {
      name: 'Ingersoll Rand 2340L5 Piston Compressor 5HP',
      categoryKey: 'Air Compressors',
      brand: 'Ingersoll Rand',
      featured: false,
      inStock: false,
      images: IMAGES.compressor,
      keyFeatures: [
        {
          title: 'Cast Iron Two-Stage Pump',
          points: [
            'Heavy-duty cast iron cylinders and heads dissipate heat effectively, allowing 100% duty cycle operation without rest periods.',
            'Two-stage compression reaches 175 PSI — powering high-demand tools including sandblasters, plasma cutters, and spray guns simultaneously.',
          ],
        },
        {
          title: 'Low 1,050 RPM Pump Speed',
          points: [
            'Running at just 1,050 RPM versus 1,500+ RPM for typical compressors dramatically reduces wear on rings, valves, and bearings.',
            'Extends service intervals and overall pump life — Ingersoll Rand 2340 pumps routinely exceed 30,000 hours in production environments.',
          ],
        },
        {
          title: '80-Gallon Air Storage',
          points: [
            '302-litre ASME-certified pressure vessel stores a large air reserve for burst-demand applications in fabrication shops.',
            'Large tank stabilises system pressure during heavy tool use, preventing compressor short-cycling.',
          ],
        },
        {
          title: 'Splash Oil Lubrication',
          points: [
            'Proven splash lubrication system requires minimal maintenance — no oil pump to fail, just periodic oil level checks and changes.',
            'Replaceable paper element air intake filter protects the pump from dust ingestion in industrial environments.',
          ],
        },
      ],
      description:
        'The Ingersoll Rand 2340L5 is a cast-iron, two-stage piston compressor built for the toughest industrial environments. Delivering 18.1 CFM at 175 PSI, it powers high-consumption tools including sandblasters, spray guns, and pneumatic wrenches continuously.\n\nThe low-RPM cast-iron pump runs cooler and with less vibration, dramatically extending maintenance intervals.',
      specifications: {
        Motor: '5 HP, 230V / 460V',
        'Max Pressure': '175 PSI / 12 bar',
        'Free Air Delivery': '18.1 CFM @ 175 PSI',
        'Tank Capacity': '80 Gallons / 302 Litres',
        'Pump Speed': '1,050 RPM',
        'Pump Type': '2-Stage Cast Iron Piston',
        Lubrication: 'Oil-Lubricated (Splash)',
        'Duty Cycle': '100%',
        'Inlet Filter': 'Replaceable Paper Element',
        Weight: '220 kg',
      },
    },
  ]

  const products: Record<string, { id: string; name: string }> = {}
  for (const p of productData) {
    const cat = categories[p.categoryKey]
    if (!cat) {
      console.warn(`   ⚠ Category not found: ${p.categoryKey}`)
      continue
    }

    const productSlug = slug(p.name)
    const created = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        description: p.description,
        specifications: p.specifications,
        keyFeatures: p.keyFeatures,
        brand: p.brand || null,
        images: p.images,
        featured: p.featured,
        inStock: p.inStock,
      },
      create: {
        name: p.name,
        slug: productSlug,
        description: p.description,
        specifications: p.specifications,
        keyFeatures: p.keyFeatures,
        brand: p.brand || null,
        images: p.images,
        featured: p.featured,
        inStock: p.inStock,
        categoryId: cat.id,
      },
    })
    products[p.name] = created
    console.log(
      `   ✓ ${created.name}${p.featured ? ' ⭐' : ''}${!p.inStock ? ' [Out of stock]' : ''}`,
    )
  }

  // ── 5. Reviews ─────────────────────────────────────────────────────────────
  console.log('\n⭐ Seeding reviews...')
  const reviewData = [
    {
      productName: 'Cummins 20kVA Silent Diesel Generator',
      user: customers[0],
      rating: 5,
      comment:
        'This generator has been running our factory for over a year without a single failure. The fuel consumption is excellent and the noise level is remarkably low for a machine of this size. Delivery was on time and the after-sales support has been outstanding.',
    },
    {
      productName: 'Honda 5kVA Petrol Generator',
      user: customers[1],
      rating: 4,
      comment:
        'Very reliable for home backup power. The eco-throttle feature really does save fuel. Only giving 4 stars because the electric start took a few attempts to kick in when cold. Otherwise a great unit.',
    },
    {
      productName: '500W Monocrystalline Solar Panel',
      user: customers[2],
      rating: 5,
      comment:
        'Excellent panels — we installed 20 of them for our office building and energy costs dropped by 65% in the first month. The build quality feels premium and the output matches the rated spec even in partial cloud.',
    },
    {
      productName: 'Yamaha 40HP 4-Stroke Outboard Engine',
      user: customers[0],
      rating: 5,
      comment:
        'My fishing fleet runs on these engines. Fuel efficiency compared to the 2-stroke units we replaced is dramatically better. Start up is instant every time and maintenance is straightforward.',
    },
    {
      productName: 'Pedrollo 4" Submersible Borehole Pump',
      user: customers[1],
      rating: 4,
      comment:
        'Has been running in our 80-metre borehole for 8 months without issue. Good pressure and flow rate for our farm irrigation. Easy to install with the included instructions.',
    },
    {
      productName: 'CAT 320 20-Tonne Hydraulic Excavator',
      user: customers[2],
      rating: 5,
      comment:
        'The Cat Grade integrated system is a game-changer for our grading work. Operator reported much less fatigue after switching from our older machine. Fuel consumption is noticeably lower as well.',
    },
    {
      productName: 'Mahindra 575 DI 47HP 2WD Tractor',
      user: customers[0],
      rating: 4,
      comment:
        'Solid tractor for our rice farm. The turning radius is tight enough for row work. Would prefer a 4WD option but the 2WD handles our terrain adequately.',
    },
    {
      productName: 'Atlas Copco GA 15 VSD Rotary Screw Compressor',
      user: customers[1],
      rating: 5,
      comment:
        'The VSD feature is brilliant — our electricity bill dropped noticeably after replacing our old fixed-speed unit. Very quiet and the Elektronikon controller gives great visibility into performance data.',
    },
    {
      productName: 'Lincoln Electric Aspect 375 TIG Welder',
      user: customers[2],
      rating: 5,
      comment:
        'Professional-grade kit. The AC frequency control for aluminium TIG work is superb. Arc starts are crisp and consistent every time. Worth every penny for production welding.',
    },
    {
      productName: 'Grundfos CM5 Centrifugal Water Pump',
      user: customers[0],
      rating: 4,
      comment:
        'Compact, quiet, and reliable for our pressure boosting system. The stainless steel construction gives confidence it will last. Installation was straightforward following the included guide.',
    },
  ]

  for (const r of reviewData) {
    const product = products[r.productName]
    if (!product) continue
    const existing = await prisma.review.findFirst({
      where: { productId: product.id, userId: r.user.id },
    })
    if (!existing) {
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: r.user.id,
          rating: r.rating,
          comment: r.comment,
        },
      })
    }
    console.log(
      `   ✓ Review on "${r.productName}" by ${r.user.name} (${r.rating}★)`,
    )
  }

  // ── 6. Inquiries ───────────────────────────────────────────────────────────
  console.log('\n📩 Seeding inquiries...')
  const inquiryData = [
    {
      name: 'Samuel Koroma',
      email: 's.koroma@kororatrading.sl',
      phone: '+232 79 112 233',
      company: 'Korora Trading Co.',
      status: 'REPLIED',
      message:
        'We need a price and availability quote for 3 units of the Cummins 20kVA generator. We also need to know lead time for delivery to Bo, Sierra Leone.',
      productName: 'Cummins 20kVA Silent Diesel Generator',
      userId: customers[2].id,
    },
    {
      name: 'Aisha Bangura',
      email: 'a.bangura@sunfarm.sl',
      phone: '+232 77 445 566',
      company: 'SunFarm Solutions',
      status: 'PENDING',
      message:
        'Please send me pricing for the 10kW grid-tied solar system package. I would also like to know if professional installation is available in Freetown.',
      productName: '10kW Grid-Tied Solar System Package',
      userId: null,
    },
    {
      name: 'Emmanuel Diallo',
      email: 'e.diallo@atlanticfish.gn',
      phone: '+224 62 778 899',
      company: 'Atlantic Fisheries Ltd.',
      status: 'PENDING',
      message:
        'We operate 12 artisanal fishing vessels and need to replace all outboard engines. Can you provide bulk pricing for the Mercury 15HP 2-stroke? Minimum 12 units.',
      productName: 'Mercury 15HP 2-Stroke Outboard Motor',
      userId: null,
    },
    {
      name: 'Dr. Mariama Jalloh',
      email: 'm.jalloh@fregenhosp.sl',
      phone: '+232 76 334 455',
      company: 'Freetown General Hospital',
      status: 'REPLIED',
      message:
        'Our facility requires a reliable backup power solution. The 100kVA generator looks suitable. We need full technical specifications, warranty terms, and installation support.',
      productName: 'Perkins 100kVA Industrial Generator',
      userId: customers[0].id,
    },
    {
      name: 'Oumar Sy',
      email: 'o.sy@syagri.sn',
      phone: '+221 77 123 456',
      company: 'Sy Agriculture SRL',
      status: 'CLOSED',
      message:
        'Looking to acquire 5 units of the Kubota L3408 compact tractor for our farm expansion project. Please provide a proforma invoice and delivery timeline to Dakar.',
      productName: 'Kubota L3408 34HP 4WD Compact Tractor',
      userId: null,
    },
    {
      name: 'Fatima Al-Hassan',
      email: 'fatima.hassan@example.com',
      phone: '+234 80 234 5678',
      company: 'Al-Hassan Agro Industries',
      status: 'PENDING',
      message:
        'Our irrigation system needs upgrading. The Atlas Copco compressor and the borehole pump both look interesting. Can we discuss a combined order?',
      productName: 'Pedrollo 4" Submersible Borehole Pump',
      userId: customers[1].id,
    },
  ]

  for (const inq of inquiryData) {
    const product = products[inq.productName]
    const existing = await prisma.inquiry.findFirst({
      where: { email: inq.email, productId: product?.id },
    })
    if (!existing) {
      await prisma.inquiry.create({
        data: {
          name: inq.name,
          email: inq.email,
          phone: inq.phone,
          company: inq.company,
          message: inq.message,
          status: inq.status,
          productId: product?.id ?? null,
          userId: inq.userId ?? null,
        },
      })
    }
    console.log(`   ✓ Inquiry from ${inq.name} [${inq.status}]`)
  }

  // ── 7. FAQs ────────────────────────────────────────────────────────────────
  console.log('\n❓ Seeding FAQs...')
  const faqData = [
    {
      order: 1,
      question: 'Do your products come with a warranty?',
      answer:
        "Yes. All products we supply come with the manufacturer's standard warranty. Generators typically carry 1–2 year warranties, solar panels carry 10–25 year performance warranties, and marine engines carry 2–3 year warranties. Extended warranty packages are available on request.",
    },
    {
      order: 2,
      question: 'How do I request a price quote?',
      answer:
        "You can request a quote by clicking the 'Request Information' button on any product page. Our team will respond with pricing, availability, and lead times within 24 hours on business days.",
    },
    {
      order: 3,
      question: 'Do you deliver outside of Sierra Leone?',
      answer:
        'Yes, we deliver across West Africa including Nigeria, Ghana, Guinea, Liberia, and Senegal. International orders may be subject to additional shipping costs and longer lead times. Please include your delivery country in your inquiry for a full landed cost quotation.',
    },
    {
      order: 4,
      question: 'Can you assist with installation?',
      answer:
        'Yes. For generators, solar systems, and large industrial equipment we offer professional installation and commissioning services through our technical team and certified partner installers. Installation services are quoted separately.',
    },
    {
      order: 5,
      question: 'Are spare parts available for all equipment?',
      answer:
        'We maintain stock of fast-moving spare parts for our most popular product lines. For slower-moving components we can source genuine OEM parts directly from manufacturers. We recommend discussing spare parts availability at the point of purchase.',
    },
    {
      order: 6,
      question: 'What payment terms do you offer?',
      answer:
        'For standard orders we require 50% deposit at order confirmation with the balance due before dispatch. For established customers with a good payment history we offer 30-day credit terms. We accept bank transfers, mobile money, and Letters of Credit for large orders.',
    },
    {
      order: 7,
      question: 'How long does delivery take?',
      answer:
        'In-stock items for Freetown deliveries can be arranged within 2–5 business days. Items ordered from our suppliers typically take 3–8 weeks depending on origin. Your sales representative will provide a specific delivery estimate in your quotation.',
    },
    {
      order: 8,
      question: 'Can I visit a showroom before purchasing?',
      answer:
        'Yes, we have a showroom at our Freetown location where you can view selected equipment in person. For large items such as generators and construction equipment we can arrange a demonstration at a nearby site. Please contact us in advance to schedule a visit.',
    },
  ]

  for (const faq of faqData) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    })
    if (!existing) await prisma.fAQ.create({ data: faq })
    console.log(`   ✓ Q${faq.order}: ${faq.question.slice(0, 55)}...`)
  }

  // ── 8. Contact Messages ────────────────────────────────────────────────────
  console.log('\n💬 Seeding contact messages...')
  const messageData = [
    {
      name: 'Ibrahim Kamara',
      email: 'i.kamara@kams.sl',
      phone: '+232 76 987 654',
      subject: 'General Equipment Enquiry',
      message:
        "Good day. I came across your website and I'm interested in your range of generators and pumps for a construction project in Makeni. Could someone from your technical team call me to discuss requirements?",
      read: true,
    },
    {
      name: 'Christiana Williams',
      email: 'c.williams@cw-export.com',
      phone: null,
      subject: 'Export Partnership Opportunity',
      message:
        'I represent a trading company based in Accra and we are looking for machinery suppliers in West Africa to partner with for regional distribution. I would love to discuss a potential partnership arrangement.',
      read: false,
    },
    {
      name: 'Mohamed Sesay',
      email: 'm.sesay@sesay-farms.sl',
      phone: '+232 78 111 222',
      subject: 'Solar System for Farm Operations',
      message:
        'We operate a poultry farm 45km outside Freetown and we need a solar system to power our ventilation fans, lighting, and incubators during load shedding. Our load is approximately 8kW continuous. Please advise on a suitable system and provide a quote.',
      read: false,
    },
  ]

  for (const msg of messageData) {
    const existing = await prisma.contactMessage.findFirst({
      where: { email: msg.email, subject: msg.subject },
    })
    if (!existing) await prisma.contactMessage.create({ data: msg })
    console.log(`   ✓ Message from ${msg.name}: "${msg.subject}"`)
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  🔐 Admin:     admin@machinerystore.com / Admin@123')
  console.log('  👤 Customers: kwame.asante@example.com   / User@1234')
  console.log('                fatima.hassan@example.com  / User@1234')
  console.log('                james.okafor@example.com   / User@1234')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
