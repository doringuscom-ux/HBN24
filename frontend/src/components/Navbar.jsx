import React, { useState } from "react";
import {
    Menu,
    ChevronDown,
    Search,
    Bell,
    Newspaper,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/HBN Thumbnail.png";

export default function AajTakNavbar() {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const navLinks = [
        { name: "होम", path: "/" },
        { name: "ई-पेपर", path: "/epaper" },
        { name: "मनोरंजन", path: "/entertainment" },
        { name: "धर्म", path: "/religion" },
        { name: "खेल", path: "/sports" },
        { name: "लाइफस्टाइल", path: "/lifestyle" },
        { name: "बिजनेस", path: "/business" },
        { name: "टेक्नोलॉजी", path: "/technology" },
    ];

    return (
        <div className="w-full mt-4 bg-gradient-to-r from-[#02132b] via-[#052b63] to-[#02132b] h-[60px] flex justify-center sticky top-4 z-50 font-sans shadow-lg shadow-[#052b63]/30 border-b border-white/10 backdrop-blur-md">
            <div className="w-full max-w-[1280px] px-4 flex items-center h-full">

                {/* Mobile Menu */}
                <button
                    onClick={() => setOpen(!open)}
                    className="text-white mr-4 xl:hidden hover:text-[#ff3b22] hover:scale-110 transition-all duration-300"
                >
                    <Menu size={28} />
                </button>

                {/* Logo */}
                <div className="flex items-center justify-center flex-shrink-0 mr-8 group cursor-pointer h-full z-50">
                    <img
                        src={logo}
                        alt="HBN 24"
                        className="h-full w-auto object-contain rounded-[4px] scale-[1.6] group-hover:scale-[1.7] transition-transform duration-300 transform-gpu"
                        style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                    />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden xl:flex items-center h-full flex-1">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center text-[15px] font-bold px-4 h-full transition-all duration-300 hover:bg-white/5 hover:text-[#ff3b22] relative group ${isActive
                                    ? "text-white"
                                    : "text-gray-200"
                                    }`}
                            >
                                {/* Animated Bottom Border */}
                                <div className={`absolute bottom-0 left-0 w-full h-[4px] bg-[#ff3b22] transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                                {link.name}
                                {link.hasDropdown && (
                                    <ChevronDown size={14} className="ml-1" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Right Side Icons */}
                <div className="flex items-center gap-6 text-white ml-auto">

                    <button className="hidden md:flex hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                        <Newspaper size={22} />
                    </button>

                    {/* X */}
                    <button className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </button>

                    {/* YouTube */}
                    <button className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M2.5 7.1c.3-1.5 1.5-2.6 3-2.9C8.9 3.8 12 3.8 12 3.8s3.1 0 6.5.4c1.5.3 2.7 1.4 3 2.9.5 2.1.5 4.9.5 4.9s0 2.8-.5 4.9c-.3 1.5-1.5 2.6-3 2.9-3.4.4-6.5.4-6.5.4s-3.1 0-6.5-.4c-1.5-.3-2.7-1.4-3-2.9-.5-2.1-.5-4.9-.5-4.9s0-2.8.5-4.9z" />
                            <path d="m10 15 5-3-5-3z" />
                        </svg>
                    </button>

                    {/* Notification */}
                    <button className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                        <Bell size={22} />
                    </button>

                    {/* Search */}
                    <button className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300 bg-white/10 p-2 rounded-full hover:bg-white/20">
                        <Search size={18} />
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {open && (
                    <div className="absolute top-[60px] left-0 w-64 bg-white/95 backdrop-blur-xl shadow-2xl z-50 rounded-br-2xl xl:hidden border border-gray-100 overflow-hidden">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setOpen(false)}
                                className={`block px-6 py-4 font-bold border-b border-gray-100/50 hover:bg-gray-50 hover:text-[#ff3b22] hover:pl-8 transition-all duration-300 ${location.pathname === item.path ? 'text-[#ff3b22]' : 'text-gray-800'}`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}