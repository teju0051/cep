'use client';
import React, { useState, useEffect } from 'react';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections = [
    { id: 'intro', title: '1. Introduction & Acceptance' },
    { id: 'services', title: '2. Laundry Services Provided' },
    { id: 'pricing', title: '3. Pricing & Payment Terms' },
    { id: 'pickup', title: '4. Pick-up & Delivery Operations' },
    { id: 'care', title: '5. Garment Care & Handling' },
    { id: 'damage', title: '6. Damaged or Lost Items' },
    { id: 'refunds', title: '7. Refund & Cancellation Policy' },
    { id: 'unclaimed', title: '8. Unclaimed Garments' },
    { id: 'customer', title: '9. Customer Responsibilities' },
    { id: 'privacy', title: '10. Privacy & Data Security' },
    { id: 'modifications', title: '11. Modifications to Terms' },
    { id: 'contact', title: '12. Contact Information' },
  ];

  // Scroll Spy to highlight the active section in the Table of Contents
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = sections[0].id;
      for (let section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the section is near the top of the viewport
          if (rect.top <= 150) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100; // Offset for header padding
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="d-flex flex-column w-100 position-relative bg-light" style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER */}
      <header className="bg-white border-bottom shadow-sm sticky-top z-3 py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center text-white" style={{ width: '40px', height: '40px' }}>
            <i className="bi bi-droplet-half fs-5"></i>
          </div>
          <div>
            <h5 className="fw-bold text-dark mb-0">Laundry <span className="text-primary">ERP</span></h5>
            <small className="text-secondary" style={{ fontSize: '0.7rem' }}>Legal & Policies</small>
          </div>
        </div>
        <a href="/dashboard" className="btn btn-outline-primary btn-sm rounded-pill fw-medium px-4">
          <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
        </a>
      </header>

      {/* MOBILE STICKY TOC */}
      <div className="d-block d-lg-none bg-white border-bottom sticky-toc-mobile shadow-sm px-3 py-2 z-2 overflow-auto" style={{ top: '70px', whiteSpace: 'nowrap' }}>
        <div className="d-flex gap-2 custom-scrollbar pb-1">
          {sections.map((sec) => (
            <a 
              key={`mob-${sec.id}`}
              href={`#${sec.id}`} 
              onClick={(e) => scrollToSection(e, sec.id)}
              className={`badge rounded-pill px-3 py-2 text-decoration-none transition-all border ${activeSection === sec.id ? 'bg-primary text-white border-primary shadow-sm' : 'bg-light text-secondary border-light hover-bg-primary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {sec.title}
            </a>
          ))}
        </div>
      </div>

      <div className="container-fluid py-4 py-md-5 px-3 px-md-5 flex-grow-1">
        
        <div className="text-center mb-5 fade-in">
          <h1 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.5px' }}>Terms of Service & Refund Policy</h1>
          <p className="text-secondary mb-0">Last Updated: <span className="fw-medium text-dark">August 2026</span></p>
        </div>

        <div className="row g-4 g-lg-5 position-relative">
          
          {/* LEFT SIDE: MAIN CONTENT (70%) */}
          <div className="col-12 col-lg-8 fade-in-up">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
              
              <section id="intro" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-journal-text"></i> 1. Introduction & Acceptance</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>Welcome to Seema Laundry Services / Laundry ERP. By accessing our platform, booking an order, or utilizing our laundry services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using our services.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Scope:</strong> These terms govern all online and offline transactions.</li>
                  <li><strong>Modifications:</strong> We reserve the right to update these terms without prior notice.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="services" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-basket-fill"></i> 2. Laundry Services Provided</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We offer comprehensive cleaning solutions including, but not limited to, wash and fold, dry cleaning, ironing, and premium fabric care.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Service Limitations:</strong> We do not clean bio-hazardous materials, garments severely damaged prior to pickup, or materials expressly prohibited by local law.</li>
                  <li><strong>Inspection:</strong> All garments undergo inspection before processing. We reserve the right to refuse service for heavily stained or delicate items.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="pricing" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-currency-rupee"></i> 3. Pricing & Payment Terms</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>Prices for our services are listed dynamically on our platform and may change based on demand or operational costs.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Payment Methods:</strong> We accept Online Payments (Razorpay, UPI, NetBanking) and Cash on Delivery (COD).</li>
                  <li><strong>Taxes:</strong> All listed prices are inclusive of applicable local taxes unless stated otherwise.</li>
                  <li><strong>Minimum Order:</strong> A minimum order value may apply for free pickup and delivery.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="pickup" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-truck"></i> 4. Pick-up & Delivery Operations</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We strive to ensure timely pickup and delivery of your garments.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Time Slots:</strong> Deliveries are subject to traffic and operational constraints. We are not liable for minor delays.</li>
                  <li><strong>Missed Pickups:</strong> If a customer is unavailable during a scheduled slot, a rescheduling fee may apply.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="care" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-stars"></i> 5. Garment Care & Handling</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We use premium detergents and industry-standard procedures, but specific garment risks fall upon the customer.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Pockets & Valuables:</strong> We are not responsible for cash, jewelry, or electronics left inside pockets. Please empty your pockets before handing over clothes.</li>
                  <li><strong>Color Bleeding & Shrinkage:</strong> We are not liable for normal wear and tear, color fading, or shrinkage caused by manufacturer defects or weak dyes.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="damage" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-scissors"></i> 6. Damaged or Lost Items</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>While we exercise utmost care, accidents can happen.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Liability Limit:</strong> In the rare event of damage or loss caused entirely by our facility, our liability is strictly limited to a maximum of <strong>5 times the cleaning cost</strong> of the specific item.</li>
                  <li><strong>Reporting Window:</strong> Any missing or damaged items must be reported to support within 24 hours of delivery. Claims made after 24 hours will not be entertained.</li>
                </ul>
              </section>

              <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4 p-4 mb-5 scroll-margin" id="refunds">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-arrow-counterclockwise"></i> 7. Refund & Cancellation Policy</h4>
                <p className="text-dark fw-medium" style={{ lineHeight: '1.7' }}>Refunds are not guaranteed and are strictly regulated to prevent abuse of our services.</p>
                <ul className="text-dark ps-4 mb-0" style={{ lineHeight: '1.7' }}>
                  <li><strong>Strict Managerial Approval:</strong> Refunds will <strong>only be initiated if investigated and formally approved by the Branch Manager</strong>. Customer support executives cannot authorize refunds directly.</li>
                  <li><strong>Order Cancellations:</strong> Orders can only be cancelled before the pickup executive arrives. Cancellations after pickup will incur a processing fee.</li>
                  <li><strong>Service Dissatisfaction:</strong> If you are unhappy with the cleaning quality, we offer a complimentary re-wash within 48 hours instead of a cash refund.</li>
                  <li><strong>Processing Time:</strong> Approved refunds via Razorpay will take 5-7 business days to reflect in the original payment source.</li>
                </ul>
              </div>

              <section id="unclaimed" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-box-seam"></i> 8. Unclaimed Garments</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>Customers must accept delivery or pick up their garments within a reasonable timeframe.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Storage Period:</strong> Garments left unclaimed for more than 30 days post-cleaning will be donated to charity or discarded.</li>
                  <li><strong>Storage Fees:</strong> We reserve the right to charge storage fees for items held past 14 days.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="customer" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-person-check"></i> 9. Customer Responsibilities</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>For a seamless experience, customers must adhere to the following:</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li>Provide accurate address, phone number, and location details.</li>
                  <li>Highlight specific stains or fabric sensitivities to the pickup executive.</li>
                  <li>Ensure pets and hazards are secured when executives arrive for pickup/delivery.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="privacy" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-shield-lock"></i> 10. Privacy & Data Security</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>Your data is securely stored within our ERP.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Data Usage:</strong> Phone numbers and addresses are used strictly for operational and delivery purposes.</li>
                  <li><strong>Payments:</strong> We do not store credit card or UPI PINs. All online payments are securely routed via Razorpay.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="modifications" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-file-earmark-diff"></i> 11. Modifications to Terms</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We reserve the right to modify these terms. Any changes will be updated on this page. Continued use of the platform after updates signifies your acceptance of the new terms.</p>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="contact" className="mb-2 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-headset"></i> 12. Contact Information</h4>
                <p className="text-secondary mb-2" style={{ lineHeight: '1.7' }}>If you have any questions or require legal clarification regarding these terms, please reach out to us:</p>
                <div className="bg-light p-4 rounded-4 mt-3 border border-light">
                  <p className="mb-2 text-dark"><i className="bi bi-envelope-fill text-primary me-2"></i> <strong>Email:</strong> legal@seemalaundry.com</p>
                  <p className="mb-2 text-dark"><i className="bi bi-telephone-fill text-primary me-2"></i> <strong>Phone:</strong> +91 98765 43210</p>
                  <p className="mb-0 text-dark"><i className="bi bi-geo-alt-fill text-primary me-2"></i> <strong>Address:</strong> Seema Laundry Services, Main Street, Panvel, Maharashtra</p>
                </div>
              </section>

            </div>
          </div>

          {/* RIGHT SIDE: TABLE OF CONTENTS (30%) - DESKTOP ONLY */}
          <div className="col-lg-4 d-none d-lg-block fade-in-left">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 sticky-toc">
              <h5 className="fw-bold text-dark mb-4 border-bottom pb-3"><i className="bi bi-list-nested text-primary me-2"></i> Table of Contents</h5>
              <nav className="nav flex-column gap-1">
                {sections.map((sec) => (
                  <a 
                    key={sec.id}
                    href={`#${sec.id}`} 
                    onClick={(e) => scrollToSection(e, sec.id)}
                    className={`nav-link text-start rounded-3 px-3 py-2 fw-medium transition-all ${activeSection === sec.id ? 'bg-primary bg-opacity-10 text-primary border-start border-4 border-primary' : 'text-secondary hover-bg-light border-start border-4 border-transparent'}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

        </div>
      </div>

      {/* Global CSS Inject */}
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; }
        
        /* Animations */
        .fade-in { animation: fadeIn 0.6s ease-out; }
        .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .fade-in-left { animation: fadeInLeft 0.6s ease-out forwards; opacity: 0; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        
        /* Hover Effects */
        .hover-bg-light:hover { background-color: #f8f9fa; color: #0d6efd !important; }
        .hover-bg-primary:hover { background-color: #0d6efd !important; color: white !important; }
        .border-transparent { border-color: transparent !important; }
        
        /* Sticky Controls */
        .sticky-toc { position: sticky; top: 100px; z-index: 10; max-height: calc(100vh - 120px); overflow-y: auto; }
        .scroll-margin { scroll-margin-top: 110px; }
        
        /* Custom Scrollbar for TOC */
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0d6efd; }
      `}} />
    </div>
  );
}