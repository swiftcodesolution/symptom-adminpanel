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
