import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  Calculator, 
  HeartPulse, 
  PhoneCall, 
  Pill, 
  Clock, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const HealthToolsModal = () => {
  const { isHealthToolsModalOpen, setIsHealthToolsModalOpen, lang } = useShop();

  const [activeTab, setActiveTab] = useState('bmi'); // 'bmi', 'helpline', 'schedule'

  // BMI State
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('6');
  const [weightKg, setWeightKg] = useState('65');
  const [bmiResult, setBmiResult] = useState(null);

  if (!isHealthToolsModalOpen) return null;

  const calculateBMI = (e) => {
    e.preventDefault();
    const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
    const heightInMeters = totalInches * 0.0254;
    const weight = parseFloat(weightKg);

    if (heightInMeters > 0 && weight > 0) {
      const bmi = weight / (heightInMeters * heightInMeters);
      let categoryBn = '';
      let categoryEn = '';
      let color = '';
      let adviceBn = '';
      let adviceEn = '';

      if (bmi < 18.5) {
        categoryBn = 'স্বল্প ওজন (Underweight)';
        categoryEn = 'Underweight';
        color = 'text-amber-600 bg-amber-50 border-amber-200';
        adviceBn = 'পর্যাপ্ত পুষ্টিকর খাবার এবং প্রোটিন গ্রহণ করুন। চিকিৎসকের পরামর্শ নিন।';
        adviceEn = 'Consume balanced nutrients and consult a nutritionist.';
      } else if (bmi >= 18.5 && bmi < 24.9) {
        categoryBn = 'স্বাভাবিক ওজন (Healthy)';
        categoryEn = 'Healthy Weight';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        adviceBn = 'অভিনন্দন! আপনার ওজন একদম সঠিক রয়েছে। নিয়মিত স্বাস্থ্যকর খাবার ও শরীরচর্চা বজায় রাখুন।';
        adviceEn = 'Great job! Maintain your balanced diet and active lifestyle.';
      } else if (bmi >= 25 && bmi < 29.9) {
        categoryBn = 'অতিরিক্ত ওজন (Overweight)';
        categoryEn = 'Overweight';
        color = 'text-orange-600 bg-orange-50 border-orange-200';
        adviceBn = 'হাঁটাচলা বাড়ান এবং অতিরিক্ত তেল-চর্বি ও চিনিযুক্ত খাবার পরিহার করুন।';
        adviceEn = 'Exercise regularly and reduce calorie intake.';
      } else {
        categoryBn = 'স্থূলতা (Obese)';
        categoryEn = 'Obese';
        color = 'text-rose-600 bg-rose-50 border-rose-200';
        adviceBn = 'ডায়াবেটিস ও হৃদরোগের ঝুঁকি কমাতে ডাক্তারের পরামর্শে ওজন নিয়ন্ত্রণ পরিকল্পনা নিন।';
        adviceEn = 'High health risk. Please consult a doctor for a weight-loss plan.';
      }

      setBmiResult({
        bmi: bmi.toFixed(1),
        categoryBn,
        categoryEn,
        color,
        adviceBn,
        adviceEn
      });
    }
  };

  const helplines = [
    { title: 'জাতীয় জরুরি সেবা (অ্যাম্বুলেন্স / পুলিশ / ফায়ার সার্ভিস)', number: '999', desc: '২৪ ঘণ্টা যেকোনো জরুরি সাহায্য' },
    { title: 'স্বাস্থ্য বাতায়ন (সরকারি স্বাস্থ্য পরামর্শ)', number: '16263', desc: 'সরাসরি ডাক্তার পরামর্শ ও তথ্য' },
    { title: 'আইইডিসিআর (রোগ নিয়ন্ত্রণ শাখা)', number: '10655', desc: 'সংক্রামক রোগ ও ডেঙ্গু পরামর্শ' },
    { title: 'জাতীয় হৃদরোগ ইনস্টিটিউট ও হাসপাতাল', number: '02-9122560', desc: 'জরুরি কার্ডিয়াক কেয়ার' },
    { title: 'বারডেম ডায়াবেটিস ইমার্জেন্সি', number: '10616', desc: 'ডায়াবেটিস ও রক্তে শর্করা সংকট' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-900">
                {lang === 'bn' ? 'স্বাস্থ্য টুলস ও জরুরি সেবা' : 'Health Tools & Helplines'}
              </h2>
              <span className="text-xs text-slate-500">
                {lang === 'bn' ? 'বিএমআই টেস্ট ও জরুরি মেডিকেল তথ্য' : 'BMI Calculator & Emergency Services'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsHealthToolsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 border-b border-slate-100 text-xs font-bold text-slate-600 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('bmi')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer font-bold ${
              activeTab === 'bmi' ? 'border-[#123184] text-[#123184] bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#02975E]" />
            <span>BMI ক্যালকুলেটর</span>
          </button>

          <button
            onClick={() => setActiveTab('helpline')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer font-bold ${
              activeTab === 'helpline' ? 'border-[#123184] text-[#123184] bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#02975E]" />
            <span>জরুরি হেল্পলাইন</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer font-bold ${
              activeTab === 'schedule' ? 'border-[#123184] text-[#123184] bg-white' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#02975E]" />
            <span>ওষুধের সেবনবিধি</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: BMI CALCULATOR */}
          {activeTab === 'bmi' && (
            <div className="space-y-4">
              <form onSubmit={calculateBMI} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'bn' ? 'উচ্চতা (ফুট)' : 'Height (Feet)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="3"
                      max="8"
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'bn' ? 'ইঞ্চি' : 'Inches'}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="11"
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'বিএমআই হিসাব করুন' : 'Calculate BMI'}
                </button>
              </form>

              {/* BMI Result display */}
              {bmiResult && (
                <div className={`p-4 rounded-2xl border ${bmiResult.color} space-y-1.5 animate-in fade-in`}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase tracking-wider">আপনার BMI স্কোর:</span>
                    <span className="text-2xl font-black">{bmiResult.bmi}</span>
                  </div>
                  <div className="font-extrabold text-sm">{lang === 'bn' ? bmiResult.categoryBn : bmiResult.categoryEn}</div>
                  <p className="text-xs pt-1 opacity-90">{lang === 'bn' ? bmiResult.adviceBn : bmiResult.adviceEn}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMERGENCY HELPLINES */}
          {activeTab === 'helpline' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                জরুরি মুহূর্তে অবিলম্বে যোগাযোগ করুন:
              </p>
              {helplines.map((line, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{line.title}</h4>
                    <span className="text-[11px] text-slate-500">{line.desc}</span>
                  </div>
                  <a
                    href={`tel:${line.number}`}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{line.number}</span>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DOSAGE & TIMING GUIDE */}
          {activeTab === 'schedule' && (
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5 text-sm">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  খাবারের পূর্বে ওষুধ সেবনের নিয়ম
                </h4>
                <p>
                  গ্যাস্ট্রিকের ওষুধ (যেমন Seclo, Sergel, Finix) সাধারণত খাবারের ২০-৩০ মিনিট পূর্বে সেবন করতে হয়। এতে পাকস্থলীর অ্যাসিড নিঃসরণ নিয়ন্ত্রিত থাকে।
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <h4 className="font-bold text-blue-950 mb-1 flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-blue-700" />
                  খাবারের পরে ওষুধ সেবনের নিয়ম
                </h4>
                <p>
                  প্যারাসিটামল (Napa), ব্যথানাশক এবং অ্যান্টিবায়োটিক সবসময় ভরা পেটে বা পর্যাপ্ত খাবারের পর সেবন করবেন। খালি পেটে এগুলো খেলে পেটে ক্ষত বা আলসার হতে পারে।
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <h4 className="font-bold text-amber-950 mb-1 flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  অ্যান্টিবায়োটিকের কোর্স পূর্ণ করা
                </h4>
                <p>
                  ডাক্তারের দেওয়া অ্যান্টিবায়োটিকের সম্পূর্ণ মেয়াদ (কোর্স) শেষ করুন। রোগ ভালো মনে হলেও নিজে থেকে কোর্স বন্ধ করবেন না, এতে অ্যান্টিমাইক্রোবিয়াল রেজিস্ট্যান্স তৈরি হয়।
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
