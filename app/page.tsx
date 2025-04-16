'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/app/auth/AuthContext'
import { FiUser, FiLogIn } from 'react-icons/fi'

export default function Home() {
  const { user, isLoading } = useAuth();
  
  const categories = [
    { name: 'Below SSC', path: '/chat/below-ssc', description: 'For students below Secondary School Certificate level' },
    { name: 'SSC', path: '/chat/ssc', description: 'For Secondary School Certificate students' },
    { name: 'HSC', path: '/chat/hsc', description: 'For Higher Secondary Certificate students' },
    { name: 'Admission Tests', path: '/chat/admission', description: 'For university admission test preparation' },
    { name: 'University', path: '/chat/university', description: 'For university level students' },
    { name: 'Career Guide', path: '/chat/career', description: 'For career planning and guidance' },
    { name: 'Research Notes', path: '/chat/research', description: 'Get resources on specific topics from various platforms' },
    { name: 'IELTS', path: '/chat/ielts', description: 'Preparation for IELTS examination' },
    { name: 'SAT', path: '/chat/sat', description: 'Preparation for SAT examination' },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary to-secondary">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-end mb-4">
            {!isLoading && (
              user ? (
                <div className="bg-white/20 rounded-full px-4 py-2 text-white flex items-center space-x-2">
                  <FiUser />
                  <span>{user.email}</span>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link 
                    href="/auth/login" 
                    className="bg-white text-primary rounded-full px-4 py-2 flex items-center space-x-1 hover:bg-gray-100"
                  >
                    <FiLogIn />
                    <span>Log in</span>
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="bg-primary-dark text-white rounded-full px-4 py-2 hover:bg-primary-darker"
                  >
                    Sign up
                  </Link>
                </div>
              )
            )}
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white">
              EduHalal Bangladesh
            </h1>
            <p className="max-w-[700px] text-white md:text-xl">
              Your AI-powered homework assistant for students in Bangladesh
            </p>
            {!isLoading && !user && (
              <Link 
                href="/auth/register" 
                className="mt-4 bg-white text-primary hover:bg-gray-100 rounded-md px-6 py-3 font-medium"
              >
                Get Started - It's Free
              </Link>
            )}
            {!isLoading && user && (
              <Link 
                href="/chat/below-ssc" 
                className="mt-4 bg-white text-primary hover:bg-gray-100 rounded-md px-6 py-3 font-medium"
              >
                Start Chatting
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Education Level</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.path} 
                href={category.path}
                className="flex flex-col p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
              >
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="mt-auto">
                  <span className="inline-flex items-center text-primary font-medium">
                    Start Chatting
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Tools & Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl mx-auto">
              <Link 
                href="/notes"
                className="flex flex-col p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
              >
                <h3 className="text-xl font-bold mb-2">Notes</h3>
                <p className="text-gray-600 mb-4">Create, organize, and manage your study notes</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-3 bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center mt-0.5">1</div>
                  <div>
                    <h3 className="font-semibold">Select Your Education Level</h3>
                    <p className="text-gray-600">Choose the category that best matches your educational needs</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center mt-0.5">2</div>
                  <div>
                    <h3 className="font-semibold">Ask Your Questions</h3>
                    <p className="text-gray-600">Type your homework questions or upload an image of your assignment</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center mt-0.5">3</div>
                  <div>
                    <h3 className="font-semibold">Get AI-Powered Help</h3>
                    <p className="text-gray-600">Receive instant, accurate assistance tailored to your education level</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Why Choose EduHalal?</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Tailored for Bangladeshi curriculum</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Personalized learning experience</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 access to learning resources</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Simple, modern, and intuitive interface</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-6 bg-gray-800 text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} EduHalal Bangladesh. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent">Terms</a>
              <a href="#" className="hover:text-accent">Privacy</a>
              <a href="#" className="hover:text-accent">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
} 