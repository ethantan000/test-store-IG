'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.contact.submit(form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <input
        type="text"
        placeholder="Full name"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="input-field"
      />
      <input
        type="email"
        placeholder="Email address"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="input-field"
      />
      <textarea
        placeholder="How can we help?"
        required
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="input-field min-h-[160px]"
      />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
