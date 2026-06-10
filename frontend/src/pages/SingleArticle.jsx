import React, { useState, useEffect, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Share2, Bookmark, Pencil, Trash2 } from 'lucide-react';

export default function SingleArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [latestNews, setLatestNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    // New states for interaction
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({ name: '', text: '' });
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [myComments, setMyComments] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const commentsRef = useRef(null);
    const articleContentRef = useRef(null);

    // Effect to clean up any invisible trailing empty nodes (like <p><span><br></span></p>)
    // And to intercept clicks on injected related news links for SPA navigation
    useEffect(() => {
        if (articleContentRef.current) {
            let child = articleContentRef.current.lastElementChild;
            while (child) {
                const textContent = child.textContent || '';
                const hasMedia = child.querySelector('img, iframe, video, audio');
                if (textContent.trim() === '' && !hasMedia) {
                    const prev = child.previousElementSibling;
                    child.remove();
                    child = prev;
                } else {
                    break;
                }
            }

            const handleLinkClick = (e) => {
                const anchor = e.target.closest('a');
                if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href').startsWith('/news/')) {
                    e.preventDefault();
                    navigate(anchor.getAttribute('href'));
                }
            };
            articleContentRef.current.addEventListener('click', handleLinkClick);

            // Related News Carousel functionality
            const leftBtn = articleContentRef.current.querySelector('.related-scroll-left');
            const rightBtn = articleContentRef.current.querySelector('.related-scroll-right');
            const scrollCont = articleContentRef.current.querySelector('.related-scroll-container');
            
            if (leftBtn && rightBtn && scrollCont) {
                // Hide scrollbar
                scrollCont.style.cssText = "scrollbar-width: none; -ms-overflow-style: none;";
                const style = document.createElement('style');
                style.innerHTML = ".related-scroll-container::-webkit-scrollbar { display: none; }";
                articleContentRef.current.appendChild(style);

                const scrollAmount = window.innerWidth < 640 ? 280 : 320;

                const onLeftClick = () => scrollCont.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                const onRightClick = () => scrollCont.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                
                leftBtn.addEventListener('click', onLeftClick);
                rightBtn.addEventListener('click', onRightClick);
                
                const updateArrows = () => {
                    leftBtn.style.opacity = scrollCont.scrollLeft > 5 ? "1" : "0";
                    leftBtn.style.pointerEvents = scrollCont.scrollLeft > 5 ? "auto" : "none";
                    
                    const maxScroll = scrollCont.scrollWidth - scrollCont.clientWidth;
                    rightBtn.style.opacity = scrollCont.scrollLeft >= maxScroll - 5 ? "0" : "1";
                    rightBtn.style.pointerEvents = scrollCont.scrollLeft >= maxScroll - 5 ? "none" : "auto";
                };
                scrollCont.addEventListener('scroll', updateArrows);
                // initial call after a short delay to ensure rendering
                setTimeout(updateArrows, 100);

                return () => {
                    if (articleContentRef.current) {
                        articleContentRef.current.removeEventListener('click', handleLinkClick);
                    }
                    leftBtn.removeEventListener('click', onLeftClick);
                    rightBtn.removeEventListener('click', onRightClick);
                    scrollCont.removeEventListener('scroll', updateArrows);
                };
            }

            return () => {
                if (articleContentRef.current) {
                    articleContentRef.current.removeEventListener('click', handleLinkClick);
                }
            };
        }
    });

    useEffect(() => {
        // Fetch article and latest news
        const fetchData = async () => {
            try {
                // Fetch specific article
                const articleRes = await fetch(`${__API_URL__}/api/news/article/${id}`);
                const articleData = await articleRes.json();

                if (articleData.redirect) {
                    navigate(`/news/${articleData.newSlug}`, { replace: true });
                    return;
                }

                // Fetch latest news for sidebar
                const newsRes = await fetch(`${__API_URL__}/api/news`);
                const newsData = await newsRes.json();

                // Optimize Cloudinary images
                const optimizeCloudinaryUrl = (url) => {
                    if (!url || typeof url !== 'string') return url;
                    if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/q_auto')) {
                        return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
                    }
                    return url;
                };

                articleData.image = optimizeCloudinaryUrl(articleData.image);
                let optimizedNewsData = newsData.map(n => ({ ...n, image: optimizeCloudinaryUrl(n.image) }));

                setArticle(articleData);
                setLikes(articleData.likes || 0);

                // Check if user already liked
                const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
                if (likedArticles.includes(articleData._id)) {
                    setHasLiked(true);
                } else {
                    setHasLiked(false);
                }

                const mySavedComments = JSON.parse(localStorage.getItem('myComments') || '[]');
                setMyComments(mySavedComments);

                const adminToken = localStorage.getItem('adminToken');
                if (adminToken) {
                    setIsAdmin(true);
                }

                // Filter out the current article from sidebar
                setLatestNews(optimizedNewsData.filter(n => n._id !== articleData._id).slice(0, 8));

                // Fetch comments
                const commentsRes = await fetch(`${__API_URL__}/api/news/${articleData._id}/comments`);
                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    setComments(commentsData);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching article:", error);
                setLoading(false);
            }
        };
        fetchData();
        // Scroll to top when route changes
        window.scrollTo(0, 0);
        // Reset expanded state
        setIsExpanded(false);
    }, [id]);

    const handleLike = async () => {
        if (hasLiked || !article) return;

        // Optimistic UI
        setLikes(prev => prev + 1);
        setHasLiked(true);
        const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
        likedArticles.push(article._id);
        localStorage.setItem('likedArticles', JSON.stringify(likedArticles));

        try {
            const res = await fetch(`${__API_URL__}/api/news/${article._id}/like`, { method: 'PUT' });
            if (!res.ok) {
                // Revert if failed
                setLikes(prev => prev - 1);
                setHasLiked(false);
                const revertedLiked = likedArticles.filter(id => id !== article._id);
                localStorage.setItem('likedArticles', JSON.stringify(revertedLiked));
            }
        } catch (error) {
            console.error('Error liking article:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.name.trim() || !newComment.text.trim()) return;

        setIsSubmittingComment(true);
        try {
            const res = await fetch(`${__API_URL__}/api/news/${article._id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });
            if (res.ok) {
                const addedComment = await res.json();
                setComments([addedComment, ...comments]);
                setNewComment({ name: '', text: '' });

                // Save to myComments
                const updatedMyComments = [...myComments, addedComment._id];
                setMyComments(updatedMyComments);
                localStorage.setItem('myComments', JSON.stringify(updatedMyComments));
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleEditCommentSubmit = async (commentId) => {
        if (!editCommentText.trim()) return;
        try {
            const res = await fetch(`${__API_URL__}/api/news/${article._id}/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editCommentText })
            });
            if (res.ok) {
                const updatedComment = await res.json();
                setComments(comments.map(c => c._id === commentId ? updatedComment : c));
                setEditingCommentId(null);
                setEditCommentText('');
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await fetch(`${__API_URL__}/api/news/${article._id}/comments/${commentId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setComments(comments.filter(c => c._id !== commentId));
                const updatedMyComments = myComments.filter(id => id !== commentId);
                setMyComments(updatedMyComments);
                localStorage.setItem('myComments', JSON.stringify(updatedMyComments));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: article?.title || 'HBN24 News',
            text: article?.metaDescription || 'Read this news on HBN24',
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    };

    const handleBookmark = () => {
        alert("इस पेज को बुकमार्क करने के लिए कृपया अपने कीबोर्ड पर Ctrl+D (या Mac पर Cmd+D) दबाएं।");
    };

    const scrollToComments = () => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (article) {
            // Meta Title
            document.title = article.metaTitle || article.title || 'HBN24 News';

            // Meta Description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = article.metaDescription || '';

            // Meta Keywords
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = "keywords";
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.content = article.metaKeywords || '';

            // Robots Tag
            let metaRobots = document.querySelector('meta[name="robots"]');
            if (!metaRobots) {
                metaRobots = document.createElement('meta');
                metaRobots.name = "robots";
                document.head.appendChild(metaRobots);
            }
            metaRobots.content = article.robots || 'index, follow';

            // Canonical URL
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = "canonical";
                document.head.appendChild(canonicalLink);
            }
            // Clean Auto Canonical URL
            const cleanUrl = `${window.location.origin}/news/${article.slug || article._id}`;
            canonicalLink.href = article.canonicalUrl || cleanUrl;
        }
    }, [article]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#da0000]"></div></div>;
    }

    if (!article || article.message) {
        return <div className="text-center py-20 text-xl font-bold text-red-600">Article not found (URL me shayad error hai)</div>;
    }

    // Removed complex regex cleaner; relying on useEffect DOM cleaner for better accuracy
    let cleanContent = article.content || '';

    // Inject related news inside the article content as a horizontal widget
    if (latestNews.length > 0) {
        // Get up to 4 related articles
        const relatedArticlesToInject = latestNews.filter(n => n.category === article.category).slice(0, 4);
        if (relatedArticlesToInject.length < 4) {
            const moreNews = latestNews.filter(n => n.category !== article.category).slice(0, 4 - relatedArticlesToInject.length);
            relatedArticlesToInject.push(...moreNews);
        }

        if (relatedArticlesToInject.length > 0) {
            const paragraphs = cleanContent.split(/(<\/p>)/i);
            const totalParagraphs = paragraphs.filter(p => p.toLowerCase() === '</p>').length;
            // Inject after the 2nd paragraph (or 1st if very short) to make it appear higher
            const targetParagraph = totalParagraphs >= 3 ? 2 : 1;

            let injectedHTML = '';
            let pCount = 0;
            let widgetInjected = false;

            for (let i = 0; i < paragraphs.length; i++) {
                injectedHTML += paragraphs[i];
                if (paragraphs[i].toLowerCase() === '</p>') {
                    pCount++;
                    if (pCount === targetParagraph && !widgetInjected) {
                        
                        let articlesHtml = relatedArticlesToInject.map((related, index) => {
                            const linkUrl = `/news/${related.slug || related._id}`;
                            const isLast = index === relatedArticlesToInject.length - 1;
                            return `
                                <a href="${linkUrl}" class="flex-none w-[280px] sm:w-[320px] flex gap-3 snap-start border-r border-gray-200 pr-4 ${isLast ? 'border-r-0 pr-0' : ''}" style="text-decoration: none !important;">
                                    <div class="w-[120px] sm:w-[140px] h-[90px] sm:h-[100px] flex-shrink-0 overflow-hidden bg-gray-50 rounded">
                                        <img src="${related.image}" alt="News" class="w-full h-full object-contain" />
                                    </div>
                                    <div class="flex-1">
                                        <span class="font-bold hover:text-[#da0000] transition-colors block" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; color: #111827 !important; font-size: 15px !important; line-height: 1.3 !important;">
                                            ${related.title}
                                        </span>
                                    </div>
                                </a>
                            `;
                        }).join('');

                        injectedHTML += `
                            <div class="my-8 font-sans w-full clear-both relative z-10 mx-auto max-w-[100%] group">
                                <div class="border border-gray-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] relative">
                                    <div class="bg-[#002866] px-4 py-2 font-extrabold" style="color: #ffffff !important; font-size: 17px !important;">
                                        सम्बंधित ख़बरें
                                    </div>
                                    
                                    <button class="related-scroll-left absolute left-2 top-[55%] -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#a3a3a3] rounded-full flex items-center justify-center z-20 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[#888] transition-all opacity-0 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="m15 18-6-6 6-6" stroke="#ffffff" /></svg>
                                    </button>
                                    
                                    <button class="related-scroll-right absolute right-2 top-[55%] -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#a3a3a3] rounded-full flex items-center justify-center z-20 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[#888] transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><path d="m9 18 6-6-6-6" stroke="#ffffff" /></svg>
                                    </button>

                                    <div class="related-scroll-container flex overflow-x-auto gap-4 p-4 scroll-smooth snap-x relative items-center">
                                        ${articlesHtml}
                                    </div>
                                </div>
                            </div>
                        `;
                        widgetInjected = true;
                    }
                }
            }
            cleanContent = injectedHTML;
        }
    }

    const hasContent = cleanContent && cleanContent.trim() !== '';

    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 font-sans">

            {/* Left Column - Main Article */}
            <div className="w-full md:w-3/4 flex flex-col gap-5">
                <h1 className="text-3xl md:text-[38px] font-black text-[#111] leading-[1.3]">
                    {article.title}
                </h1>



                <div className="w-full flex flex-col group cursor-pointer">
                    <div className="w-full bg-gray-100 overflow-hidden">
                        <img src={article.image} alt={article.imageAlt || article.title} className="w-full h-auto max-h-[500px] object-contain transition-transform duration-500 group-hover:scale-110 group-hover:origin-center" />
                    </div>
                    <p className="text-sm text-gray-500 py-2 px-1 border-b border-gray-200">
                        {article.imageAlt || `${article.title} (Photo)`}
                    </p>
                </div>

                {/* Author & Share Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=da0000&color=fff" alt="Author" className="w-full h-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px] text-gray-900">एडमिन</span>
                            <span className="text-[13px] text-gray-500">
                                {new Date(article.createdAt || Date.now()).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}, (अपडेटेड {new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })})
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500">
                        <button onClick={handleLike} className={`flex items-center gap-1 hover:text-[#da0000] transition-colors ${hasLiked ? 'text-[#da0000]' : ''}`}>
                            <ThumbsUp size={18} className={hasLiked ? 'fill-current' : ''} />
                            <span className="text-xs">{likes > 0 ? likes : ''}</span>
                        </button>
                        <button onClick={scrollToComments} className="flex items-center gap-1 hover:text-[#da0000] transition-colors">
                            <MessageCircle size={18} />
                            <span className="text-xs">{comments.length > 0 ? comments.length : ''}</span>
                        </button>
                        <a href="https://www.facebook.com/HBNNews24" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors" title="Facebook">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <button onClick={handleShare} className="hover:text-[#da0000] transition-colors"><Share2 size={18} /></button>
                        <button onClick={handleBookmark} className="flex items-center hover:text-[#da0000] transition-colors" title="Bookmark">
                            <Bookmark size={18} />
                        </button>
                    </div>
                </div>

                {/* Article Body */}
                {hasContent && (
                    <div className="relative">
                        <div
                            ref={articleContentRef}
                            className={`force-article-font overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-none' : 'max-h-[300px]'}`}
                            dangerouslySetInnerHTML={{ __html: cleanContent }}
                        />
                        {!isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        )}
                    </div>
                )}

                {/* Read More Button OR End Text */}
                {hasContent && (
                    !isExpanded ? (
                        <div className="flex justify-center mt-4 relative z-10">
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="bg-[#da0000] text-white px-8 py-2 rounded-full font-bold text-lg hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
                            >
                                और पढ़ें <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 mt-8 text-gray-500 font-bold text-lg">
                            <span>---- समाप्त ----</span>
                            <div className="w-2 h-2 bg-[#da0000]"></div>
                        </div>
                    )
                )}

                {/* Comments Section */}
                <div ref={commentsRef} className="mt-12 border-t border-gray-200 pt-8">
                    <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8 flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={newComment.name}
                            onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#da0000]"
                            required
                        />
                        <textarea
                            placeholder="Write your comment here..."
                            value={newComment.text}
                            onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#da0000]"
                            rows="4"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            disabled={isSubmittingComment}
                            className="self-start bg-[#da0000] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="flex flex-col gap-6">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">{comment.name}</span>
                                            {myComments.includes(comment._id) && (
                                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">You</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            {(isAdmin || myComments.includes(comment._id)) && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {myComments.includes(comment._id) && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingCommentId(comment._id);
                                                                setEditCommentText(comment.text);
                                                            }}
                                                            className="text-gray-400 hover:text-blue-600"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="text-gray-400 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {editingCommentId === comment._id ? (
                                        <div className="mt-2 flex flex-col gap-2">
                                            <textarea
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                                rows="3"
                                            ></textarea>
                                            <div className="flex gap-2 self-end">
                                                <button
                                                    onClick={() => { setEditingCommentId(null); setEditCommentText(''); }}
                                                    className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleEditCommentSubmit(comment._id)}
                                                    className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700">{comment.text}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Right Column - Sidebar */}
            <div className="w-full md:w-1/4">
                <div className="sticky top-6 flex flex-col">
                    <div className="flex items-center gap-2 border-b-[2px] border-gray-200 pb-2 mb-4">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-[#da0000] border-b-[6px] border-b-transparent transform rotate-45"></div>
                        <h2 className="text-xl font-bold">लेटेस्ट</h2>
                    </div>

                    <div className="flex flex-col gap-6">
                        {latestNews.map((news) => (
                            <Link to={`/news/${news.slug || news._id}`} key={news._id} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                                <div className="relative w-[110px] h-[75px] flex-shrink-0 overflow-hidden rounded-[4px]">
                                    <img
                                        src={news.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"}
                                        alt={news.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-bold text-[#222] leading-[1.35] group-hover:text-[#da0000] transition-colors line-clamp-3">
                                        {news.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
