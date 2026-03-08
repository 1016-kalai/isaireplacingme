'use client';
import { useState } from 'react';

const INDUSTRIES = [
    { value: '', label: 'Select your industry', disabled: true },
    { value: 'technology', label: 'Technology / IT' },
    { value: 'finance', label: 'Finance / Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'ecommerce', label: 'E-Commerce / Retail' },
    { value: 'media', label: 'Media / Entertainment' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'legal', label: 'Legal' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'government', label: 'Government' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'telecom', label: 'Telecom' },
    { value: 'pharma', label: 'Pharma' },
    { value: 'hospitality', label: 'Hospitality / Travel' },
    { value: 'logistics', label: 'Logistics / Supply Chain' },
    { value: 'marketing_agency', label: 'Marketing / Advertising' },
    { value: 'other', label: 'Other' },
];

export default function FormScreen({ onSubmit, onBack }) {
    const [formData, setFormData] = useState({
        name: '', age: '', role: '', experience: '',
        industry: '', organisation: '', tasks: '',
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.role || !formData.industry || !formData.tasks) return;
        onSubmit(formData);
    };

    return (
        <section className="screen active" id="form-section">
            <div className="form-container">
                <div className="form-header">
                    <span className="form-skull">☠️</span>
                    <h2>Before We Dig Your Grave...</h2>
                    <p className="form-subtitle">We need some details. Don&apos;t worry, this will be used <em>against</em> you.</p>
                </div>
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-grid">
                        <div className="form-group" data-index="0">
                            <label><span className="label-icon">🪦</span> What should we engrave on your tombstone?</label>
                            <input type="text" name="name" placeholder="Your name (while it still matters)" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group" data-index="1">
                            <label><span className="label-icon">⏳</span> How many years have you wasted?</label>
                            <input type="number" name="age" placeholder="Your age" min="16" max="80" value={formData.age} onChange={handleChange} required />
                        </div>
                        <div className="form-group" data-index="2">
                            <label><span className="label-icon">💼</span> Your current role (while it lasts)</label>
                            <input type="text" name="role" placeholder="e.g., Designer, Developer, Manager..." value={formData.role} onChange={handleChange} required />
                        </div>
                        <div className="form-group" data-index="3">
                            <label><span className="label-icon">📅</span> Years of experience (AI learned it in seconds)</label>
                            <input type="number" name="experience" placeholder="Years of experience" min="0" max="50" value={formData.experience} onChange={handleChange} required />
                        </div>
                        <div className="form-group" data-index="4">
                            <label><span className="label-icon">🏭</span> What industry are you doomed in?</label>
                            <select name="industry" value={formData.industry} onChange={handleChange} required>
                                {INDUSTRIES.map(ind => (
                                    <option key={ind.value} value={ind.value} disabled={ind.disabled}>{ind.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" data-index="5">
                            <label><span className="label-icon">🏢</span> Organisation (the one replacing you)</label>
                            <input type="text" name="organisation" placeholder="e.g., Infosys, TCS, Google..." value={formData.organisation} onChange={handleChange} required />
                        </div>
                        <div className="form-group full-width" data-index="6">
                            <label><span className="label-icon">📋</span> What do you actually do all day? (AI wants to know)</label>
                            <textarea name="tasks" placeholder="List your daily tasks... e.g., Writing code, Making designs, Analyzing data..." rows="3" value={formData.tasks} onChange={handleChange} required />
                        </div>
                    </div>
                    <button type="submit" className="cta-btn submit-cta"><span className="btn-text">⚡ Find My Termination Date</span><div className="btn-glow" /></button>
                </form>
                <button className="back-btn" onClick={onBack}>← Back to safety</button>
            </div>
        </section>
    );
}
