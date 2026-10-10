"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, AtSign, BadgeCheck, Building2, Check, ChevronDown, LandPlot, Mail, MapPin, MessageCircle, Ruler, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import type { Property, PropertyCategory } from "@/lib/types";

const categories: Array<"All land" | PropertyCategory> = ["All land", "Residential Plot", "Farm Land", "Commercial Land"];
const whatsapp = "918778903754";

function Logo() {
  return <a className="brand-lockup" href="#home" aria-label="Murugan Realestate home"><span className="brand-mark"><LandPlot size={19} /></span><span className="brand-name">MURUGAN <span>REALESTATE</span></span></a>;
}

function PropertyCard({ property, onEnquire }: { property: Property; onEnquire: (property: Property) => void }) {
  return <article className="property-card">
    <div className="property-photo" role="img" aria-label={`${property.category} in ${property.location}`} style={{ backgroundImage: `linear-gradient(180deg, transparent 54%, rgba(6, 9, 9, .62)), url("${property.image}")` }}>
      <span className="photo-tag">{property.category}</span>{property.featured && <span className="featured-tag"><BadgeCheck size={13} /> Selected</span>}
    </div>
    <div className="property-content"><div className="property-heading-row"><p className="property-price">{property.priceLabel}</p><span className="property-area"><Ruler size={13} /> {property.area.toLocaleString("en-IN")} sq.ft.</span></div>
      <h3>{property.title}</h3><p className="property-location"><MapPin size={14} /> {property.location}</p><p className="property-description">{property.description}</p>
      <div className="property-highlights">{property.highlights.slice(0, 2).map((item) => <span key={item}><Check size={12} /> {item}</span>)}</div>
      <button className="enquire-button" type="button" onClick={() => onEnquire(property)}><MessageCircle size={16} /> Enquire about this plot <ArrowUpRight size={15} /></button>
    </div>
  </article>;
}

export default function PropertyMarketplace() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All land");
  const [budget, setBudget] = useState("any");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<Property | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [enquiryError, setEnquiryError] = useState("");

  async function loadProperties() {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/properties", { cache: "no-store" });
      if (!response.ok) throw new Error();
      setProperties(await response.json() as Property[]);
    } catch {
      setLoadError("Listings are taking a moment to load. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProperties(); }, []);

  const visible = properties.filter((property) => {
    const text = `${property.title} ${property.location} ${property.category}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const matchesCategory = category === "All land" || category === property.category;
    const matchesBudget = budget === "any" || (budget === "under-40" ? property.price < 4000000 : budget === "40-75" ? property.price >= 4000000 && property.price <= 7500000 : property.price > 7500000);
    return matchesQuery && matchesCategory && matchesBudget;
  }).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : Number(b.featured) - Number(a.featured));

  function enquire(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setEnquiryError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!selected) return;
    const message = `Hello, my name is ${name.trim()}. I am interested in ${selected.title} in ${selected.location}. Please contact me at +91 ${cleanPhone}.`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setSelected(null);
  }

  return <main id="home" className="site-shell">
    <header className="site-header"><div className="header-inner"><Logo /><nav className="main-nav" aria-label="Main navigation"><a href="#properties">Properties</a><a href="#about">Our approach</a><a href="#contact">Contact</a></nav><a className="header-contact" href="tel:+918778903754"><span className="online-dot" /> Speak with Nishanth <ArrowUpRight size={14} /></a></div></header>
    <section className="hero-section"><div className="hero-image" role="img" aria-label="Open green countryside near Coimbatore" /><div className="hero-shade" /><div className="hero-content"><div className="eyebrow"><span /> LAND, WITH A LITTLE MORE MEANING <span className="eyebrow-place">COIMBATORE · TAMIL NADU</span></div><h1>Find your place<br />in the <em>open.</em></h1><p>Considered plots and land, chosen by people who know Coimbatore by heart.</p><a className="hero-cta" href="#properties">Explore available land <ArrowDownRight size={17} /></a></div><div className="hero-stamp"><span>LOCAL KNOWLEDGE</span><strong>Since<br />2006</strong><div className="stamp-line" /><small>COIMBATORE</small></div><div className="hero-index"><span>01</span><span className="index-line" /><span>LAND & PLOTS</span></div></section>
    <section className="trust-strip" id="about"><div className="trust-intro"><span className="eyebrow-dark">A BETTER WAY TO BUY LAND</span><p>Good land is more than a pin on a map.<br /><span>It is a decision made with clarity.</span></p></div><div className="trust-point"><ShieldCheck size={20} /><div><strong>Clear documentation</strong><span>Details worth checking</span></div></div><div className="trust-point"><MapPin size={20} /><div><strong>Ground-level insight</strong><span>Local, not from a listing feed</span></div></div><div className="trust-point"><Building2 size={20} /><div><strong>People-first guidance</strong><span>From first visit to registration</span></div></div></section>
    <section id="properties" className="properties-section"><div className="section-heading"><div><span className="eyebrow-dark">THE CURRENT COLLECTION</span><h2>Land worth<br className="mobile-break" /> looking at.</h2></div><p>Every property is selected with its setting, access, and paperwork in mind. Start with what matters to you.</p></div>
      <div className="search-panel"><label className="search-field"><Search size={17} /><input aria-label="Search by place or keyword" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a place or neighbourhood" /><kbd>⌘ K</kbd></label><div className="filter-field"><SlidersHorizontal size={15} /><select aria-label="Property type" value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div><div className="filter-field"><select aria-label="Price range" value={budget} onChange={(event) => setBudget(event.target.value)}><option value="any">Any budget</option><option value="under-40">Under ₹40 L</option><option value="40-75">₹40 L – ₹75 L</option><option value="over-75">Above ₹75 L</option></select><ChevronDown size={14} /></div><div className="filter-field sort-filter"><select aria-label="Sort listings" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={14} /></div></div>
      <div className="listing-toolbar"><span>{loading ? "Finding the right plots…" : <><strong>{visible.length.toString().padStart(2, "0")}</strong> properties in and around Coimbatore</>}</span><span className="toolbar-note"><span /> UPDATED SELECTION</span></div>
      {loadError ? <div className="empty-state"><p>{loadError}</p><button className="text-button" type="button" onClick={() => void loadProperties()}>Try again <ArrowUpRight size={15} /></button></div> : loading ? <div className="property-grid">{[0, 1, 2].map((item) => <div className="property-skeleton" key={item} />)}</div> : visible.length ? <div className="property-grid">{visible.map((property) => <PropertyCard key={property.id} property={property} onEnquire={(item) => { setSelected(item); setName(""); setPhone(""); setEnquiryError(""); }} />)}</div> : <div className="empty-state"><Search size={23} /><p>No plots match those filters just yet.</p><button className="text-button" type="button" onClick={() => { setQuery(""); setCategory("All land"); setBudget("any"); }}>Clear filters <ArrowUpRight size={15} /></button></div>}
      <div className="collection-note"><span className="note-mark">M.</span><p>Looking for something specific?<br /><span>Tell us what you have in mind and we will look with you.</span></p><a href="https://wa.me/918778903754?text=Hello%2C%20I%27m%20looking%20for%20land%20in%20Coimbatore." target="_blank" rel="noreferrer">Share your brief <ArrowUpRight size={15} /></a></div>
    </section>
    <section className="contact-band" id="contact"><div><span className="eyebrow">A CONVERSATION, NOT A SALES PITCH</span><h2>Let&apos;s walk<br />the land together.</h2><p>Ask about a listing, arrange a site visit, or just talk through your plans.</p></div><div className="contact-actions"><a className="contact-primary" href="https://wa.me/918778903754" target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp Nishanth <ArrowUpRight size={15} /></a><a href="tel:+918778903754">+91 87789 03754 <ArrowUpRight size={14} /></a><a href="mailto:muruganrealestate21@gmail.com">muruganrealestate21@gmail.com</a><a href="https://www.instagram.com/murugan_real.estate_cbe/" target="_blank" rel="noreferrer">@murugan_real.estate_cbe</a></div><div className="contact-orbit" aria-hidden="true"><span>COIMBATORE</span><span>11.0168° N<br />76.9558° E</span></div></section>
    <footer className="site-footer"><div className="footer-top"><Logo /><p>Good land. Honest guidance.<br /><span>Rooted in Coimbatore.</span></p><div className="footer-channels"><a href="https://wa.me/918778903754" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={17} /></a><a href="https://www.instagram.com/murugan_real.estate_cbe/" target="_blank" rel="noreferrer" aria-label="Instagram"><AtSign size={17} /></a><a href="mailto:muruganrealestate21@gmail.com" aria-label="Email"><Mail size={17} /></a></div></div><div className="footer-bottom"><span>© 2026 Murugan Realestate</span><span>COIMBATORE · TAMIL NADU</span><Link href="/admin">Admin access <ArrowUpRight size={12} /></Link></div></footer>
    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title"><button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close enquiry"><X size={18} /></button><span className="eyebrow-dark">PROPERTY ENQUIRY</span><h2 id="enquiry-title">A good place<br />to <em>start.</em></h2><p className="modal-property"><strong>{selected.title}</strong><span><MapPin size={13} /> {selected.location}</span></p><form onSubmit={enquire}><label>Your name<input autoFocus required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we address you?" /></label><label>Mobile number<input required inputMode="numeric" maxLength={14} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="98765 43210" /></label>{enquiryError && <p className="form-error">{enquiryError}</p>}<button className="whatsapp-submit" type="submit"><MessageCircle size={17} /> Continue to WhatsApp <ArrowUpRight size={15} /></button><small>Your details open in a WhatsApp message to Nishanth. Nothing is shared publicly.</small></form></section></div>}
  </main>;
}
