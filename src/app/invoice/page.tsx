
import InvoicePage from './invoice' // Adjust path if needed
// or for App Router: import InvoicePage from '../invoice'; 

export default function Success() {
  // imagine you grabbed `customerCountry` from your Stripe webhook/session
  const billedTo = {
    name: 'John Doe',
    addressLine1: '456 Client Blvd.',
    city: 'Metropolis',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    company: 'Meta AI'  // or 'Bangladesh'
  }

  return (
    <InvoicePage
      invoiceNumber="2025-00123"
      invoiceDate="2025-05-07" // YYYY-MM-DD format
      billedTo={billedTo}
      plan="Basic"
      price={19.99}
      billingCycle="Monthly"
    />
  )
}