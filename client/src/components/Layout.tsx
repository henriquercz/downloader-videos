import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
            {/* Header */}
            <header className="w-full py-6 px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20">
                            <img src="/logo.png" alt="Nano Banana Pro" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Nano Banana Pro
                        </h1>
                    </div>
                    <nav className="hidden md:flex gap-4 text-sm font-medium text-slate-400">
                        <a href="#" className="hover:text-indigo-400 transition-colors">Como funciona</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Formatos</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
                {children}
            </main>

            {/* Footer */}
            <footer className="w-full py-8 border-t border-slate-800 mt-auto bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} Universal Video Downloader. Projeto Educacional.</p>
                    <p className="mt-2 text-xs">Suporta YouTube, TikTok, Instagram e mais. Uso pessoal apenas.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
