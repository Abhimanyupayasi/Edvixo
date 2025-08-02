// components/pricing/PlanCard.jsx
import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { FaRupeeSign } from "react-icons/fa";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import {
  getPrimaryTier,
  getEffectivePrice,
  humanizeDuration,
  formatINR,
  ensureRazorpay,
  BASE_URL,
} from "./utils";

export default function PlanCard({ plan }) {
  // Keep same implementation from your original `PlanCard`
  // ...
}
