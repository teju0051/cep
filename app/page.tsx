"use client";
import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="bg-white min-vh-100 font-sans"
      style={{ overflowX: "hidden" }}
    >
      {/* ================= 1. NAVBAR ================= */}
      <nav
        className="navbar navbar-expand-lg bg-white py-3 sticky-top shadow-sm"
        style={{ zIndex: 1030 }}
      >
        <div className="container px-4 px-md-5 d-flex justify-content-between align-items-center">
          <Link
            href="/"
            className="navbar-brand d-flex align-items-center gap-2"
          >
            <img
              src="/logo.png"
              alt="WashNora Laundry Logo"
              style={{ height: "45px", objectFit: "contain" }}
            />
          </Link>

          <div>
            <Link
              href="/login"
              className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center gap-2"
            >
              Login <i className="bi bi-box-arrow-in-right"></i>
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= 2. HERO SECTION ================= */}
      <section
        className="position-relative overflow-hidden"
        style={{
          backgroundColor: "#f4f9ff",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* FIXED: Added explicit height and width parameters to ensure rendering */}
        <div
          className="position-absolute d-none d-lg-block shadow-lg"
          style={{
            top: 0,
            right: 0,
            width: "55%",
            height: "100%",
            clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
            zIndex: 1,
            backgroundColor: "#ffffff",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1582735689308-4a13498153ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="container px-4 px-md-5 position-relative z-2 py-5">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6 text-center text-lg-start fade-in-up py-5">
              <h1
                className="display-4 fw-bolder text-dark mb-4"
                style={{ lineHeight: "1.2" }}
              >
                Your Laundry, <br />
                <span className="text-primary">Done Flawlessly.</span>
              </h1>
              <p
                className="lead text-secondary mb-5 fw-medium"
                style={{ fontSize: "1.15rem", maxWidth: "520px" }}
              >
                We pick up your dirty clothes and deliver them back fresh,
                crisp, and perfectly folded. Experience the ultimate
                convenience.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                <Link
                  href="/login"
                  className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow hover-lift"
                >
                  Schedule a Pickup
                </Link>
              </div>
            </div>

            {/* Mobile Fallback Image (Shows only on small screens) */}
            <div className="col-12 d-block d-lg-none mt-4 fade-in-up">
              <div
                className="rounded-4 shadow-lg w-100"
                style={{
                  height: "300px",
                  backgroundColor: "#ffffff",
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1582735689308-4a13498153ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. HOW IT WORKS SECTION ================= */}
      <section className="py-5 bg-white position-relative">
        <div className="container px-4 px-md-5 py-5">
          <div className="text-center mb-5 fade-in-up">
            <h2 className="display-6 fw-bolder text-dark mb-3">
              How WashNora Laundry Works
            </h2>
            <p
              className="text-secondary fs-5 mx-auto"
              style={{ maxWidth: "600px" }}
            >
              Three simple steps to getting your weekends back. Leave the
              washing, drying, and folding to the experts.
            </p>
          </div>

          <div className="row g-4 text-center position-relative">
            {/* Connecting line for desktop */}
            <div
              className="d-none d-lg-block position-absolute top-50 start-50 translate-middle w-75 border-top border-2 border-primary border-dashed opacity-25"
              style={{ zIndex: 0 }}
            ></div>

            <div className="col-12 col-lg-4 position-relative z-1 hover-lift">
              <div className="card border-0 bg-transparent">
                <div
                  className="rounded-circle mx-auto mb-4 shadow border border-white border-4"
                  style={{
                    width: "160px",
                    height: "160px",
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
                <h4 className="fw-bold text-dark">1. You Schedule</h4>
                <p className="text-secondary px-3">
                  Book a collection time online. Our friendly driver will arrive
                  with custom laundry bags.
                </p>
              </div>
            </div>

            <div className="col-12 col-lg-4 position-relative z-1 hover-lift">
              <div className="card border-0 bg-transparent">
                <div
                  className="rounded-circle mx-auto mb-4 shadow border border-white border-4"
                  style={{
                    width: "160px",
                    height: "160px",
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1545173168-9f1947eebb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
                <h4 className="fw-bold text-dark">2. We Clean</h4>
                <p className="text-secondary px-3">
                  Our facility uses eco-friendly solvents and premium detergents
                  to treat your garments.
                </p>
              </div>
            </div>

            <div className="col-12 col-lg-4 position-relative z-1 hover-lift">
              <div className="card border-0 bg-transparent">
                <div
                  className="rounded-circle mx-auto mb-4 shadow border border-white border-4"
                  style={{
                    width: "160px",
                    height: "160px",
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
                <h4 className="fw-bold text-dark">3. We Deliver</h4>
                <p className="text-secondary px-3">
                  Your clothes are returned fresh, folded, and perfectly pressed
                  within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. OUR SERVICES SECTION ================= */}
      <section className="py-5" style={{ backgroundColor: "#f8fafd" }}>
        <div className="container px-4 px-md-5 py-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
            <div className="mb-4 mb-md-0">
              <h2 className="display-6 fw-bolder text-dark mb-2">
                Our Premium Services
              </h2>
              <p className="text-secondary fs-5 mb-0">
                Tailored garment care for every fabric type.
              </p>
            </div>
            <Link
              href="/login"
              className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold hover-lift bg-white"
            >
              View Pricing <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 rounded-4 overflow-hidden shadow-sm hover-lift bg-white">
                <div
                  style={{
                    height: "240px",
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
                <div className="card-body p-4 text-center">
                  <div
                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-droplet-half fs-3"></i>
                  </div>
                  <h4 className="fw-bold text-dark mb-2">Wash & Fold</h4>
                  <p className="text-secondary mb-0">
                    Everyday laundry washed precisely, tumbled dry, and neatly
                    folded for your drawers.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 rounded-4 overflow-hidden shadow-sm hover-lift bg-white">
                <div
                  style={{
                    height: "240px",
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
                <div className="card-body p-4 text-center">
                  <div
                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-suit-club fs-3"></i>
                  </div>
                  <h4 className="fw-bold text-dark mb-2">Dry Cleaning</h4>
                  <p className="text-secondary mb-0">
                    Specialized stain removal and care for your delicate
                    fabrics, suits, and ethnic wear.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 rounded-4 overflow-hidden shadow-sm hover-lift bg-white">
                <div
                  style={{
                    height: "240px",
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1543269664-56d93c1b41a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
                <div className="card-body p-4 text-center">
                  <div
                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-magic fs-3"></i>
                  </div>
                  <h4 className="fw-bold text-dark mb-2">Steam Ironing</h4>
                  <p className="text-secondary mb-0">
                    Crisp, wrinkle-free finishing using commercial-grade steam
                    presses for that perfect look.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. WHY CHOOSE US / FINAL CTA ================= */}
      <section className="py-5 position-relative overflow-hidden bg-primary text-white">
        <div
          className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1582735689308-4a13498153ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
          }}
        ></div>

        <div className="container px-4 px-md-5 py-5 position-relative z-2">
          <div className="row g-5 align-items-center">
            <div className="col-12 col-lg-7 text-center text-lg-start">
              <h2 className="display-5 fw-bolder mb-4">
                Experience the Joy of <br />
                Zero Laundry Days.
              </h2>
              <p className="lead mb-5 opacity-75" style={{ maxWidth: "600px" }}>
                Join thousands of happy customers who have reclaimed their free
                time. Professional cleaning, transparent pricing, and reliable
                delivery.
              </p>

              <div className="row g-4 mb-5 text-start">
                <div className="col-sm-6 d-flex align-items-center gap-3">
                  <div
                    className="bg-white text-primary rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="bi bi-check-lg fs-5"></i>
                  </div>
                  <span className="fw-bold fs-5">Eco-Friendly Solvents</span>
                </div>
                <div className="col-sm-6 d-flex align-items-center gap-3">
                  <div
                    className="bg-white text-primary rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="bi bi-check-lg fs-5"></i>
                  </div>
                  <span className="fw-bold fs-5">Express 48H Delivery</span>
                </div>
                <div className="col-sm-6 d-flex align-items-center gap-3">
                  <div
                    className="bg-white text-primary rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="bi bi-check-lg fs-5"></i>
                  </div>
                  <span className="fw-bold fs-5">Affordable Pricing</span>
                </div>
                <div className="col-sm-6 d-flex align-items-center gap-3">
                  <div
                    className="bg-white text-primary rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="bi bi-check-lg fs-5"></i>
                  </div>
                  <span className="fw-bold fs-5">100% Satisfaction</span>
                </div>
              </div>

              <Link
                href="/login"
                className="btn btn-light btn-lg text-primary rounded-pill px-5 py-3 fw-bold shadow-lg hover-lift d-inline-flex align-items-center gap-2"
              >
                Get Started Today <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="col-12 col-lg-5 d-none d-lg-block">
              <div className="bg-white p-4 rounded-4 shadow-lg text-dark transform-tilt">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div
                    className="rounded-circle"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                  <div>
                    <h5 className="fw-bold mb-0">Priya Sharma</h5>
                    <div className="text-warning">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                    </div>
                  </div>
                </div>
                <p className="fst-italic fs-5 mb-0 text-secondary">
                  "Absolutely brilliant service. My clothes came back smelling
                  fresh, perfectly pressed, and right on time. Highly
                  recommended!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXACT FOOTER REQUESTED ================= */}
      <footer className="py-4 bg-white border-top">
        <div className="container text-center">
          <p className="mb-0 text-secondary fw-medium">
            © 2026 WashNora Laundry. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================= STYLES ================= */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .font-sans { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        
        .hover-lift { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(13, 110, 253, 0.2) !important; }
        
        .transform-tilt { transform: perspective(1000px) rotateY(-5deg) rotateX(2deg); transition: transform 0.5s ease; }
        .transform-tilt:hover { transform: perspective(1000px) rotateY(0deg) rotateX(0deg); }

        .border-dashed { border-style: dashed !important; opacity: 0.5; }

        .fade-in-up { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fade-in-left { animation: fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `,
        }}
      />
    </div>
  );
}
