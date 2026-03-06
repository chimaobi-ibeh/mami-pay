import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section id="partners" className="py-16">
      <div className="max-w-7xl mx-auto bg-[#075f47] rounded-3xl py-20 px-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          Join the Financial Movement.
        </h2>
        <p className="text-green-200 text-lg mb-10">
          Be among the first to experience the future of youth finance in Nigeria. Join our
          early access program today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2.5 bg-white text-[#075f47] font-semibold px-6 py-3.5 rounded-lg
                       hover:bg-green-50 transition-all duration-200 w-full sm:w-auto justify-center
                       hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
          >
            Get Early Access
          </Link>
          <Link
            to="/register"
            className="border border-white/40 text-white font-semibold px-6 py-3.5 rounded-lg
                       hover:bg-white/10 hover:border-white/70 transition-all duration-200
                       w-full sm:w-auto text-center active:scale-[0.98]"
          >
            Become a Partner
          </Link>
        </div>
        </div>
      </div>
    </section>
  )
}