"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Award, Target, Heart, Shield, Leaf } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const values = [
    {
      icon: Shield,
      title: "Quality First",
      description:
        "We never compromise on quality. Every KLITZO product undergoes rigorous testing to ensure superior performance.",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description:
        "Our commitment to the environment drives us to create biodegradable, sustainable cleaning solutions.",
    },
    {
      icon: Heart,
      title: "Customer Care",
      description: "Your satisfaction is our priority. We're here to support you with exceptional customer service.",
    },
    {
      icon: Target,
      title: "Innovation",
      description: "We continuously research and develop cutting-edge cleaning technologies for better results.",
    },
  ]

  const stats = [
    { number: "100+", label: "Happy Customers" },
    { number: "2+", label: "Years Experience" },
    { number: "25+", label: "Products" },
    { number: "99.9%", label: "Customer Satisfaction" },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-800 mb-6">
              About KLITZO
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Pioneering the future of cleaning with innovative, eco-friendly solutions that make your life easier and
              your home cleaner.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Our Story</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              KLITZO was created with one vision: to make cleaning simple, powerful, and universal. Combining advanced US technology with Indian manufacturing excellence, KLITZO delivers world-class cleaning performance in every spray
              </p>
            </div>
            <div
              className={`transform transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
            >
              <div className="bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl p-8">
                <img
                  src="/modern-cleaning-lab.png"
                  alt="KLITZO Laboratory"
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 px-4 bg-gradient-to-r from-teal-600 to-blue-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Our Values */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Our Values</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These core principles guide everything we do at KLITZO, from product development to customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className={`p-6 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-slate-50 to-blue-50 group transform ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="p-4 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="p-8 border-0 shadow-lg">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-teal-600 mr-3" />
                <h3 className="text-2xl font-bold text-slate-800">Our Mission</h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                To revolutionize the cleaning industry by providing innovative, eco-friendly products that deliver
                exceptional results while protecting the health of families and the environment. We strive to make
                cleaning simple, effective, and sustainable for everyone.
              </p>
            </Card>

            <Card className="p-8 border-0 shadow-lg">
              <div className="flex items-center mb-6">
                <Award className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-slate-800">Our Vision</h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                To become the world's most trusted cleaning brand, known for our commitment to quality, innovation, and
                environmental stewardship. We envision a future where every home and business can achieve perfect
                cleanliness without compromising on safety or sustainability.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Meet Our Team</h2>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
            Behind every KLITZO product is a dedicated team of scientists, engineers, and cleaning experts working
            tirelessly to bring you the best solutions.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Dr. Sarah Johnson", role: "Chief Scientist", image: "/professional-woman-scientist.png" },
              { name: "Michael Chen", role: "Product Development", image: "/professional-engineer.png" },
              { name: "Emily Rodriguez", role: "Quality Assurance", image: "/placeholder-jkvbl.png" },
            ].map((member, index) => (
              <Card
                key={index}
                className={`p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white group transform ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <h3 className="text-xl font-bold text-slate-800 mb-2">{member.name}</h3>
                <p className="text-teal-600 font-medium">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}

    </div>
  )
}
