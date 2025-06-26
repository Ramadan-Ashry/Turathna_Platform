import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#6B4423] to-[#4A2C2A] text-white py-8">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="footer-col">
          <h3 className="text-2xl font-bold mb-4 relative inline-block text-[beige]">
            عن تراثنا
            <span className="absolute bottom-[-6px] right-0 w-10 h-0.5 bg-[#D4AF37]"></span>
          </h3>
          <p className="mb-3 text-sm text-gray-200 leading-relaxed text-lg font-bold">منصة تراثنا هي موقع إلكتروني متكامل للصناعات والحرف اليدوية العربية تجمع بين التجارة الإلكتروني وموقع تواصل اجتماعي.</p>
          <div className="flex space-x-3 mt-24">
            <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#4A2C2A] transition-all duration-300 hover:scale-110">
              <Facebook size={14} />
            </a>
            <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#4A2C2A] transition-all duration-300 hover:scale-110">
              <Twitter size={14} />
            </a>
            <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#4A2C2A] transition-all duration-300 hover:scale-110">
              <Instagram size={14} />
            </a>
            <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#4A2C2A] transition-all duration-300 hover:scale-110">
              <Youtube size={14} />
            </a>
          </div>
        </div>
        
        <div className="footer-col">
          <h3 className="text-2xl font-bold mb-4 relative inline-block text-[beige]">
            روابط سريعة
            <span className="absolute bottom-[-6px] right-0 w-10 h-0.5 bg-[#D4AF37]"></span>
          </h3>
          <ul className="space-y-1.5 text-xl font-bold">
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">الصفحة الرئيسية</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">المتجر الإلكتروني</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">الورش التعليمية</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">المجتمع التفاعلي</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">سياسة الخصوصية</a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h3 className="text-2xl font-bold mb-4 relative inline-block text-[beige]">
            الدول
            <span className="absolute bottom-[-6px] right-0 w-10 h-0.5 bg-[#D4AF37]"></span>
          </h3>
          <ul className="space-y-1.5 text-xl font-bold">
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">السعودية</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">الإمارات</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">مصر</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">المغرب</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">العراق</a></li>
            <li><a href="#" className="text-gray-300 hover:text-[#D4AF37] hover:pr-2 transition-all duration-300 text-sm">عُمان</a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h3 className="text-2xl font-bold mb-4 relative inline-block text-[beige]">
            اتصل بنا
            <span className="absolute bottom-[-6px] right-0 w-10 h-0.5 bg-[#D4AF37]"></span>
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-center text-xl">
              <MapPin className="ml-2 text-[#D4AF37]" size={12} />
              <span className="text-gray-300">الرياض، السعودية</span>
            </li>
            <li className="flex items-center text-sm">
              <Phone className="ml-2 text-[#D4AF37]" size={12} />
              <span className="text-gray-300">+966 12 345 6789</span>
            </li>
            <li className="flex items-center text-sm">
              <Mail className="ml-2 text-[#D4AF37]" size={12} />
              <span className="text-gray-300">info@irath.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-6 pt-6 mt-6 border-t border-white/10 text-center text[beige] text-sm">
        <p>جميع الحقوق محفوظة &copy;منصه تراثنا 2025</p>
      </div>
    </footer>
  );
};

export default Footer;