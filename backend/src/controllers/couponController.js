import Coupon from '../models/Coupon.js';

export const addCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      value,
      maxUsage,
      applicableTo,
      expiresAt
    } = req.body;

    const newCoupon = new Coupon({
      code,
      discountType,
      value,
      maxUsage,
      applicableTo,
      expiresAt
    });

    await newCoupon.save();

    res.status(201).json({ message: 'Coupon added successfully', coupon: newCoupon });
  } catch (error) {
    console.error('Error adding coupon:', error.message);
    res.status(500).json({ error: 'Failed to add coupon' });
  }
};
