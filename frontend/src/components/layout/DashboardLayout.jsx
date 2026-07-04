import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Bell, Search, ChevronUp } from 'lucide-react'
import Sidebar from './Sidebar'
import { cx } from '../../utils/helpers'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Mobile overlay */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Sidebar – desktop always visible, mobile as drawer */}
      <div className={cx(
        'lg:block',
        mobileSidebar ? 'block' : 'hidden'
      )}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main content */}
      <div
        className={cx(
          'flex-1 flex flex-col min-w-0 transition-all duration-200',
          collapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* Top bar */}
        <header className="h-16 flex items-center px-4 lg:px-6 gap-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={() => setMobileSidebar(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search (Press '/' to focus)…"
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Live Clock */}
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {time}
            </span>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 notification-btn" title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-lg z-50 transition-all duration-300 transform hover:scale-110 active:scale-95 animate-fade-in cursor-pointer border-0"
          title="Scroll to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
