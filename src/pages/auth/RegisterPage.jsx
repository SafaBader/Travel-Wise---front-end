import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Compass, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        const { error } = await signUp(form.email, form.password, form.name);
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard');
        }
    };

    const perks = [
        'Save unlimited favorite destinations',
        'Plan multi-day itineraries',
        'Track your trips & travel history',
        'Write and read destination reviews',
    ];

    return (
        <section className="min-h-screen flex bg-white dark:bg-neutral-950">
            <section className="hidden lg:flex lg:w-1/2 relative">
                <img
                    src="https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg"
                    alt="Bali temple"
                    className="w-full h-full object-cover"
                />
                <section className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <section className="absolute bottom-12 left-12 text-white">
                    <h2 className="font-display text-4xl font-bold mb-4">Start your adventure</h2>
                    <ul className="space-y-2.5">
                        {perks.map(p => (
                            <li key={p} className="flex items-center gap-2.5 text-white/90">
                                <CheckCircle className="w-5 h-5 text-secondary-400 shrink-0" />
                                {p}
                            </li>
                        ))}
                    </ul>
                </section>
            </section>

            <section className="flex-1 flex items-center justify-center p-8">
                <section className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2.5 mb-10">
                        <section className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                            <Compass className="w-5 h-5 text-white" />
                        </section>
                        <span className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100">
                            Travel<span className="text-primary-600">Wise</span>
                        </span>
                    </Link>

                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Create account</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8">Join thousands of travelers worldwide</p>

                    {error && (
                        <section className="flex items-center gap-2.5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6 text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </section>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <section>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="input"
                                placeholder="Jane Doe"
                            />
                        </section>
                        <section>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="input"
                                placeholder="you@example.com"
                            />
                        </section>
                        <section>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Password</label>
                            <section className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    className="input pr-12"
                                    placeholder="Min 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </section>
                        </section>
                        <section>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={form.confirm}
                                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                                className="input"
                                placeholder="••••••••"
                            />
                        </section>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </section>
            </section>
        </section>
    );
}
