import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, AlertCircle, Mail } from 'lucide-react';

const NetworkBackground = ({ isDark }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (x, y) => ({
      x: x || Math.random() * canvas.width,
      y: y || Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      connections: []
    });

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const drawParticle = (particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? 'rgba(59, 130, 246, 0.5)' 
        : 'rgba(0, 61, 91, 0.5)';
      ctx.fill();
    };

    const drawConnections = () => {
      particles.forEach(particle => {
        particle.connections = [];
        particles.forEach(otherParticle => {
          if (particle === otherParticle) return;
          const distance = Math.hypot(particle.x - otherParticle.x, particle.y - otherParticle.y);
          if (distance < 100) {
            particle.connections.push(otherParticle);
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = isDark
              ? `rgba(59, 130, 246, ${0.2 * (1 - distance / 100)})`
              : `rgba(0, 61, 91, ${0.2 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        drawParticle(particle);
      });
      
      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full"
      style={{ 
        background: isDark
          ? 'linear-gradient(to bottom right, #0f172a, #1e293b)'
          : 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)',
        zIndex: 0 
      }}
    />
  );
};

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark);
  }, [isDark]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      onLogin();
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative">
      <NetworkBackground isDark={isDark} />
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-4 right-4 z-30 p-2 rounded-lg bg-white/10 backdrop-blur-sm text-dark-text-primary"
      >
        {isDark ? '🌞' : '🌙'}
      </button>
      <div className="relative bg-white/80 dark:bg-dark-card/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200/50 dark:border-dark-border z-20">
        {/* Elementos decorativos */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#FF6B2B]/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#003D5B]/10 rounded-full blur-2xl"></div>
        
        <div className="relative flex flex-col items-center mb-8">
          <div className="w-40 h-40 relative">
            <div className="absolute inset-0 bg-[#FF6B2B]/20 rounded-full blur-xl animate-pulse"></div>
            <img 
              src="/logo.png" 
              alt="RetailTracker Logo" 
              className="w-40 h-40 object-contain relative z-10"
            />
          </div>
          <h2 className="text-2xl font-bold text-primary dark:text-dark-text-primary mt-6">Bienvenido</h2>
          <p className="text-slate-600 dark:text-dark-text-secondary">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-text-secondary group-hover:text-secondary-dark transition-colors" size={20} />
            <input
              type="text"
              placeholder="Usuario"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark focus:border-transparent transition-all hover:border-secondary/50 dark:hover:border-secondary-dark/50"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-text-secondary group-hover:text-secondary-dark transition-colors" size={20} />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark focus:border-transparent transition-all hover:border-secondary/50 dark:hover:border-secondary-dark/50"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-[#FF6B2B] hover:text-[#003D5B] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90 text-white py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Ingresar
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-slate-500 bg-white">O continúa con</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Iniciar con Google
          </button>

          <div className="mt-6 text-center">
            <span className="text-slate-600">¿No tienes una cuenta? </span>
            <button
              type="button"
              className="text-[#FF6B2B] hover:text-[#003D5B] font-medium transition-colors"
            >
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;