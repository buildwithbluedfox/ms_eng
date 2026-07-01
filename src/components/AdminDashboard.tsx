"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import '../app/catalog/catalog.css';

interface AdminDashboardProps {
  initialCatalog: Product[];
  initialQuotes: any[];
  initialSearchLogs: any[];
}

export default function AdminDashboard({ initialCatalog, initialQuotes, initialSearchLogs }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [catalog, setCatalog] = useState(initialCatalog);
  const [catalogSearch, setCatalogSearch] = useState('');
  
  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'MINI CRANES',
    description: '',
    image: '',
    specs: [{ label: '', value: '' }],
    tag: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Analytics Logic
  const topSearches = useMemo(() => {
    const counts: Record<string, number> = {};
    initialSearchLogs.forEach(log => {
      const q = log.query.toLowerCase().trim();
      counts[q] = (counts[q] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count);
  }, [initialSearchLogs]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...newProduct,
        specs: newProduct.specs.filter(s => s.label && s.value), // Remove empty specs
        features: [{ title: "NEW PRODUCT", desc: "Added from Admin Panel", icon: "ri-star-line" }], // Default placeholder
        thumbnails: [newProduct.image],
        extendedSpecs: newProduct.specs.filter(s => s.label && s.value)
      };

      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setCatalog([...catalog, data.product]);
        setNewProduct({ title: '', category: 'MINI CRANES', description: '', image: '', specs: [{ label: '', value: '' }], tag: '' });
        alert('Product Added Successfully!');
        setActiveTab('catalog');
      } else {
        alert('Error adding product: ' + data.error);
      }
    } catch (err) {
      alert('Error adding product');
    }
    setIsSubmitting(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch('/api/catalog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      const data = await res.json();
      if (data.success) {
        setCatalog(catalog.filter((p: any) => p.id !== id));
      } else {
        alert('Error deleting product: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const filteredCatalog = catalog.filter((p: any) => 
    p.title.toLowerCase().includes(catalogSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2>MS Admin</h2>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
            <i className="ri-list-check"></i> Catalog Overview
          </button>
          <button className={`admin-nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
            <i className="ri-add-box-line"></i> Add Product
          </button>
          <button className={`admin-nav-item ${activeTab === 'quotes' ? 'active' : ''}`} onClick={() => setActiveTab('quotes')}>
            <i className="ri-message-3-line"></i> Quote Requests
            {initialQuotes.length > 0 && <span className="admin-badge">{initialQuotes.length}</span>}
          </button>
          <button className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <i className="ri-bar-chart-box-line"></i> Search Analytics
          </button>
          <div style={{ flex: 1 }}></div>
          <Link href="/" className="admin-nav-item" style={{ marginTop: 'auto' }}>
            <i className="ri-home-4-line"></i> Back to Website
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {activeTab === 'catalog' && (
          <div>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1>Catalog Overview</h1>
                <p>Manage your {catalog.length} active products.</p>
              </div>
              <div>
                <div style={{ position: 'relative' }}>
                  <i className="ri-search-line" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                  <input 
                    type="text" 
                    placeholder="Search catalog..." 
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    style={{ padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>
            <div className="admin-card admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCatalog.map((p: any) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td><img src={p.image} alt={p.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td><span className="admin-badge">{p.category}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link 
                            href={`/catalog/${p.id}`}
                            target="_blank"
                            style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '18px', padding: '4px', display: 'flex', alignItems: 'center' }}
                            title="View Product on Website"
                          >
                            <i className="ri-eye-line"></i>
                          </Link>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                            title="Delete Product"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div>
            <div className="admin-header">
              <h1>Add New Product</h1>
              <p>Publish new equipment directly to your catalog.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {/* Form Column */}
              <div className="admin-card" style={{ flex: '1 1 500px', maxWidth: '600px' }}>
                <form onSubmit={handleAddProduct}>
                  <div className="admin-form-group">
                    <label>Product Title</label>
                    <input type="text" required value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} placeholder="e.g. SAFARI SFPM 2000" />
                  </div>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      <option value="MINI CRANES">Mini Cranes</option>
                      <option value="CONCRETE MIXERS">Concrete Mixers</option>
                      <option value="MATERIAL HOISTS">Material Hoists</option>
                      <option value="REBAR EQUIPMENT">Rebar Equipment</option>
                      <option value="COMPACTION">Compaction</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Image URL</label>
                    <input type="text" required value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="/data/images/safari.webp" />
                  </div>
                  <div className="admin-form-group">
                    <label>Description</label>
                    <textarea required rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Brief product overview..."></textarea>
                  </div>
                  <div className="admin-form-group">
                    <label>Product Specifications</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {newProduct.specs.map((spec, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" value={spec.label} onChange={(e) => {
                            const newSpecs = [...newProduct.specs];
                            newSpecs[index].label = e.target.value;
                            setNewProduct({...newProduct, specs: newSpecs});
                          }} placeholder="Label (e.g. Capacity)" style={{ flex: 1 }} />
                          <input type="text" value={spec.value} onChange={(e) => {
                            const newSpecs = [...newProduct.specs];
                            newSpecs[index].value = e.target.value;
                            setNewProduct({...newProduct, specs: newSpecs});
                          }} placeholder="Value (e.g. 2000L)" style={{ flex: 1 }} />
                          <button type="button" onClick={() => {
                            if (newProduct.specs.length > 1) {
                              const newSpecs = newProduct.specs.filter((_, i) => i !== index);
                              setNewProduct({...newProduct, specs: newSpecs});
                            }
                          }} style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setNewProduct({...newProduct, specs: [...newProduct.specs, { label: '', value: '' }]})} style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
                        + Add Specification
                      </button>
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Product Tag (Optional)</label>
                    <input type="text" value={newProduct.tag} onChange={e => setNewProduct({...newProduct, tag: e.target.value})} placeholder="e.g. AUTHORIZED SAFARI PARTNER" />
                  </div>
                  <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing...' : 'Publish Product'}
                  </button>
                </form>
              </div>

              {/* Preview Column */}
              <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                <h3 style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>Live Preview</h3>
                <div className="product-card" style={{ margin: '0', pointerEvents: 'none', position: 'relative' }}>
                  {newProduct.tag && <div className="product-badge" style={{ position: 'absolute', top: '10px', left: '10px', background: '#3b82f6', color: '#fff', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', zIndex: 10 }}>{newProduct.tag}</div>}
                  <div className="product-image-container">
                    <img 
                      src={newProduct.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                      alt={newProduct.title || 'Preview'} 
                      className="product-image"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL' }}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-category">{newProduct.category || 'Category'}</div>
                    <h3 className="product-title" style={{ marginBottom: '8px' }}>{newProduct.title || 'Product Title'}</h3>
                    
                    {newProduct.description && (
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                        {newProduct.description}
                      </div>
                    )}
                    
                    <div className="btn-view-details" style={{ textDecoration: 'none' }}>
                      View Details <i className="ri-arrow-right-line"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div>
            <div className="admin-header">
              <h1>Quote Requests</h1>
              <p>View all customer inquiries submitted through the website.</p>
            </div>
            <div className="admin-card admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Product Context</th>
                    <th>Qty</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {[...initialQuotes].reverse().map((q: any) => (
                    <tr key={q.id}>
                      <td>{new Date(q.timestamp).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>{q.name}</td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{q.email}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{q.phone}</div>
                      </td>
                      <td><span className="admin-badge">{q.context}</span></td>
                      <td>{q.quantity || '-'}</td>
                      <td style={{ fontSize: '12px', color: '#94a3b8' }}>#{q.id}</td>
                    </tr>
                  ))}
                  {initialQuotes.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No quote requests yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="admin-header">
              <h1>Search Analytics</h1>
              <p>Discover exactly what your customers are looking for.</p>
            </div>

            <div className="analytics-grid" style={{ marginBottom: '32px' }}>
              <div className="analytics-card">
                <span className="analytics-card-title">Total Searches</span>
                <span className="analytics-card-value">{initialSearchLogs.length}</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-card-title">Unique Terms</span>
                <span className="analytics-card-value">{topSearches.length}</span>
              </div>
            </div>

            <div className="admin-card admin-table-container" style={{ maxWidth: '600px' }}>
              <h3>Top Searched Words</h3>
              <table className="admin-table" style={{ marginTop: '16px' }}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Search Query</th>
                    <th>Searches</th>
                  </tr>
                </thead>
                <tbody>
                  {topSearches.map((item, index) => (
                    <tr key={index}>
                      <td>#{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>&quot;{item.query}&quot;</td>
                      <td><span className="admin-badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>{item.count}</span></td>
                    </tr>
                  ))}
                  {topSearches.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>No searches recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
