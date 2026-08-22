import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'

export default function MainLayout() {
  return (
    <div className="flex h-full min-h-screen">
      <Navbar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="min-h-full p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
