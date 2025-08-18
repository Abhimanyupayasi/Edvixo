import React from "react";
import { FaTwitter, FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#0B1220] text-gray-300 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <a href="/" className="flex items-center gap-3">
              <img
                src="/edvixo-logo-mark.svg"
                className="h-9 w-9"
                alt="Edvixo logo"
              />
              <span className="text-2xl font-semibold text-white">Edvixo</span>
            </a>
            <p className="mt-4 text-sm text-gray-400 max-w-sm">
              The complete platform to build your public site, manage students, and collect fees—with a modern, secure workflow.
            </p>
            <div className="mt-6 flex items-center gap-4 text-gray-400">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-white">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-white">
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-white">
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-white">
                <FaYoutube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/plans" className="hover:text-white">Pricing & Plans</a></li>
                <li><a href="/public-site/student-login" className="hover:text-white">Student Portal</a></li>
                <li><a href="/my-plan/:planId/update-website" className="hover:text-white">Website Builder</a></li>
                <li><a href="#security" className="hover:text-white">Security</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Solutions</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#schools" className="hover:text-white">Schools</a></li>
                <li><a href="#colleges" className="hover:text-white">Colleges</a></li>
                <li><a href="#coaching" className="hover:text-white">Coaching</a></li>
                <li><a href="#nonprofits" className="hover:text-white">Non‑profits</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="#docs" className="hover:text-white">Docs</a></li>
                <li><a href="#demo" className="hover:text-white">Watch demo</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Legal</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Refund Policy</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold">Stay in the loop</h4>
              <p className="text-sm text-gray-400">Monthly updates on new features and tips. No spam.</p>
            </div>
            <form className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full md:w-80 rounded-lg bg-[#0B1220] border border-white/15 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {year} Edvixo. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="mailto:hello@edvixo.com" className="hover:text-white">hello@edvixo.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
