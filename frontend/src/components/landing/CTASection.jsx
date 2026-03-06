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
          <a
            href="#"
            className="flex items-center gap-2.5 bg-white text-[#075f47] font-semibold px-6 py-3.5 rounded-lg
                       hover:bg-green-50 transition-all duration-200 w-full sm:w-auto justify-center
                       hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.17.74.82 0 2.37-.91 3.99-.78 1.66.14 2.91.82 3.71 2.07-3.37 2.01-2.8 6.43.54 7.69-.65 1.5-1.47 2.97-3.41 4.16zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Download App
          </a>
          <a
            href="#"
            className="border border-white/40 text-white font-semibold px-6 py-3.5 rounded-lg
                       hover:bg-white/10 hover:border-white/70 transition-all duration-200
                       w-full sm:w-auto text-center active:scale-[0.98]"
          >
            Become a Partner
          </a>
        </div>
        </div>
      </div>
    </section>
  )
}