import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('adminToken', data.token);
                navigate('/admin');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-red-800 uppercase tracking-wider mb-2">HBN News 24</h1>
                    <p className="text-gray-500">Admin Control Panel</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-medium border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                            placeholder="Enter admin username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-800 text-white font-bold py-3 rounded-lg hover:bg-red-900 transition-colors uppercase tracking-wide"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
