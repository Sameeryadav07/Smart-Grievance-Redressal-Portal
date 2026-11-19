import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Grievance Redressal Database...');

  // Clean existing records in reverse dependency order
  await prisma.complaintUpdate.deleteMany({});
  await prisma.aIAnalysis.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('✓ Cleaned existing tables');

  // 1. Departments
  const deptPWD = await prisma.department.create({
    data: {
      name: 'Public Works Department (PWD)',
      description: 'Roads, bridges, flyovers, highways, footpaths, and structural infrastructure.',
      keywords: 'road,pothole,highway,bridge,footpath,pavement,crack,construction,asphalt,divider,flyover,pedestrian',
    },
  });

  const deptWater = await prisma.department.create({
    data: {
      name: 'Water Supply & Sewerage Board',
      description: 'Drinking water pipelines, municipal tanks, sewage leakage, and drainage blockages.',
      keywords: 'water,pipeline,tap,supply,tank,contaminated,dirty,leakage,drainage,sewage,borewell,shortage',
    },
  });

  const deptPower = await prisma.department.create({
    data: {
      name: 'Electricity Distribution Board',
      description: 'Power transmission, transformers, streetlights, blackout outages, and exposed live wires.',
      keywords: 'power,electricity,transformer,wire,voltage,outage,blackout,streetlight,meter,current,shock,live',
    },
  });

  const deptMunc = await prisma.department.create({
    data: {
      name: 'Municipal Corporation (Sanitation & Parks)',
      description: 'Solid waste management, garbage clearance, park maintenance, and street sweeping.',
      keywords: 'garbage,waste,dustbin,sweeping,drain,smell,dump,clean,sanitation,rubbish,trash,disposal,park',
    },
  });

  const deptPolice = await prisma.department.create({
    data: {
      name: 'Police Department & Traffic',
      description: 'Public safety, nuisance, traffic signal failure, theft, and illegal parking.',
      keywords: 'crime,theft,robbery,assault,harassment,accident,traffic,signal,police,security,unsafe,danger',
    },
  });

  const deptHealth = await prisma.department.create({
    data: {
      name: 'Public Health Department',
      description: 'Mosquito breeding, epidemics, stagnant water hazards, and municipal clinic standards.',
      keywords: 'hospital,clinic,disease,epidemic,mosquito,stagnant,medical,ambulance,doctor,health,dengue,malaria',
    },
  });

  const deptEdu = await prisma.department.create({
    data: {
      name: 'Department of School Education',
      description: 'Government school infrastructure, safety hazards, mid-day meals, and boundary walls.',
      keywords: 'school,college,teacher,classroom,education,playground,library,student,infrastructure',
    },
  });

  const deptRevenue = await prisma.department.create({
    data: {
      name: 'Revenue & Land Administration',
      description: 'Public land encroachment, illegal constructions, property disputes, and registry issues.',
      keywords: 'tax,property,land,encroachment,illegal,construction,mutation,registry,survey',
    },
  });

  console.log('✓ Created 8 Departments');

  // 2. Categories
  const catPothole = await prisma.category.create({
    data: {
      name: 'Road Damage & Potholes',
      description: 'Potholes, broken roads, damaged asphalt, and missing speed breakers',
      keywords: 'road,pothole,asphalt,crater,highway,patch,damage',
      departmentId: deptPWD.id,
    },
  });

  const catBridge = await prisma.category.create({
    data: {
      name: 'Bridge & Flyover Structural Hazard',
      description: 'Cracks in flyovers, falling concrete, loose expansion joints',
      keywords: 'bridge,flyover,expansion,joint,crack,concrete,pillar',
      departmentId: deptPWD.id,
    },
  });

  const catWaterSupply = await prisma.category.create({
    data: {
      name: 'Water Supply Disruption & Contamination',
      description: 'No water supply, muddy/smelly drinking water, low pressure',
      keywords: 'water,supply,tap,muddy,smell,pressure,pipe,drinking',
      departmentId: deptWater.id,
    },
  });

  const catSewage = await prisma.category.create({
    data: {
      name: 'Sewage Overflow & Drain Blockage',
      description: 'Open drains, blocked manholes, gutter overflow on roads',
      keywords: 'drain,sewage,manhole,overflow,gutter,stink,block',
      departmentId: deptWater.id,
    },
  });

  const catPowerOutage = await prisma.category.create({
    data: {
      name: 'Power Outage & Transformer Fault',
      description: 'Frequent blackouts, sparking transformers, voltage spikes',
      keywords: 'power,outage,blackout,transformer,spark,voltage,cut',
      departmentId: deptPower.id,
    },
  });

  const catStreetLight = await prisma.category.create({
    data: {
      name: 'Street Light Inoperative',
      description: 'Dark streets, non-functional sodium/LED public lamps',
      keywords: 'street,light,lamp,dark,bulb,post,streetlight',
      departmentId: deptPower.id,
    },
  });

  const catGarbage = await prisma.category.create({
    data: {
      name: 'Uncollected Garbage Dump',
      description: 'Overflowing municipal bins, roadside garbage heaps, stench',
      keywords: 'garbage,dump,waste,rubbish,trash,bin,stench,cleaning',
      departmentId: deptMunc.id,
    },
  });

  const catPublicSafety = await prisma.category.create({
    data: {
      name: 'Public Safety & Traffic Signal',
      description: 'Broken traffic lights, dark unpatrolled alleys, road safety',
      keywords: 'traffic,signal,police,safety,hazard,light,cross',
      departmentId: deptPolice.id,
    },
  });

  const catHealth = await prisma.category.create({
    data: {
      name: 'Mosquito Vector & Sanitation Hazard',
      description: 'Stagnant water pools causing dengue/malaria outbreak threat',
      keywords: 'mosquito,dengue,malaria,stagnant,pool,disease,larvae',
      departmentId: deptHealth.id,
    },
  });

  const catEncroachment = await prisma.category.create({
    data: {
      name: 'Public Land Encroachment',
      description: 'Illegal kiosks, unauthorized construction blocking public right of way',
      keywords: 'encroachment,illegal,construction,footpath,land,shop',
      departmentId: deptRevenue.id,
    },
  });

  console.log('✓ Created 10 Categories');

  // 3. Users (Password: password123)
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Shri Vikram Malhotra (Admin)',
      email: 'admin@gov.in',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const pwdOfficer = await prisma.user.create({
    data: {
      name: 'Er. Rajesh Kulkarni (PWD Nodal)',
      email: 'pwd.officer@gov.in',
      passwordHash,
      role: 'DEPT_OFFICER',
      departmentId: deptPWD.id,
    },
  });

  const waterOfficer = await prisma.user.create({
    data: {
      name: 'Smt. Ananya Sen (Water Board)',
      email: 'water.officer@gov.in',
      passwordHash,
      role: 'DEPT_OFFICER',
      departmentId: deptWater.id,
    },
  });

  const policeOfficer = await prisma.user.create({
    data: {
      name: 'Inspector Sandeep Rathi (Traffic & Safety)',
      email: 'police.officer@gov.in',
      passwordHash,
      role: 'DEPT_OFFICER',
      departmentId: deptPolice.id,
    },
  });

  const citizenRahul = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      passwordHash,
      role: 'CITIZEN',
    },
  });

  const citizenPriya = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya@example.com',
      passwordHash,
      role: 'CITIZEN',
    },
  });

  console.log('✓ Created 6 Users (Super Admin, Officers & Citizens)');

  // 4. Pre-seeded Complaints
  const c1 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-A1B2C3',
      title: 'Massive dangerous pothole causing continuous 2-wheeler accidents near Metro Pillar 142',
      description:
        'A severe 2-feet deep pothole has emerged right after the recent rainfall near Metro Pillar 142 on Ring Road. Two motorcyclists have already fallen in the last 48 hours. Urgent asphalt leveling required before a fatal collision occurs.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      locationLat: 28.6289,
      locationLng: 77.2065,
      locationAddress: 'Ring Road, Near Metro Pillar 142, New Delhi',
      userId: citizenRahul.id,
      categoryId: catPothole.id,
      departmentId: deptPWD.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c1.id,
      tamperingScore: 12.4,
      metadataFlags: JSON.stringify(['valid_exif_camera: Samsung SM-G998B', 'geo_match_verified']),
      autoCategory: 'Road Damage & Potholes',
      categoryConfidence: 0.94,
      isFlagged: false,
      analysisData: JSON.stringify({
        duplicates: [],
        routingDecision: 'Direct routed to PWD (Urgency: High)',
      }),
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: c1.id,
      officerId: pwdOfficer.id,
      status: 'UNDER_REVIEW',
      comment: 'Complaint acknowledged. Junior Engineer Mr. Verma deputed for on-site inspection.',
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: c1.id,
      officerId: pwdOfficer.id,
      status: 'IN_PROGRESS',
      comment: 'Bitumen and asphalt repair team scheduled for road restoration tonight between 11 PM and 4 AM.',
    },
  });

  // Complaint 2: Flagged as Spliced / Fake
  const c2 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-FAKE01',
      title: 'Alleged complete road collapse on Sector 62 expressway',
      description:
        'The whole highway has collapsed into a giant trench. Immediate disaster response team needed.',
      status: 'UNDER_REVIEW',
      priority: 'LOW',
      locationLat: 28.5355,
      locationLng: 77.391,
      locationAddress: 'Sector 62 Expressway, Noida',
      userId: citizenPriya.id,
      categoryId: catPothole.id,
      departmentId: deptPWD.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c2.id,
      tamperingScore: 84.6,
      metadataFlags: JSON.stringify([
        'software_detected: Adobe Photoshop 2023',
        'high_ela_variance',
        'inconsistent_compression',
      ]),
      autoCategory: 'Road Damage & Potholes',
      categoryConfidence: 0.88,
      isFlagged: true,
      analysisData: JSON.stringify({
        duplicates: [],
        routingDecision: 'Priority downgraded due to high tampering probability',
      }),
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: c2.id,
      officerId: pwdOfficer.id,
      status: 'UNDER_REVIEW',
      comment: 'Automated AI Forensic alert: Image failed Error Level Analysis. Officer dispatched for manual verification before initiating expenditure.',
    },
  });

  // Complaint 3: Water pipeline contamination
  const c3 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-WTR789',
      title: 'Severely contaminated brown drinking water flowing through municipal taps in Block C',
      description:
        'Since yesterday morning, tap water in Block C has turned dark brown with an unbearable sewage odor. Hundreds of families have stopped drinking tap water. Suspect cross-contamination between drinking main and underground drainage line.',
      status: 'UNDER_REVIEW',
      priority: 'URGENT',
      locationLat: 19.076,
      locationLng: 72.8777,
      locationAddress: 'Bandra West, Block C, Mumbai, Maharashtra',
      userId: citizenRahul.id,
      categoryId: catWaterSupply.id,
      departmentId: deptWater.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c3.id,
      tamperingScore: 18.2,
      metadataFlags: JSON.stringify(['valid_exif_camera: Apple iPhone 14', 'geo_match_verified']),
      autoCategory: 'Water Supply Disruption & Contamination',
      categoryConfidence: 0.96,
      isFlagged: false,
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: c3.id,
      officerId: waterOfficer.id,
      status: 'UNDER_REVIEW',
      comment: 'Water quality testing team mobilized. Clean tanker dispatch ordered for Block C.',
    },
  });

  // Complaint 4: Duplicate of Complaint 1
  const c4 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-DUP002',
      title: 'Broken road and deep pothole near pillar 142 ring road',
      description:
        'Very big pothole near metro pillar 142. Bikes slipping and getting damaged. Please fix quickly.',
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      locationLat: 28.6291,
      locationLng: 77.2064,
      locationAddress: 'Near Pillar 142 Ring Road, Delhi',
      userId: citizenPriya.id,
      categoryId: catPothole.id,
      departmentId: deptPWD.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c4.id,
      tamperingScore: 8.5,
      duplicateOfId: c1.id,
      similarityScore: 0.89,
      autoCategory: 'Road Damage & Potholes',
      categoryConfidence: 0.91,
      isFlagged: true,
      analysisData: JSON.stringify({
        duplicates: [
          {
            complaintId: c1.id,
            trackingId: c1.trackingId,
            title: c1.title,
            similarityScore: 0.89,
            matchType: 'text+location (distance: 35m)',
          },
        ],
      }),
    },
  });

  // Complaint 5: Sparking transformer / Power Outage
  const c5 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-PWR451',
      title: 'Commercial transformer sparking with exposed live cables on pedestrian sidewalk',
      description:
        'A distribution transformer near the bus stop has caught minor sparks multiple times. Live dangling wires are touching the wet pavement. Major electrocution danger for school children.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      locationLat: 12.9716,
      locationLng: 77.5946,
      locationAddress: 'MG Road Near Bus Stand, Bengaluru, Karnataka',
      userId: citizenRahul.id,
      categoryId: catPowerOutage.id,
      departmentId: deptPower.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c5.id,
      tamperingScore: 14.1,
      autoCategory: 'Power Outage & Transformer Fault',
      categoryConfidence: 0.98,
      isFlagged: false,
    },
  });

  // Complaint 6: Street Light Inoperative (Resolved)
  const c6 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-LGT320',
      title: 'Four consecutive LED street lamps not functioning on 5th Cross Road',
      description:
        'The street is pitch dark after 7 PM, creating safety concerns for women and elderly walkers. Need replacement of fused LED fixtures.',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      locationLat: 13.0827,
      locationLng: 80.2707,
      locationAddress: '5th Cross Road, Anna Salai, Chennai, Tamil Nadu',
      userId: citizenPriya.id,
      categoryId: catStreetLight.id,
      departmentId: deptPower.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c6.id,
      tamperingScore: 5.2,
      autoCategory: 'Street Light Inoperative',
      categoryConfidence: 0.95,
      isFlagged: false,
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: c6.id,
      officerId: pwdOfficer.id,
      status: 'RESOLVED',
      comment: 'Maintenance lineman replaced all 4 faulty LED driver units. Illumination verified by night patrol.',
    },
  });

  // Complaint 7: Overflowing Garbage Dump
  const c7 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-GAR102',
      title: 'Overflowing municipal garbage bin blocking lane entrance for 5 days',
      description:
        'Sanitation trucks have not visited the central bin in Shastri Nagar for almost a week. Stray cattle and dogs are scattering waste across the road.',
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      locationLat: 22.5726,
      locationLng: 88.3639,
      locationAddress: 'Shastri Nagar Lane 4, Kolkata, West Bengal',
      userId: citizenRahul.id,
      categoryId: catGarbage.id,
      departmentId: deptMunc.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c7.id,
      tamperingScore: 11.0,
      autoCategory: 'Uncollected Garbage Dump',
      categoryConfidence: 0.93,
      isFlagged: false,
    },
  });

  // Complaint 8: Stagnant water & Dengue outbreak hazard
  const c8 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-HLT554',
      title: 'Large stagnant water pool in vacant plot breeding swarms of mosquitoes',
      description:
        'An abandoned construction basement has accumulated 4 feet of stagnant rainwater. Three dengue cases already reported in the adjoining society. Need immediate larvicide chemical spraying.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      locationLat: 17.385,
      locationLng: 78.4867,
      locationAddress: 'Banjara Hills Road No. 12, Hyderabad, Telangana',
      userId: citizenPriya.id,
      categoryId: catHealth.id,
      departmentId: deptHealth.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c8.id,
      tamperingScore: 16.5,
      autoCategory: 'Mosquito Vector & Sanitation Hazard',
      categoryConfidence: 0.95,
      isFlagged: false,
    },
  });

  // Complaint 9: Encroachment (Rejected - Commercial private dispute)
  const c9 = await prisma.complaint.create({
    data: {
      trackingId: 'GRV-REJ991',
      title: 'Neighbor built a boundary wall inside my residential plot',
      description:
        'Private property dispute between two private house owners regarding compound boundary alignment.',
      status: 'REJECTED',
      priority: 'LOW',
      locationLat: 28.6139,
      locationLng: 77.209,
      locationAddress: 'Defence Colony, New Delhi',
      userId: citizenRahul.id,
      categoryId: catEncroachment.id,
      departmentId: deptRevenue.id,
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      complaintId: c9.id,
      tamperingScore: 22.0,
      autoCategory: 'Public Land Encroachment',
      categoryConfidence: 0.81,
      isFlagged: false,
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: c9.id,
      officerId: adminUser.id,
      status: 'REJECTED',
      comment: 'Rejected: Portal handles public civic grievances only. Private land title disputes fall under Civil Court jurisdiction.',
    },
  });

  console.log('✓ Created realistic Grievances with AI Telemetry, Heatmaps & Audit Logs');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
