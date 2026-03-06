export default function FeaturesSection() {
  return (
    <section id="solutions" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* For Corps Members - Dark Card */}
          <div className="bg-[#075f47] rounded-2xl p-8 text-white
                          transition-all duration-300 hover:shadow-2xl hover:shadow-[#075f47]/30 hover:-translate-y-1">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-5
                            transition-all duration-300 hover:bg-white/25 hover:scale-110">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">For Corps Members</h3>
            <p className="text-green-200 text-sm mb-6">
              Dedicated infrastructure for your service year. Secure your
              allowance and build credit while you serve.
            </p>

            <div className="space-y-4">
              <Feature
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                }
                title="Verified Service ID"
                desc="Automated verification for NYSC members."
                light
              />
              <Feature
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
                title="Overdraft Access"
                desc="Bridging financial gaps between monthly allowances."
                light
              />
              <Feature
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                }
                title="Camp & Vendor QR"
                desc="Seamless payments at the Mami market."
                light
              />
            </div>
          </div>

          {/* For Everyone - Light Card */}
          <div className="bg-gray-50 rounded-2xl p-8
                          transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/80 hover:-translate-y-1 hover:bg-white">
            <div className="w-10 h-10 bg-[#e8f5ee] rounded-xl flex items-center justify-center mb-5
                            transition-all duration-300 hover:bg-[#d4edde] hover:scale-110">
              <svg className="w-5 h-5 text-[#075f47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">For Everyone</h3>
            <p className="text-gray-500 text-sm mb-6">
              Financial empowerment for the next generation of Nigerian
              professionals and entrepreneurs.
            </p>

            <div className="space-y-4">
              <Feature
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Digital Savings"
                desc="Automated goals with competitive interest rates."
              />
              <Feature
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                }
                title="Instant Transfers"
                desc="Zero-fee transactions to any Nigerian bank."
              />
              <Feature
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                title="Growth Products"
                desc="Investment opportunities designed for starters."
              />
            </div>

            <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest font-medium">
              Available Nationwide Beyond NYSC Service
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Feature({ icon, title, desc, light }) {
  return (
    <div className="flex items-start gap-3 group/feature">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                       transition-all duration-200 group-hover/feature:scale-110 ${
        light ? 'bg-white/15 text-green-300 group-hover/feature:bg-white/25' : 'bg-[#e8f5ee] text-[#075f47] group-hover/feature:bg-[#d4edde]'
      }`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-semibold ${light ? 'text-white' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-xs mt-0.5 ${light ? 'text-green-200' : 'text-gray-500'}`}>{desc}</p>
      </div>
    </div>
  )
}