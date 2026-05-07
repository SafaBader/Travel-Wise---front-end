import { useState, useEffect, useCallback } from 'react';
import { api, normalizeUser } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

function normalizeReview(review) {
    const user = normalizeUser(review.userId || review.user || review.profile);
    const rawPlace = review.placeId || review.place || review.place_id;
    return {
        ...review,
        id: review.id || review._id,
        place_id: rawPlace?._id || rawPlace?.id || rawPlace,
        user_id: user?.id || review.userId?._id || review.userId,
        content: review.content || review.comment || '',
        comment: review.comment || review.content || '',
        profile: user,
        created_at: review.createdAt || review.created_at,
    };
}

export function useReviews(placeId) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewCount, setReviewCount] = useState(0);

    const fetchReviews = useCallback(async () => {
        if (!placeId) return;
        setLoading(true);
        try {
            const data = await api.get(`/reviews?placeId=${placeId}`);
            const all = (Array.isArray(data) ? data : []).map(normalizeReview).filter(r => r.place_id === placeId);
            setReviews(all);
            setReviewCount(all.length);
        } finally {
            setLoading(false);
        }
    }, [placeId]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const submitReview = async (rating, content) => {
        if (!user) return null;
        const data = await api.post('/reviews', { placeId, rating, comment: content });
        const created = normalizeReview(data.review || data);
        created.profile = user;
        created.user_id = user.id;
        setReviews(prev => [created, ...prev]);
        setReviewCount(data.reviewCount ?? (reviews.length + 1));
        return created;
    };

    const updateReview = async (reviewId, rating, content) => {
        if (!user) return null;
        const data = await api.put(`/reviews/${reviewId}`, { rating, comment: content });
        const updated = normalizeReview(data.review || data);
        setReviews(prev => prev.map(r => r.id === reviewId ? updated : r));
        return updated;
    };

    const deleteReview = async (reviewId) => {
        if (!user || !reviewId) return;
        const data = await api.delete(`/reviews/${reviewId}`);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setReviewCount(data.reviewCount ?? Math.max(0, reviews.length - 1));
    };

    return { reviews, userReview: null, reviewCount, loading, submitReview, updateReview, deleteReview, refetch: fetchReviews };
}
