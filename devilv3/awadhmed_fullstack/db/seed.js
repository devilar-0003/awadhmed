const bcrypt = require('bcryptjs');
const User    = require('../models/User');
const Doctor  = require('../models/Doctor');
const Medicine= require('../models/Medicine');
const Blog    = require('../models/Blog');
const Scheme  = require('../models/Scheme');

async function seed() {
  // ── Admin ──
  const adminEmail = process.env.ADMIN_EMAIL || 'anc@awadhmed.com';
  const adminPass  = process.env.ADMIN_PASSWORD || 'DVWPA1283B';
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    await User.create({
      name: 'AwadhMed Admin', email: adminEmail,
      password: await bcrypt.hash(adminPass, 10),
      role: 'admin', phone: '9999999999'
    });
    console.log(`✅ Admin seeded → ${adminEmail} / ${adminPass}`);
  }

  // ── Doctors ──
  if (await Doctor.countDocuments() === 0) {
    await Doctor.insertMany([
      { name:'Dr. Priya Sharma',  email:'priya@awadhmed.com',   specialty:'Cardiology',     hospital:'Medanta Lucknow',   fee:800,  rating:4.9, experience:15, photo:'https://i.pravatar.cc/150?img=47', available:true, slots:['09:00','10:00','11:00','14:00','15:00','16:00'], upiId:'priya.sharma@upi',  bio:'Senior cardiologist with 15 years experience.' },
      { name:'Dr. Rahul Verma',   email:'rahul@awadhmed.com',   specialty:'Orthopedics',    hospital:'KGMU Lucknow',      fee:600,  rating:4.7, experience:12, photo:'https://i.pravatar.cc/150?img=12', available:true, slots:['10:00','11:00','12:00','15:00','16:00'],          upiId:'rahul.verma@upi',   bio:'Expert orthopedic surgeon.' },
      { name:'Dr. Sunita Gupta',  email:'sunita@awadhmed.com',  specialty:'Pediatrics',     hospital:'Ram Manohar Lohia', fee:500,  rating:4.8, experience:10, photo:'https://i.pravatar.cc/150?img=32', available:true, slots:['09:00','10:00','11:00','14:00','16:00'],          upiId:'sunita.gupta@upi',  bio:'Child specialist and neonatologist.' },
      { name:'Dr. Amit Mishra',   email:'amit@awadhmed.com',    specialty:'Neurology',      hospital:'Apollo Lucknow',    fee:1000, rating:4.9, experience:18, photo:'https://i.pravatar.cc/150?img=15', available:true, slots:['11:00','12:00','15:00','16:00','17:00'],          upiId:'amit.mishra@upi',   bio:'Neurologist specializing in brain disorders.' },
      { name:'Dr. Kavita Singh',  email:'kavita@awadhmed.com',  specialty:'Dermatology',    hospital:'Sahara Hospital',   fee:700,  rating:4.6, experience:8,  photo:'https://i.pravatar.cc/150?img=45', available:true, slots:['09:00','10:00','12:00','14:00','15:00'],          upiId:'kavita.singh@upi',  bio:'Skin specialist and cosmetologist.' },
      { name:'Dr. Vikas Dubey',   email:'vikas@awadhmed.com',   specialty:'General Medicine',hospital:'Charak Hospital',  fee:400,  rating:4.5, experience:6,  photo:'https://i.pravatar.cc/150?img=18', available:true, slots:['09:00','10:00','11:00','14:00','15:00','16:00'], upiId:'vikas.dubey@upi',   bio:'General physician for all common ailments.' },
    ]);
    console.log('✅ Doctors seeded');
  }

  // ── Medicines ──
  if (await Medicine.countDocuments() === 0) {
    await Medicine.insertMany([
      { name:'Paracetamol 500mg',  brand:'Calpol',    category:'Pain Relief', price:45,  stock:200, description:'For fever and mild pain.',            image:'💊' },
      { name:'Azithromycin 500mg', brand:'Zithromax', category:'Antibiotic',  price:180, stock:100, description:'Broad-spectrum antibiotic.',           image:'💊' },
      { name:'Metformin 500mg',    brand:'Glycomet',  category:'Diabetes',    price:65,  stock:150, description:'For Type 2 diabetes management.',      image:'💊' },
      { name:'Omeprazole 20mg',    brand:'Omez',      category:'Gastric',     price:95,  stock:180, description:'Acid reflux and ulcer treatment.',      image:'💊' },
      { name:'Vitamin D3 60000IU', brand:'Calcirol',  category:'Supplements', price:120, stock:250, description:'Vitamin D deficiency supplement.',      image:'💊' },
      { name:'Cetirizine 10mg',    brand:'Zyrtec',    category:'Allergy',     price:35,  stock:300, description:'Antihistamine for allergies.',          image:'💊' },
      { name:'Atorvastatin 10mg',  brand:'Lipitor',   category:'Cholesterol', price:210, stock:90,  description:'Cholesterol-lowering statin.',         image:'💊' },
      { name:'Amlodipine 5mg',     brand:'Norvasc',   category:'Blood Pressure', price:75, stock:120, description:'Calcium channel blocker for BP.', image:'💊' },
    ]);
    console.log('✅ Medicines seeded');
  }

  // ── Schemes ──
  if (await Scheme.countDocuments() === 0) {
    await Scheme.insertMany([
      { name:'Ayushman Bharat PM-JAY',             description:'Health insurance cover of ₹5 lakh per family for secondary & tertiary care.', longDesc:'Pradhan Mantri Jan Arogya Yojana provides cashless treatment in empanelled hospitals.',          category:'Insurance', eligibility:'Families in SECC database, deprived rural/urban workers.',        benefits:'₹5 lakh per family per year, covers 1500+ procedures, free treatment.',                       applyLink:'https://pmjay.gov.in' },
      { name:'Pradhan Mantri Matru Vandana Yojana',description:'Maternity benefit for pregnant & lactating mothers.',                          longDesc:'Cash incentive of ₹5,000 for first child, conditional on vaccination.',                          category:'Women',     eligibility:'All pregnant women (19+ years) except government employees.',        benefits:'Partial wage compensation, nutritional support, safe delivery encouragement.',                 applyLink:'https://wcd.nic.in' },
      { name:'Rashtriya Swasthya Bima Yojana',     description:'Health insurance for BPL families.',                                          longDesc:'Coverage up to ₹30,000 for hospitalization.',                                                   category:'Insurance', eligibility:'Below Poverty Line families, certain occupational groups.',          benefits:'Cashless hospitalization, pre-existing diseases covered, family floater.',                     applyLink:'https://rsby.gov.in' },
      { name:'National Health Mission (NHM)',       description:'Strengthening public health systems.',                                        longDesc:'Supports maternal health, child health, and communicable diseases.',                             category:'Health',    eligibility:'All citizens, especially rural and tribal populations.',             benefits:'Free diagnostics, drugs, and institutional care at public facilities.',                        applyLink:'https://nhm.gov.in' },
      { name:'PM National Dialysis Program',        description:'Free dialysis services at district hospitals.',                               longDesc:'Provides free dialysis under NHM for kidney patients.',                                         category:'Health',    eligibility:'All citizens with kidney failure.',                                  benefits:'Free dialysis sessions, transport allowance, quality care.',                                   applyLink:'https://nhm.gov.in' },
      { name:'Rashtriya Vayoshri Yojana',           description:'Assistive devices for senior citizens.',                                     longDesc:'Free distribution of aids & assistive devices.',                                                category:'Senior',    eligibility:'Senior citizens (60+ years) with low income.',                       benefits:'Walking sticks, hearing aids, spectacles, dentures, etc.',                                     applyLink:'https://socialjustice.gov.in' },
      { name:'Niramay Health Scheme',               description:'Preventive health checkups for rural women.',                                 longDesc:'Focus on breast & cervical cancer screening.',                                                   category:'Women',     eligibility:'Women aged 30-65 in rural areas.',                                   benefits:'Free screening, medicines, and follow-up consultations.',                                      applyLink:'https://nrhm.gov.in' },
      { name:'PM National Tuberculosis Elimination', description:'Nikshay Poshan Yojana for TB patients.',                                    longDesc:'Nutritional support to TB patients.',                                                           category:'Health',    eligibility:'All notified TB patients.',                                          benefits:'₹500 per month during treatment, direct benefit transfer.',                                    applyLink:'https://tbcindia.gov.in' },
    ]);
    console.log('✅ Schemes seeded');
  }

  // ── Blog ──
  if (await Blog.countDocuments() === 0) {
    await Blog.insertMany([
      { title:'5 Tips for a Healthier Monsoon Season in Lucknow', slug:'5-tips-healthier-monsoon-lucknow', content:'The monsoon season brings relief from scorching heat but also diseases. Here are five tips:\n\n1. **Drink boiled/filtered water** — Waterborne diseases spike.\n2. **Avoid street food** — Especially raw salads exposed to rain.\n3. **Use mosquito repellent** — Dengue and malaria cases rise.\n4. **Keep surroundings dry** — Stagnant water breeds mosquitoes.\n5. **Strengthen immunity** — Vitamin C and warm turmeric milk help.', excerpt:'Stay safe this monsoon with practical health tips from AwadhMed.', author:'Dr. Vikas Dubey', category:'Wellness', tags:['monsoon','health','lucknow'], published:true },
      { title:'Understanding Diabetes: Prevention and Management', slug:'understanding-diabetes-prevention-management', content:'Diabetes is one of the fastest growing lifestyle diseases in India. Lucknow alone has seen a 30% rise in Type 2 diabetes cases.\n\n**What causes Type 2 Diabetes?**\nInsulin resistance develops when cells stop responding to insulin.\n\n**Prevention Tips:**\n- Maintain healthy body weight\n- Exercise 30 minutes daily\n- Reduce refined sugar intake', excerpt:'Comprehensive guide to understanding, preventing and managing diabetes.', author:'Dr. Sunita Gupta', category:'Medical Guide', tags:['diabetes','prevention','lifestyle'], published:true },
    ]);
    console.log('✅ Blog posts seeded');
  }
}

module.exports = seed;
