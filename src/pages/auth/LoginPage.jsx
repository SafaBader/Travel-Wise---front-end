import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Compass, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/dashboard';

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await signIn(form.email, form.password);
        setLoading(false);
        if (error) {
            setError(error.message.includes('Invalid') ? 'Invalid email or password.' : error.message);
        } else {
            navigate(from, { replace: true });
        }
    };

    return (
        <section className="min-h-screen flex bg-white dark:bg-neutral-950">
            <section className="hidden lg:flex lg:w-1/2 relative">
                <img
                    src="https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg"
                    alt="Santorini"
                    className="w-full h-full object-cover"
                />
                <section className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <section className="absolute bottom-12 left-12 text-white">
                    <h2 className="font-display text-4xl font-bold mb-3">The world is waiting.</h2>
                    <p className="text-white/80 text-lg">Plan your perfect journey today.</p>
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

                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Welcome back</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8">Sign in to continue your journey</p>

                    {error && (
                        <section className="flex items-center gap-2.5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6 text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </section>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                >
                                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </section>
                        </section>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            Create one free
                        </Link>
                    </p>
                </section>
            </section>
        </section>
    );
}
