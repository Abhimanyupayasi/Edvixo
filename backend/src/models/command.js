import Deal from "./Deal";// Adjust path if needed

const createSampleDeal = async () => {
  try {
    const newDeal = new Deal({
      title: "Back to School",
      description: "15% off on School Plans",
      discountType: "percentage", // or 'flat'
      value: 15, // 15% discount
      startAt: new Date("2025-07-01"),
      endAt: new Date("2025-08-15"),
      applicableTo: ["School"], // Apply to School plans only
      isActive: true
    });

    const savedDeal = await newDeal.save();
    console.log("Deal created:", savedDeal);
  } catch (error) {
    console.error("Error creating deal:", error.message);
  }
};

createSampleDeal();
