import React, { useEffect, useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const ContactUs = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Contact Us | HBN News 24';
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(__API_URL__ + '/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to send message.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[1270px] mx-auto px-4 py-10">
            <h1 className="text-3xl md:text-4xl font-black mb-6 text-gray-900 border-b pb-4">Contact Us (संपर्क करें)</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                    <p className="text-gray-700 mb-8 leading-relaxed">
                        We value your feedback, news tips, and inquiries. Please feel free to reach out to the HBN News 24 team using the contact information below.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <FaEnvelope size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Email Address</h3>
                                <p className="text-gray-600 mt-1">hbnnews24live@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <FaMapMarkerAlt size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Office Location</h3>
                                <p className="text-gray-600 mt-1">HBN News 24 Network<br/>SCO 19, Sector 11<br/>Panchkula, Haryana 134109</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
                    
                    {status.message && (
                        <div className={`mb-6 p-4 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {status.message}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea rows="4" name="message" value={formData.message} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" required></textarea>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
