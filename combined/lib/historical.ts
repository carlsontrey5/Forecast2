import { Contract, ContractCategory } from '@/types';

const VENDORS = ['IBM', 'Accenture', 'Leidos', 'SAIC', 'Booz Allen Hamilton', 'Deloitte', 'CGI Federal', 'DXC Technology', 'ManTech', 'CACI', 'Peraton', 'Maximus', 'Cognizant', 'Infosys', 'Capgemini'];
const AGENCIES = ['Department of Defense', 'Department of Homeland Security', 'IRS', 'Veterans Affairs', 'HHS', 'CMS', 'NASA', 'GSA', 'Social Security Administration', 'DOJ', 'Air Force', 'Army', 'Navy'];

const TEMPLATES: Record<ContractCategory, Array<{ title: string; description: string }>> = {
  Contracts: [
    { title: 'Enterprise IT Modernization Contract', description: 'Multi-year contract to modernize legacy IT infrastructure and migrate to cloud-based systems.' },
    { title: 'Cybersecurity Operations Support', description: 'Providing 24/7 security operations center (SOC) services and threat intelligence.' },
    { title: 'Digital Transformation Services', description: 'End-to-end digital transformation encompassing cloud migration, DevSecOps, and agile delivery.' },
    { title: 'IT Help Desk and Field Services', description: 'Tier 1-3 IT support services including desktop management and field technician support.' },
    { title: 'Data Analytics Platform', description: 'Building and maintaining enterprise data analytics and business intelligence platform.' },
  ],
  'Financial Results': [
    { title: 'Q1 Revenue Report', description: 'First quarter financial results showing strong growth in government IT services sector.' },
    { title: 'Annual Financial Performance Summary', description: 'Full-year financial results with year-over-year comparisons across business segments.' },
    { title: 'Q3 Earnings Release', description: 'Third quarter earnings report with updated full-year guidance and backlog information.' },
  ],
  'M&A': [
    { title: 'Acquisition of IT Services Firm', description: 'Strategic acquisition to expand capabilities in cloud computing and cybersecurity services.' },
    { title: 'Merger Announcement', description: 'Definitive agreement to merge two IT services firms to create a combined entity.' },
    { title: 'Divestiture of Business Unit', description: 'Sale of non-core business segment to focus on government IT services.' },
  ],
  'New Offerings': [
    { title: 'Zero Trust Security Platform Launch', description: 'New zero trust architecture solution designed for federal government compliance requirements.' },
    { title: 'AI-Powered Analytics Service', description: 'Launch of artificial intelligence and machine learning-based analytics service for enterprise clients.' },
    { title: 'Cloud Migration Accelerator', description: 'New rapid cloud migration tool enabling agencies to move workloads to FedRAMP-authorized environments.' },
  ],
  Partnerships: [
    { title: 'Strategic Alliance with Cloud Provider', description: 'Teaming agreement to deliver managed cloud services to federal agencies.' },
    { title: 'Subcontractor Partnership Agreement', description: 'Small business subcontracting partnership to expand capacity and socioeconomic goals.' },
    { title: 'Technology Reseller Agreement', description: 'Authorized reseller agreement for enterprise software licenses and professional services.' },
  ],
};

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randValue(category: ContractCategory): number {
  switch (category) {
    case 'Contracts': return randInt(5, 900) * 1_000_000;
    case 'Financial Results': return randInt(100, 5000) * 1_000_000;
    case 'M&A': return randInt(50, 3000) * 1_000_000;
    case 'New Offerings': return 0;
    case 'Partnerships': return randInt(10, 200) * 1_000_000;
  }
}

export function generateHistoricalContracts(
  startYear: number,
  categories: ContractCategory[],
  maxPerCategoryPerYear: number
): Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>[] {
  const endYear = new Date().getFullYear();
  const results: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (const category of categories) {
      const templates = TEMPLATES[category];
      const count = Math.min(maxPerCategoryPerYear, templates.length);

      for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        const vendor = rand(VENDORS);
        const agency = rand(AGENCIES);
        const month = String(randInt(1, 12)).padStart(2, '0');
        const day = String(randInt(1, 28)).padStart(2, '0');
        const startDate = `${year}-${month}-${day}`;
        const endYear2 = year + randInt(1, 5);
        const endDate = `${endYear2}-${month}-${day}`;
        const now = new Date().getFullYear();
        const status = endYear2 < now ? 'expired' : year > now ? 'pending' : 'active';

        results.push({
          title: `${vendor} – ${template.title}`,
          vendor,
          agency,
          value: randValue(category),
          category,
          status,
          startDate,
          endDate,
          description: template.description,
          year,
        });
      }
    }
  }

  return results;
}
