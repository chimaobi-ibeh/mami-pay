const problems = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Payroll Inefficiencies',
    desc: 'Manual processing slows growth and creates payment delays.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'B/N Mismatches',
    desc: 'Identity gaps prevent accurate financial deliveries.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Poor Planning Tools',
    desc: 'No structured way to save, track, or invest for the future.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Lack of Credit',
    desc: 'Youth excluded from traditional credit-scoring models.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    title: 'Fragmented Payments',
    desc: 'Disconnected systems across diverse regions.',
  },
]

export default function ProblemSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Financial Systems for Youth Are Broken.
          </h2>
          <div className="w-16 h-1 bg-[#2e7d52] mx-auto"></div>
        </div>

        {/* Single horizontal row of visible boxes */}
        <div className="flex flex-nowrap gap-4 mb-10 overflow-x-auto pb-2">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="flex-1 min-w-[160px] bg-white border border-gray-200 rounded-xl p-5 text-center
                         shadow-sm transition-all duration-300 ease-out
                         hover:shadow-lg hover:border-[#2e7d52]/40 hover:-translate-y-1 hover:bg-[#fafffe]
                         group cursor-default"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-3
                              group-hover:bg-[#e8f5ee] transition-colors duration-300">
                <span className="text-gray-500 group-hover:text-[#075f47] transition-colors duration-300">
                  {problem.icon}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5 leading-snug">{problem.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{problem.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 font-medium">
          Mami Pay fixes this with{' '}
          <span className="text-[#075f47] font-semibold">structure</span>,{' '}
          <span className="text-[#075f47] font-semibold">security</span>, and{' '}
          <span className="text-[#075f47] font-semibold">scalability</span>.
        </p>
      </div>
    </section>
  )
}