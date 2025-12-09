// lib/mock-data.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  lastActive: string;
  status: "active" | "inactive" | "pending";
  medicinesCount: number;
  chatsCount: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  topic: string;
  messages: ChatMessage[];
  createdAt: string;
  status: "completed" | "ongoing" | "archived";
}

export interface Medicine {
  id: string;
  userId: string;
  userName: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  reminderEnabled: boolean;
  notes?: string;
}

export interface PersonalInfo {
  id: string;
  userId: string;
  dateOfBirth: string;
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  conditions: string[];
}

export interface EmergencyContact {
  id: string;
  userId: string;
  userName: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface Insurance {
  id: string;
  userId: string;
  userName: string;
  provider: string;
  policyNumber: string;
  groupNumber: string;
  memberId: string;
  expiryDate: string;
}

export interface Doctor {
  id: string;
  userId: string;
  userName: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  address: string;
  hospital?: string;
}

export interface Pharmacy {
  id: string;
  userId: string;
  userName: string;
  name: string;
  phone: string;
  address: string;
  isPreferred: boolean;
}

export interface MedicalHistoryItem {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer: string;
  category: string;
  answeredAt: string;
}

export interface EmergencySOSLog {
  id: string;
  userId: string;
  userName: string;
  type: "911" | "emergency_contact";
  contactName?: string;
  timestamp: string;
  location?: string;
  status: "triggered" | "resolved" | "cancelled";
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: "b2b" | "b2c";
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxUsers?: number; // For B2B plans
  isActive: boolean;
}

export interface B2CSubscription {
  id: string;
  odId: string;
  userName: string;
  planId: string;
  planName: string;
  status: "active" | "cancelled" | "expired" | "trial";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  amount: number;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  logo?: string;
  subscriptionId: string;
  planId: string;
  planName: string;
  maxUsers: number;
  currentUsers: number;
  status: "active" | "suspended" | "pending" | "cancelled";
  contractStartDate: string;
  contractEndDate: string;
  billingContact: {
    name: string;
    email: string;
    phone: string;
  };
  adminCredentials: {
    username: string;
    passwordHash: string; // In real app, never expose this
  };
  createdAt: string;
  updatedAt: string;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  companyName: string;
  employeeId?: string;
  username: string;
  passwordHash: string; // In real app, never expose this
  name: string;
  email: string;
  phone: string;
  department?: string;
  role: "admin" | "manager" | "employee";
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin?: string;
  createdBy: string;
}

export interface SubscriptionStats {
  totalB2CSubscriptions: number;
  activeB2CSubscriptions: number;
  totalCompanies: number;
  activeCompanies: number;
  totalRevenue: number;
  monthlyRevenue: number;
  trialUsers: number;
  churnRate: number;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "usr_001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    createdAt: "2024-01-15T10:30:00Z",
    lastActive: "2024-12-19T14:22:00Z",
    status: "active",
    medicinesCount: 5,
    chatsCount: 12,
  },
  {
    id: "usr_002",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 234-5678",
    createdAt: "2024-02-20T08:15:00Z",
    lastActive: "2024-12-18T09:45:00Z",
    status: "active",
    medicinesCount: 3,
    chatsCount: 8,
  },
  {
    id: "usr_003",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 345-6789",
    createdAt: "2024-03-10T16:45:00Z",
    lastActive: "2024-12-17T11:30:00Z",
    status: "active",
    medicinesCount: 7,
    chatsCount: 15,
  },
  {
    id: "usr_004",
    name: "Emily Davis",
    email: "emily.d@email.com",
    phone: "+1 (555) 456-7890",
    createdAt: "2024-04-05T12:00:00Z",
    lastActive: "2024-12-10T16:20:00Z",
    status: "inactive",
    medicinesCount: 2,
    chatsCount: 4,
  },
  {
    id: "usr_005",
    name: "Robert Wilson",
    email: "r.wilson@email.com",
    phone: "+1 (555) 567-8901",
    createdAt: "2024-05-22T09:30:00Z",
    lastActive: "2024-12-19T08:10:00Z",
    status: "active",
    medicinesCount: 4,
    chatsCount: 9,
  },
  {
    id: "usr_006",
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    phone: "+1 (555) 678-9012",
    createdAt: "2024-06-18T14:20:00Z",
    lastActive: "2024-12-19T15:45:00Z",
    status: "active",
    medicinesCount: 6,
    chatsCount: 11,
  },
  {
    id: "usr_007",
    name: "David Brown",
    email: "d.brown@email.com",
    phone: "+1 (555) 789-0123",
    createdAt: "2024-07-30T11:15:00Z",
    lastActive: "2024-12-01T10:00:00Z",
    status: "inactive",
    medicinesCount: 1,
    chatsCount: 2,
  },
  {
    id: "usr_008",
    name: "Jennifer Martinez",
    email: "j.martinez@email.com",
    phone: "+1 (555) 890-1234",
    createdAt: "2024-08-12T13:40:00Z",
    lastActive: "2024-12-19T12:30:00Z",
    status: "pending",
    medicinesCount: 0,
    chatsCount: 1,
  },
];

// Mock Personal Info
export const mockPersonalInfo: PersonalInfo[] = [
  {
    id: "pi_001",
    userId: "usr_001",
    dateOfBirth: "1985-03-15",
    bloodType: "O+",
    height: "5'10\"",
    weight: "175 lbs",
    allergies: ["Penicillin", "Peanuts"],
    conditions: ["Hypertension", "Type 2 Diabetes"],
  },
  {
    id: "pi_002",
    userId: "usr_002",
    dateOfBirth: "1990-07-22",
    bloodType: "A-",
    height: "5'6\"",
    weight: "140 lbs",
    allergies: [],
    conditions: ["Hypothyroidism"],
  },
  {
    id: "pi_003",
    userId: "usr_003",
    dateOfBirth: "1978-11-08",
    bloodType: "B+",
    height: "5'11\"",
    weight: "185 lbs",
    allergies: ["Sulfa drugs"],
    conditions: ["High Cholesterol", "Hypertension"],
  },
  {
    id: "pi_004",
    userId: "usr_004",
    dateOfBirth: "1995-01-30",
    bloodType: "AB+",
    height: "5'4\"",
    weight: "125 lbs",
    allergies: ["Latex"],
    conditions: [],
  },
  {
    id: "pi_005",
    userId: "usr_005",
    dateOfBirth: "1972-09-12",
    bloodType: "O-",
    height: "6'0\"",
    weight: "190 lbs",
    allergies: [],
    conditions: ["GERD", "Anxiety"],
  },
  {
    id: "pi_006",
    userId: "usr_006",
    dateOfBirth: "1988-05-25",
    bloodType: "A+",
    height: "5'7\"",
    weight: "155 lbs",
    allergies: ["Shellfish"],
    conditions: ["Depression", "Vitamin D Deficiency"],
  },
  {
    id: "pi_007",
    userId: "usr_007",
    dateOfBirth: "1982-12-03",
    bloodType: "B-",
    height: "5'9\"",
    weight: "170 lbs",
    allergies: [],
    conditions: [],
  },
  {
    id: "pi_008",
    userId: "usr_008",
    dateOfBirth: "1998-08-17",
    bloodType: "AB-",
    height: "5'5\"",
    weight: "135 lbs",
    allergies: ["Aspirin"],
    conditions: [],
  },
];

// Default Personal Info for users without data
export const defaultPersonalInfo: Omit<PersonalInfo, "id" | "userId"> = {
  dateOfBirth: "Not provided",
  bloodType: "Unknown",
  height: "Not provided",
  weight: "Not provided",
  allergies: [],
  conditions: [],
};

// Mock Chats
export const mockChats: Chat[] = [
  {
    id: "chat_001",
    userId: "usr_001",
    userName: "John Smith",
    topic: "Persistent headache and fatigue",
    messages: [
      {
        id: "msg_001",
        role: "user",
        content:
          "I've been having headaches for the past 3 days along with fatigue. What could be causing this?",
        timestamp: "2024-12-19T14:00:00Z",
      },
      {
        id: "msg_002",
        role: "assistant",
        content:
          "I understand you're experiencing headaches and fatigue. These symptoms can have various causes. Let me ask you a few questions to better understand your situation. Are you staying hydrated? How many hours of sleep are you getting?",
        timestamp: "2024-12-19T14:00:30Z",
      },
      {
        id: "msg_003",
        role: "user",
        content:
          "I drink about 4-5 glasses of water daily and sleep around 5-6 hours.",
        timestamp: "2024-12-19T14:02:00Z",
      },
      {
        id: "msg_004",
        role: "assistant",
        content:
          "Based on what you've shared, dehydration and insufficient sleep could be contributing factors. Adults typically need 7-9 hours of sleep and 8 glasses of water daily. I recommend increasing your water intake and prioritizing sleep. If symptoms persist beyond a week, please consult a healthcare provider.",
        timestamp: "2024-12-19T14:02:45Z",
      },
    ],
    createdAt: "2024-12-19T14:00:00Z",
    status: "completed",
  },
  {
    id: "chat_002",
    userId: "usr_002",
    userName: "Sarah Johnson",
    topic: "Seasonal allergies symptoms",
    messages: [
      {
        id: "msg_005",
        role: "user",
        content: "My nose is runny and eyes are itchy. Is this allergies?",
        timestamp: "2024-12-18T09:30:00Z",
      },
      {
        id: "msg_006",
        role: "assistant",
        content:
          "Your symptoms do sound consistent with allergic rhinitis (hay fever). Common symptoms include runny nose, itchy eyes, sneezing, and nasal congestion. Are you experiencing any other symptoms like coughing or skin rashes?",
        timestamp: "2024-12-18T09:30:45Z",
      },
    ],
    createdAt: "2024-12-18T09:30:00Z",
    status: "ongoing",
  },
  {
    id: "chat_003",
    userId: "usr_003",
    userName: "Michael Chen",
    topic: "Medication side effects inquiry",
    messages: [
      {
        id: "msg_007",
        role: "user",
        content:
          "I started taking Metformin last week and feeling nauseous. Is this normal?",
        timestamp: "2024-12-17T11:15:00Z",
      },
      {
        id: "msg_008",
        role: "assistant",
        content:
          "Nausea is a common side effect when starting Metformin, especially during the first few weeks. This often improves as your body adjusts. Taking it with food can help reduce nausea. However, if symptoms are severe or persist, please contact your prescribing physician.",
        timestamp: "2024-12-17T11:16:00Z",
      },
    ],
    createdAt: "2024-12-17T11:15:00Z",
    status: "completed",
  },
  {
    id: "chat_004",
    userId: "usr_005",
    userName: "Robert Wilson",
    topic: "Lower back pain",
    messages: [
      {
        id: "msg_009",
        role: "user",
        content:
          "I've had lower back pain since yesterday after lifting something heavy.",
        timestamp: "2024-12-19T08:00:00Z",
      },
      {
        id: "msg_010",
        role: "assistant",
        content:
          "Muscle strain from lifting is a common cause of lower back pain. For the next 24-48 hours, I recommend rest, ice packs for 15-20 minutes at a time, and over-the-counter pain relievers if needed. Avoid heavy lifting. If pain is severe, radiates down your legs, or you experience numbness, seek medical attention immediately.",
        timestamp: "2024-12-19T08:01:00Z",
      },
    ],
    createdAt: "2024-12-19T08:00:00Z",
    status: "completed",
  },
  {
    id: "chat_005",
    userId: "usr_006",
    userName: "Lisa Anderson",
    topic: "Sleep issues and insomnia",
    messages: [
      {
        id: "msg_011",
        role: "user",
        content:
          "I can't fall asleep at night. Been tossing and turning for hours.",
        timestamp: "2024-12-19T15:30:00Z",
      },
      {
        id: "msg_012",
        role: "assistant",
        content:
          "Insomnia can be frustrating. Let's explore some factors that might be affecting your sleep. What time do you typically go to bed and wake up? Do you use electronic devices before bed? How much caffeine do you consume daily?",
        timestamp: "2024-12-19T15:31:00Z",
      },
    ],
    createdAt: "2024-12-19T15:30:00Z",
    status: "ongoing",
  },
];

// Mock Medicines
export const mockMedicines: Medicine[] = [
  {
    id: "med_001",
    userId: "usr_001",
    userName: "John Smith",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    times: ["08:00"],
    startDate: "2024-01-15",
    reminderEnabled: true,
    notes: "Take with water, avoid potassium supplements",
  },
  {
    id: "med_002",
    userId: "usr_001",
    userName: "John Smith",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    times: ["08:00", "20:00"],
    startDate: "2024-01-15",
    reminderEnabled: true,
    notes: "Take with meals",
  },
  {
    id: "med_003",
    userId: "usr_002",
    userName: "Sarah Johnson",
    name: "Levothyroxine",
    dosage: "50mcg",
    frequency: "Once daily",
    times: ["06:00"],
    startDate: "2024-02-20",
    reminderEnabled: true,
    notes: "Take on empty stomach, 30 min before breakfast",
  },
  {
    id: "med_004",
    userId: "usr_003",
    userName: "Michael Chen",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    times: ["21:00"],
    startDate: "2024-03-10",
    reminderEnabled: true,
    notes: "Take at bedtime",
  },
  {
    id: "med_005",
    userId: "usr_003",
    userName: "Michael Chen",
    name: "Aspirin",
    dosage: "81mg",
    frequency: "Once daily",
    times: ["08:00"],
    startDate: "2024-03-10",
    reminderEnabled: true,
  },
  {
    id: "med_006",
    userId: "usr_005",
    userName: "Robert Wilson",
    name: "Omeprazole",
    dosage: "20mg",
    frequency: "Once daily",
    times: ["07:00"],
    startDate: "2024-05-22",
    reminderEnabled: true,
    notes: "Take 30 minutes before first meal",
  },
  {
    id: "med_007",
    userId: "usr_006",
    userName: "Lisa Anderson",
    name: "Sertraline",
    dosage: "50mg",
    frequency: "Once daily",
    times: ["09:00"],
    startDate: "2024-06-18",
    reminderEnabled: true,
  },
  {
    id: "med_008",
    userId: "usr_006",
    userName: "Lisa Anderson",
    name: "Vitamin D3",
    dosage: "2000 IU",
    frequency: "Once daily",
    times: ["09:00"],
    startDate: "2024-06-18",
    reminderEnabled: false,
  },
];

// Mock Emergency Contacts
export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: "ec_001",
    userId: "usr_001",
    userName: "John Smith",
    name: "Mary Smith",
    phone: "+1 (555) 111-2222",
    relationship: "Spouse",
    isPrimary: true,
  },
  {
    id: "ec_002",
    userId: "usr_001",
    userName: "John Smith",
    name: "James Smith",
    phone: "+1 (555) 111-3333",
    relationship: "Brother",
    isPrimary: false,
  },
  {
    id: "ec_003",
    userId: "usr_002",
    userName: "Sarah Johnson",
    name: "Tom Johnson",
    phone: "+1 (555) 222-3333",
    relationship: "Father",
    isPrimary: true,
  },
  {
    id: "ec_004",
    userId: "usr_003",
    userName: "Michael Chen",
    name: "Linda Chen",
    phone: "+1 (555) 333-4444",
    relationship: "Wife",
    isPrimary: true,
  },
  {
    id: "ec_005",
    userId: "usr_005",
    userName: "Robert Wilson",
    name: "Karen Wilson",
    phone: "+1 (555) 444-5555",
    relationship: "Daughter",
    isPrimary: true,
  },
  {
    id: "ec_006",
    userId: "usr_006",
    userName: "Lisa Anderson",
    name: "Mark Anderson",
    phone: "+1 (555) 555-6666",
    relationship: "Husband",
    isPrimary: true,
  },
];

// Mock Insurance
export const mockInsurance: Insurance[] = [
  {
    id: "ins_001",
    userId: "usr_001",
    userName: "John Smith",
    provider: "Blue Cross Blue Shield",
    policyNumber: "BCB123456789",
    groupNumber: "GRP001",
    memberId: "MEM001234",
    expiryDate: "2025-12-31",
  },
  {
    id: "ins_002",
    userId: "usr_002",
    userName: "Sarah Johnson",
    provider: "Aetna",
    policyNumber: "AET987654321",
    groupNumber: "GRP002",
    memberId: "MEM005678",
    expiryDate: "2025-06-30",
  },
  {
    id: "ins_003",
    userId: "usr_003",
    userName: "Michael Chen",
    provider: "United Healthcare",
    policyNumber: "UHC456789123",
    groupNumber: "GRP003",
    memberId: "MEM009012",
    expiryDate: "2025-08-31",
  },
  {
    id: "ins_004",
    userId: "usr_005",
    userName: "Robert Wilson",
    provider: "Cigna",
    policyNumber: "CIG789123456",
    groupNumber: "GRP005",
    memberId: "MEM003456",
    expiryDate: "2025-10-31",
  },
  {
    id: "ins_005",
    userId: "usr_006",
    userName: "Lisa Anderson",
    provider: "Humana",
    policyNumber: "HUM456123789",
    groupNumber: "GRP006",
    memberId: "MEM007890",
    expiryDate: "2025-09-30",
  },
];

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: "doc_001",
    userId: "usr_001",
    userName: "John Smith",
    name: "Dr. Amanda Roberts",
    specialty: "Primary Care",
    phone: "+1 (555) 600-1001",
    email: "a.roberts@clinic.com",
    address: "123 Medical Center Dr, Suite 100",
    hospital: "City General Hospital",
  },
  {
    id: "doc_002",
    userId: "usr_001",
    userName: "John Smith",
    name: "Dr. Steven Park",
    specialty: "Cardiology",
    phone: "+1 (555) 600-1002",
    address: "456 Heart Center Blvd",
    hospital: "City General Hospital",
  },
  {
    id: "doc_003",
    userId: "usr_002",
    userName: "Sarah Johnson",
    name: "Dr. Michelle Lee",
    specialty: "Endocrinology",
    phone: "+1 (555) 600-2001",
    address: "789 Specialist Way",
  },
  {
    id: "doc_004",
    userId: "usr_003",
    userName: "Michael Chen",
    name: "Dr. Robert Kim",
    specialty: "Internal Medicine",
    phone: "+1 (555) 600-3001",
    address: "321 Health Plaza",
    hospital: "Metro Medical Center",
  },
  {
    id: "doc_005",
    userId: "usr_005",
    userName: "Robert Wilson",
    name: "Dr. Sarah Thompson",
    specialty: "Gastroenterology",
    phone: "+1 (555) 600-5001",
    email: "s.thompson@digestive.com",
    address: "555 GI Center Dr",
    hospital: "Regional Medical Center",
  },
  {
    id: "doc_006",
    userId: "usr_006",
    userName: "Lisa Anderson",
    name: "Dr. James Wilson",
    specialty: "Psychiatry",
    phone: "+1 (555) 600-6001",
    email: "j.wilson@mentalhealth.com",
    address: "777 Wellness Blvd, Suite 200",
  },
];

// Mock Pharmacies
export const mockPharmacies: Pharmacy[] = [
  {
    id: "pharm_001",
    userId: "usr_001",
    userName: "John Smith",
    name: "CVS Pharmacy",
    phone: "+1 (555) 700-1001",
    address: "100 Main Street",
    isPreferred: true,
  },
  {
    id: "pharm_002",
    userId: "usr_002",
    userName: "Sarah Johnson",
    name: "Walgreens",
    phone: "+1 (555) 700-2001",
    address: "200 Oak Avenue",
    isPreferred: true,
  },
  {
    id: "pharm_003",
    userId: "usr_003",
    userName: "Michael Chen",
    name: "Rite Aid",
    phone: "+1 (555) 700-3001",
    address: "300 Elm Street",
    isPreferred: true,
  },
  {
    id: "pharm_004",
    userId: "usr_005",
    userName: "Robert Wilson",
    name: "CVS Pharmacy",
    phone: "+1 (555) 700-5001",
    address: "500 Pine Road",
    isPreferred: true,
  },
  {
    id: "pharm_005",
    userId: "usr_006",
    userName: "Lisa Anderson",
    name: "Walgreens",
    phone: "+1 (555) 700-6001",
    address: "600 Cedar Lane",
    isPreferred: true,
  },
];

// Mock Medical History (Onboarding Q&A)
export const mockMedicalHistory: MedicalHistoryItem[] = [
  {
    id: "mh_001",
    userId: "usr_001",
    userName: "John Smith",
    question: "Do you have any chronic conditions?",
    answer: "High blood pressure, Type 2 Diabetes",
    category: "Conditions",
    answeredAt: "2024-01-15T10:35:00Z",
  },
  {
    id: "mh_002",
    userId: "usr_001",
    userName: "John Smith",
    question: "Do you have any known allergies?",
    answer: "Penicillin, Peanuts",
    category: "Allergies",
    answeredAt: "2024-01-15T10:36:00Z",
  },
  {
    id: "mh_003",
    userId: "usr_001",
    userName: "John Smith",
    question: "Have you had any surgeries?",
    answer: "Appendectomy (2015)",
    category: "Surgical History",
    answeredAt: "2024-01-15T10:37:00Z",
  },
  {
    id: "mh_004",
    userId: "usr_001",
    userName: "John Smith",
    question: "Do you have a family history of heart disease?",
    answer: "Yes, father had heart attack at age 55",
    category: "Family History",
    answeredAt: "2024-01-15T10:38:00Z",
  },
  {
    id: "mh_005",
    userId: "usr_002",
    userName: "Sarah Johnson",
    question: "Do you have any chronic conditions?",
    answer: "Hypothyroidism",
    category: "Conditions",
    answeredAt: "2024-02-20T08:20:00Z",
  },
  {
    id: "mh_006",
    userId: "usr_002",
    userName: "Sarah Johnson",
    question: "Do you have any known allergies?",
    answer: "None",
    category: "Allergies",
    answeredAt: "2024-02-20T08:21:00Z",
  },
  {
    id: "mh_007",
    userId: "usr_003",
    userName: "Michael Chen",
    question: "Do you have any chronic conditions?",
    answer: "High cholesterol, Hypertension",
    category: "Conditions",
    answeredAt: "2024-03-10T16:50:00Z",
  },
  {
    id: "mh_008",
    userId: "usr_003",
    userName: "Michael Chen",
    question: "Do you smoke or use tobacco?",
    answer: "Former smoker, quit 5 years ago",
    category: "Lifestyle",
    answeredAt: "2024-03-10T16:51:00Z",
  },
  {
    id: "mh_009",
    userId: "usr_005",
    userName: "Robert Wilson",
    question: "Do you have any chronic conditions?",
    answer: "GERD, Anxiety",
    category: "Conditions",
    answeredAt: "2024-05-22T09:35:00Z",
  },
  {
    id: "mh_010",
    userId: "usr_005",
    userName: "Robert Wilson",
    question: "How often do you exercise?",
    answer: "3-4 times per week, mostly walking and light weights",
    category: "Lifestyle",
    answeredAt: "2024-05-22T09:36:00Z",
  },
  {
    id: "mh_011",
    userId: "usr_006",
    userName: "Lisa Anderson",
    question: "Do you have any chronic conditions?",
    answer: "Depression, Vitamin D Deficiency",
    category: "Conditions",
    answeredAt: "2024-06-18T14:25:00Z",
  },
  {
    id: "mh_012",
    userId: "usr_006",
    userName: "Lisa Anderson",
    question: "Do you have any known allergies?",
    answer: "Shellfish",
    category: "Allergies",
    answeredAt: "2024-06-18T14:26:00Z",
  },
  {
    id: "mh_013",
    userId: "usr_006",
    userName: "Lisa Anderson",
    question: "How would you rate your sleep quality?",
    answer: "Poor - frequently wake up at night, difficulty falling asleep",
    category: "Lifestyle",
    answeredAt: "2024-06-18T14:27:00Z",
  },
];

// Mock Emergency SOS Logs
export const mockEmergencyLogs: EmergencySOSLog[] = [
  {
    id: "sos_001",
    userId: "usr_001",
    userName: "John Smith",
    type: "emergency_contact",
    contactName: "Mary Smith",
    timestamp: "2024-11-15T22:30:00Z",
    status: "resolved",
  },
  {
    id: "sos_002",
    userId: "usr_003",
    userName: "Michael Chen",
    type: "911",
    timestamp: "2024-10-20T14:15:00Z",
    location: "Home - 456 Oak St",
    status: "resolved",
  },
  {
    id: "sos_003",
    userId: "usr_005",
    userName: "Robert Wilson",
    type: "emergency_contact",
    contactName: "Karen Wilson",
    timestamp: "2024-12-01T08:45:00Z",
    status: "cancelled",
  },
  {
    id: "sos_004",
    userId: "usr_006",
    userName: "Lisa Anderson",
    type: "911",
    timestamp: "2024-12-18T19:20:00Z",
    location: "Work - 789 Business Blvd",
    status: "triggered",
  },
];

// Dashboard Stats
export const getDashboardStats = () => ({
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter((u) => u.status === "active").length,
  totalChats: mockChats.length,
  ongoingChats: mockChats.filter((c) => c.status === "ongoing").length,
  totalMedicines: mockMedicines.length,
  activeMedicines: mockMedicines.filter((m) => m.reminderEnabled).length,
  emergencyContacts: mockEmergencyContacts.length,
  recentSOS: mockEmergencyLogs.filter((l) => {
    const logDate = new Date(l.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate > weekAgo;
  }).length,
});

// ============================================
// MOCK SUBSCRIPTION PLANS
// ============================================

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  // B2C Plans
  {
    id: "plan_b2c_free",
    name: "Free",
    type: "b2c",
    price: 0,
    billingCycle: "monthly",
    features: [
      "Basic symptom checker",
      "Up to 3 medicines tracking",
      "1 emergency contact",
    ],
    isActive: true,
  },
  {
    id: "plan_b2c_basic",
    name: "Basic",
    type: "b2c",
    price: 4.99,
    billingCycle: "monthly",
    features: [
      "Unlimited symptom chats",
      "Up to 10 medicines tracking",
      "3 emergency contacts",
      "Medical history storage",
      "Email support",
    ],
    isActive: true,
  },
  {
    id: "plan_b2c_premium",
    name: "Premium",
    type: "b2c",
    price: 9.99,
    billingCycle: "monthly",
    features: [
      "Everything in Basic",
      "Unlimited medicines tracking",
      "Unlimited emergency contacts",
      "Insurance & doctor management",
      "PDF reports",
      "Priority support",
      "Family sharing (up to 5)",
    ],
    isActive: true,
  },
  {
    id: "plan_b2c_premium_yearly",
    name: "Premium Yearly",
    type: "b2c",
    price: 99.99,
    billingCycle: "yearly",
    features: [
      "Everything in Premium",
      "2 months free",
      "Early access to features",
    ],
    isActive: true,
  },
  // B2B Plans
  {
    id: "plan_b2b_starter",
    name: "Business Starter",
    type: "b2b",
    price: 99,
    billingCycle: "monthly",
    maxUsers: 25,
    features: [
      "Up to 25 employees",
      "Admin dashboard",
      "Employee health tracking",
      "Basic analytics",
      "Email support",
    ],
    isActive: true,
  },
  {
    id: "plan_b2b_professional",
    name: "Business Professional",
    type: "b2b",
    price: 249,
    billingCycle: "monthly",
    maxUsers: 100,
    features: [
      "Up to 100 employees",
      "Advanced admin dashboard",
      "Department management",
      "Health analytics & reports",
      "API access",
      "Phone support",
    ],
    isActive: true,
  },
  {
    id: "plan_b2b_enterprise",
    name: "Enterprise",
    type: "b2b",
    price: 499,
    billingCycle: "monthly",
    maxUsers: 500,
    features: [
      "Up to 500 employees",
      "Custom branding",
      "SSO integration",
      "Advanced analytics",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom integrations",
    ],
    isActive: true,
  },
  {
    id: "plan_b2b_unlimited",
    name: "Enterprise Unlimited",
    type: "b2b",
    price: 999,
    billingCycle: "monthly",
    maxUsers: -1, // Unlimited
    features: [
      "Unlimited employees",
      "All Enterprise features",
      "On-premise deployment option",
      "Custom SLA",
      "Quarterly business reviews",
    ],
    isActive: true,
  },
];

// ============================================
// MOCK B2C SUBSCRIPTIONS
// ============================================

export const mockB2CSubscriptions: B2CSubscription[] = [
  {
    id: "sub_001",
    odId: "usr_001",
    userName: "John Smith",
    planId: "plan_b2c_premium",
    planName: "Premium",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    autoRenew: true,
    paymentMethod: "Visa •••• 4242",
    amount: 9.99,
  },
  {
    id: "sub_002",
    odId: "usr_002",
    userName: "Sarah Johnson",
    planId: "plan_b2c_basic",
    planName: "Basic",
    status: "active",
    startDate: "2024-02-20",
    endDate: "2025-02-20",
    autoRenew: true,
    paymentMethod: "Mastercard •••• 5555",
    amount: 4.99,
  },
  {
    id: "sub_003",
    odId: "usr_003",
    userName: "Michael Chen",
    planId: "plan_b2c_premium_yearly",
    planName: "Premium Yearly",
    status: "active",
    startDate: "2024-03-10",
    endDate: "2025-03-10",
    autoRenew: true,
    paymentMethod: "Visa •••• 1234",
    amount: 99.99,
  },
  {
    id: "sub_004",
    odId: "usr_004",
    userName: "Emily Davis",
    planId: "plan_b2c_free",
    planName: "Free",
    status: "active",
    startDate: "2024-04-05",
    endDate: "2099-12-31",
    autoRenew: false,
    amount: 0,
  },
  {
    id: "sub_005",
    odId: "usr_005",
    userName: "Robert Wilson",
    planId: "plan_b2c_basic",
    planName: "Basic",
    status: "cancelled",
    startDate: "2024-05-22",
    endDate: "2024-11-22",
    autoRenew: false,
    paymentMethod: "PayPal",
    amount: 4.99,
  },
  {
    id: "sub_006",
    odId: "usr_006",
    userName: "Lisa Anderson",
    planId: "plan_b2c_premium",
    planName: "Premium",
    status: "active",
    startDate: "2024-06-18",
    endDate: "2025-06-18",
    autoRenew: true,
    paymentMethod: "Visa •••• 9999",
    amount: 9.99,
  },
  {
    id: "sub_007",
    odId: "usr_007",
    userName: "David Brown",
    planId: "plan_b2c_free",
    planName: "Free",
    status: "expired",
    startDate: "2024-07-30",
    endDate: "2024-10-30",
    autoRenew: false,
    amount: 0,
  },
  {
    id: "sub_008",
    odId: "usr_008",
    userName: "Jennifer Martinez",
    planId: "plan_b2c_basic",
    planName: "Basic",
    status: "trial",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    autoRenew: false,
    amount: 0,
  },
];

// ============================================
// MOCK COMPANIES (B2B)
// ============================================

export const mockCompanies: Company[] = [
  {
    id: "comp_001",
    name: "McDonald's Corporation",
    email: "health@mcdonalds.com",
    phone: "+1 (800) 244-6227",
    address: "110 N Carpenter St, Chicago, IL 60607",
    industry: "Food & Beverage",
    subscriptionId: "sub_b2b_001",
    planId: "plan_b2b_enterprise",
    planName: "Enterprise",
    maxUsers: 500,
    currentUsers: 342,
    status: "active",
    contractStartDate: "2024-01-01",
    contractEndDate: "2025-12-31",
    billingContact: {
      name: "Sarah Mitchell",
      email: "s.mitchell@mcdonalds.com",
      phone: "+1 (312) 555-0101",
    },
    adminCredentials: {
      username: "mcdonalds_admin",
      passwordHash: "hashed_password_here",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-15T10:30:00Z",
  },
  {
    id: "comp_002",
    name: "Walmart Inc.",
    email: "wellness@walmart.com",
    phone: "+1 (800) 925-6278",
    address: "702 SW 8th Street, Bentonville, AR 72716",
    industry: "Retail",
    subscriptionId: "sub_b2b_002",
    planId: "plan_b2b_unlimited",
    planName: "Enterprise Unlimited",
    maxUsers: -1,
    currentUsers: 1250,
    status: "active",
    contractStartDate: "2024-02-15",
    contractEndDate: "2026-02-15",
    billingContact: {
      name: "John Peterson",
      email: "j.peterson@walmart.com",
      phone: "+1 (479) 555-0202",
    },
    adminCredentials: {
      username: "walmart_admin",
      passwordHash: "hashed_password_here",
    },
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-12-18T14:20:00Z",
  },
  {
    id: "comp_003",
    name: "TechStart Solutions",
    email: "hr@techstart.io",
    phone: "+1 (415) 555-0303",
    address: "500 Terry A Francois Blvd, San Francisco, CA 94158",
    industry: "Technology",
    subscriptionId: "sub_b2b_003",
    planId: "plan_b2b_starter",
    planName: "Business Starter",
    maxUsers: 25,
    currentUsers: 18,
    status: "active",
    contractStartDate: "2024-06-01",
    contractEndDate: "2025-06-01",
    billingContact: {
      name: "Emily Chen",
      email: "emily@techstart.io",
      phone: "+1 (415) 555-0304",
    },
    adminCredentials: {
      username: "techstart_admin",
      passwordHash: "hashed_password_here",
    },
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-12-10T09:15:00Z",
  },
  {
    id: "comp_004",
    name: "City General Hospital",
    email: "staff@citygeneral.org",
    phone: "+1 (555) 444-0404",
    address: "123 Medical Center Dr, New York, NY 10001",
    industry: "Healthcare",
    subscriptionId: "sub_b2b_004",
    planId: "plan_b2b_professional",
    planName: "Business Professional",
    maxUsers: 100,
    currentUsers: 87,
    status: "active",
    contractStartDate: "2024-03-15",
    contractEndDate: "2025-03-15",
    billingContact: {
      name: "Dr. Robert Adams",
      email: "r.adams@citygeneral.org",
      phone: "+1 (555) 444-0405",
    },
    adminCredentials: {
      username: "citygeneral_admin",
      passwordHash: "hashed_password_here",
    },
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-12-19T16:45:00Z",
  },
  {
    id: "comp_005",
    name: "Global Finance Corp",
    email: "wellness@globalfinance.com",
    phone: "+1 (212) 555-0505",
    address: "1 Wall Street, New York, NY 10005",
    industry: "Finance",
    subscriptionId: "sub_b2b_005",
    planId: "plan_b2b_enterprise",
    planName: "Enterprise",
    maxUsers: 500,
    currentUsers: 156,
    status: "suspended",
    contractStartDate: "2024-04-01",
    contractEndDate: "2025-04-01",
    billingContact: {
      name: "Michael Roberts",
      email: "m.roberts@globalfinance.com",
      phone: "+1 (212) 555-0506",
    },
    adminCredentials: {
      username: "globalfinance_admin",
      passwordHash: "hashed_password_here",
    },
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-11-20T11:30:00Z",
  },
  {
    id: "comp_006",
    name: "Green Energy Ltd",
    email: "people@greenenergy.co",
    phone: "+1 (303) 555-0606",
    address: "789 Sustainable Way, Denver, CO 80202",
    industry: "Energy",
    subscriptionId: "sub_b2b_006",
    planId: "plan_b2b_professional",
    planName: "Business Professional",
    maxUsers: 100,
    currentUsers: 45,
    status: "pending",
    contractStartDate: "2024-12-01",
    contractEndDate: "2025-12-01",
    billingContact: {
      name: "Lisa Green",
      email: "l.green@greenenergy.co",
      phone: "+1 (303) 555-0607",
    },
    adminCredentials: {
      username: "greenenergy_admin",
      passwordHash: "hashed_password_here",
    },
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
];

// ============================================
// MOCK COMPANY USERS
// ============================================

export const mockCompanyUsers: CompanyUser[] = [
  // McDonald's Users
  {
    id: "cu_001",
    companyId: "comp_001",
    companyName: "McDonald's Corporation",
    employeeId: "MCD-001",
    username: "jsmith_mcd",
    passwordHash: "hashed",
    name: "James Smith",
    email: "j.smith@mcdonalds.com",
    phone: "+1 (312) 555-1001",
    department: "Operations",
    role: "manager",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLogin: "2024-12-19T08:30:00Z",
    createdBy: "admin",
  },
  {
    id: "cu_002",
    companyId: "comp_001",
    companyName: "McDonald's Corporation",
    employeeId: "MCD-002",
    username: "mjohnson_mcd",
    passwordHash: "hashed",
    name: "Maria Johnson",
    email: "m.johnson@mcdonalds.com",
    phone: "+1 (312) 555-1002",
    department: "HR",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLogin: "2024-12-19T09:15:00Z",
    createdBy: "admin",
  },
  {
    id: "cu_003",
    companyId: "comp_001",
    companyName: "McDonald's Corporation",
    employeeId: "MCD-003",
    username: "dwilliams_mcd",
    passwordHash: "hashed",
    name: "David Williams",
    email: "d.williams@mcdonalds.com",
    phone: "+1 (312) 555-1003",
    department: "Kitchen",
    role: "employee",
    status: "active",
    createdAt: "2024-02-01T09:00:00Z",
    lastLogin: "2024-12-18T14:20:00Z",
    createdBy: "mjohnson_mcd",
  },
  {
    id: "cu_004",
    companyId: "comp_001",
    companyName: "McDonald's Corporation",
    employeeId: "MCD-004",
    username: "sbrown_mcd",
    passwordHash: "hashed",
    name: "Susan Brown",
    email: "s.brown@mcdonalds.com",
    phone: "+1 (312) 555-1004",
    department: "Customer Service",
    role: "employee",
    status: "inactive",
    createdAt: "2024-02-15T11:00:00Z",
    lastLogin: "2024-10-01T10:00:00Z",
    createdBy: "mjohnson_mcd",
  },
  // Walmart Users
  {
    id: "cu_005",
    companyId: "comp_002",
    companyName: "Walmart Inc.",
    employeeId: "WMT-001",
    username: "rjones_wmt",
    passwordHash: "hashed",
    name: "Robert Jones",
    email: "r.jones@walmart.com",
    phone: "+1 (479) 555-2001",
    department: "Store Operations",
    role: "admin",
    status: "active",
    createdAt: "2024-02-20T08:00:00Z",
    lastLogin: "2024-12-19T07:45:00Z",
    createdBy: "admin",
  },
  {
    id: "cu_006",
    companyId: "comp_002",
    companyName: "Walmart Inc.",
    employeeId: "WMT-002",
    username: "agarcia_wmt",
    passwordHash: "hashed",
    name: "Ana Garcia",
    email: "a.garcia@walmart.com",
    phone: "+1 (479) 555-2002",
    department: "Pharmacy",
    role: "manager",
    status: "active",
    createdAt: "2024-03-01T09:00:00Z",
    lastLogin: "2024-12-19T11:30:00Z",
    createdBy: "rjones_wmt",
  },
  // TechStart Users
  {
    id: "cu_007",
    companyId: "comp_003",
    companyName: "TechStart Solutions",
    employeeId: "TS-001",
    username: "klee_ts",
    passwordHash: "hashed",
    name: "Kevin Lee",
    email: "k.lee@techstart.io",
    phone: "+1 (415) 555-3001",
    department: "Engineering",
    role: "admin",
    status: "active",
    createdAt: "2024-06-05T10:00:00Z",
    lastLogin: "2024-12-19T10:00:00Z",
    createdBy: "admin",
  },
  {
    id: "cu_008",
    companyId: "comp_003",
    companyName: "TechStart Solutions",
    employeeId: "TS-002",
    username: "jpark_ts",
    passwordHash: "hashed",
    name: "Jennifer Park",
    email: "j.park@techstart.io",
    phone: "+1 (415) 555-3002",
    department: "Design",
    role: "employee",
    status: "active",
    createdAt: "2024-06-10T09:00:00Z",
    lastLogin: "2024-12-18T16:45:00Z",
    createdBy: "klee_ts",
  },
  {
    id: "cu_009",
    companyId: "comp_003",
    companyName: "TechStart Solutions",
    employeeId: "TS-003",
    username: "mkim_ts",
    passwordHash: "hashed",
    name: "Michael Kim",
    email: "m.kim@techstart.io",
    phone: "+1 (415) 555-3003",
    department: "Engineering",
    role: "employee",
    status: "pending",
    createdAt: "2024-12-15T14:00:00Z",
    createdBy: "klee_ts",
  },
  // City General Hospital Users
  {
    id: "cu_010",
    companyId: "comp_004",
    companyName: "City General Hospital",
    employeeId: "CGH-001",
    username: "drwilson_cgh",
    passwordHash: "hashed",
    name: "Dr. Sarah Wilson",
    email: "s.wilson@citygeneral.org",
    phone: "+1 (555) 444-4001",
    department: "Emergency",
    role: "admin",
    status: "active",
    createdAt: "2024-03-20T08:00:00Z",
    lastLogin: "2024-12-19T06:30:00Z",
    createdBy: "admin",
  },
];
