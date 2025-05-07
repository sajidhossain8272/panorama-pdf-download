// pages/invoice.tsx
"use client"

import React, { useRef } from 'react'


interface InvoiceProps {
  invoiceNumber: string
  invoiceDate: string      // e.g. '2025-05-07'
  billedTo: {
    name: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    zip: string
    country: string
    company: string
  }
  plan: 'Basic' | 'Standard' | 'Premium'
  price: number            // e.g. 49.99
  billingCycle: 'Monthly' | 'Yearly'
}

const InvoicePage: React.FC<InvoiceProps> = ({
  invoiceNumber,
  invoiceDate,
  billedTo,
  plan,
  price,
  billingCycle,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const taxRate = 0.10
  const taxAmount = price * taxRate
  const total = price + taxAmount

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return date.toLocaleDateString(undefined, options)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Invoice */}
        <div
          ref={invoiceRef}
          className="bg-white shadow-xl ring-1 ring-gray-300 rounded-xl overflow-hidden"
        >
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* Header */}
            <header className="pb-8 sm:pb-10 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="flex items-center space-x-4 mb-6 sm:mb-0">
                  <img
                    src="/logo.png"
                    alt="Panorama Management Advisory Services"
                    className="h-14 w-auto sm:h-16"
                  />
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-blue-600">
                    Invoice
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">
                    <span className="font-medium"># {invoiceNumber}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Date: <span className="font-medium">{formatDate(invoiceDate)}</span>
                  </p>
                </div>
              </div>
            </header>

            {/* From / To / Status */}
            <section className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                  Bill From
                </h3>
                <p className="font-semibold text-sm text-gray-800">
                  Panorama Management Advisory Services Ltd.
                </p>
                {billedTo.country === 'Bangladesh' ? (
                  <>
                    <p className="text-xs text-gray-600">Awal Center, CoSpace Level 4</p>
                    <p className="text-xs text-gray-600">34 Kamal Ataturk Avenue, Banani</p>
                    <p className="text-xs text-gray-600">Dhaka-1230, Bangladesh</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-600">2727 Palomar Road</p>
                    <p className="text-xs text-gray-600">Celina, TX 75009, USA</p>
                  </>
                )}
                <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                  <p>Phone: (123) 456-7890</p>
                  <p>Email: info@panoramamas.com</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                  Bill To
                </h3>
                <p className="font-semibold text-sm text-gray-800">{billedTo.company}</p>
                <p className="text-xs text-gray-600">{billedTo.addressLine1}</p>
                {billedTo.addressLine2 && (
                  <p className="text-xs text-gray-600">{billedTo.addressLine2}</p>
                )}
                <p className="text-xs text-gray-600">
                  {billedTo.city}, {billedTo.state} {billedTo.zip}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{billedTo.country}</p>
              </div>

              <div className="text-right">
                <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                  Status
                </h3>
                <span className="inline-block bg-green-100 text-green-700 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full">
                  PAID
                </span>
                <p className="mt-2 text-xs text-gray-500">
                  Payment on: {formatDate(invoiceDate)}
                </p>
              </div>
            </section>

            {/* Items */}
            <section className="mt-10 sm:mt-12">
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Item Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Plan / Cycle
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        Panorama Assessment Tool (PAT)
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {plan} Plan ({billingCycle})
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-700">
                        ${price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-700">
                        1
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-medium text-gray-800">
                        ${price.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Totals & Notes */}
            <section className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                <p className="text-xs text-gray-600">
                  Thank you for your business! Payment has been successfully processed.
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  For any inquiries regarding this invoice, please contact our billing department at{' '}
                  <a href="mailto:billing@panoramamanagement.com" className="text-blue-600 hover:underline">
                    info@panoramams.com
                  </a>.
                </p>
              </div>
              <div>
                <div className="space-y-2 rounded-lg bg-gray-50 p-4 sm:p-6">
                  <div className="flex justify-between text-xs text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">${price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-700">
                    <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total Paid:</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-gray-300">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Panorama Management Advisory Services Ltd.
                </p>
                <p className="text-xs text-gray-500">
                  {billedTo.country === 'Bangladesh'
                    ? 'Awal Center, CoSpace L4, 34 Kamal Ataturk Ave, Banani, Dhaka-1230, Bangladesh'
                    : '2727 Palomar Road, Celina, TX 75009, USA'}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <a
                    href="https://panoramamas.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    panoramamas.com
                  </a>
                  {' • '}
                  <a
                    href="mailto:billing@panoramamanagement.com"
                    className="text-blue-600 hover:underline"
                  >
                    info@panoramamas.com
                  </a>
                </p>
                <p className="mt-3 text-xxs sm:text-xs text-gray-400">
                  © {new Date().getFullYear()} Panorama Management Advisory Services Ltd. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoicePage
