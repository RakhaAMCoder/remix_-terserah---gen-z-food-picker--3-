import React from 'react';
import { motion } from 'motion/react';
import { User, Store, Shield, ChevronRight } from 'lucide-react';
import { Language, translations } from '../../translations';
import { UserRole } from '../../types/auth';

interface RoleSelectionProps {
  language: Language;
  darkMode: boolean;
  onSelect: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ language, darkMode, onSelect }) => {
  const t = translations[language];

  const roles = [
    {
      id: 'user' as UserRole,
      title: language === 'id' ? 'Pengguna Biasa' : 'Regular User',
      desc: language === 'id' ? 'Cari tempat kuliner dan simpan favoritmu.' : 'Search for culinary spots and save your favorites.',
      icon: <User size={32} />,
      color: 'bg-blue-500'
    },
    {
      id: 'merchant' as UserRole,
      title: language === 'id' ? 'Merchant / Penjual' : 'Merchant / Seller',
      desc: language === 'id' ? 'Kelola menu dan promosikan usahamu.' : 'Manage your menu and promote your business.',
      icon: <Store size={32} />,
      color: 'bg-[#1A9E5C]'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col p-8 transition-colors duration-300 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-[#1A1A2E]'}`}>
      <div className="mt-12 mb-10 space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">
          {language === 'id' ? 'Masuk Sebagai Apa?' : 'Join As...'}
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          {language === 'id' ? 'Tentukan peranmu untuk menyesuaikan fitur.' : 'Pick a role to customize your experience.'}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {roles.map((role) => (
          <motion.button
            key={role.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(role.id)}
            className={`w-full p-6 rounded-[32px] border flex items-center justify-between text-left transition-all ${
              darkMode 
                ? 'bg-white/[0.03] border-white/10 hover:bg-white/5' 
                : 'bg-white border-black/5 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 ${role.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {role.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-lg tracking-tight uppercase">{role.title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[180px]">{role.desc}</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </motion.button>
        ))}
      </div>
      
      <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-8">
        © 2026 Terserah Team. Malang, Indonesia.
      </p>
    </div>
  );
};

export default RoleSelection;
