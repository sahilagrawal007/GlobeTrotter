import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding GlobeTrotter database...");

  // ─── Clear existing data ──────────────────────────────────────────────────
  await prisma.stopActivity.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  // ─── Cities ───────────────────────────────────────────────────────────────
  const cityData = [
    { name: "Goa", country: "India", costIndex: 3 },
    { name: "Jaipur", country: "India", costIndex: 2 },
    { name: "Kerala (Kochi)", country: "India", costIndex: 3 },
    { name: "Manali", country: "India", costIndex: 2 },
    { name: "Udaipur", country: "India", costIndex: 3 },
    { name: "Rishikesh", country: "India", costIndex: 2 },
    { name: "Mumbai", country: "India", costIndex: 4 },
    { name: "Bangkok", country: "Thailand", costIndex: 3 },
    { name: "Bali", country: "Indonesia", costIndex: 3 },
    { name: "Singapore", country: "Singapore", costIndex: 5 },
    { name: "Kuala Lumpur", country: "Malaysia", costIndex: 3 },
    { name: "Dubai", country: "UAE", costIndex: 5 },
    { name: "Kathmandu", country: "Nepal", costIndex: 2 },
    { name: "Colombo", country: "Sri Lanka", costIndex: 2 },
    { name: "Tokyo", country: "Japan", costIndex: 5 },
    { name: "Paris", country: "France", costIndex: 5 },
    { name: "Rome", country: "Italy", costIndex: 4 },
    { name: "Barcelona", country: "Spain", costIndex: 4 },
    { name: "London", country: "UK", costIndex: 5 },
    { name: "Amsterdam", country: "Netherlands", costIndex: 4 },
  ];

  const cities = await Promise.all(
    cityData.map((c) => prisma.city.create({ data: c }))
  );

  const cityMap = Object.fromEntries(cities.map((c) => [c.name, c.id]));

  // ─── Activities ───────────────────────────────────────────────────────────
  const activities = [
    // Goa
    { cityName: "Goa", name: "Scuba Diving", type: "adventure", cost: 2500, durationMin: 120, description: "Explore vibrant coral reefs and marine life off the Goa coast." },
    { cityName: "Goa", name: "Beach Shack Dinner", type: "food", cost: 800, durationMin: 90, description: "Fresh seafood and Goan cuisine by the Arabian Sea." },
    { cityName: "Goa", name: "Old Goa Church Tour", type: "culture", cost: 0, durationMin: 120, description: "Visit the Basilica of Bom Jesus and Se Cathedral, UNESCO Heritage Sites." },

    // Jaipur
    { cityName: "Jaipur", name: "Amber Fort Tour", type: "sightseeing", cost: 500, durationMin: 150, description: "Explore the magnificent hilltop fort overlooking Maota Lake." },
    { cityName: "Jaipur", name: "Rajasthani Thali", type: "food", cost: 600, durationMin: 60, description: "Authentic multi-course Rajasthani meal with dal baati churma." },
    { cityName: "Jaipur", name: "City Palace Visit", type: "culture", cost: 700, durationMin: 120, description: "Royal palace complex with museums and Diwan-i-Khas." },

    // Kerala (Kochi)
    { cityName: "Kerala (Kochi)", name: "Backwater Houseboat Stay", type: "relaxation", cost: 5000, durationMin: 480, description: "Cruise the serene Alleppey backwaters on a traditional kettu vallam." },
    { cityName: "Kerala (Kochi)", name: "Kathakali Performance", type: "culture", cost: 400, durationMin: 90, description: "Watch classical Kerala dance-drama with elaborate costumes and makeup." },
    { cityName: "Kerala (Kochi)", name: "Seafood at Fort Kochi", type: "food", cost: 900, durationMin: 90, description: "Fresh catch grilled at the iconic Chinese fishing net stalls." },

    // Manali
    { cityName: "Manali", name: "Rohtang Pass Trek", type: "adventure", cost: 1500, durationMin: 360, description: "Snow-capped mountain pass at 3,978 m with breathtaking Himalayan views." },
    { cityName: "Manali", name: "River Rafting on Beas", type: "adventure", cost: 1200, durationMin: 180, description: "Grade III–IV rapids through the Kullu valley." },
    { cityName: "Manali", name: "Hadimba Temple Visit", type: "sightseeing", cost: 0, durationMin: 60, description: "Unique four-storied wooden pagoda temple nestled among deodar trees." },

    // Udaipur
    { cityName: "Udaipur", name: "City Palace Museum", type: "culture", cost: 800, durationMin: 150, description: "Vast royal palace complex with crystal gallery and peacock mosaic courtyards." },
    { cityName: "Udaipur", name: "Lake Pichola Boat Ride", type: "relaxation", cost: 400, durationMin: 60, description: "Evening boat ride with views of Jag Mandir and Lake Palace." },
    { cityName: "Udaipur", name: "Rajasthani Puppet Show Dinner", type: "food", cost: 1000, durationMin: 120, description: "Cultural dinner with live folk performances." },

    // Rishikesh
    { cityName: "Rishikesh", name: "White Water Rafting", type: "adventure", cost: 1500, durationMin: 240, description: "Thrilling 16 km stretch on the Ganges through Grade III–IV rapids." },
    { cityName: "Rishikesh", name: "Yoga Session at Ashram", type: "relaxation", cost: 500, durationMin: 120, description: "Morning Hatha yoga and meditation at a riverside ashram." },
    { cityName: "Rishikesh", name: "Ganga Aarti at Triveni Ghat", type: "culture", cost: 0, durationMin: 60, description: "Spiritual evening fire ceremony on the banks of the holy Ganges." },

    // Mumbai
    { cityName: "Mumbai", name: "Gateway of India Walk", type: "sightseeing", cost: 0, durationMin: 60, description: "Iconic colonial arch overlooking Mumbai Harbour and the Arabian Sea." },
    { cityName: "Mumbai", name: "Dharavi Slum Tour", type: "culture", cost: 900, durationMin: 180, description: "Guided responsible-tourism walk through Asia's largest slum-city." },
    { cityName: "Mumbai", name: "Vada Pav Street Food Trail", type: "food", cost: 300, durationMin: 90, description: "Taste Mumbai's beloved street snacks across Dadar and Juhu." },

    // Bangkok
    { cityName: "Bangkok", name: "Grand Palace & Wat Phra Kaew", type: "culture", cost: 1500, durationMin: 180, description: "Thailand's most sacred temple and opulent royal complex." },
    { cityName: "Bangkok", name: "Thai Street Food Night Market", type: "food", cost: 700, durationMin: 120, description: "Pad thai, mango sticky rice, and satay at Yaowarat Road." },
    { cityName: "Bangkok", name: "Chao Phraya Sunset Cruise", type: "relaxation", cost: 1200, durationMin: 120, description: "Elegant dinner cruise along the river of kings." },

    // Bali
    { cityName: "Bali", name: "Tegallalang Rice Terrace Walk", type: "sightseeing", cost: 200, durationMin: 120, description: "UNESCO-listed emerald rice paddies north of Ubud." },
    { cityName: "Bali", name: "Uluwatu Temple & Kecak Dance", type: "culture", cost: 800, durationMin: 150, description: "Clifftop sea temple with mesmerising fire-dance performance at sunset." },
    { cityName: "Bali", name: "Balinese Cooking Class", type: "food", cost: 1800, durationMin: 240, description: "Market visit + hands-on Balinese cuisine cooking session." },

    // Singapore
    { cityName: "Singapore", name: "Gardens by the Bay Night Show", type: "sightseeing", cost: 1600, durationMin: 120, description: "Supertree Grove and Cloud Forest light-and-sound spectacle." },
    { cityName: "Singapore", name: "Hawker Centre Feast", type: "food", cost: 800, durationMin: 90, description: "Michelin-starred hawker stalls at Maxwell Food Centre." },
    { cityName: "Singapore", name: "Sentosa Island Day", type: "relaxation", cost: 3000, durationMin: 360, description: "Universal Studios, beach clubs, and cable car over the harbour." },

    // Kuala Lumpur
    { cityName: "Kuala Lumpur", name: "Petronas Twin Towers Visit", type: "sightseeing", cost: 1200, durationMin: 120, description: "Sky Bridge on level 41 and observation deck at level 86." },
    { cityName: "Kuala Lumpur", name: "Jalan Alor Street Food", type: "food", cost: 600, durationMin: 90, description: "KL's premier night food street — satay, dim sum, durian." },
    { cityName: "Kuala Lumpur", name: "Batu Caves Temple Trek", type: "culture", cost: 0, durationMin: 120, description: "Climb 272 rainbow-painted steps to the giant limestone cave temple." },

    // Dubai
    { cityName: "Dubai", name: "Burj Khalifa At the Top", type: "sightseeing", cost: 4000, durationMin: 120, description: "Observation deck at 124th floor of the world's tallest building." },
    { cityName: "Dubai", name: "Desert Safari & BBQ Dinner", type: "adventure", cost: 3500, durationMin: 360, description: "Dune bashing, camel riding, and traditional Arabic feast under the stars." },
    { cityName: "Dubai", name: "Gold Souk & Spice Souk", type: "culture", cost: 0, durationMin: 120, description: "Wander through Deira's legendary traditional markets." },

    // Kathmandu
    { cityName: "Kathmandu", name: "Pashupatinath Temple", type: "culture", cost: 200, durationMin: 120, description: "One of the most sacred Hindu temples, on the banks of the Bagmati." },
    { cityName: "Kathmandu", name: "Boudhanath Stupa Walk", type: "sightseeing", cost: 0, durationMin: 90, description: "Circumambulate the world's largest stupa with prayer wheels and monks." },
    { cityName: "Kathmandu", name: "Himalayan Trekking Day Hike", type: "adventure", cost: 1500, durationMin: 480, description: "Guided hike to Nagarkot viewpoint for sunrise Himalaya panorama." },

    // Colombo
    { cityName: "Colombo", name: "Galle Face Green Sunset", type: "relaxation", cost: 0, durationMin: 90, description: "Colonial-era oceanfront promenade with street food and sea breeze." },
    { cityName: "Colombo", name: "Sri Lankan Rice & Curry", type: "food", cost: 500, durationMin: 60, description: "Traditional leaf-served rice and 12-curry meal at a local restaurant." },
    { cityName: "Colombo", name: "National Museum Tour", type: "culture", cost: 300, durationMin: 120, description: "Explore Sri Lanka's history from ancient kingdoms to colonial era." },

    // Tokyo
    { cityName: "Tokyo", name: "Shibuya Crossing & Harajuku", type: "sightseeing", cost: 0, durationMin: 180, description: "Experience the world's busiest pedestrian crossing and quirky fashion street." },
    { cityName: "Tokyo", name: "Tsukiji Outer Market Breakfast", type: "food", cost: 2000, durationMin: 120, description: "Freshest sushi, tamagoyaki, and seafood at the famous outer market." },
    { cityName: "Tokyo", name: "teamLab Planets", type: "culture", cost: 3500, durationMin: 150, description: "Immersive digital art museum with infinite rooms and flower gardens." },

    // Paris
    { cityName: "Paris", name: "Eiffel Tower & Seine Cruise", type: "sightseeing", cost: 4000, durationMin: 240, description: "Summit of the iron lady + evening river cruise under city lights." },
    { cityName: "Paris", name: "Louvre Museum Half-Day", type: "culture", cost: 2000, durationMin: 240, description: "Mona Lisa, Venus de Milo and 35,000 works in the world's largest museum." },
    { cityName: "Paris", name: "Parisian Bistro Dinner", type: "food", cost: 3500, durationMin: 120, description: "Classic French cuisine — escargot, duck confit, crème brûlée." },

    // Rome
    { cityName: "Rome", name: "Colosseum & Roman Forum", type: "sightseeing", cost: 2500, durationMin: 240, description: "Skip-the-line tour of the ancient amphitheatre and Forum Romanum." },
    { cityName: "Rome", name: "Vatican City Tour", type: "culture", cost: 3000, durationMin: 300, description: "Sistine Chapel, St Peter's Basilica and the Vatican Museums." },
    { cityName: "Rome", name: "Trastevere Food Walk", type: "food", cost: 1500, durationMin: 180, description: "Neighbourhood pasta, suppli, and gelato tasting walk." },

    // Barcelona
    { cityName: "Barcelona", name: "Sagrada Família Visit", type: "culture", cost: 2500, durationMin: 150, description: "Gaudí's awe-inspiring basilica — towers with panoramic city views." },
    { cityName: "Barcelona", name: "La Barceloneta Beach Day", type: "relaxation", cost: 0, durationMin: 360, description: "Sun and sea on Barcelona's urban beach with tapas nearby." },
    { cityName: "Barcelona", name: "La Boqueria Market & Tapas", type: "food", cost: 1200, durationMin: 120, description: "Vibrant covered market plus pintxos and vermouth in El Born." },

    // London
    { cityName: "London", name: "British Museum", type: "culture", cost: 0, durationMin: 240, description: "Rosetta Stone, Egyptian mummies and 8 million global artefacts." },
    { cityName: "London", name: "Tower of London & Tower Bridge", type: "sightseeing", cost: 3000, durationMin: 180, description: "Crown Jewels and the world's most famous bascule bridge." },
    { cityName: "London", name: "Borough Market Food Tour", type: "food", cost: 1800, durationMin: 120, description: "London's oldest food market — artisan cheese, street food, pastries." },

    // Amsterdam
    { cityName: "Amsterdam", name: "Anne Frank House", type: "culture", cost: 1400, durationMin: 120, description: "The secret annex where Anne Frank hid during WWII — deeply moving." },
    { cityName: "Amsterdam", name: "Canal Boat Tour", type: "sightseeing", cost: 1200, durationMin: 90, description: "Cruise through 165 historic canals past 17th-century gabled houses." },
    { cityName: "Amsterdam", name: "Dutch Cheese & Stroopwafel Tasting", type: "food", cost: 800, durationMin: 60, description: "Sample Gouda, Edam, and traditional Dutch sweets at a heritage shop." },
  ];

  await Promise.all(
    activities.map((a) =>
      prisma.activity.create({
        data: {
          cityId: cityMap[a.cityName],
          name: a.name,
          type: a.type,
          cost: a.cost,
          durationMin: a.durationMin,
          description: a.description,
        },
      })
    )
  );

  // ─── Demo users ───────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@globetrotter.app",
      password: passwordHash,
      name: "Demo User",
      role: "user",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@globetrotter.app",
      password: passwordHash,
      name: "Admin",
      role: "admin",
    },
  });

  // ─── Demo trip for demo user ──────────────────────────────────────────────
  const goaId = cityMap["Goa"];
  const jaipurId = cityMap["Jaipur"];
  const goaActivities = await prisma.activity.findMany({ where: { cityId: goaId } });
  const jaipurActivities = await prisma.activity.findMany({ where: { cityId: jaipurId } });

  const demoTrip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: "Goa & Jaipur Adventure",
      description: "A perfect mix of beaches and royal heritage",
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-09-10T00:00:00.000Z"),
      isPublic: false,
    },
  });

  const stop1 = await prisma.stop.create({
    data: {
      tripId: demoTrip.id,
      cityId: goaId,
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-09-04T00:00:00.000Z"),
      order: 0,
      transportCost: 4000,
      stayCost: 9000,
      mealsCost: 2400,
    },
  });

  const stop2 = await prisma.stop.create({
    data: {
      tripId: demoTrip.id,
      cityId: jaipurId,
      startDate: new Date("2026-09-05T00:00:00.000Z"),
      endDate: new Date("2026-09-10T00:00:00.000Z"),
      order: 1,
      transportCost: 3500,
      stayCost: 7500,
      mealsCost: 1800,
    },
  });

  if (goaActivities.length > 0) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop1.id,
        activityId: goaActivities[0].id,
        scheduledTime: new Date("2026-09-02T10:00:00.000Z"),
      },
    });
  }
  if (goaActivities.length > 1) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop1.id,
        activityId: goaActivities[1].id,
        scheduledTime: new Date("2026-09-03T19:00:00.000Z"),
      },
    });
  }
  if (jaipurActivities.length > 0) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop2.id,
        activityId: jaipurActivities[0].id,
        scheduledTime: new Date("2026-09-06T09:00:00.000Z"),
      },
    });
  }

  console.log(`✅ Seed complete!`);
  console.log(`   Cities: ${cities.length}`);
  console.log(`   Activities: ${activities.length}`);
  console.log(`   Demo user: demo@globetrotter.app / password123`);
  console.log(`   Admin user: admin@globetrotter.app / password123`);
  console.log(`   Demo trip: "${demoTrip.name}"`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
