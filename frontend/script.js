const API_URL = "http://localhost:5000/api/donors";


// ===============================
// REGISTER DONOR
// ===============================

document
    .getElementById("donorForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const donorMessage =
            document.getElementById("donorMessage");

        const donor = {
            name: document.getElementById("name").value.trim(),

            blood_group:
                document.getElementById("blood_group").value,

            phone:
                document.getElementById("phone").value.trim(),

            location:
                document.getElementById("location").value.trim(),

            availability:
                document.getElementById("availability").value === "true",

            additional_info:
                document.getElementById("additional_info").value.trim()
        };


        try {

            donorMessage.textContent = "Registering donor...";

            const response = await fetch(API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(donor)
            });


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data.error || "Registration failed"
                );
            }


            donorMessage.textContent =
                "✅ Donor registered successfully!";


            document
                .getElementById("donorForm")
                .reset();


            // Refresh donor list
            findDonors();


        } catch (error) {

            donorMessage.textContent =
                "❌ " + error.message;

        }

    });



// ===============================
// FIND DONORS
// ===============================

async function findDonors() {

    const search =
        document
            .getElementById("search")
            .value
            .trim();


    const bloodGroup =
        document
            .getElementById("filterBlood")
            .value;


    const location =
        document
            .getElementById("filterLocation")
            .value
            .trim();


    const params =
        new URLSearchParams();


    if (search) {
        params.append("search", search);
    }


    if (bloodGroup) {
        params.append(
            "blood_group",
            bloodGroup
        );
    }


    if (location) {
        params.append(
            "location",
            location
        );
    }


    try {

        const response =
            await fetch(
                `${API_URL}?${params.toString()}`
            );


        if (!response.ok) {
            throw new Error(
                "Could not retrieve donors"
            );
        }


        const donors =
            await response.json();


        displayDonors(donors);


    } catch (error) {

        document
            .getElementById("donorList")
            .innerHTML = `
                <div class="empty-message">
                    ❌ Could not connect to server.
                    <br>
                    Make sure the backend server is running.
                </div>
            `;

    }

}



// ===============================
// DISPLAY DONORS
// ===============================

function displayDonors(donors) {

    const donorList =
        document.getElementById("donorList");


    donorList.innerHTML = "";


    if (donors.length === 0) {

        donorList.innerHTML = `
            <div class="empty-message">
                🔍 No matching donors found.
            </div>
        `;

        return;
    }


    donors.forEach(donor => {

        const card =
            document.createElement("div");


        card.className =
            "donor-card";


        const availabilityText =
            donor.availability
                ? "🟢 Available"
                : "🔴 Not Available";


        const availabilityClass =
            donor.availability
                ? "available"
                : "unavailable";


        card.innerHTML = `

            <h3>
                🩸 ${donor.name}
            </h3>

            <p>
                <strong>Blood Group:</strong>
                ${donor.blood_group}
            </p>

            <p>
                <strong>Phone:</strong>
                ${donor.phone}
            </p>

            <p>
                <strong>Location:</strong>
                ${donor.location}
            </p>

            <p class="${availabilityClass}">
                ${availabilityText}
            </p>

            <p>
                <strong>Additional Information:</strong>
                ${donor.additional_info || "None"}
            </p>

        `;


        donorList.appendChild(card);

    });

}



// ===============================
// LOAD DONORS WHEN PAGE OPENS
// ===============================

findDonors();