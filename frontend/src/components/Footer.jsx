import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const footerLinks = [
        { name: 'होम', path: '/' },
        { name: 'मनोरंजन', path: '/entertainment' },
        { name: 'धर्म', path: '/religion' },
        { name: 'खेल', path: '/sports' },
        { name: 'लाइफस्टाइल', path: '/lifestyle' },
        { name: 'बिजनेस', path: '/business' },
        { name: 'टेक्नोलॉजी', path: '/technology' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Disclaimer', path: '/disclaimer' },
        { name: 'Editorial Policy', path: '/editorial-policy' },
        { name: 'Fact Check Policy', path: '/fact-check-policy' },
    ];

    return (
        <footer className="w-full bg-[#171717] border-t-[3px] border-[#937851] py-5">
            <div className="w-full max-w-[1270px] mx-auto px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {footerLinks.map((link, index) => (
                    <Link
                        key={index}
                        to={link.path}
                        className="text-[#4da6ff] text-[13px] hover:text-white transition-colors tracking-wide"
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
        </footer>
    );
};

export default Footer;
