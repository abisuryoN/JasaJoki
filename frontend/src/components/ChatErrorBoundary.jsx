import React from 'react';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

class ChatErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🧩 Chat Crash Caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-900/50 backdrop-blur-xl border border-red-500/20 rounded-3xl m-4 shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                        <FaExclamationTriangle size={32} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-lg uppercase tracking-tight">Terjadi Kesalahan</h4>
                        <p className="text-slate-400 text-xs font-medium max-w-[200px] mt-1 italic uppercase tracking-tighter">Sistem chat mengalami gangguan teknis sementara.</p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <FaSync size={10} /> Muat Ulang
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ChatErrorBoundary;
