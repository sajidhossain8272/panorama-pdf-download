// src/components/ReportCard.tsx
import Link from 'next/link'
import React from 'react'
import {
  FiFileText,
  FiUsers,
  FiClock,
  FiBarChart2,
  FiUserCheck,
  FiArrowRight,
} from 'react-icons/fi'

export interface ReportCardProps {
  /** matches one of the keys below for icon selection */
  id: 'standard' | 'userComparison' | 'timehorizon' | 'companyAverage' | 'individualCompany'
  title: string
  description: string
  href: string
}

const iconMap: Record<
  ReportCardProps['id'],
  React.ComponentType<{ size?: number; className?: string }>
> = {
  standard: FiFileText,
  userComparison: FiUsers,
  timehorizon: FiClock,
  companyAverage: FiBarChart2,
  individualCompany: FiUserCheck,
}

export const ReportCard: React.FC<ReportCardProps> = ({
  id,
  title,
  description,
  href,
}) => {
  const Icon = iconMap[id]

  return (
    <div
      id={id}
      className="
        group
        bg-white
        border border-gray-200
        rounded-lg
        p-6
        flex flex-col
        justify-between
        shadow-sm
        transition-transform
        transform
        hover:shadow-lg
        hover:-translate-y-0.5
      "
    >

    
      {/* Header with icon */}
      <div className="flex items-center mb-4">
        <Icon size={28} className="text-blue-600 mr-3" />
        <h2
          className="
            text-xl font-semibold
            text-gray-900
            group-hover:text-blue-600
            transition-colors
          "
        >
          {title}
        </h2>
      </div>

      {/* Description */}
      <p className="flex-grow text-gray-600 mb-6">{description}</p>

      {/* View PDF button */}
      <Link
        href={href}
        className="
          inline-flex items-center justify-center
          w-full px-4 py-2
          rounded-md
          bg-blue-600 text-white
          font-medium text-sm
          hover:bg-blue-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition
        "
      >
        <span>View Report</span>
        <FiArrowRight size={16} className="ml-2" />
      </Link>
    </div>
  )
}
