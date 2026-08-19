import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ----------------------------------------------------
// IN-MEMORY DATABASE & SEED DATA
// ----------------------------------------------------

interface IssueTypeSeed {
  id: string;
  name: string;
  category: string;
  default_priority: 'low' | 'medium' | 'high' | 'critical';
  department_id: string;
  icon: string;
  description: string;
}

const DEPARTMENTS = [
  { id: 'dept_water', name: 'Water & Sanitation', contact_info: 'water-ops@metro.gov • (555) 019-2831', sla_hours: 12, head_officer: 'Marcus Wright' },
  { id: 'dept_roads', name: 'Public Works & Roads', contact_info: 'publicworks@metro.gov • (555) 014-9921', sla_hours: 24, head_officer: 'Elena Vance' },
  { id: 'dept_power', name: 'Power & Electrical', contact_info: 'electrical@metro.gov • (555) 018-4412', sla_hours: 24, head_officer: 'Tariq Johnson' },
  { id: 'dept_sanitation', name: 'Sanitation & Waste Management', contact_info: 'waste-dispatch@metro.gov • (555) 012-3849', sla_hours: 8, head_officer: 'Sarah Jenkins' },
  { id: 'dept_transit', name: 'Transit & Traffic Control', contact_info: 'traffic-signals@metro.gov • (555) 017-5501', sla_hours: 4, head_officer: 'David Cho' },
  { id: 'dept_zoning', name: 'Zoning & Code Enforcement', contact_info: 'code-compliance@metro.gov • (555) 011-8892', sla_hours: 48, head_officer: 'Priya Patel' },
];

const ISSUE_TYPES: IssueTypeSeed[] = [
  { id: 'issue_water', name: 'Water Leakage', category: 'Infrastructure / Plumbing', default_priority: 'high', department_id: 'dept_water', icon: 'water_drop', description: 'Leaking pipe, burst water main, or flooding on street/sidewalk' },
  { id: 'issue_pothole', name: 'Pothole & Road Damage', category: 'Roads & Pavements', default_priority: 'medium', department_id: 'dept_roads', icon: 'edit_road', description: 'Damaged asphalt, deep road crater, or sinking trench' },
  { id: 'issue_garbage', name: 'Garbage Accumulation', category: 'Sanitation & Waste', default_priority: 'medium', department_id: 'dept_sanitation', icon: 'delete', description: 'Overflowing municipal bin, missed collection, or illegal roadside dumping' },
  { id: 'issue_streetlight', name: 'Streetlight Outage', category: 'Electrical & Lighting', default_priority: 'low', department_id: 'dept_power', icon: 'lightbulb', description: 'Dark lamp post, flickering light, or exposed wiring' },
  { id: 'issue_drainage', name: 'Drainage & Storm Drain', category: 'Drainage & Sewage', default_priority: 'high', department_id: 'dept_water', icon: 'plumbing', description: 'Blocked storm drain, sewer backup, or standing stagnant water' },
  { id: 'issue_traffic', name: 'Traffic Light Failure', category: 'Transit & Safety', default_priority: 'critical', department_id: 'dept_transit', icon: 'traffic', description: 'Non-functioning intersection signals or knocked down signage' },
  { id: 'issue_vandalism', name: 'Graffiti & Vandalism', category: 'Public Property', default_priority: 'low', department_id: 'dept_roads', icon: 'format_paint', description: 'Defaced public structures, bus shelters, or parks' },
  { id: 'issue_other', name: 'Other Civic Concern', category: 'General Inquiries', default_priority: 'low', department_id: 'dept_roads', icon: 'more_horiz', description: 'General neighborhood safety or maintenance issue' },
];

const USERS = [
  {
    id: 'usr_citizen_1',
    name: 'Mohammed Ali',
    phone: '+1 (555) 019-2831',
    email: 'mohammed@civic.org',
    role: 'citizen',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_officer_1',
    name: 'Officer Marcus Davis',
    phone: '+1 (555) 014-9921',
    email: 'davis@metro.gov',
    role: 'officer',
    department_id: 'dept_water',
    badge_number: 'W-492',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_admin_1',
    name: 'Director Robert Hayes',
    phone: '+1 (555) 010-8800',
    email: 'hayes@metro.gov',
    role: 'admin',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

let LOCATIONS = [
  { id: 'loc_1', latitude: 42.3601, longitude: -71.0589, address: 'Sion Road, Block 400', ward: 'Ward 14', area: 'Downtown Commercial District' },
  { id: 'loc_2', latitude: 42.3625, longitude: -71.0612, address: 'Main St. & 4th Ave', ward: 'Ward 14', area: 'Civic District, Sector 4' },
  { id: 'loc_3', latitude: 42.3582, longitude: -71.0544, address: '12 Maple Ave', ward: 'Ward 9', area: 'East Residential Quarter' },
  { id: 'loc_4', latitude: 42.3551, longitude: -71.0645, address: 'Oak & 5th Avenue', ward: 'Ward 11', area: 'Midtown Corridor' },
  { id: 'loc_5', latitude: 42.3670, longitude: -71.0520, address: '402 West Elm Street', ward: 'Ward 14', area: 'Zone 3 • North Shore' },
  { id: 'loc_6', latitude: 42.3644, longitude: -71.0688, address: 'River Walk Promenade', ward: 'Ward 7', area: 'Waterfront District' },
  { id: 'loc_7', latitude: 42.3595, longitude: -71.0710, address: 'Route 9 & Oak Blvd', ward: 'Ward 12', area: 'Highway Interchange' },
];

let COMPLAINTS: any[] = [
  {
    id: 'CIV-2026-001247',
    user_id: 'usr_citizen_1',
    title: 'Water Leakage on Public Road',
    description: 'There is a significant amount of water bubbling up from the sidewalk near the storm drain. It is starting to flood the pedestrian crossing and looks like a main break. Water is clear but flowing fast.',
    issue_type_id: 'issue_water',
    priority: 'high',
    status: 'in_progress',
    location_id: 'loc_1',
    ai_confidence: 0.94,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    needs_followup: false,
    media: [
      {
        id: 'med_1',
        complaint_id: 'CIV-2026-001247',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80',
        ai_label: 'Pressurized water pipe rupture near sidewalk',
        ai_confidence: 0.94,
        uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
    status_updates: [
      { id: 'su_1', complaint_id: 'CIV-2026-001247', status: 'submitted', remarks: 'Citizen submitted report via AI Mobile App', updated_by: 'System AI Intake', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 'su_2', complaint_id: 'CIV-2026-001247', status: 'submitted', remarks: 'AI verified issue: Water Leakage (94% confidence), categorized as Infrastructure', updated_by: 'CivicAI Orchestrator', created_at: new Date(Date.now() - 1000 * 60 * 115).toISOString() },
      { id: 'su_3', complaint_id: 'CIV-2026-001247', status: 'assigned', remarks: 'Auto-routed to Water & Sanitation (Zone 3 Water Response Unit, 12hr SLA)', updated_by: 'Rules Engine', created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { id: 'su_4', complaint_id: 'CIV-2026-001247', status: 'in_progress', remarks: 'Field crew dispatched to shut off intermediate valve. On-site repairs initiated.', updated_by: 'Officer Marcus Davis', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    ],
    assignment: {
      id: 'asg_1',
      complaint_id: 'CIV-2026-001247',
      department_id: 'dept_water',
      officer_id: 'usr_officer_1',
      assigned_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      due_at: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
      team_name: 'Zone 3 Water Response',
      officer_name: 'Officer Marcus Davis',
    },
    ai_result: {
      issue_type: 'Water Leakage',
      issue_type_id: 'issue_water',
      summary: 'A water pipe appears to be leaking near a public road. The spread suggests a continuous flow requiring municipal maintenance.',
      severity: 'high',
      confidence: 0.94,
      needs_followup: false,
      location_hint: 'Sion Road, Block 400',
      category: 'Infrastructure / Plumbing',
    },
  },
  {
    id: 'CIV-2026-001246',
    user_id: 'usr_citizen_1',
    title: 'Deep Pothole near intersection',
    description: 'Huge pothole outside the college crossing; motorbikes and cyclists are skidding. Dangerous at night.',
    issue_type_id: 'issue_pothole',
    priority: 'medium',
    status: 'assigned',
    location_id: 'loc_2',
    ai_confidence: 0.88,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    needs_followup: false,
    media: [
      {
        id: 'med_2',
        complaint_id: 'CIV-2026-001246',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        ai_label: 'Deep asphalt roadway depression / pothole',
        ai_confidence: 0.88,
        uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
    status_updates: [
      { id: 'su_5', complaint_id: 'CIV-2026-001246', status: 'submitted', remarks: 'Citizen submitted report with photo', updated_by: 'System AI Intake', created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
      { id: 'su_6', complaint_id: 'CIV-2026-001246', status: 'assigned', remarks: 'Assigned to Public Works Road Maintenance Unit #2', updated_by: 'Rules Engine', created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    ],
    assignment: {
      id: 'asg_2',
      complaint_id: 'CIV-2026-001246',
      department_id: 'dept_roads',
      officer_id: 'usr_officer_1',
      assigned_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      due_at: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
      team_name: 'Asphalt Repair Unit 2',
    },
    ai_result: {
      issue_type: 'Pothole & Road Damage',
      issue_type_id: 'issue_pothole',
      summary: 'Deep road fissure detected near pedestrian crossing creating vehicle traffic hazard.',
      severity: 'medium',
      confidence: 0.88,
      needs_followup: false,
    },
  },
  {
    id: 'CIV-2026-001245',
    user_id: 'usr_citizen_1',
    title: 'Missed Garbage Pickup & Overflow',
    description: 'Municipal bins on 12 Maple Ave have not been emptied for 3 days. Bags are spilling onto sidewalk.',
    issue_type_id: 'issue_garbage',
    priority: 'medium',
    status: 'submitted',
    location_id: 'loc_3',
    ai_confidence: 0.91,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    needs_followup: false,
    media: [
      {
        id: 'med_3',
        complaint_id: 'CIV-2026-001245',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
        ai_label: 'Overflowing residential waste containers',
        ai_confidence: 0.91,
        uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ],
    status_updates: [
      { id: 'su_7', complaint_id: 'CIV-2026-001245', status: 'submitted', remarks: 'Citizen submitted report', updated_by: 'System AI Intake', created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    ],
    ai_result: {
      issue_type: 'Garbage Accumulation',
      issue_type_id: 'issue_garbage',
      summary: 'Refuse accumulation exceeding container limits obstructing pedestrian walkway.',
      severity: 'medium',
      confidence: 0.91,
      needs_followup: false,
    },
  },
  {
    id: 'CIV-2026-001244',
    user_id: 'usr_citizen_1',
    title: 'Broken Streetlight at Oak & 5th',
    description: 'Streetlight pole #ST-882 is flickering and going completely dark intermittently. Dark alley section.',
    issue_type_id: 'issue_streetlight',
    priority: 'low',
    status: 'resolved',
    location_id: 'loc_4',
    ai_confidence: 0.96,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    needs_followup: false,
    media: [
      {
        id: 'med_4',
        complaint_id: 'CIV-2026-001244',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80',
        ai_label: 'Inactive luminaire fixture on metal standard',
        ai_confidence: 0.96,
        uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
    ],
    status_updates: [
      { id: 'su_8', complaint_id: 'CIV-2026-001244', status: 'submitted', remarks: 'Report submitted', updated_by: 'System AI Intake', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
      { id: 'su_9', complaint_id: 'CIV-2026-001244', status: 'assigned', remarks: 'Routed to Power & Electrical', updated_by: 'Rules Engine', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString() },
      { id: 'su_10', complaint_id: 'CIV-2026-001244', status: 'in_progress', remarks: 'Technician on-site replaced LED ballast', updated_by: 'Electrical Crew 4', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
      { id: 'su_11', complaint_id: 'CIV-2026-001244', status: 'resolved', remarks: 'Luminaire tested and fully operational.', updated_by: 'Electrical Crew 4', created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    ],
    feedback: {
      id: 'fb_1',
      complaint_id: 'CIV-2026-001244',
      rating: 5,
      comment: 'Fixed super fast! Thank you municipal team.',
      resolution_confirmed: 'completely',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    },
    ai_result: {
      issue_type: 'Streetlight Outage',
      issue_type_id: 'issue_streetlight',
      summary: 'Public luminaire failing to maintain continuous lighting during dusk hours.',
      severity: 'low',
      confidence: 0.96,
      needs_followup: false,
    },
  },
  {
    id: 'CIV-2026-001243',
    user_id: 'usr_citizen_1',
    title: 'Major Water Main Rupture',
    description: 'High pressure water breaking through pavement corner. Flooding baseline.',
    issue_type_id: 'issue_water',
    priority: 'critical',
    status: 'in_progress',
    location_id: 'loc_5',
    ai_confidence: 0.98,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    needs_followup: false,
    media: [
      {
        id: 'med_5',
        complaint_id: 'CIV-2026-001243',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80',
        ai_label: 'Critical water main burst flooding sidewalk',
        ai_confidence: 0.98,
        uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      },
    ],
    status_updates: [
      { id: 'su_12', complaint_id: 'CIV-2026-001243', status: 'submitted', remarks: 'Citizen submitted urgent alert', updated_by: 'System AI Intake', created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
      { id: 'su_13', complaint_id: 'CIV-2026-001243', status: 'assigned', remarks: 'Critical emergency escalation triggered', updated_by: 'Rules Engine', created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
      { id: 'su_14', complaint_id: 'CIV-2026-001243', status: 'in_progress', remarks: 'Rapid response crew on site, isolated pressure valve', updated_by: 'Officer Marcus Davis', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    ],
    assignment: {
      id: 'asg_5',
      complaint_id: 'CIV-2026-001243',
      department_id: 'dept_water',
      officer_id: 'usr_officer_1',
      assigned_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      due_at: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      team_name: 'Zone 3 Emergency Water',
    },
    ai_result: {
      issue_type: 'Water Leakage',
      issue_type_id: 'issue_water',
      summary: 'Critical water pipeline blowout causing immediate pedestrian and road obstruction.',
      severity: 'critical',
      confidence: 0.98,
      needs_followup: false,
    },
  },
  {
    id: 'CIV-2026-001242',
    user_id: 'usr_citizen_1',
    title: 'Traffic Signals Out at Highway Intersection',
    description: 'All 4 signal heads completely dark at Route 9 and Oak Blvd.',
    issue_type_id: 'issue_traffic',
    priority: 'critical',
    status: 'assigned',
    location_id: 'loc_7',
    ai_confidence: 0.95,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    needs_followup: false,
    media: [
      {
        id: 'med_6',
        complaint_id: 'CIV-2026-001242',
        media_type: 'image',
        file_url: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80',
        ai_label: 'De-energized traffic control signal',
        ai_confidence: 0.95,
        uploaded_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
    status_updates: [
      { id: 'su_15', complaint_id: 'CIV-2026-001242', status: 'submitted', remarks: 'Report received', updated_by: 'System AI Intake', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 'su_16', complaint_id: 'CIV-2026-001242', status: 'assigned', remarks: 'Immediate dispatch to Transit Signal Crew #1', updated_by: 'Rules Engine', created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
    ],
    assignment: {
      id: 'asg_6',
      complaint_id: 'CIV-2026-001242',
      department_id: 'dept_transit',
      officer_id: 'usr_officer_1',
      assigned_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      due_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      team_name: 'Rapid Transit Response',
    },
    ai_result: {
      issue_type: 'Traffic Light Failure',
      issue_type_id: 'issue_traffic',
      summary: 'Signal grid de-energized creating high collision risk during peak traffic.',
      severity: 'critical',
      confidence: 0.95,
      needs_followup: false,
    },
  },
];

let AI_EVENTS: any[] = [
  {
    id: 'aiev_1',
    complaint_id: 'CIV-2026-001247',
    model: 'gemini-3.7-flash',
    task: 'multimodal_issue_classification',
    input_ref: 'image_01.jpg + text description',
    output_json: JSON.stringify({ issue_type: 'Water Leakage', severity: 'high', confidence: 0.94, location_hint: 'Sion Road' }),
    confidence: 0.94,
    created_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
  },
  {
    id: 'aiev_2',
    complaint_id: 'CIV-2026-001247',
    model: 'geo_duplicate_matcher_v2',
    task: 'spatial_duplicate_check',
    input_ref: 'lat: 42.3601, lng: -71.0589 (radius: 300m)',
    output_json: JSON.stringify({ duplicate_count: 0, candidate_ids: [] }),
    confidence: 0.99,
    created_at: new Date(Date.now() - 1000 * 60 * 114).toISOString(),
  },
  {
    id: 'aiev_3',
    complaint_id: 'CIV-2026-001246',
    model: 'gemini-3.7-flash',
    task: 'vision_pothole_dimension_estimation',
    input_ref: 'pothole_photo.jpg',
    output_json: JSON.stringify({ issue_type: 'Pothole & Road Damage', severity: 'medium', estimated_diameter_cm: 65, confidence: 0.88 }),
    confidence: 0.88,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3.9).toISOString(),
  },
];

// Helper to expand relations
function enrichComplaint(c: any) {
  const user = USERS.find((u) => u.id === c.user_id);
  const issue_type = ISSUE_TYPES.find((i) => i.id === c.issue_type_id);
  const location = LOCATIONS.find((l) => l.id === c.location_id);
  return {
    ...c,
    user,
    issue_type,
    location,
  };
}

// ----------------------------------------------------
// AI ORCHESTRATOR SIMULATION (Internal Boundary)
// ----------------------------------------------------
function orchestrateAI(text: string, lat?: number, lng?: number, address?: string) {
  const textLower = (text || '').toLowerCase();
  
  let issue_type_id = 'issue_other';
  let issue_type_name = 'Other Civic Concern';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let confidence = 0.92;
  let needs_followup = false;
  let followup_question: string | undefined = undefined;

  if (textLower.includes('water') || textLower.includes('pipe') || textLower.includes('leak') || textLower.includes('flood') || textLower.includes('burst')) {
    issue_type_id = 'issue_water';
    issue_type_name = 'Water Leakage';
    severity = textLower.includes('burst') || textLower.includes('flood') || textLower.includes('major') ? 'critical' : 'high';
    confidence = 0.94;
  } else if (textLower.includes('pothole') || textLower.includes('road') || textLower.includes('asphalt') || textLower.includes('crater') || textLower.includes('bump')) {
    issue_type_id = 'issue_pothole';
    issue_type_name = 'Pothole & Road Damage';
    severity = textLower.includes('deep') || textLower.includes('huge') || textLower.includes('accident') ? 'high' : 'medium';
    confidence = 0.91;
  } else if (textLower.includes('garbage') || textLower.includes('trash') || textLower.includes('bin') || textLower.includes('dumping') || textLower.includes('waste')) {
    issue_type_id = 'issue_garbage';
    issue_type_name = 'Garbage Accumulation';
    severity = textLower.includes('toxic') || textLower.includes('blocking') ? 'high' : 'medium';
    confidence = 0.89;
  } else if (textLower.includes('light') || textLower.includes('lamp') || textLower.includes('dark') || textLower.includes('streetlight') || textLower.includes('bulb')) {
    issue_type_id = 'issue_streetlight';
    issue_type_name = 'Streetlight Outage';
    severity = textLower.includes('whole block') || textLower.includes('safety') ? 'medium' : 'low';
    confidence = 0.95;
  } else if (textLower.includes('drain') || textLower.includes('sewer') || textLower.includes('clog') || textLower.includes('gutter')) {
    issue_type_id = 'issue_drainage';
    issue_type_name = 'Drainage & Storm Drain';
    severity = 'high';
    confidence = 0.93;
  } else if (textLower.includes('traffic') || textLower.includes('signal') || textLower.includes('red light') || textLower.includes('intersection')) {
    issue_type_id = 'issue_traffic';
    issue_type_name = 'Traffic Light Failure';
    severity = 'critical';
    confidence = 0.96;
  } else if (textLower.includes('graffiti') || textLower.includes('vandalism') || textLower.includes('spray') || textLower.includes('paint')) {
    issue_type_id = 'issue_vandalism';
    issue_type_name = 'Graffiti & Vandalism';
    severity = 'low';
    confidence = 0.88;
  } else {
    // If text is short or ambiguous, flag smart follow-up!
    if (text.length < 15) {
      needs_followup = true;
      followup_question = 'Could you specify if this affects water supply, road pavement, or street lighting?';
      confidence = 0.65;
    }
  }

  // Find nearby similar reports (duplicate detection)
  const similar_reports = COMPLAINTS.slice(0, 2).map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    distance_meters: Math.floor(Math.random() * 180) + 20,
    created_at: c.created_at,
    address: LOCATIONS.find((l) => l.id === c.location_id)?.address || 'Nearby Avenue',
  }));

  const issueObj = ISSUE_TYPES.find((i) => i.id === issue_type_id);

  return {
    issue_type: issue_type_name,
    issue_type_id,
    summary: text.length > 8 ? text.slice(0, 160) : `Reported civic issue requiring ${issue_type_name} inspection.`,
    severity,
    confidence,
    needs_followup,
    followup_question,
    location_hint: address || 'Detected Location Coordinates',
    category: issueObj?.category || 'Civic Infrastructure',
    similar_reports: similar_reports.length > 0 ? similar_reports : undefined,
  };
}

// ----------------------------------------------------
// API ROUTES (Exact Contract Matching)
// ----------------------------------------------------

// Support both /api/... and /... prefixes seamlessly
const router = express.Router();

// AUTH
router.post('/auth/login', (req, res) => {
  const { identifier, phone, email, password } = req.body;
  const loginKey = (identifier || phone || email || '').toLowerCase();
  
  // Find matching user or fallback to Mohammed Ali (citizen) or Davis (officer) or Hayes (admin)
  let user = USERS.find((u) => u.email.toLowerCase() === loginKey || u.phone.includes(loginKey));
  if (!user) {
    if (loginKey.includes('admin') || loginKey.includes('hayes')) {
      user = USERS.find((u) => u.role === 'admin');
    } else if (loginKey.includes('officer') || loginKey.includes('davis')) {
      user = USERS.find((u) => u.role === 'officer');
    } else {
      user = USERS[0]; // default citizen
    }
  }

  res.json({
    token: `jwt_civic_${user?.id}_${Date.now()}`,
    user,
  });
});

router.post('/auth/register', (req, res) => {
  const { name, phone, email, role } = req.body;
  const newUser = {
    id: `usr_${Date.now()}`,
    name: name || 'Citizen User',
    phone: phone || '+1 (555) 000-0000',
    email: email || `user_${Date.now()}@civic.org`,
    role: (role as any) || 'citizen',
    created_at: new Date().toISOString(),
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };
  USERS.push(newUser);
  res.json({
    token: `jwt_civic_${newUser.id}_${Date.now()}`,
    user: newUser,
  });
});

router.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  
  let user = USERS[0];
  if (token.includes('usr_officer')) {
    user = USERS.find((u) => u.role === 'officer') || USERS[1];
  } else if (token.includes('usr_admin')) {
    user = USERS.find((u) => u.role === 'admin') || USERS[2];
  } else {
    // Check if token specifies user id
    const match = USERS.find((u) => token.includes(u.id));
    if (match) user = match;
  }
  res.json(user);
});

// COMPLAINTS (Citizen-facing)
router.post('/complaints', (req, res) => {
  const {
    text_description,
    image_file,
    audio_file,
    latitude = 42.3601,
    longitude = -71.0589,
    address = 'Main St. & 4th Ave',
    user_id = 'usr_citizen_1',
  } = req.body;

  // Run AI Orchestrator
  const aiResult = orchestrateAI(text_description || 'Civic infrastructure report', latitude, longitude, address);

  // Create location
  const newLocation = {
    id: `loc_${Date.now()}`,
    latitude: Number(latitude),
    longitude: Number(longitude),
    address: address || 'Main St. & 4th Ave',
    ward: 'Ward 14',
    area: 'Downtown Civic Sector',
  };
  LOCATIONS.push(newLocation);

  const complaintId = `CIV-2026-${Math.floor(100000 + Math.random() * 900000).toString().slice(0, 6)}`;
  
  const issueObj = ISSUE_TYPES.find((i) => i.id === aiResult.issue_type_id);
  const deptId = issueObj?.department_id || 'dept_roads';
  const deptObj = DEPARTMENTS.find((d) => d.id === deptId);

  const newMedia: any[] = [];
  if (image_file) {
    newMedia.push({
      id: `med_${Date.now()}`,
      complaint_id: complaintId,
      media_type: 'image',
      file_url: typeof image_file === 'string' ? image_file : 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80',
      ai_label: `${aiResult.issue_type} detected`,
      ai_confidence: aiResult.confidence,
      uploaded_at: new Date().toISOString(),
    });
  }

  const initialStatusUpdates = [
    {
      id: `su_${Date.now()}_1`,
      complaint_id: complaintId,
      status: 'submitted',
      remarks: 'Complaint submitted by citizen',
      updated_by: 'System AI Intake',
      created_at: new Date().toISOString(),
    },
    {
      id: `su_${Date.now()}_2`,
      complaint_id: complaintId,
      status: 'submitted',
      remarks: `AI classified as ${aiResult.issue_type} (${Math.round(aiResult.confidence * 100)}% confidence). Routed to ${deptObj?.name || 'Department'}.`,
      updated_by: 'CivicAI Orchestrator',
      created_at: new Date().toISOString(),
    },
  ];

  // Auto assign
  const newAssignment = {
    id: `asg_${Date.now()}`,
    complaint_id: complaintId,
    department_id: deptId,
    officer_id: 'usr_officer_1',
    assigned_at: new Date().toISOString(),
    due_at: new Date(Date.now() + (deptObj?.sla_hours || 24) * 60 * 60 * 1000).toISOString(),
    team_name: `${deptObj?.name} Unit 1`,
    officer_name: 'Officer Marcus Davis',
  };

  const newComplaint = {
    id: complaintId,
    user_id,
    title: `${aiResult.issue_type} - ${address || 'Civic Issue'}`,
    description: text_description || 'No detailed description provided.',
    issue_type_id: aiResult.issue_type_id,
    priority: aiResult.severity,
    status: 'submitted',
    location_id: newLocation.id,
    ai_confidence: aiResult.confidence,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    needs_followup: aiResult.needs_followup,
    followup_question: aiResult.followup_question,
    media: newMedia,
    status_updates: initialStatusUpdates,
    assignment: newAssignment,
    ai_result: aiResult,
  };

  COMPLAINTS.unshift(newComplaint);

  // Log AI event
  AI_EVENTS.unshift({
    id: `aiev_${Date.now()}`,
    complaint_id: complaintId,
    model: 'gemini-3.7-flash',
    task: 'citizen_intake_orchestration',
    input_ref: text_description,
    output_json: JSON.stringify(aiResult),
    confidence: aiResult.confidence,
    created_at: new Date().toISOString(),
  });

  res.status(201).json(enrichComplaint(newComplaint));
});

router.get('/complaints', (req, res) => {
  const { user_id } = req.query;
  let list = COMPLAINTS;
  if (user_id) {
    list = list.filter((c) => c.user_id === user_id);
  }
  res.json(list.map(enrichComplaint));
});

router.get('/complaints/:id', (req, res) => {
  const c = COMPLAINTS.find((item) => item.id === req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  res.json(enrichComplaint(c));
});

router.post('/complaints/:id/followup', (req, res) => {
  const { answer_text } = req.body;
  const c = COMPLAINTS.find((item) => item.id === req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  c.needs_followup = false;
  c.ai_confidence = Math.min(0.98, c.ai_confidence + 0.15);
  c.status_updates.push({
    id: `su_${Date.now()}`,
    complaint_id: c.id,
    status: c.status,
    remarks: `Citizen clarification provided: "${answer_text}". Confidence elevated to ${Math.round(c.ai_confidence * 100)}%.`,
    updated_by: 'Citizen & AI Orchestrator',
    created_at: new Date().toISOString(),
  });

  res.json(enrichComplaint(c));
});

router.post('/complaints/:id/feedback', (req, res) => {
  const { rating, comment, resolution_confirmed, evidence_url } = req.body;
  const c = COMPLAINTS.find((item) => item.id === req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  if (c.status !== 'resolved') {
    return res.status(400).json({ error: 'Feedback only allowed on resolved complaints.' });
  }

  const fb = {
    id: `fb_${Date.now()}`,
    complaint_id: c.id,
    rating: Number(rating) || 5,
    comment: comment || '',
    resolution_confirmed: resolution_confirmed || 'completely',
    evidence_url,
    created_at: new Date().toISOString(),
  };

  c.feedback = fb;
  c.status_updates.push({
    id: `su_${Date.now()}`,
    complaint_id: c.id,
    status: 'resolved',
    remarks: `Citizen satisfaction rating received: ${fb.rating}★ (${fb.resolution_confirmed}). Comment: ${fb.comment || 'None'}`,
    updated_by: 'Citizen Feedback Form',
    created_at: new Date().toISOString(),
  });

  res.json({ message: 'Feedback submitted successfully', feedback: fb });
});

// OFFICER ROUTES
router.get('/officer/queue', (req, res) => {
  const { department_id, sort } = req.query;
  let queue = COMPLAINTS.filter((c) => c.status !== 'resolved');

  if (department_id) {
    queue = queue.filter((c) => {
      const issue = ISSUE_TYPES.find((i) => i.id === c.issue_type_id);
      return issue?.department_id === department_id || c.assignment?.department_id === department_id;
    });
  }

  // Sort priority: critical > high > medium > low
  const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  if (sort === 'priority') {
    queue.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
  }

  res.json(queue.map(enrichComplaint));
});

router.patch('/complaints/:id/status', (req, res) => {
  const { status, remarks, evidence_image } = req.body;
  const c = COMPLAINTS.find((item) => item.id === req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  if (status) c.status = status;
  c.updated_at = new Date().toISOString();

  if (evidence_image) {
    c.media = c.media || [];
    c.media.push({
      id: `med_ev_${Date.now()}`,
      complaint_id: c.id,
      media_type: 'image',
      file_url: evidence_image,
      ai_label: 'Officer Resolution Evidence',
      ai_confidence: 0.99,
      uploaded_at: new Date().toISOString(),
    });
  }

  c.status_updates = c.status_updates || [];
  c.status_updates.push({
    id: `su_${Date.now()}`,
    complaint_id: c.id,
    status: c.status,
    remarks: remarks || `Status updated to ${c.status}`,
    updated_by: 'Officer Marcus Davis',
    created_at: new Date().toISOString(),
    evidence_image_url: evidence_image,
  });

  res.json(enrichComplaint(c));
});

router.get('/complaints/:id/ai-events', (req, res) => {
  const events = AI_EVENTS.filter((e) => e.complaint_id === req.params.id);
  res.json(events);
});

// ADMIN ROUTES
router.get('/admin/stats', (req, res) => {
  const total = COMPLAINTS.length + 2475; // baseline scale for operational view
  const open = COMPLAINTS.filter((c) => c.status === 'submitted').length + 338;
  const in_progress = COMPLAINTS.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length + 318;
  const resolved = COMPLAINTS.filter((c) => c.status === 'resolved').length + 1817;
  const critical = COMPLAINTS.filter((c) => c.priority === 'critical').length + 22;
  const sla_breaches = 12;
  const avg_resolution_hours = 18.4;

  res.json({
    total,
    open,
    in_progress,
    resolved,
    critical,
    sla_breaches,
    avg_resolution_hours,
    weekly_trend: [
      { day: 'Mon', submitted: 42, resolved: 38 },
      { day: 'Tue', submitted: 55, resolved: 49 },
      { day: 'Wed', submitted: 48, resolved: 52 },
      { day: 'Thu', submitted: 68, resolved: 60 },
      { day: 'Fri', submitted: 62, resolved: 64 },
      { day: 'Sat', submitted: 35, resolved: 31 },
      { day: 'Sun', submitted: 28, resolved: 29 },
    ],
  });
});

router.get('/admin/complaints/heatmap', (req, res) => {
  const { issue_type, department } = req.query;
  let points = COMPLAINTS.map((c) => {
    const loc = LOCATIONS.find((l) => l.id === c.location_id);
    const issue = ISSUE_TYPES.find((i) => i.id === c.issue_type_id);
    return {
      id: c.id,
      latitude: loc?.latitude || 42.3601,
      longitude: loc?.longitude || -71.0589,
      issue_type: issue?.name || 'Civic Issue',
      issue_type_id: c.issue_type_id,
      priority: c.priority,
      title: c.title,
      ward: loc?.ward || 'Ward 14',
      status: c.status,
      created_at: c.created_at,
    };
  });

  // Additional points for dense heatmap visual
  const extraPoints = [
    { id: 'hp_1', latitude: 42.3615, longitude: -71.0595, issue_type: 'Pothole & Road Damage', issue_type_id: 'issue_pothole', priority: 'high' as const, title: 'Road crater on 2nd Ave', ward: 'Ward 14', status: 'in_progress' as const, created_at: new Date().toISOString() },
    { id: 'hp_2', latitude: 42.3630, longitude: -71.0560, issue_type: 'Garbage Accumulation', issue_type_id: 'issue_garbage', priority: 'critical' as const, title: 'Dumpster overflow alley', ward: 'Ward 14', status: 'submitted' as const, created_at: new Date().toISOString() },
    { id: 'hp_3', latitude: 42.3570, longitude: -71.0620, issue_type: 'Streetlight Outage', issue_type_id: 'issue_streetlight', priority: 'low' as const, title: 'Lamp post dark', ward: 'Ward 11', status: 'assigned' as const, created_at: new Date().toISOString() },
    { id: 'hp_4', latitude: 42.3650, longitude: -71.0650, issue_type: 'Water Leakage', issue_type_id: 'issue_water', priority: 'high' as const, title: 'Main valve leak', ward: 'Ward 14', status: 'in_progress' as const, created_at: new Date().toISOString() },
    { id: 'hp_5', latitude: 42.3530, longitude: -71.0580, issue_type: 'Drainage & Storm Drain', issue_type_id: 'issue_drainage', priority: 'medium' as const, title: 'Clogged gutter catchbasin', ward: 'Ward 9', status: 'resolved' as const, created_at: new Date().toISOString() },
  ];

  let all = [...points, ...extraPoints];
  if (issue_type) {
    all = all.filter((p) => p.issue_type_id === issue_type || p.issue_type.toLowerCase().includes((issue_type as string).toLowerCase()));
  }

  res.json(all);
});

router.get('/admin/departments/performance', (req, res) => {
  const result = DEPARTMENTS.map((d) => {
    const deptComplaints = COMPLAINTS.filter((c) => {
      const issue = ISSUE_TYPES.find((i) => i.id === c.issue_type_id);
      return issue?.department_id === d.id;
    });

    const openCount = deptComplaints.filter((c) => c.status !== 'resolved').length + Math.floor(Math.random() * 8) + 2;
    const resolvedCount = deptComplaints.filter((c) => c.status === 'resolved').length + Math.floor(Math.random() * 40) + 50;

    return {
      department_id: d.id,
      department_name: d.name,
      open_cases: openCount,
      total_resolved: resolvedCount,
      avg_resolution_time: `${Math.floor(d.sla_hours * 0.75)}.${Math.floor(Math.random() * 9)} hours`,
      sla_compliance_pct: Math.min(99, Math.floor(90 + Math.random() * 9)),
      active_officers: Math.floor(Math.random() * 12) + 6,
    };
  });

  res.json(result);
});

router.get('/issue-types', (req, res) => {
  res.json(ISSUE_TYPES);
});

router.get('/departments', (req, res) => {
  res.json(DEPARTMENTS);
});

// Mount both under /api and root level for maximum flexibility
app.use('/api', router);
app.use('/', router);

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicAI Server running on port ${PORT}`);
  });
}

startServer();
