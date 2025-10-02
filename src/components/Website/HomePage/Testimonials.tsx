"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { UserCircle2, X } from 'lucide-react';
import { testimonials, Testimonial } from './testimonial';

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const cardWidth = 280;
  const gap = 16;
  const singleSetWidth = testimonials.length * (cardWidth + gap);

  const moveMarquee = useCallback((timestamp: number) => {
    if (isHovered || isDragging) return;

    if (!lastFrameTime.current) lastFrameTime.current = timestamp;
    const delta = timestamp - lastFrameTime.current;

    if (delta > 16) {
      const currentX = x.get();
      x.set(currentX - 0.8);
      lastFrameTime.current = timestamp;
    }

    animationRef.current = requestAnimationFrame(moveMarquee);
  }, [isHovered, isDragging, x]);

  const handleInfiniteLoop = useCallback(() => {
    const currentX = x.get();
    if (currentX <= -singleSetWidth * 2) {
      x.set(currentX + singleSetWidth);
    } else if (currentX >= 0) {
      x.set(currentX - singleSetWidth);
    }
  }, [x, singleSetWidth]);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
  };

  const handlePointerUp = (testimonial: Testimonial, e: React.PointerEvent) => {
    if (!pointerDownPos.current) return;
    
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);

    if (dx < 10 && dy < 10) {
      clickTimeout.current = setTimeout(() => {
        setSelectedTestimonial(testimonial);
        setIsModalOpen(true);
      }, 150);
    }

    pointerDownPos.current = null;
  };

  const handlePointerCancel = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    pointerDownPos.current = null;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTestimonial(null), 300);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  useEffect(() => {
    const unsubscribe = x.onChange(handleInfiniteLoop);
    return unsubscribe;
  }, [x, handleInfiniteLoop]);

  useEffect(() => {
    const frame = (time: number) => moveMarquee(time);
    animationRef.current = requestAnimationFrame(frame);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [moveMarquee]);

  useEffect(() => {
    x.set(-singleSetWidth);
  }, [x, singleSetWidth]);

  const infiniteTestimonials = Array(3).fill(testimonials).flat();

  return (
    <section className="relative py-20 bg-gradient-to-br from-[#f7fafc] to-[#edf2f7]">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231a2b3d\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M30 15a15 15 0 100 30 15 15 0 000-30zm0 20a5 5 0 110-10 5 5 0 010 10z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '120px 120px',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-[#4a6789]/10 text-[#4a6789] px-4 py-2 rounded-full text-sm font-semibold">
              Client Reviews
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b3d] mb-6">
            What Our Clients
            <span className="block text-[#4a6789]">Say About Us</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mb-6"></div>
          <p className="text-[#718096] text-lg leading-relaxed max-w-3xl mx-auto">
            Trusted by businesses and individuals across Pakistan. Here's what our clients have to say about
            their experience working with N&A Jurists.
          </p>
        </div>
        
        <div
          ref={containerRef}
          className="relative w-full overflow-x-hidden py-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="flex gap-4 w-max items-stretch pl-4 cursor-grab active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -Infinity, right: Infinity }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            dragElastic={0}
            dragMomentum={false}
          >
            <AnimatePresence>
              {infiniteTestimonials.map((testimonial, index) => (
                <motion.div
                  key={`${testimonial.id}-${index}`}
                  className="flex-shrink-0 w-[260px] h-[300px] px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                  onPointerDown={handlePointerDown}
                  onPointerUp={(e) => handlePointerUp(testimonial, e)}
                  onPointerCancel={handlePointerCancel}
                >
                  <div className="bg-white border border-[#e2e8f0] p-6 h-full w-full flex flex-col justify-between rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-[#4a6789]/30 group relative overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b3d]/5 to-[#4a6789]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                      {/* Quote icon */}
                      <div className="absolute -top-2 -left-2 text-4xl text-[#4a6789]/20 font-serif">"</div>

                      <div className="flex items-center mb-4">
                        <div className="relative w-12 h-12 mr-4 flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden bg-[#4a6789]/10 group-hover:bg-[#4a6789]/20 transition-colors duration-300">
                          {testimonial.image ? (
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCircle2 className="w-12 h-12 text-[#4a6789] flex-shrink-0" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-[#1a2b3d] truncate group-hover:text-[#4a6789] transition-colors duration-300">
                            {testimonial.name}
                          </h3>
                          <p className="text-sm text-[#718096] truncate">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>

                      <blockquote className="text-[#718096] italic line-clamp-4 mb-4 leading-relaxed">
                        "{testimonial.content}"
                      </blockquote>

                      {/* Star rating */}
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < testimonial.rating ? 'text-[#4a6789]' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Read more indicator */}
                      <div className="text-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-xs text-[#4a6789] font-medium">Click to read full review</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedTestimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="pr-8">
                <div className="flex items-center mb-6">
                  <div className="relative w-16 h-16 mr-4 flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden bg-[#2c415e]/10">
                    {selectedTestimonial.image ? (
                      <img
                        src={selectedTestimonial.image}
                        alt={selectedTestimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="w-16 h-16 text-[#2c415e] flex-shrink-0" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-[#2c415e]">
                      {selectedTestimonial.name}
                    </h3>
                    <p className="text-gray-600">
                      {selectedTestimonial.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < selectedTestimonial.rating ? 'text-[#4a6789]' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                  &quot;{selectedTestimonial.content}&quot;
                </blockquote>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}