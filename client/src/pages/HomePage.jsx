import { useState, useEffect } from "react";
import { FaLeaf, FaUser, FaShoppingCart } from "react-icons/fa";
import { 
 
  FaMapMarkedAlt, 
  FaCalculator, 
  FaHandsHelping, 
  FaRupeeSign,
  FaTractor,
  FaRecycle,
  FaSeedling,
  FaGlobeAsia,
  FaArrowRight,
  FaChartLine,
  FaUsers,
  FaAward,
  FaSatellite,
  FaLanguage,
  FaQuoteRight
} from "react-icons/fa";
import { MdAgriculture, MdAir, MdWarning, MdEnergySavingsLeaf } from "react-icons/md";
import { GiWheat, GiCorn, GiFarmer, GiFactory } from "react-icons/gi";
import { WiDaySunny, WiCloudy } from "react-icons/wi";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [currentStat, setCurrentStat] = useState(0);
  
  // Rotating stats for animation
  const stats = [
    { value: "40%", label: "Air Pollution Reduction" },
    { value: "₹15K", label: "Additional Income/Acre" },
    { value: "2M+", label: "Farmers Benefited" },
    { value: "5L", label: "Tons CO2 Saved" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sample alternatives data
  const alternatives = [
    {
      icon: <GiFactory className="text-4xl" />,
      title: "Biochar Production",
      roi: "180%",
      timeline: "6 months",
      income: "₹25,000/acre",
      color: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
    },
    {
      icon: <FaRecycle className="text-4xl" />,
      title: "Pellet Manufacturing",
      roi: "150%",
      timeline: "8 months",
      income: "₹22,000/acre",
      color: "from-emerald-500 to-green-500",
      bgLight: "bg-emerald-50",
    },
    {
      icon: <FaSeedling className="text-4xl" />,
      title: "Composting",
      roi: "120%",
      timeline: "4 months",
      income: "₹15,000/acre",
      color: "from-green-500 to-teal-500",
      bgLight: "bg-green-50",
    },
    {
      icon: <FaTractor className="text-4xl" />,
      title: "Direct Incorporation",
      roi: "90%",
      timeline: "2 months",
      income: "₹10,000/acre",
      color: "from-blue-500 to-cyan-500",
      bgLight: "bg-blue-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navbar */}
     <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-green-100">
  <div className="container mx-auto px-6 py-4">
    <div className="flex items-center justify-between">

      {/* Logo */}
      <div className="flex items-center space-x-3 cursor-pointer">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
          <img
            src={"logo.jpeg"}
            alt="Crop2Cash Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Crop2Cash
          </h1>
          <p className="text-xs text-gray-500">
            Smart Stubble Solutions
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-8">
        <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Features</a>
        <a href="#alternatives" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Alternatives</a>
        <a href="#impact" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Impact</a>
        <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Contact</a>
      </div>

    </div>
  </div>
</nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1">
              {/* AQI Warning Badge */}
             

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  AI-Powered
                </span>
                <br />
                <span className="text-gray-800">Stubble Burning</span>
                <br />
                <span className="text-gray-800">Alternatives</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transform crop residue into profit. Get personalized recommendations, 
                calculate ROI, and connect with buyers - all in one platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                <button 
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
                >
                  Get Started Now
                  <FaArrowRight />
                </button>
               
              </div>

              {/* Animated Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold text-green-600">
                    {stats[currentStat].value}
                  </div>
                  <div className="text-gray-600">{stats[currentStat].label}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  {stats.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        index === currentStat ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="flex-1 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Sustainable Farming"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Overlay Stats */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                      <WiDaySunny className="text-white text-3xl" />
                      <div className="text-white font-bold text-xl">30+ Days</div>
                      <div className="text-white/80 text-sm">Crop Cycle Left</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                      <GiWheat className="text-white text-3xl" />
                      <div className="text-white font-bold text-xl">2.5 tons</div>
                      <div className="text-white/80 text-sm">Residue/Acre</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose <span className="text-green-600">Crop2Cash?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solution for farmers to make informed decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <MdAgriculture className="text-5xl text-green-500" />,
                title: "AI Recommendations",
                desc: "Personalized alternatives based on your field data",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: <FaCalculator className="text-5xl text-blue-500" />,
                title: "ROI Calculator",
                desc: "Setup cost, income, and break-even timeline",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <FaMapMarkedAlt className="text-5xl text-purple-500" />,
                title: "Nearby Buyers",
                desc: "Connect with local aggregators and processors",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: <FaSatellite className="text-5xl text-orange-500" />,
                title: "Satellite Integration",
                desc: "Automatic biomass estimation using NDVI data",
                color: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternatives Preview */}
      <section id="alternatives" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Profitable <span className="text-green-600">Alternatives</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Compare different options ranked by net economic benefit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {alternatives.map((alt, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className={`h-3 bg-gradient-to-r ${alt.color}`}></div>
                <div className="p-6">
                  <div className={`w-16 h-16 ${alt.bgLight} rounded-2xl flex items-center justify-center mb-4 text-${alt.color.split(' ')[1]}`}>
                    {alt.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{alt.title}</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">ROI</span>
                      <span className="font-bold text-green-600">{alt.roi}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Timeline</span>
                      <span className="font-bold text-gray-700">{alt.timeline}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Income</span>
                      <span className="font-bold text-gray-700">{alt.income}</span>
                    </div>
                  </div>

                  <button className="w-full py-3 border-2 border-green-500 text-green-600 rounded-xl font-semibold hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2 group">
                    View Details
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Impact</h2>
              <p className="text-xl mb-8 text-green-100">
                Together we're making a difference in combating air pollution and improving farmer livelihoods.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <MdAir className="text-4xl mb-3" />
                  <div className="text-3xl font-bold">40%</div>
                  <div className="text-green-100">Air Quality Improvement</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <GiFarmer className="text-4xl mb-3" />
                  <div className="text-3xl font-bold">2M+</div>
                  <div className="text-green-100">Farmers Reached</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <FaRupeeSign className="text-4xl mb-3" />
                  <div className="text-3xl font-bold">₹3,000Cr</div>
                  <div className="text-green-100">Additional Income</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <MdEnergySavingsLeaf className="text-4xl mb-3" />
                  <div className="text-3xl font-bold">5L Tons</div>
                  <div className="text-green-100">CO2 Reduction</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                <FaQuoteRight className="text-6xl text-white/30 mb-4" />
                <p className="text-2xl italic mb-6">
                  "Crop2Cash helped me earn ₹25,000 extra per acre by converting my paddy straw into biochar. No more burning!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center text-2xl font-bold">
                    GS
                  </div>
                  <div>
                    <div className="font-bold text-xl">Gurpreet Singh</div>
                    <div className="text-green-200">Farmer, Punjab</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Make a Change?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of farmers who've stopped burning and started earning more.
              </p>
              <button 
                onClick={() => navigate("/register")}
                className="px-8 py-4 bg-white text-green-600 rounded-2xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
              >
                Register as Farmer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
     <footer className="bg-gray-900 text-white py-8">
  <div className="container mx-auto px-6">

    {/* Top Row */}
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">

      {/* Logo + Name */}
      <div className="flex items-center space-x-3">
        <img
          src={"logo.jpeg"}
          alt="Crop2Cash Logo"
          className="w-10 h-10 rounded-lg object-cover"
        />
        <span className="text-xl font-bold">Crop2Cash</span>
      </div>

      {/* Quick Links */}
      <div className="flex space-x-6 text-gray-400 text-sm">
        <a href="#" className="hover:text-green-400 transition-colors">About</a>
        <a href="#" className="hover:text-green-400 transition-colors">Features</a>
        <a href="#" className="hover:text-green-400 transition-colors">Contact</a>
      </div>

      {/* Social Icons */}
     

    </div>

    {/* Bottom Line */}
    <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} Crop2Cash · Made for Sustainable Agriculture 🌱
    </div>

  </div>
</footer>
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}