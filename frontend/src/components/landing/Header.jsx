import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Solutions', href: '#solutions' },
  { label: 'Partners',  href: '#partners'  },
  { label: 'Security',  href: '#security'  },
  { label: 'Company',   href: '#company'   },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100
                       transition-shadow duration-300 hover:shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#075f47] rounded-sm flex items-center justify-center
                          transition-transform duration-200 group-hover:scale-105">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-bold text-[#075f47] text-lg tracking-wide uppercase
                           transition-opacity duration-200 group-hover:opacity-80">Mami Pay</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm text-gray-600 hover:text-[#075f47] transition-colors duration-200
                         relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1.5px]
                         after:bg-[#075f47] after:transition-all after:duration-250
                         hover:after:w-full"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-gray-700 font-medium transition-colors duration-200
                       hover:text-[#075f47]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-[#075f47] text-white text-sm font-medium px-5 py-2.5 rounded-lg
                       hover:bg-[#064e3b] transition-all duration-200
                       hover:shadow-md hover:shadow-[#075f47]/20 active:scale-[0.98]"
          >
            Get Early Access
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 transition-opacity duration-200 hover:opacity-60"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`w-5 h-0.5 bg-gray-700 mb-1 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
          <div className={`w-5 h-0.5 bg-gray-700 mb-1 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-5 h-0.5 bg-gray-700 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4
                        animate-[slideDown_0.2s_ease-out]">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}
               className="text-sm text-gray-600 hover:text-[#075f47] transition-colors duration-200">
              {label}
            </a>
          ))}
          <Link to="/login" className="text-sm text-gray-600 hover:text-[#075f47] transition-colors duration-200">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-[#075f47] text-white text-sm font-medium px-5 py-2.5 rounded-lg text-center
                       hover:bg-[#064e3b] transition-colors duration-200"
          >
            Get Early Access
          </Link>
        </div>
      )}
    </header>
  )
}
