import React from 'react'
import { ReportCard } from '@/components/ReportCard'

const reports: Array<{
  id: 'standard' | 'userComparison' | 'timehorizon' | 'companyAverage' | 'individualCompany';
  title: string;
  description: string;
  href: string;
}> = [
  {
    id: 'standard',
    title: 'Standard Assessment Report',
    description: 'Access reports for each individual assessment.',
    href: '/standard',
  },
  {
    id: 'userComparison',
    title: 'User Comparison Report',
    description:
      'Compare assessment results across different users to identify strengths and gaps.',
    href: '/userComparison',
  },
  {
    id: 'timehorizon',
    title: 'Time Horizon Report',
    description:
      'Either individual or by group, compare assessment reports over time.',
    href: '/timehorizon',
  },
  {
    id: 'companyAverage',
    title: 'Company Average Report',
    description: 'Review the overall company average report.',
    href: '/companyAverage',
  },
  {
    id: 'individualCompany',
    title: 'Individual vs Company Report',
    description:
      'Compare individual assessment results against your company average.',
    href: '/individualCompany',
  },
]

export default function Home() {
  return (
    <>
      <main className="max-w-3xl mx-auto my-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r) => (
          <ReportCard key={r.id} {...r} />
        ))}
      </main>
    </>
  )
}
