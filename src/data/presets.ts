export interface DocumentPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  document_type: string;
  parties: string;
  terms: string;
  dates: string;
  jurisdiction: string;
}

export const PRESETS: DocumentPreset[] = [
  {
    id: 'freelance-contract',
    name: 'Freelance Work Contract',
    badge: 'Popular',
    description: 'Service agreement defining deliverables, deadlines, IP rights, and 7-day payment window.',
    document_type: 'Freelance Work Contract',
    parties: 'Jane Doe (Service Provider), TechNova Inc. (Client)',
    terms: 'Work must be delivered by May 15, 2025; Payment will be made within 7 days of invoice; The client retains intellectual property rights upon full payment; Confidentiality must be maintained at all times; Either party may terminate with 15 days written notice',
    dates: 'April 15, 2025',
    jurisdiction: 'State of California, USA',
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    badge: 'Confidentiality',
    description: 'Mutual/unilateral NDA protecting proprietary data, code, client lists, and trade secrets.',
    document_type: 'Non-Disclosure Agreement',
    parties: 'Jane Doe (Disclosing Party), TechNova Solutions Inc. (Receiving Party)',
    terms: 'Scope of confidentiality covers source code, design systems, customer records, and financial models; Obligation of non-disclosure shall remain in effect for 3 consecutive years; Return or certified destruction of confidential materials within 10 days of request; Injunctive relief available without bond in case of actual or threatened breach',
    dates: 'April 15, 2025',
    jurisdiction: 'State of Delaware, USA',
  },
  {
    id: 'employment-contract',
    name: 'Startup Employment Contract',
    badge: 'HR & Hiring',
    description: 'Comprehensive employment agreement covering compensation, equity, IP assignment, and benefits.',
    document_type: 'Employment Contract',
    parties: 'Jane Smith (Employee), Apex Technologies Inc. (Employer)',
    terms: 'Base annual compensation of $125,000 paid semi-monthly; Eligibility for 0.5% stock option equity grant vesting over 4 years; Comprehensive health, dental, and vision insurance commencing day 30; 15 days of paid time off per calendar year; Mandatory invention assignment and confidential information protection; At-will employment terminable with 2 weeks notice',
    dates: 'April 1, 2025',
    jurisdiction: 'State of New York, USA',
  },
  {
    id: 'residential-lease',
    name: 'Residential Lease Agreement',
    badge: 'Real Estate',
    description: 'Tenancy agreement specifying rent, security deposit, maintenance, and occupancy terms.',
    document_type: 'Residential Lease Agreement',
    parties: 'Alice Smith (Tenant), XYZ Realty Management LLC (Landlord)',
    terms: 'Monthly rent of $2,400 due on or before the 1st of each calendar month; Security deposit of $2,400 deposited in escrow and refundable within 21 days; Fixed 12-month lease term commencing May 1, 2025; Tenant responsible for electricity, gas, and internet utilities; No unauthorized pets, smoking, or sub-leasing without prior written consent',
    dates: 'May 1, 2025',
    jurisdiction: 'State of Texas, USA',
  },
  {
    id: 'consulting-agreement',
    name: 'Consulting & Advisory Agreement',
    badge: 'Advisory',
    description: 'Independent consultant scope of work, hourly/retainer billing, and indemnification.',
    document_type: 'Independent Consulting Agreement',
    parties: 'Marcus Vance Consulting (Consultant), OmniCorp Global (Client)',
    terms: 'Advisory services provided at $175 per hour capped at 20 hours per week; Monthly detailed milestone timesheets submitted with net-15 payment terms; Independent contractor status with no employment benefits created; Full indemnification against third-party claims arising from unauthorized materials',
    dates: 'June 1, 2025',
    jurisdiction: 'State of Delaware, USA',
  },
];
