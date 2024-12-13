import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://js-crud-f6c3b-default-rtdb.firebaseio.com/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const usersListInDb = ref(database, "users");

const idEl = document.querySelector("#id");
const nameEl = document.querySelector("#name");
const ageEl = document.querySelector("#age");
const cityEl = document.querySelector("#city");
const frm = document.querySelector("#frm");
const tblBodyEl = document.querySelector("#tblBody");

// Handle form submission
frm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate inputs
    if (!nameEl.value.trim() || !ageEl.value.trim() || !cityEl.value.trim()) {
        alert("Please fill all details");
        return;
    }

    const newUser = {
        name: nameEl.value.trim(),
        age: ageEl.value.trim(),
        city: cityEl.value.trim()
    };

    if (idEl.value.trim()) {
        // Update existing user
        const userRef = ref(database, `users/${idEl.value}`);
        set(userRef, newUser).then(() => {
            alert("User updated successfully!");
            frm.reset();
        });
    } else {
        // Add new user
        push(usersListInDb, newUser).then(() => {
            alert("User added successfully!");
            frm.reset();
        });
    }
});

// Fetch and display users
onValue(usersListInDb, function (snapshot) {
    tblBodyEl.innerHTML = ""; // Clear the table body
    let count = 1;

    snapshot.forEach(function (childSnapshot) {
        const userId = childSnapshot.key;
        const userData = childSnapshot.val();

        const row = document.createElement("tr");
        row.dataset.id = userId; // Set user ID for the row

        row.innerHTML = `
            <td>${count++}</td>
            <td>${userData.name}</td>
            <td>${userData.age}</td>
            <td>${userData.city}</td>
            <td><button class="edit-btn">Edit</button></td>
            <td><button class="delete-btn">Delete</button></td>
        `;

        tblBodyEl.appendChild(row);
    });
});

// Event delegation for edit and delete buttons
tblBodyEl.addEventListener("click", function (e) {
    const target = e.target;
    const row = target.closest("tr");
    const userId = row.dataset.id;

    if (target.classList.contains("edit-btn")) {
        // Edit user
        const userRef = ref(database, `users/${userId}`);
        onValue(userRef, function (snapshot) {
            const userData = snapshot.val();

            idEl.value = userId; // Populate hidden ID field
            nameEl.value = userData.name;
            ageEl.value = userData.age;
            cityEl.value = userData.city;
        }, { onlyOnce: true });
    }

    if (target.classList.contains("delete-btn")) {
        // Delete user
        const userRef = ref(database, `users/${userId}`);
        remove(userRef)
            .then(() => {
                alert("User deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting user:", error);
            });
    }
});
