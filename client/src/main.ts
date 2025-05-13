document.getElementById("login")?.addEventListener("submit", async (e) => {
	e.preventDefault();

	const username = document.getElementById("username")!.value;
	const password = document.getElementById("password")!.value;

	try {
		const response = await fetch("http://localhost:3000/api/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include", // Important for cookies!
			body: JSON.stringify({ username, password }),
		});

		const data = await response.json();
		console.log(data);
	} catch (error) {
		console.error("Login error:", error);
	}
});

document.getElementById("test")?.addEventListener("click", () => {});
