import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white text-dark font-sans w-100 overflow-x-hidden">
      {/* Custom CSS for Animations & Premium Effects */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hover-lift { transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .hover-lift:hover { transform: translateY(-12px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
        
        .glass-nav { background: rgba(255, 255, 255, 0.9) !important; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-up { animation: fadeUp 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }
        
        .img-zoom { transition: transform 0.8s ease; }
        .card:hover .img-zoom { transform: scale(1.05); }
      `,
        }}
      />

      {/* Top Header / Navbar matching reference design */}
      <header className="position-absolute top-0 start-0 w-100 z-3">
        <div className="d-flex align-items-center justify-content-between">
          {/* Left Brand Logo (Over the hero background) */}
          <div className="ps-4 ps-md-5 py-3">
            <Link
              href="/"
              className="navbar-brand d-flex align-items-center gap-2 text-white text-decoration-none"
            >
              <div
                className="bg-primary text-white p-2 rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <i className="bi bi-droplet-half fs-4"></i>
              </div>
              <span
                className="fs-3 fw-black text-white tracking-wider"
                style={{ letterSpacing: "1.5px", textTransform: "uppercase" }}
              >
                MYDHOBHIGHAT
              </span>
            </Link>
          </div>

          {/* Right White Curved Navigation Island */}
          <div
            className="bg-white shadow-sm d-none d-lg-flex align-items-center px-5 py-3"
            style={{
              borderBottomLeftRadius: "40px",
              minHeight: "68px",
            }}
          >
            <nav className="d-flex align-items-center gap-3">
              <Link
                href="/"
                className="text-decoration-none fw-bold text-dark text-uppercase small"
                style={{ letterSpacing: "1px" }}
              >
                HOME
              </Link>
              <span className="text-muted small">-</span>
              <a
                href="#about"
                className="text-decoration-none fw-bold text-secondary text-uppercase small"
                style={{ letterSpacing: "1px" }}
              >
                ABOUT
              </a>
              <span className="text-muted small">-</span>
              <a
                href="#services"
                className="text-decoration-none fw-bold text-secondary text-uppercase small"
                style={{ letterSpacing: "1px" }}
              >
                SERVICES
              </a>
              <span className="text-muted small">-</span>
              <a
                href="#pricing"
                className="text-decoration-none fw-bold text-secondary text-uppercase small"
                style={{ letterSpacing: "1px" }}
              >
                PRICING
              </a>
              <span className="text-muted small">-</span>
              <a
                href="#faq"
                className="text-decoration-none fw-bold text-secondary text-uppercase small"
                style={{ letterSpacing: "1px" }}
              >
                FAQ
              </a>
              <span className="text-muted small">-</span>
              <a
                href="#blog"
                className="text-decoration-none fw-bold text-secondary text-uppercase small"
                style={{ letterSpacing: "1px" }}
              >
                BLOG
              </a>
              <span className="text-muted small">-</span>
              <a
                href="#contact"
                className="text-decoration-none fw-bold text-secondary text-uppercase small"
                style={{ letterSpacing: "1px" }}
              >
                CONTACT
              </a>

              <Link
                href="/login"
                className="btn btn-primary btn-sm px-4 py-2 rounded-pill fw-bold ms-3 shadow-sm"
              >
                LOGIN
              </Link>
            </nav>
          </div>

          {/* Mobile Login Button */}
          <div className="d-lg-none pe-4">
            <Link
              href="/login"
              className="btn btn-primary btn-sm px-3 py-2 rounded-pill fw-bold"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Matching Mockup */}
      <section
        className="position-relative container-fluid p-0 d-flex align-items-center overflow-visible"
        style={{
          minHeight: "88vh",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "80px",
        }}
      >
        {/* Dark overlay for contrast */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.65 }}
        ></div>

        <div className="row w-100 m-0 position-relative z-1 px-4 px-md-5 py-5">
          <div className="col-lg-8 col-xl-6 py-5 text-white">
            <div className="d-flex">
              {/* Blue accent line */}
              <div
                className="bg-primary rounded-1"
                style={{
                  width: "8px",
                  marginRight: "24px",
                  minHeight: "140px",
                }}
              ></div>
              <div>
                <h1
                  className="display-3 fw-black mb-3 text-white"
                  style={{ letterSpacing: "-1px", lineHeight: "1.1" }}
                >
                  Fresh Clothes,
                  <br />
                  Hassle Free
                </h1>
                <p
                  className="lead mb-4 text-white-50"
                  style={{ maxWidth: "520px" }}
                >
                  Professional laundry and dry cleaning services with free
                  doorstep pickup and express on-time delivery.
                </p>
                <button
                  className="btn btn-primary px-4 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-2 shadow hover-lift text-uppercase"
                  style={{ letterSpacing: "0.5px" }}
                >
                  READ MORE <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slider Controls (bottom right of hero banner) */}
        <div
          className="position-absolute d-none d-md-flex gap-2 z-2"
          style={{ bottom: "90px", right: "10%" }}
        >
          <button
            className="btn btn-outline-light rounded-1 px-3 py-2 opacity-75 border-2"
            aria-label="Previous Slide"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            className="btn btn-outline-light rounded-1 px-3 py-2 opacity-75 border-2"
            aria-label="Next Slide"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {/* Floating Call Us Box */}
        <div
          className="position-absolute bg-white shadow-lg rounded-3 p-3 p-md-4 d-flex align-items-center gap-3 z-3 hover-lift border"
          style={{
            bottom: "-40px",
            right: "8%",
            minWidth: "290px",
          }}
        >
          <div
            className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
            style={{ width: "50px", height: "50px" }}
          >
            <i className="bi bi-telephone-fill fs-5"></i>
          </div>
          <div>
            <span
              className="text-primary d-block fw-bold small text-uppercase"
              style={{ letterSpacing: "1px" }}
            >
              Call Us
            </span>
            <span className="fs-5 fw-bolder text-dark">+91 98765 43210</span>
          </div>
        </div>
      </section>

      {/* Services Section - Premium Edge-to-Edge Layout with Heading */}
      <section
        className="container-fluid p-0 position-relative z-2 bg-white"
        style={{ paddingTop: "80px", paddingBottom: "0px" }}
      >
        {/* Premium Section Title */}
        <div className="text-center px-4 mb-5 animate-fade-up">
          <span
            className="text-primary fw-bold text-uppercase small"
            style={{ letterSpacing: "1.5px" }}
          ></span>
          <h2
            className="display-4 fw-black text-dark mt-2 mb-0"
            style={{ letterSpacing: "-1px" }}
          >
            Premium Laundry Services
          </h2>
        </div>

        {/* Edge-to-Edge Image Grid (No Gaps, Touching All Borders) */}
        <div className="row w-100 m-0 g-0">
          {[
            {
              subtitle: "Our Service",
              title: "Wash & Fold",
              img: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=2070&auto=format&fit=crop",
            },
            {
              subtitle: "Our Service",
              title: "Dry Cleaning",
              img: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=2039&auto=format&fit=crop",
            },
            {
              subtitle: "Our Service",
              title: "Ironing",
              img: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071&auto=format&fit=crop",
            },
            {
              subtitle: "Our Service",
              title: "Shoe Spa",
              img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974&auto=format&fit=crop",
            },
          ].map((service, index) => (
            <div key={index} className="col-md-6 col-xl-3 p-0">
              <div
                className="card border-0 rounded-0 overflow-hidden position-relative hover-lift"
                style={{ minHeight: "450px" }}
              >
                {/* Full Card Background Image */}
                <img
                  src={service.img}
                  alt={service.title}
                  className="position-absolute top-0 start-0 w-100 h-100 img-zoom"
                  style={{ objectFit: "cover", zIndex: 1 }}
                />

                {/* Dark Blue/Navy Gradient Overlay matching the reference */}
                <div
                  className="position-absolute bottom-0 start-0 w-100 p-4 p-xl-5 d-flex flex-column justify-content-end z-2"
                  style={{
                    height: "75%",
                    background:
                      "linear-gradient(to top, rgba(16, 24, 40, 0.95) 0%, rgba(16, 24, 40, 0.5) 50%, transparent 100%)",
                  }}
                >
                  <h4
                    className="fw-bolder text-white mb-0"
                    style={{
                      fontSize: "1.5rem",
                      letterSpacing: "0.5px",
                      lineHeight: "1.3",
                    }}
                  >
                    <span
                      className="d-block fw-normal text-white-50 mb-2"
                      style={{
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {service.subtitle}
                    </span>
                    {service.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Feature Highlights - Premium Card Layout */}
      <section
        className="container-fluid px-4 px-md-5 bg-light position-relative z-2"
        style={{ paddingTop: "80px", paddingBottom: "80px" }}
      >
        <div className="row w-100 m-0 g-4 justify-content-center">
          {[
            {
              icon: "bi-box-seam",
              title: "Seamless Logistics",
              desc: "Complimentary pickup and delivery on your exact schedule.",
            },
            {
              icon: "bi-stars",
              title: "Pristine Quality",
              desc: "Eco-conscious detergents and imported machinery for deep cleaning.",
            },
            {
              icon: "bi-lightning",
              title: "Rapid Turnaround",
              desc: "Get your wardrobe refreshed and returned in under 24 hours.",
            },
            {
              icon: "bi-wallet2",
              title: "Transparent Pricing",
              desc: "Luxury service without the exorbitant price tag.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`col-md-6 col-xl-3 animate-fade-up delay-${idx % 3}`}
            >
              <div className="card h-100 border-0 shadow-sm rounded-3 py-5 px-4 text-center hover-lift bg-white d-flex flex-column align-items-center">
                {/* Primary Blue Icon Container */}
                <div
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-sm"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i className={`bi ${feature.icon} fs-1 text-white`}></i>
                </div>

                <h4 className="fw-bolder text-dark mb-3">{feature.title}</h4>
                <p
                  className="text-secondary fs-6 mb-0 lh-lg"
                  style={{ maxWidth: "250px" }}
                >
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section - Immersive Edge to Edge Image */}
      <section
        className="position-relative container-fluid px-4 px-md-5 py-6 text-white text-center my-0 d-flex align-items-center"
        style={{
          minHeight: "70vh",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=2039&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.75 }}
        ></div>
        <div className="position-relative z-1 py-5 w-100 animate-fade-up">
          <span className="badge bg-white text-dark rounded-pill px-4 py-2 mb-4 fw-bold shadow">
            The My Dhobi Ghat Standard
          </span>
          <h2
            className="display-4 fw-black mb-5"
            style={{ letterSpacing: "-1px" }}
          >
            Uncompromising Care.
          </h2>

          <div className="row g-5 justify-content-center mt-4 px-lg-5">
            {[
              {
                icon: "bi-shield-check",
                title: "Hygienic Wash",
                desc: "Individualized washing per customer",
              },
              {
                icon: "bi-patch-check",
                title: "Fabric Experts",
                desc: "Decades of textile knowledge",
              },
              {
                icon: "bi-tree",
                title: "Eco-Solvents",
                desc: "Harsh chemical-free cleaning",
              },
              {
                icon: "bi-lock",
                title: "Garment Guarantee",
                desc: "Fully insured handling process",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`col-6 col-lg-3 px-4 animate-fade-up delay-${idx % 3} hover-lift`}
              >
                <div
                  className="bg-white bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4 backdrop-blur"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i className={`bi ${item.icon} display-6 text-white`}></i>
                </div>
                <h5 className="fw-bolder">{item.title}</h5>
                <p className="text-white-50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section - Premium White Theme Grid */}
      <section
        className="container-fluid px-4 px-md-5 py-6 bg-light text-center"
        style={{ paddingTop: "80px", paddingBottom: "80px" }}
      >
        <div className="animate-fade-up">
          <span
            className="text-primary fw-bold text-uppercase small"
            style={{ letterSpacing: "1.5px" }}
          >
            Testimonials
          </span>
          <h2
            className="display-5 fw-black mb-5 text-dark mt-2"
            style={{ letterSpacing: "-1px" }}
          >
            Loved by Thousands
          </h2>

          <div className="row g-4 justify-content-center px-lg-5">
            {[
              {
                text: "The attention to detail is unmatched. My silk shirts come back looking like they were just purchased from the boutique.",
                name: "Aisha Patel",
                loc: "Verified Customer",
                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
              },
              {
                text: "Absolute lifesavers. The express delivery is genuinely express, and the packaging makes it feel like a luxury unboxing.",
                name: "Rohan Desai",
                loc: "Verified Customer",
                img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
              },
              {
                text: "Finally, a laundry service that understands fabric care. The eco-friendly detergents leave no residue. Highly recommended.",
                name: "Kabir Singh",
                loc: "Verified Customer",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className={`col-md-6 col-lg-4 animate-fade-up delay-${idx % 3}`}
              >
                <div className="card border-0 shadow-sm h-100 rounded-4 text-start p-5 hover-lift bg-white">
                  <div className="d-flex text-warning mb-4 fs-5">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                  <p className="text-secondary fs-6 fw-medium mb-5 lh-lg">
                    "{review.text}"
                  </p>
                  <div className="d-flex align-items-center gap-3 mt-auto">
                    <img
                      src={review.img}
                      alt={review.name}
                      className="rounded-circle shadow-sm"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h6 className="fw-bolder text-dark mb-1 fs-5">
                        {review.name}
                      </h6>
                      <small
                        className="text-primary fw-bold text-uppercase"
                        style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
                      >
                        {review.loc}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section - Edge-to-Edge Light Theme */}
      <section
        className="container-fluid px-4 px-md-5 bg-white position-relative overflow-hidden"
        style={{ paddingTop: "100px", paddingBottom: "100px" }}
      >
        {/* Subtle geometric background element */}
        <div
          className="position-absolute top-0 end-0 h-100 bg-primary opacity-10"
          style={{
            width: "40%",
            clipPath: "polygon(20% 0%, 100% 0, 100% 100%, 0% 100%)",
          }}
        ></div>

        <div className="row align-items-center position-relative z-1 w-100 m-0">
          <div className="col-lg-6 p-0 pe-lg-5 text-center text-lg-start mb-5 mb-lg-0 animate-fade-up">
            <span
              className="text-primary fw-bold text-uppercase small"
              style={{ letterSpacing: "1.5px" }}
            >
              Get the App
            </span>
            <h2
              className="display-4 fw-black mb-4 text-dark mt-2"
              style={{ letterSpacing: "-1px" }}
            >
              Control Your Laundry
              <br />
              From Anywhere.
            </h2>
            <p
              className="lead text-secondary mb-5 fw-medium"
              style={{ maxWidth: "550px" }}
            >
              Track orders in real-time, schedule pickups, and manage payments
              effortlessly with our premium mobile application.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <button className="btn btn-dark px-4 py-3 rounded-pill d-flex align-items-center gap-3 shadow hover-lift transition-all">
                <i className="bi bi-apple fs-4 text-white"></i>
                <div className="text-start">
                  <small
                    className="d-block text-white-50 fw-bold"
                    style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                  >
                    DOWNLOAD ON THE
                  </small>
                  <span className="fw-black text-white d-block lh-1 fs-5">
                    App Store
                  </span>
                </div>
              </button>
              <button className="btn btn-dark px-4 py-3 rounded-pill d-flex align-items-center gap-3 shadow hover-lift transition-all">
                <i className="bi bi-google-play fs-4 text-white"></i>
                <div className="text-start">
                  <small
                    className="d-block text-white-50 fw-bold"
                    style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                  >
                    GET IT ON
                  </small>
                  <span className="fw-black text-white d-block lh-1 fs-5">
                    Google Play
                  </span>
                </div>
              </button>
            </div>
          </div>
          <div className="col-lg-6 p-0 text-center position-relative animate-fade-up delay-1">
            <img
              src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop"
              alt="Mobile App View"
              className="img-fluid rounded-4 shadow-lg"
              style={{
                maxWidth: "75%",
                border: "12px solid #f8f9fa",
              }}
            />
          </div>
        </div>
      </section>

      {/* Footer - Edge to Edge White Minimalist */}
      <footer className="container-fluid px-4 px-md-5 pt-6 pb-3 bg-white border-top">
        <div className="row g-5 py-5 w-100 m-0">
          <div className="col-lg-4 pe-lg-5 p-0">
            <div className="d-flex align-items-center gap-2 mb-4">
              <div
                className="bg-primary text-white p-2 rounded-2 d-flex align-items-center justify-content-center"
                style={{ width: "38px", height: "38px" }}
              >
                <i className="bi bi-droplet-half fs-5"></i>
              </div>
              <span className="fs-4 fw-black text-dark tracking-tight text-uppercase">
                MyDhobhiGhat
              </span>
            </div>
            <p className="text-secondary pe-4 fs-6 lh-lg mb-4">
              Elevating the standard of garment care. We combine technology,
              eco-friendly practices, and deep textile expertise to deliver
              unmatched laundry services.
            </p>
            <div className="d-flex gap-3">
              <a
                href="#"
                className="btn btn-light text-dark rounded-circle shadow-sm hover-lift d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-facebook"></i>
              </a>
              <a
                href="#"
                className="btn btn-light text-dark rounded-circle shadow-sm hover-lift d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a
                href="#"
                className="btn btn-light text-dark rounded-circle shadow-sm hover-lift d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-twitter-x"></i>
              </a>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 p-0 ps-lg-4">
            <h6 className="fw-bolder text-dark mb-4 fs-5">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none fw-medium hover-lift d-inline-block"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none fw-medium hover-lift d-inline-block"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none fw-medium hover-lift d-inline-block"
                >
                  How it Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none fw-medium hover-lift d-inline-block"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-4 p-0">
            <h6 className="fw-bolder text-dark mb-4 fs-5">Company</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none fw-medium hover-lift d-inline-block"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none fw-medium hover-lift d-inline-block"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none fw-medium hover-lift d-inline-block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none fw-medium hover-lift d-inline-block"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-4 p-0">
            <h6 className="fw-bolder text-dark mb-4 fs-5">Contact Us</h6>
            <ul className="list-unstyled d-flex flex-column gap-4 text-secondary">
              <li className="d-flex gap-3 align-items-center">
                <div className="bg-light p-3 rounded-circle text-primary">
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <span className="fw-bold fs-5 text-dark">+91 98765 43210</span>
              </li>
              <li className="d-flex gap-3 align-items-center">
                <div className="bg-light p-3 rounded-circle text-primary">
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <span className="fw-medium">hello@mydhobhighat.com</span>
              </li>
              <li className="d-flex gap-3 align-items-center">
                <div className="bg-light p-3 rounded-circle text-primary">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <span className="fw-medium">
                  Navi Mumbai, Maharashtra, India
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="text-center text-secondary pt-4 pb-2 mt-4 border-top fw-bold"
          style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
        >
          &copy; 2026 MY DHOBHI GHAT. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
