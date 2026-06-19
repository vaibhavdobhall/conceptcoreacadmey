'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Target, Brain, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: GraduationCap,
      title: 'Expert Educators',
      description: 'Learn from qualified professionals with years of teaching experience across multiple subjects.',
      color: 'bg-blue-500'
    },
    {
      icon: Target,
      title: 'Personalized Learning',
      description: 'Customized lesson plans tailored to your unique learning style and academic goals.',
      color: 'bg-purple-500'
    },
    {
      icon: Brain,
      title: 'Concept-Based Teaching',
      description: 'We focus on building strong foundational understanding rather than rote memorization.',
      color: 'bg-green-500'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Book sessions at times that work best for you with our easy-to-use booking system.',
      color: 'bg-orange-500'
    },
    {
      icon: MessageSquare,
      title: 'Open Communication',
      description: 'Regular progress updates and direct communication with your educator.',
      color: 'bg-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your improvement with regular assessments and feedback.',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-blue-600">ConceptCore Academy</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide a comprehensive learning experience designed to help you achieve academic excellence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}