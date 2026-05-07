import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',

  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (error) setError(error.message);
    else setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10">
      <section className="page-container max-w-2xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Profile Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">Update your personal information</p>

        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-sm">
          {success && (
            <section className="flex items-center gap-2.5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mb-6 text-green-700 dark:text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Profile updated successfully!
            </section>
          )}
          {error && (
            <section className="flex items-center gap-2.5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </section>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <section>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                className="input"
                placeholder="Your full name"
              />
            </section>
            <section>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="input resize-none"
                placeholder="Tell us about yourself..."
              />
            </section>
            <section>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input opacity-60 cursor-not-allowed"
                disabled
              />
            </section>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>
      </section>
    </section>
  );
}
