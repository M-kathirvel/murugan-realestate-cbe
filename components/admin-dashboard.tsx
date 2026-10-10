"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Check, CirclePlus, DoorOpen, ImagePlus, LandPlot, LockKeyhole, MapPin, Pencil, Search, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import type { Property, PropertyCategory, PropertyInput } from "@/lib/types";

const emptyProperty: PropertyInput = { title: "", location: "", area: 1800, price: 3000000, priceLabel: "₹30 L", category: "Residential Plot", description: "", highlights: [], image: "", featured: false };

function messageFrom(data: { error?: string } | null, fallback: string) {
  return data?.error || fallback;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PropertyInput>(emptyProperty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" }).then((response) => response.json()).then((data: { authenticated: boolean }) => { if (active) setAuthenticated(data.authenticated); }).catch(() => { if (active) setLoginError("Could not check your session. Refresh and try again."); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    fetch("/api/properties", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error();
      setProperties(await response.json() as Property[]);
    }).catch(() => setNotice("Could not load listings. Refresh the page to try again.")).finally(() => setLoading(false));
  }, [authenticated]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(messageFrom(data, "Unable to sign in."));
      setPassword("");
      setAuthenticated(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setProperties([]);
    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyProperty);
    setImageFile(null);
    setFormError("");
  }

  function setField<K extends keyof PropertyInput>(key: K, value: PropertyInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editProperty(property: Property) {
    setEditingId(property.id);
    setForm({ title: property.title, location: property.location, area: property.area, price: property.price, priceLabel: property.priceLabel, category: property.category, description: property.description, highlights: property.highlights, image: property.image, featured: property.featured });
    setImageFile(null);
    setFormError("");
    document.getElementById("listing-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      let image = form.image;
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.set("file", imageFile);
        const response = await fetch("/api/admin/upload", { method: "POST", body: uploadData });
        const uploaded = await response.json() as { image?: string; error?: string };
        if (!response.ok || !uploaded.image) throw new Error(messageFrom(uploaded, "Photo upload failed."));
        image = uploaded.image;
      }
      const response = await fetch(editingId ? `/api/properties/${editingId}` : "/api/properties", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, image }) });
      const result = await response.json() as Property | { error?: string };
      if (!response.ok || !("id" in result)) throw new Error(("error" in result && result.error) || "Could not save this listing.");
      setProperties((current) => editingId ? current.map((item) => item.id === result.id ? result : item) : [result, ...current]);
      setNotice(editingId ? "Property details updated." : "New property published.");
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not save this listing.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProperty(property: Property) {
    if (!window.confirm(`Remove “${property.title}” from the public listings?`)) return;
    const response = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
    if (!response.ok) {
      setNotice("Could not remove this property. Please try again.");
      return;
    }
    setProperties((current) => current.filter((item) => item.id !== property.id));
    if (editingId === property.id) resetForm();
    setNotice("Property removed from the public collection.");
  }

  function updatePrice(price: number) {
    const formatted = price >= 10000000 ? `₹${(price / 10000000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} Cr` : `₹${(price / 100000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} L`;
    setForm((current) => ({ ...current, price, priceLabel: formatted }));
  }

  if (checking) return <main className="admin-loading"><span className="loading-ring" /> Checking secure session</main>;

  if (!authenticated) return <main className="admin-login-shell"><div className="login-photo" /><div className="login-shade" /><div className="login-content"><Link href="/" className="back-home"><ArrowLeft size={15} /> Public website</Link><div className="login-card"><div className="login-brand"><span><LandPlot size={20} /></span><div>MURUGAN <small>REALESTATE</small></div></div><span className="eyebrow-dark">PRIVATE ADMIN PORTAL</span><h1>Good to have<br /><em>you back.</em></h1><p className="login-description">Sign in to manage the Coimbatore property collection.</p><form onSubmit={signIn}><label>Username<input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Admin username" /></label><label>Password<input autoComplete="current-password" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></label>{loginError && <p className="form-error" role="alert">{loginError}</p>}<button className="login-submit" type="submit" disabled={loginBusy}>{loginBusy ? "Checking…" : <><LockKeyhole size={16} /> Secure sign in <ArrowUpRight size={15} /></>}</button></form><div className="login-foot"><ShieldCheck size={14} /> Protected admin access <span>·</span> Public listings are read-only</div></div><p className="login-caption">MURUGAN REALESTATE <span>·</span> COIMBATORE, TAMIL NADU</p></div></main>;

  const filtered = properties.filter((property) => `${property.title} ${property.location}`.toLowerCase().includes(filter.toLowerCase()));

  return <main className="admin-shell"><aside className="admin-sidebar"><Link href="/" className="admin-brand"><span><LandPlot size={19} /></span><div>MURUGAN<small>REALESTATE</small></div></Link><span className="sidebar-label">WORKSPACE</span><a className="sidebar-link active" href="#listings"><LandPlot size={16} /> Property listings</a><a className="sidebar-link" href="#listing-form"><CirclePlus size={16} /> Add a property</a><div className="sidebar-bottom"><span className="sidebar-label">PUBLIC PORTAL</span><Link className="sidebar-link" href="/"><ArrowUpRight size={16} /> View website</Link><button className="sidebar-link" type="button" onClick={() => void signOut()}><DoorOpen size={16} /> Sign out</button><div className="admin-identity"><span className="identity-avatar">N</span><div><strong>Nishanth</strong><small>Administrator</small></div><ShieldCheck size={15} /></div></div></aside>
    <section className="admin-main"><header className="admin-topbar"><div><span className="eyebrow-dark">PROPERTY OPERATIONS</span><h1>Good morning, Nishanth<span>.</span></h1></div><div className="admin-top-actions"><span className="secure-pill"><span /> SECURE SESSION</span><Link href="/" className="public-view">View public site <ArrowUpRight size={14} /></Link></div></header>
      <div className="admin-stats"><div><span>LIVE LISTINGS</span><strong>{properties.length.toString().padStart(2, "0")}</strong><small>Visible on public website</small></div><div><span>FEATURED</span><strong>{properties.filter((item) => item.featured).length.toString().padStart(2, "0")}</strong><small>Highlighted in the collection</small></div><div><span>LAND CATEGORIES</span><strong>03</strong><small>Plots, farm & commercial</small></div></div>
      <section className="admin-listings" id="listings"><div className="admin-section-heading"><div><span className="eyebrow-dark">YOUR PUBLIC COLLECTION</span><h2>Property listings</h2></div><a href="#listing-form" className="add-listing-button"><CirclePlus size={16} /> Add property</a></div>{notice && <div className="admin-notice"><Check size={15} /> {notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={14} /></button></div>}<div className="listing-table-tools"><label><Search size={15} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Find a listing" /></label><span>{loading ? "Loading…" : `${filtered.length} listings`}</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PROPERTY</th><th>CATEGORY</th><th>AREA</th><th>PRICE</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((property) => <tr key={property.id}><td><div className="table-property"><div className="table-thumb" style={{ backgroundImage: `url("${property.image}")` }} /><div><strong>{property.title}</strong><span><MapPin size={12} /> {property.location}</span></div></div></td><td><span className="table-category">{property.category}</span></td><td>{property.area.toLocaleString("en-IN")} sq.ft.</td><td className="table-price">{property.priceLabel}</td><td><span className={`status-pill ${property.featured ? "featured" : ""}`}><span /> {property.featured ? "Featured" : "Live"}</span></td><td><div className="table-actions"><button type="button" title="Edit listing" aria-label={`Edit ${property.title}`} onClick={() => editProperty(property)}><Pencil size={15} /></button><button type="button" title="Delete listing" aria-label={`Delete ${property.title}`} onClick={() => void removeProperty(property)}><Trash2 size={15} /></button></div></td></tr>)}{!filtered.length && <tr><td className="table-empty" colSpan={6}>{loading ? "Loading properties…" : "No properties found. Add a property to publish your first listing."}</td></tr>}</tbody></table></div></section>
      <section className="admin-form-section" id="listing-form"><div className="admin-section-heading"><div><span className="eyebrow-dark">{editingId ? "MAKE AN UPDATE" : "GROW THE COLLECTION"}</span><h2>{editingId ? "Edit property" : "Add a property"}</h2></div>{editingId && <button className="cancel-edit" type="button" onClick={resetForm}><X size={14} /> Cancel edit</button>}</div><form className="property-editor" onSubmit={saveProperty}><div className="editor-grid"><label>Listing title<input required minLength={5} maxLength={120} value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder="A considered title for this property" /></label><label>Location<input required minLength={3} maxLength={120} value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder="Neighbourhood, Coimbatore" /></label><label>Land category<select value={form.category} onChange={(event) => setField("category", event.target.value as PropertyCategory)}><option>Residential Plot</option><option>Farm Land</option><option>Commercial Land</option></select></label><label>Area in square feet<input required type="number" min="1" value={form.area} onChange={(event) => setField("area", Number(event.target.value))} /></label><label>Asking price (₹)<input required type="number" min="1" value={form.price} onChange={(event) => updatePrice(Number(event.target.value))} /><small>Shown publicly as {form.priceLabel}</small></label><label>Price display<input required maxLength={30} value={form.priceLabel} onChange={(event) => setField("priceLabel", event.target.value)} placeholder="₹30 L" /></label><label className="editor-wide">Description<textarea required minLength={20} maxLength={1200} rows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="Describe the setting, access, and what makes the land worth a visit." /></label><label className="editor-wide">Highlights <span className="label-aside">Separate each with a comma</span><input value={form.highlights.join(", ")} onChange={(event) => setField("highlights", event.target.value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8))} placeholder="DTCP approved, Clear title, 30 ft. road" /></label><label className="editor-wide">Photo URL <span className="label-aside">Or upload a JPG, PNG, or WebP (up to 5 MB)</span><input value={imageFile ? imageFile.name : form.image} onChange={(event) => { setField("image", event.target.value); setImageFile(null); }} placeholder="https://…" /></label><label className="upload-control editor-wide"><ImagePlus size={17} /><span>{imageFile ? imageFile.name : "Choose a property photo"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event: ChangeEvent<HTMLInputElement>) => setImageFile(event.target.files?.[0] ?? null)} /><Upload size={15} /></label></div><label className="featured-toggle"><input type="checkbox" checked={form.featured} onChange={(event) => setField("featured", event.target.checked)} /><span className="toggle-track"><span /></span><span><strong>Feature this property</strong><small>Show it near the top of the public collection</small></span><BadgeCheck size={17} /></label>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="editor-footer"><span><ShieldCheck size={14} /> Only you can publish or change listings</span><button className="publish-button" type="submit" disabled={saving}>{saving ? "Saving…" : <>{editingId ? <Check size={16} /> : <CirclePlus size={16} />} {editingId ? "Save changes" : "Publish listing"} <ArrowUpRight size={15} /></>}</button></div></form></section>
      <footer className="admin-footer"><span>Murugan Realestate · Coimbatore</span><span>ADMIN WORKSPACE <span className="footer-dot">·</span> PRIVATE</span></footer>
    </section></main>;
}
