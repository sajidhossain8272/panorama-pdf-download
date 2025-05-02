// src/components/NavBar.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiMenu,
  FiX,
  FiHome,
  FiFileText,
  FiUsers,
  FiClock,
  FiBarChart2,
  FiUserCheck,
} from 'react-icons/fi'

interface NavItem {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const navItems: NavItem[] = [
  { href: '/',                  label: 'Home',                Icon: FiHome },
  { href: '/standard',          label: 'Standard Assessment', Icon: FiFileText },
  { href: '/userComparison',    label: 'User Comparison',     Icon: FiUsers },
  { href: '/timehorizon',       label: 'Time Horizon',        Icon: FiClock },
  { href: '/companyAverage',    label: 'Company Average',     Icon: FiBarChart2 },
  { href: '/individualCompany', label: 'Individual vs Company', Icon: FiUserCheck },
]

export const NavBar: React.FC = () => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <FiFileText size={24} className="text-blue-600" />
          <span className="text-xl font-bold">Panorama</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`
                  inline-flex items-center space-x-1 whitespace-nowrap py-2 text-sm font-medium
                  ${isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:border-blue-600'}
                `}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-blue-600' : 'text-gray-500'}
                />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-2 pb-4 space-y-1 bg-white border-t border-gray-200">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center px-3 py-2 rounded-md text-base font-medium
                  ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-blue-600 mr-3' : 'text-gray-500 mr-3'}
                />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
