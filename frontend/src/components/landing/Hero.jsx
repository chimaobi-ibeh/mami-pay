export default function Hero() {
  return (
    <section className="pt-24 pb-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#e8f5ee] text-[#075f47] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider
                            transition-all duration-300 hover:bg-[#d4edde] hover:shadow-sm cursor-default">
              <span className="w-1.5 h-1.5 bg-[#2e7d52] rounded-full animate-pulse"></span>
              Now Launching in Nigeria
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Built for Service.<br />
              Built for Growth.
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Mami Pay is a next-generation financial platform designed to power
              youth growth, simplify payroll systems, and build structured financial
              opportunities across Nigeria.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-[#075f47] text-white font-semibold px-6 py-3 rounded-lg
                           hover:bg-[#064e3b] transition-all duration-200
                           hover:shadow-lg hover:shadow-[#075f47]/25 hover:gap-3 active:scale-[0.98]"
              >
                Get Early Access
                <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-700 font-medium hover:text-[#075f47] transition-colors duration-200
                           relative after:absolute after:bottom-[-1px] after:left-0 after:w-0 after:h-[1.5px]
                           after:bg-[#075f47] after:transition-all after:duration-250 hover:after:w-full"
              >
                Partner With Us
              </a>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex-shrink-0">
            <div className="relative w-64 lg:w-72 transition-transform duration-500 hover:-translate-y-2 hover:drop-shadow-2xl">
              {/* Phone shell */}
              <div className="bg-[#111] rounded-[2.5rem] p-3 shadow-2xl">
                <div className="bg-[#075f47] rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <span className="text-white text-xs">9:41</span>
                    <div className="w-16 h-4 bg-black rounded-full"></div>
                    <div className="flex gap-1">
                      <div className="w-3 h-2 bg-white rounded-sm opacity-80"></div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-white mx-2 mb-2 rounded-2xl p-4">
                    {/* Header bar */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 bg-[#075f47] rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-[#075f47] rounded-xl p-4 mb-4">
                      <p className="text-green-300 text-xs mb-1">MAIN BALANCE</p>
                      <p className="text-white text-2xl font-bold">₦77,000.00</p>

                      {/* Action buttons */}
                      <div className="flex justify-between mt-4">
                        {['Deposit', 'Transfer', 'QR Pay'].map((action) => (
                          <div key={action} className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center
                                            hover:bg-white/30 transition-colors duration-200 cursor-pointer">
                              <div className="w-3 h-3 bg-white/80 rounded-sm"></div>
                            </div>
                            <span className="text-white text-[9px]">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-700 text-xs font-semibold">Recent Activity</p>
                        <span className="text-[#075f47] text-xs hover:underline cursor-pointer">View All</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-[9px] font-bold">NY</span>
                            </div>
                            <div>
                              <p className="text-gray-800 text-[10px] font-medium">NYSC Allowance</p>
                              <p className="text-gray-400 text-[9px]">Today, 8am</p>
                            </div>
                          </div>
                          <span className="text-green-600 text-[10px] font-semibold">+₦71,000</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 text-[9px] font-bold">M</span>
                            </div>
                            <div>
                              <p className="text-gray-800 text-[10px] font-medium">Molo Hacker GR</p>
                              <p className="text-gray-400 text-[9px]">Yesterday</p>
                            </div>
                          </div>
                          <span className="text-red-500 text-[10px] font-semibold">-₦1,200</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-[9px] font-bold">SV</span>
                            </div>
                            <div>
                              <p className="text-gray-800 text-[10px] font-medium">Savings Goal</p>
                              <p className="text-gray-400 text-[9px]">Interest Disbursed</p>
                            </div>
                          </div>
                          <span className="text-green-600 text-[10px] font-semibold">+₦310</span>
                        </div>
                      </div>
                    </div>

                    {/* Growth Goal */}
                    <div className="mt-3 bg-[#f4fbf7] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[#075f47] text-[9px] font-bold uppercase tracking-wider">Growth Goal</p>
                        <span className="text-[#2e7d52] text-[9px] font-semibold">68%</span>
                      </div>
                      <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full w-[68%] bg-[#2e7d52] rounded-full"></div>
                      </div>
                      <p className="text-gray-400 text-[8px] mt-1">₦52,360 of ₦77,000 saved</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#e8f5ee] rounded-full opacity-60 -z-10
                              transition-transform duration-500 group-hover:scale-110"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#f0f9f4] rounded-full opacity-80 -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}