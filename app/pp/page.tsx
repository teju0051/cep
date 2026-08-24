'use client';
import React, { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections = [
    { id: 'intro', title: '1. Introduction' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'usage', title: '3. How We Use Your Data' },
    { id: 'payments', title: '4. Payment Processing' },
    { id: 'sharing', title: '5. Data Sharing & Third Parties' },
    { id: 'security', title: '6. Data Security Measures' },
    { id: 'cookies', title: '7. Cookies & Tracking' },
    { id: 'retention', title: '8. Data Retention Policy' },
    { id: 'rights', title: '9. Your Privacy Rights' },
    { id: 'updates', title: '10. Updates to this Policy' },
    { id: 'contact', title: '11. Contact Information' },
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
            <i className="bi bi-shield-check fs-5"></i>
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
          <h1 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.5px' }}>Privacy Policy</h1>
          <p className="text-secondary mb-0">Last Updated: <span className="fw-medium text-dark">August 2026</span></p>
        </div>

        <div className="row g-4 g-lg-5 position-relative">
          
          {/* LEFT SIDE: MAIN CONTENT (70%) */}
          <div className="col-12 col-lg-8 fade-in-up">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
              
              <section id="intro" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-shield-lock"></i> 1. Introduction</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>Welcome to Seema Laundry Services / Laundry ERP. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, safeguard, and disclose your information when you use our platform and services.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Consent:</strong> By creating an account or booking an order, you consent to the data practices described in this policy.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="collection" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-person-lines-fill"></i> 2. Information We Collect</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>To provide you with seamless laundry and delivery services, we must collect certain necessary information during your onboarding and usage of the app.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Personal Identifiers:</strong> Your full name, email address, and phone number.</li>
                  <li><strong>Location Data:</strong> Your full residential or office address required for precise garment pickup and delivery.</li>
                  <li><strong>Order History:</strong> Details about the services you book, your garment types, and service preferences.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="usage" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-gear"></i> 3. How We Use Your Data</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We solely use your data to operate, maintain, and improve your experience with our laundry services.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Service Fulfillment:</strong> To dispatch delivery executives to your location and accurately process your laundry orders.</li>
                  <li><strong>Communication:</strong> To send you real-time status updates regarding your order, invoices, and emergency support messages.</li>
                  <li><strong>Account Management:</strong> To maintain your profile and secure your authentication sessions.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4 p-4 mb-5 scroll-margin" id="payments">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-credit-card"></i> 4. Payment Processing</h4>
                <p className="text-dark fw-medium" style={{ lineHeight: '1.7' }}>We utilize industry-leading, secure third-party gateways to process your transactions.</p>
                <ul className="text-dark ps-4 mb-0" style={{ lineHeight: '1.7' }}>
                  <li><strong>Razorpay Integration:</strong> All online payments (UPI, Credit/Debit Cards, NetBanking) are processed securely through Razorpay.</li>
                  <li><strong>Zero Data Storage:</strong> Our ERP servers <strong>never store or access</strong> your sensitive payment information, such as card numbers or UPI PINs.</li>
                  <li><strong>Transaction Records:</strong> We only retain the Razorpay Payment ID and the transaction amount for billing and refund purposes.</li>
                </ul>
              </div>

              <section id="sharing" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-share"></i> 5. Data Sharing & Third Parties</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We do not sell, trade, or rent your personal information to marketing agencies.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Internal Staff:</strong> Your address and phone number are securely shared with our authorized delivery executives strictly for order fulfillment.</li>
                  <li><strong>Legal Compliance:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="security" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-lock"></i> 6. Data Security Measures</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We employ robust technological safeguards to ensure your data remains protected from unauthorized access.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Role-Based Access:</strong> Only specific Admins and Managers have access to global order data. Delivery staff only see relevant details for active runs.</li>
                  <li><strong>Encryption:</strong> Data transmitted between your browser and our database is protected using modern encryption protocols (HTTPS/SSL).</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="cookies" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-browser-chrome"></i> 7. Cookies & Tracking</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>Our ERP utilizes necessary cookies to keep you logged in and ensure the platform functions smoothly.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Session Cookies:</strong> Used for secure authentication so you do not have to log in repeatedly.</li>
                  <li><strong>Opt-Out:</strong> You can configure your browser to reject cookies, though this may prevent you from logging into your dashboard.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="retention" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-server"></i> 8. Data Retention Policy</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We retain personal data only for as long as necessary to fulfill the purposes for which we collected it.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Account Data:</strong> Retained as long as your account remains active.</li>
                  <li><strong>Order History:</strong> Retained for administrative, accounting, and legal compliance purposes.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="rights" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-person-bounding-box"></i> 9. Your Privacy Rights</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>You have full control over the personal data you share with us.</p>
                <ul className="text-secondary ps-4" style={{ lineHeight: '1.7' }}>
                  <li><strong>Data Access & Modification:</strong> You can instantly review or update your name, phone number, and address from the "Edit Profile" section in your dashboard.</li>
                  <li><strong>Account Deletion:</strong> You may request the complete deletion of your account and associated personal data by contacting support.</li>
                </ul>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="updates" className="mb-5 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-clock-history"></i> 10. Updates to this Policy</h4>
                <p className="text-secondary" style={{ lineHeight: '1.7' }}>We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. When we do, we will revise the "Last Updated" date at the top of this page. We encourage you to review this policy regularly.</p>
              </section>

              <hr className="border-secondary opacity-10 my-4" />

              <section id="contact" className="mb-2 scroll-margin">
                <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2"><i className="bi bi-headset"></i> 11. Contact Information</h4>
                <p className="text-secondary mb-2" style={{ lineHeight: '1.7' }}>If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact our privacy team:</p>
                <div className="bg-light p-4 rounded-4 mt-3 border border-light">
                  <p className="mb-2 text-dark"><i className="bi bi-envelope-fill text-primary me-2"></i> <strong>Email:</strong> privacy@seemalaundry.com</p>
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