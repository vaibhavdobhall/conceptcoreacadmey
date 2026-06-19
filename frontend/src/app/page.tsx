import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Booking from '@/components/Booking';
import Contact from '@/components/Contact';
import EducatorDashboard from '@/components/EducatorDashboard';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Booking />
      <EducatorDashboard />
      <Contact />
      <Footer />
    </main>
  );
}
