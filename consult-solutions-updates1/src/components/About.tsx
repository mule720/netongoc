import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Award, Lightbulb } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-teal-500/20 px-4 py-2 text-sm text-teal-200 tracking-[0.12em] uppercase shadow-sm shadow-teal-500/30 mb-4">
            Who We Are
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About NETON Limited
          </h2>
          <p className="text-xl text-teal-200 max-w-3xl mx-auto">
            A dynamic business support and consultancy firm committed to delivering exceptional solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="rounded-[2rem] border border-teal-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(20,184,166,0.3)]">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Our Mission</h3>
              <p className="text-teal-200 leading-relaxed">
                NETON Limited is a dynamic Business support and consultancy firm committed to
                delivering exceptional business, project, accounting, business technology solutions,
                financing, procurement and wealth planning and management services. Our mission is
                to empower businesses to achieve their full potential through innovative strategies
                and cutting-edge technology with exceptional financing.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-teal-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(20,184,166,0.3)]">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Our Approach</h3>
              <p className="text-teal-200 leading-relaxed">
                We believe in a client-centric approach. We work closely with our clients to
                understand their unique challenges and goals, developing tailored solutions that
                deliver measurable results. Our collaborative methodology ensures that our clients
                are involved at every step, fostering trust, transparency and knowledge sharing.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="rounded-[2rem] border border-teal-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(20,184,166,0.3)]">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Expertise</h4>
              <p className="text-teal-200 text-sm">
                Our team brings wealth of knowledge across various sectors
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-teal-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(20,184,166,0.3)]">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Innovation</h4>
              <p className="text-teal-200 text-sm">
                Leveraging advanced data analytics and technology
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-teal-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(20,184,166,0.3)]">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Partnership</h4>
              <p className="text-teal-200 text-sm">
                Dedicated to fostering long-term client relationships
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[2rem] border border-teal-500/20 bg-slate-900/80 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(20,184,166,0.3)]">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-white mb-4">Our Commitment</h3>
            <p className="text-teal-200 leading-relaxed">
              Our team of experienced professionals brings a wealth of knowledge across various
              sectors, ensuring that we address the unique needs and challenges of each client.
              By leveraging advanced data analytics and technology, we help businesses make
              informed decisions, optimize operations, and enhance their competitive edge.
              At NETON Limited, we are dedicated to fostering long-term partnerships with our
              clients, guiding them through every step of their journey towards success.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;