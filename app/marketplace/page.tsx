import { Suspense } from 'react'
import MarketplacePage from './MarketplacePage'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarketplacePage />
    </Suspense>
  )
}