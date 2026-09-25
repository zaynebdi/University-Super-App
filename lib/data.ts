export type Course = {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  progress: number;
  attendance: number;
  grade: string;
  room: string;
  schedule: string;
  color: string;
};

export const courses: Course[] = [
  {
    id: "se-401",
    code: "SE-401",
    name: "Software Architecture",
    instructor: "Dr. Ahmed Khan",
    credits: 3,
    progress: 88,
    attendance: 94,
    grade: "A",
    room: "Lab 3",
    schedule: "Monday · 09:00 AM",
    color: "indigo",
  },
  {
    id: "ai-402",
    code: "AI-402",
    name: "Artificial Intelligence",
    instructor: "Dr. Sara Malik",
    credits: 3,
    progress: 76,
    attendance: 89,
    grade: "A-",
    room: "A-204",
    schedule: "Tuesday · 11:00 AM",
    color: "violet",
  },
  {
    id: "cs-405",
    code: "CS-405",
    name: "Cyber Security",
    instructor: "Prof. Hassan Raza",
    credits: 3,
    progress: 91,
    attendance: 96,
    grade: "A",
    room: "Cyber Lab",
    schedule: "Wednesday · 10:00 AM",
    color: "emerald",
  },
  {
    id: "se-406",
    code: "SE-406",
    name: "Web Engineering",
    instructor: "Dr. Ali Hassan",
    credits: 3,
    progress: 84,
    attendance: 91,
    grade: "B+",
    room: "Lab 2",
    schedule: "Thursday · 01:00 PM",
    color: "amber",
  },
  {
    id: "se-407",
    code: "SE-407",
    name: "Software Testing",
    instructor: "Dr. Usman Tariq",
    credits: 3,
    progress: 72,
    attendance: 87,
    grade: "B+",
    room: "B-112",
    schedule: "Friday · 10:00 AM",
    color: "rose",
  },
  {
    id: "ds-408",
    code: "DS-408",
    name: "Distributed Systems",
    instructor: "Dr. Hamza Ahmed",
    credits: 3,
    progress: 68,
    attendance: 84,
    grade: "B",
    room: "A-301",
    schedule: "Friday · 02:00 PM",
    color: "cyan",
  },
];
