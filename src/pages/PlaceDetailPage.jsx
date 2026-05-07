import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Heart, MapPin, Clock, Star, Calendar, Tag,
    ChevronLeft, Plus, Share2, Globe
} from 'lucide-react';
import { usePlace } from '../hooks/usePlaces';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import StarRating from '../components/ui/StarRating';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { format } from '../utils/date';

export default function PlaceDetailPage() {
    const { id } = useParams();
    const { place, loading } = usePlace(id);
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { reviews, reviewCount, submitReview, updateReview, deleteReview } = useReviews(id);
    const [activeImg, setActiveImg] = useState(0);
    const [reviewModal, setReviewModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' });
    const [submitting, setSubmitting] = useState(false);

    if (loading) return (
        <section className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
            <LoadingSpinner size="lg" />
        </section>
    );
    if (!place) return (
        <section className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
            <p className="text-neutral-500 dark:text-neutral-400">Destination not found.</p>
        </section>
    );

    const handleReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        if (editingReview) await updateReview(editingReview.id, reviewForm.rating, reviewForm.content);
        else await submitReview(reviewForm.rating, reviewForm.content);
        setSubmitting(false);
        setReviewModal(false);
        setEditingReview(null);
        setReviewForm({ rating: 5, content: '' });
    };

    const fav = isFavorite(place.id);

    return (
        <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Image hero */}
            <section className="relative h-[50vh] md:h-[60vh] bg-neutral-900 overflow-hidden">
                <img
                    src={place.images[activeImg] || place.images[0]}
                    alt={place.name}
                    className="w-full h-full object-cover transition-all duration-500"
                />
                <section className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/20" />

                <section className="absolute top-4 left-4">
                    <Link to="/explore" className="flex items-center gap-1.5 px-3 py-2 bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-900 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 transition-all shadow-sm">
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </Link>
                </section>

                <section className="absolute top-4 right-4 flex gap-2">
                    <button className="w-10 h-10 bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-900 rounded-xl flex items-center justify-center shadow-sm transition-all">
                        <Share2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    </button>
                    {user && (
                        <button
                            onClick={() => toggleFavorite(place.id)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${fav ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-300'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
                        </button>
                    )}
                </section>

                {place.images.length > 1 && (
                    <section className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                        {place.images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImg(i)}
                                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-white scale-105' : 'border-white/40 opacity-60'
                                    }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </section>
                )}

                <section className="absolute bottom-6 left-6 text-white">
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{place.name}</h1>
                    <section className="flex items-center gap-4 flex-wrap">
                        <section className="flex items-center gap-1.5 text-white/80">
                            <MapPin className="w-4 h-4" />
                            <span>{place.location}, {place.country}</span>
                        </section>
                        {place.category && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-sm rounded-full border border-white/30 font-medium">
                                {place.category.name}
                            </span>
                        )}
                    </section>
                </section>
            </section>

            <section className="page-container py-10">
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <section className="lg:col-span-2 space-y-6">
                        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-sm">
                            <section className="flex items-center gap-3 mb-4">
                                <StarRating rating={place.rating} />
                                <span className="font-bold text-neutral-900 dark:text-neutral-100">{Number(place.rating).toFixed(1)}</span>
                                <span className="text-neutral-500 dark:text-neutral-400 text-sm">({reviewCount ?? place.review_count} reviews)</span>
                            </section>
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{place.description}</p>

                            {place.tags && place.tags.length > 0 && (
                                <section className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
                                    {place.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </section>
                            )}
                        </section>

                        {/* Reviews */}
                        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-sm">
                            <section className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Reviews</h2>
                                {user && (
                                    <button
                                        onClick={() => {
                                            setEditingReview(null);
                                            setReviewForm({ rating: 5, content: '' });
                                            setReviewModal(true);
                                        }}
                                        className="btn-primary text-sm flex items-center gap-1.5"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Write Review
                                    </button>
                                )}
                            </section>

                            {reviews.length === 0 ? (
                                <section className="text-center py-10">
                                    <Star className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" />
                                    <p className="text-neutral-500 dark:text-neutral-400">No reviews yet. Be the first to review!</p>
                                </section>
                            ) : (
                                <section className="space-y-5">
                                    {reviews.map(review => (
                                        <section key={review.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 pb-5 last:pb-0">
                                            <section className="flex items-start justify-between gap-3">
                                                <section className="flex items-center gap-3">
                                                    <section className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center font-semibold text-primary-700 dark:text-primary-400 text-sm shrink-0">
                                                        {(review.profile?.full_name || 'U')[0].toUpperCase()}
                                                    </section>
                                                    <section>
                                                        <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{review.profile?.full_name || 'Traveler'}</p>
                                                        <p className="text-xs text-neutral-400 dark:text-neutral-500">{format(review.created_at)}</p>
                                                    </section>
                                                </section>
                                                <section className="flex items-center gap-2 shrink-0">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    {user?.id === review.user_id && (
                                                        <>
                                                            <button onClick={() => { setEditingReview(review); setReviewForm({ rating: review.rating, content: review.content }); setReviewModal(true); }} className="text-xs text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Edit</button>
                                                            <button onClick={() => deleteReview(review.id)} className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">Delete</button>
                                                        </>
                                                    )}
                                                </section>
                                            </section>
                                            {review.content && (
                                                <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-3 ml-12 leading-relaxed">{review.content}</p>
                                            )}
                                        </section>
                                    ))}
                                </section>
                            )}
                        </section>
                    </section>

                    {/* Sidebar */}
                    <section className="space-y-4">
                        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm space-y-4">
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Trip Details</h3>
                            {[
                                { icon: MapPin, label: 'Location', value: `${place.location}, ${place.country}` },
                                { icon: Clock, label: 'Best Duration', value: place.estimated_duration || 'Flexible' },
                                { icon: Star, label: 'Rating', value: `${Number(place.rating).toFixed(1)} / 5 (${reviewCount ?? place.review_count} reviews)` },
                                { icon: Globe, label: 'Category', value: place.category?.name || 'General' },
                            ].map(({ icon: Icon, label, value }) => (
                                <section key={label} className="flex gap-3">
                                    <section className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                                        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </section>
                                    <section>
                                        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wide">{label}</p>
                                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{value}</p>
                                    </section>
                                </section>
                            ))}
                        </section>

                        {user ? (
                            <Link to="/trips" className="btn-primary w-full flex items-center justify-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Add to Trip
                            </Link>
                        ) : (
                            <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                                Sign in to plan trip
                            </Link>
                        )}

                        {user && (
                            <button
                                onClick={() => toggleFavorite(place.id)}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border ${fav
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
                                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : ''}`} />
                                {fav ? 'Saved to Favorites' : 'Save to Favorites'}
                            </button>
                        )}
                    </section>
                </section>
            </section>

            <Modal open={reviewModal} onClose={() => { setReviewModal(false); setEditingReview(null); }} title={editingReview ? 'Edit Review' : 'Write a Review'}>
                <form onSubmit={handleReview} className="space-y-4">
                    <section>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Your Rating</label>
                        <StarRating
                            rating={reviewForm.rating}
                            size="lg"
                            interactive
                            onChange={r => setReviewForm(p => ({ ...p, rating: r }))}
                        />
                    </section>
                    <section>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Your Review (optional)</label>
                        <textarea
                            value={reviewForm.content}
                            onChange={e => setReviewForm(p => ({ ...p, content: e.target.value }))}
                            rows={4}
                            className="input resize-none"
                            placeholder="Share your experience..."
                        />
                    </section>
                    <section className="flex gap-3">
                        <button type="button" onClick={() => setReviewModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1">
                            {submitting ? 'Saving...' : editingReview ? 'Save Review' : 'Submit Review'}
                        </button>
                    </section>
                </form>
            </Modal>
        </section>
    );
}
