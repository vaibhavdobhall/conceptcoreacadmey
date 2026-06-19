'use client';

import { motion } from 'framer-motion';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">ConceptCore Academy</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering students through personalized, concept-based learning experiences.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="text-gray-400 hover:text-blue-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-blue-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#booking" className="text-gray-400 hover:text-blue-400 transition-colors">Book a Session</a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-gray-400 text-sm">contact@conceptcoreacademy.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-gray-400 text-sm">Online Worldwide</span>
              </li>
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-blue-600 transition-colors text-white font-bold text-sm">
                FB
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-blue-400 transition-colors text-white font-bold text-sm">
                TW
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-pink-600 transition-colors text-white font-bold text-sm">
                IG
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-blue-700 transition-colors text-white font-bold text-sm">
                LI
              </a>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ConceptCore Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}