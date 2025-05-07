import React from 'react'
import { ReportCard } from '@/components/ReportCard'

const reports: Array<{
  id: 'standard' | 'userComparison' | 'timehorizon' | 'companyAverage' | 'individualCompany' | 'invoice';
  title: string;
  description: string;
  href: string;
}> = [
  {
    id: 'standard',
    title: 'Standard Assessment Report',
    description: 'Access reports for each individual assessment.',
    href: '/standard/67dd6bdf91be1c47c862cff1',
  },
  {
    id: 'userComparison',
    title: 'User Comparison Report',
    description:
      'Compare assessment results across different users to identify strengths and gaps.',
    href: '/userComparison/67f915ff731ada24a582fd28',
  },
  {
    id: 'timehorizon',
    title: 'Time Horizon Report',
    description:
      'Either individual or by group, compare assessment reports over time.',
    href: '/timehorizon/67fa3d7e731ada24a5873de1',
  },
  {
    id: 'companyAverage',
    title: 'Company Average Report',
    description: 'Review the overall company average report.',
    href: '/companyAverage/67f96cca731ada24a583d8a5',
  },
  {
    id: 'individualCompany',
    title: 'Individual vs Company Report',
    description:
      'Compare individual assessment results against your company average.',
    href: '/individualCompany/67f9730d731ada24a5848a7f',
  },
  {
    id: 'invoice',
    title: 'Invoice ',
    description:
      'Pay for your Panorama assessments with a credit card or ACH transfer.',
    href: '/invoice',
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
