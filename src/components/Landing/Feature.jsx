import React from 'react';
import { FaStore, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
// import SectionTitle from './common/SectionTitle';

const Features = () => {
  const features = [
    {
      icon: <FaStore className="text-5xl text-[#8B4513] mb-4" />,
      title: "متجر إلكتروني",
      description: "منصة تسوق آمنة لشراء أجود المنتجات الحرفية مباشرة من الحرفيين في جميع أنحاء العالم العربي"
    },
    {
      icon: <FaUsers className="text-5xl text-[#8B4513] mb-4" />,
      title: "مجتمع تفاعلي",
      description: "تواصل مع الحرفيين والمهتمين بالتراث، شارك أعمالك واحصل على تعليقات وتقييمات"
    },
    {
      icon: <FaChalkboardTeacher className="text-5xl text-[#8B4513] mb-4" />,
      title: "توصيات المجتمع",
      description: "ابحث عن الحرفي المناسب بوصف بسيط!"
    }
  ];

  return (
 <section className="features-section mb-16 px-4 pattern-bg">
  <h2 className="text-3xl text-center mb-12 mt-10 text-[#8B4513] relative">
    كيف نخدم تراثنا
    <span className="block w-24 h-1 bg-[#C19A6B] mx-auto mt-4"></span>
  </h2>      

  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className="feature-card bg-white rounded-lg shadow-md transition-transform hover:-translate-y-2.5 hover:shadow-lg p-8 text-center border-t-4 border-[#C19A6B]"
        >
          {feature.icon}
          <h3 className="text-xl font-bold text-[#5D4037] mb-4">{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

  );
};

export default Features;