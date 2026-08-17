const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
app.use(cors());
const PORT = 5000;

const DONORS_FILE = path.join(__dirname, "donors.json");

app.use(express.json());

app.get("/api/donors", (req, res) => {
    fs.readFile(DONORS_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({
                error: "Could not read donors"
            });
        }

        const donors = JSON.parse(data);

        const { blood_group, location, availability, search } = req.query;

        let filteredDonors = donors;

        if (blood_group) {
            filteredDonors = filteredDonors.filter(donor =>
                donor.blood_group.toLowerCase() === blood_group.toLowerCase()
            );
        }

        if (location) {
            filteredDonors = filteredDonors.filter(donor =>
                donor.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (availability !== undefined) {
            filteredDonors = filteredDonors.filter(donor =>
                donor.availability === (availability === "true")
            );
        }

        if (search) {
            filteredDonors = filteredDonors.filter(donor =>
                donor.name.toLowerCase().includes(search.toLowerCase()) ||
                donor.blood_group.toLowerCase().includes(search.toLowerCase()) ||
                donor.location.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(filteredDonors);
    });
});


// Register a donor
app.post("/api/donors", (req, res) => {
    const {
        name,
        blood_group,
        phone,
        location,
        availability,
        additional_info
    } = req.body;

    // Basic validation
    if (!name || !blood_group || !phone || !location) {
        return res.status(400).json({
            error: "Name, blood group, phone and location are required"
        });
    }

    fs.readFile(DONORS_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({
                error: "Could not read donors"
            });
        }

        const donors = JSON.parse(data);

        const newDonor = {
            id: Date.now(),
            name,
            blood_group,
            phone,
            location,
            availability: availability ?? true,
            additional_info: additional_info || ""
        };

        donors.push(newDonor);

        fs.writeFile(
            DONORS_FILE,
            JSON.stringify(donors, null, 2),
            (err) => {
                if (err) {
                    return res.status(500).json({
                        error: "Could not save donor"
                    });
                }

                res.status(201).json({
                    message: "Donor registered successfully",
                    donor: newDonor
                });
            }
        );
    });
});
// Update a donor
app.put("/api/donors/:id", (req, res) => {
    const donorId = Number(req.params.id);

    fs.readFile(DONORS_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({
                error: "Could not read donors"
            });
        }

        const donors = JSON.parse(data);

        const donorIndex = donors.findIndex(
            donor => donor.id === donorId
        );

        if (donorIndex === -1) {
            return res.status(404).json({
                error: "Donor not found"
            });
        }

        donors[donorIndex] = {
            ...donors[donorIndex],
            ...req.body,
            id: donorId
        };

        fs.writeFile(
            DONORS_FILE,
            JSON.stringify(donors, null, 2),
            err => {
                if (err) {
                    return res.status(500).json({
                        error: "Could not update donor"
                    });
                }

                res.json({
                    message: "Donor updated successfully",
                    donor: donors[donorIndex]
                });
            }
        );
    });
});

// Delete a donor
app.delete("/api/donors/:id", (req, res) => {
    const donorId = Number(req.params.id);

    fs.readFile(DONORS_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({
                error: "Could not read donors"
            });
        }

        const donors = JSON.parse(data);

        const donorIndex = donors.findIndex(
            donor => donor.id === donorId
        );

        if (donorIndex === -1) {
            return res.status(404).json({
                error: "Donor not found"
            });
        }

        const deletedDonor = donors.splice(donorIndex, 1)[0];

        fs.writeFile(
            DONORS_FILE,
            JSON.stringify(donors, null, 2),
            err => {
                if (err) {
                    return res.status(500).json({
                        error: "Could not delete donor"
                    });
                }

                res.json({
                    message: "Donor deleted successfully",
                    donor: deletedDonor
                });
            }
        );
    });
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});