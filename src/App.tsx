import Holdie from './app/components/holdie/Holdie'
import Vault from './app/components/Vault'
import EggShelf from './app/components/EggShelf'
import SellIntervene from './app/components/SellIntervene'
import PlanForm from './app/components/PlanForm'
import Collection from './app/components/Collection'
import Review from './app/components/Review'
import {
  mockHeldRecords,
  mockPastSells,
  mockPlans,
  mockPrices,
} from './app/mock/data'

/**
 * Phase A 셸 — 목데이터로 전 컴포넌트를 한 화면에 나열.
 * 본 UI(홀디 SVG, 금고 다이얼, 알 선반 인터랙션)는 이 스텁을 교체하며 구현한다.
 */
export default function App() {
  return (
    <main style={{ padding: 20, display: 'grid', gap: 16 }}>
      <header style={{ textAlign: 'center' }}>
        <Holdie face="calm" />
        <h1 style={{ margin: '12px 0 0', fontSize: 22 }}>HOLD</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>
          수익률 대신, 계획대로 가고 있는지만.
        </p>
      </header>
      <Vault openCountToday={3} />
      <EggShelf plans={mockPlans} prices={mockPrices} />
      <PlanForm />
      <SellIntervene pastSells={mockPastSells} />
      <Collection heldRecords={mockHeldRecords} />
      <Review />
    </main>
  )
}
