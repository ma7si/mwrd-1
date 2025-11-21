import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function Landing() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-['Inter',sans-serif]">
      <header className="sticky top-0 z-50 bg-[#FAFAF9]/80 backdrop-blur-sm">
    <div className="min-h-screen bg-[#F6F9FC] font-['Inter',sans-serif]" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 bg-[#F6F9FC]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between border-b border-gray-200 py-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 text-[#6366F1]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-[#6366F1] text-xl font-bold leading-tight tracking-tight">mwrd</h2>
            </div>
            <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#6366F1]" href="#clients">For Clients</a>
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#6366F1]" href="#suppliers">For Suppliers</a>
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#6366F1]" href="#how-it-works">How It Works</a>
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#6366F1]" href="#testimonials">About</a>
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]" href="#clients">{t('nav.forClients')}</a>
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]" href="#suppliers">{t('nav.forSuppliers')}</a>
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]" href="#how-it-works">{t('nav.howItWorks')}</a>
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]" href="#testimonials">{t('nav.about')}</a>
            </nav>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/login')}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-[#4A4A4A] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
              >
                <span className="truncate">{t('nav.login')}</span>
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#6366F1] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#6366F1]/90 transition-colors"
              >
                <span className="truncate">{t('nav.requestDemo')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-8 text-center lg:text-left">
                <div className="flex flex-col gap-4">
                  <h1 className="text-[#6366F1] text-4xl font-black leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                    The Smarter B2B Marketplace, Managed for You
                  <h1 className="text-[#0A2540] text-4xl font-black leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                    {t('landing.hero.title')}
                  </h1>
                  <p className="text-[#6b7280] text-lg font-normal leading-normal md:text-xl">
                    {t('landing.hero.subtitle')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => navigate('/signup?role=client')}
                    className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#6366F1] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#6366F1]/90 transition-colors"
                  >
                    <span className="truncate">{t('landing.hero.clientBtn')}</span>
                  </button>
                  <button
                    onClick={() => navigate('/signup?role=supplier')}
                    className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gray-200 text-[#4A4A4A] text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
                  >
                    <span className="truncate">{t('landing.hero.supplierBtn')}</span>
                  </button>
                </div>
              </div>
              <div className="w-full bg-center bg-no-repeat aspect-square md:aspect-video lg:aspect-square bg-cover rounded-xl" style={{ backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)' }}></div>
            </div>
          </div>
        </section>

        <section id="clients" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-12">
              <div className="border-b border-gray-200">
                <div className="flex justify-center gap-8">
                  <a className="flex flex-col items-center justify-center border-b-[3px] border-b-[#6366F1] text-[#6366F1] pb-[13px] pt-4" href="#clients">
                    <p className="text-base font-bold leading-normal tracking-[0.015em]">For Clients</p>
                  </a>
                  <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#6b7280] pb-[13px] pt-4 hover:text-[#6366F1]" href="#suppliers">
                    <p className="text-base font-bold leading-normal tracking-[0.015em]">For Suppliers</p>
                  <a className="flex flex-col items-center justify-center border-b-[3px] border-b-[#0A2540] text-[#0A2540] pb-[13px] pt-4" href="#clients">
                    <p className="text-base font-bold leading-normal tracking-[0.015em]">{t('landing.features.title')}</p>
                  </a>
                  <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#6b7280] pb-[13px] pt-4 hover:text-[#0A2540]" href="#suppliers">
                    <p className="text-base font-bold leading-normal tracking-[0.015em]">{t('landing.features.suppliers')}</p>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col hover:shadow-lg transition-shadow">
                  <ShieldCheck className="text-[#F97316] w-8 h-8" />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#6366F1] text-lg font-bold leading-tight">Access Vetted Suppliers</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">Connect with a curated network of trusted professionals and service providers, ensuring quality and reliability.</p>
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">{t('landing.features.vetted.title')}</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">{t('landing.features.vetted.desc')}</p>
                  </div>
                </div>

                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col hover:shadow-lg transition-shadow">
                  <ShoppingCart className="text-[#F97316] w-8 h-8" />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#6366F1] text-lg font-bold leading-tight">Streamline Procurement</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">Simplify your purchasing process with our intuitive tools, from request to payment, all in one place.</p>
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">{t('landing.features.procurement.title')}</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">{t('landing.features.procurement.desc')}</p>
                  </div>
                </div>

                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col hover:shadow-lg transition-shadow">
                  <LayoutDashboard className="text-[#F97316] w-8 h-8" />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#6366F1] text-lg font-bold leading-tight">Manage Projects Centrally</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">Oversee all your projects, communications, and milestones from a single, powerful dashboard.</p>
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">{t('landing.features.manage.title')}</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">{t('landing.features.manage.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center gap-12">
              <div className="flex flex-col gap-3 max-w-2xl">
                <h2 className="text-[#6366F1] text-3xl md:text-4xl font-bold leading-tight tracking-tight">How It Works</h2>
                <p className="text-[#6b7280] text-base md:text-lg">A simple, transparent process to connect and get work done.</p>
                <h2 className="text-[#0A2540] text-3xl md:text-4xl font-bold leading-tight tracking-tight">{t('landing.howItWorks.title')}</h2>
                <p className="text-[#6b7280] text-base md:text-lg">{t('landing.howItWorks.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#F97316]/20 text-[#F97316] font-bold text-xl">1</div>
                  <h3 className="text-[#6366F1] text-xl font-bold">Post or Find Opportunity</h3>
                  <p className="text-[#6b7280] text-sm">Clients post project requirements. Suppliers browse and find opportunities that match their expertise.</p>
                </div>

                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#F97316]/20 text-[#F97316] font-bold text-xl">2</div>
                  <h3 className="text-[#6366F1] text-xl font-bold">Connect & Collaborate</h3>
                  <p className="text-[#6b7280] text-sm">Use our platform to communicate, negotiate terms, and manage project milestones seamlessly.</p>
                </div>

                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#F97316]/20 text-[#F97316] font-bold text-xl">3</div>
                  <h3 className="text-[#6366F1] text-xl font-bold">Complete & Get Paid</h3>
                  <p className="text-[#6b7280] text-sm">Once the work is complete and approved, payments are processed securely and swiftly through the platform.</p>
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#00C49A]/20 text-[#00C49A] font-bold text-xl">1</div>
                  <h3 className="text-[#0A2540] text-xl font-bold">{t('landing.howItWorks.step1.title')}</h3>
                  <p className="text-[#6b7280] text-sm">{t('landing.howItWorks.step1.desc')}</p>
                </div>

                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#00C49A]/20 text-[#00C49A] font-bold text-xl">2</div>
                  <h3 className="text-[#0A2540] text-xl font-bold">{t('landing.howItWorks.step2.title')}</h3>
                  <p className="text-[#6b7280] text-sm">{t('landing.howItWorks.step2.desc')}</p>
                </div>

                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#00C49A]/20 text-[#00C49A] font-bold text-xl">3</div>
                  <h3 className="text-[#0A2540] text-xl font-bold">{t('landing.howItWorks.step3.title')}</h3>
                  <p className="text-[#6b7280] text-sm">{t('landing.howItWorks.step3.desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center gap-12">
              <div className="flex flex-col gap-3 max-w-2xl">
                <h2 className="text-[#6366F1] text-3xl md:text-4xl font-bold leading-tight tracking-tight">Trusted by Industry Leaders</h2>
                <p className="text-[#6b7280] text-base md:text-lg">Hear what our partners have to say about their experience with mwrd.</p>
                <h2 className="text-[#0A2540] text-3xl md:text-4xl font-bold leading-tight tracking-tight">{t('landing.testimonials.title')}</h2>
                <p className="text-[#6b7280] text-base md:text-lg">{t('landing.testimonials.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg transition-shadow">
                  <p className="text-[#4A4A4A]">{t('landing.testimonials.1')}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
                    <div>
                      <p className="font-bold text-[#6366F1]">Sarah Johnson</p>
                      <p className="text-sm text-[#6b7280]">Operations Manager, Innovate Inc.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg transition-shadow">
                  <p className="text-[#4A4A4A]">{t('landing.testimonials.2')}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                    <div>
                      <p className="font-bold text-[#6366F1]">Michael Chen</p>
                      <p className="text-sm text-[#6b7280]">CEO, Precision Solutions</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg transition-shadow">
                  <p className="text-[#4A4A4A]">{t('landing.testimonials.3')}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                    <div>
                      <p className="font-bold text-[#6366F1]">Emily Rodriguez</p>
                      <p className="text-sm text-[#6b7280]">Marketing Director, BuildFast Corp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#4338CA] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 text-white">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h2 className="text-white text-xl font-bold">mwrd</h2>
              </div>
              <p className="text-sm text-gray-300">{t('landing.footer.tagline')}</p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white">{t('landing.footer.platform')}</h4>
              <a className="text-sm text-gray-300 hover:text-white" href="#clients">{t('nav.forClients')}</a>
              <a className="text-sm text-gray-300 hover:text-white" href="#suppliers">{t('nav.forSuppliers')}</a>
              <a className="text-sm text-gray-300 hover:text-white" href="#how-it-works">{t('nav.howItWorks')}</a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white">{t('landing.footer.company')}</h4>
              <a className="text-sm text-gray-300 hover:text-white" href="#testimonials">{t('landing.footer.aboutUs')}</a>
              <a className="text-sm text-gray-300 hover:text-white" href="#testimonials">{t('landing.footer.careers')}</a>
              <a className="text-sm text-gray-300 hover:text-white" href="#testimonials">{t('landing.footer.contact')}</a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white">{t('landing.footer.legal')}</h4>
              <a className="text-sm text-gray-300 hover:text-white" href="#">{t('landing.footer.privacy')}</a>
              <a className="text-sm text-gray-300 hover:text-white" href="#">{t('landing.footer.terms')}</a>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-100/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
            <p>&copy; {new Date().getFullYear()} mwrd. {t('landing.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
