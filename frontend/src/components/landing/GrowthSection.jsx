const stages = [
  {
    label: 'CORPER STAGE',
    title: 'Service Year',
    features: ['NYSC Allowance Account', 'Camp & Vendor QR', 'Verified Service ID', 'Overdraft Access'],
    active: false,
  },
  {
    label: 'GRADUATE STAGE',
    title: 'Professional Life',
    features: ['Salary Account', 'Credit Building', 'Investment Products', 'Business Tools'],
    active: true,
  },
  {
    label: 'CAREER & BUSINESS',
    title: 'Building Wealth',
    features: ['Business Banking', 'Payroll Management', 'Trade Finance', 'Global Payments'],
    active: false,
  },
]

export default function GrowthSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Growth Beyond Service.</h2>
        </div>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-16 text-base leading-relaxed">
          Mami Pay is your lifelong financial companion. As you transition from the service
          year into your professional career, our platform evolves with you, providing the data
          identity and financial tools required for modern adulthood in Nigeria.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <div
              key={stage.label}
              className={`rounded-2xl p-6 transition-all duration-300 ${
                stage.active
                  ? 'bg-[#075f47] text-white shadow-xl scale-105 hover:shadow-2xl hover:shadow-[#075f47]/40 hover:scale-[1.07]'
                  : 'bg-white text-gray-900 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#2e7d52]/20 border border-transparent'
              }`}
            >
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                stage.active ? 'text-green-300' : 'text-gray-400'
              }`}>
                {stage.label}
              </p>
              <h3 className={`text-xl font-bold mb-5 ${stage.active ? 'text-white' : 'text-gray-900'}`}>
                {stage.title}
              </h3>
              <ul className="space-y-3">
                {stage.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      stage.active ? 'bg-green-400/30' : 'bg-[#e8f5ee]'
                    }`}>
                      <svg className={`w-2.5 h-2.5 ${stage.active ? 'text-green-300' : 'text-[#2e7d52]'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className={`text-sm ${stage.active ? 'text-green-100' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}