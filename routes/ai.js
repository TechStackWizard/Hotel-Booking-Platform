const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

// Show form
router.get("/recommend", (req, res) => {
    res.render("ai/recommend");
});

// Handle form + show results
router.post("/recommend", async (req, res) => {
    const { location, budget, travelType } = req.body;

    // Find listings by location (case insensitive)
    const listings = await Listing.find({
        $or: [
            { location: { $regex: location, $options: "i" } },
            { country: { $regex: location, $options: "i" } }
        ]
    });

    // AI-style ranking
    const recommended = listings.map(listing => {

        let score = 0;
        let reasons = [];

        // Budget match
        if (listing.price <= budget) {
            score += 30;
            reasons.push("fits your budget");
        }

        // Location match
        if (listing.location.toLowerCase().includes(location.toLowerCase())) {
            score += 30;
            reasons.push("located in your preferred area");
        }

        // Description-based logic (THIS IS YOUR “AI”)
        if (listing.description) {
            const desc = listing.description.toLowerCase();

            if (travelType === "family" && desc.includes("family")) {
                score += 20;
                reasons.push("suitable for family stay");
            }

            if (travelType === "business" && desc.includes("business")) {
                score += 20;
                reasons.push("good for business travel");
            }

            if (travelType === "couple" && desc.includes("couple")) {
                score += 20;
                reasons.push("ideal for couples");
            }

            if (travelType === "solo" && desc.includes("solo")) {
                score += 20;
                reasons.push("perfect for solo travelers");
            }

            if (travelType === "tourist" && desc.includes("tourist")) {
                score += 20;
                reasons.push("great for sightseeing");
            }
        }

        if (reasons.length === 0) {
            reasons.push("a good match based on your preferences");
        }

        return {
            ...listing._doc,
            score,
            aiReason: reasons.join(", ")
        };
    });

    // Sort & take top 3
    const topListings = recommended
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    res.render("ai/results", {
        listings: topListings,
        location,
        budget,
        travelType
    });
});

module.exports = router;