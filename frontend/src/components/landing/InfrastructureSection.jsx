const pillars = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Enterprise-Grade Security',
    desc: 'Our architecture is built with multi-layer encryption and real-time fraud monitoring to ensure every token is accounted for.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Strict Compliance',
    desc: 'Fully aligned with CBN regulations and national financial inclusion standards, ensuring a stable platform for long-term growth.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Scalable Architecture',
    desc: 'Designed to handle millions of transactions across all 36 states without compromising speed or reliability.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Youth Empowerment',
    desc: "We don't just provide accounts; we provide the data identity that helps youth access global financial opportunities.",
  },
]

export default function InfrastructureSection() {
  return (
    <section className="py-14 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            More Than a Wallet.
          </h2>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#4caf82] leading-tight">
            Built as Infrastructure.
          </h2>
        </div>

        {/* 2×2 grid — icon inline with title, description indented below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="group transition-all duration-300">
              {/* Icon + Title inline */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#4caf82] flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {pillar.icon}
                </span>
                <h3 className="text-white font-bold text-base tracking-wide">
                  {pillar.title}
                </h3>
              </div>
              {/* Description indented to align under title */}
              <p className="text-gray-400 text-sm leading-relaxed pl-8">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}